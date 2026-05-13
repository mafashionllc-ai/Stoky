
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Plus, Minus, Download, User, Receipt, Calculator, Percent, Tag, CheckCircle2, AlertCircle, ChevronRight, Trash2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp, writeBatch, doc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, DeliveryNote } from '../types';

interface DeliveryNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editNote?: DeliveryNote | null;
}

export const DeliveryNoteModal: React.FC<DeliveryNoteModalProps> = ({ isOpen, onClose, editNote }) => {
  const { products, user, lines } = useApp();
  const [step, setStep] = useState<'selection' | 'preview'>('selection');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [receptor, setReceptor] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  const [aplicarTax, setAplicarTax] = useState(false);
  const [tipoDescuento, setTipoDescuento] = useState<'porcentaje' | 'monto_fijo'>('porcentaje');
  const [valorDescuento, setValorDescuento] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize state if editing
  React.useEffect(() => {
    if (editNote) {
      setReceptor(editNote.receptor);
      setObservaciones(editNote.observaciones || '');
      setAplicarTax(editNote.aplicarTax || false);
      setTipoDescuento(editNote.tipoDescuento || 'porcentaje');
      setValorDescuento(editNote.valorDescuento || 0);
      
      const items = editNote.items.map(item => {
        const product = products.find(p => p.id === item.productoId);
        return product ? { product, quantity: item.cantidad } : null;
      }).filter(Boolean) as { product: Product; quantity: number }[];
      
      setSelectedItems(items);
      setStep('preview'); // Open directly into summary if editing
    } else {
      // Reset if not editing
      setSelectedItems([]);
      setReceptor('');
      setObservaciones('');
      setAplicarTax(false);
      setValorDescuento(0);
      setStep('selection');
    }
  }, [editNote, products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.activo && 
      (p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
       p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const subtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + (item.product.precio || 0) * item.quantity, 0);
  }, [selectedItems]);

  const taxRate = 0.065;
  const taxAmount = aplicarTax ? subtotal * taxRate : 0;

  const montoDescuento = useMemo(() => {
    if (tipoDescuento === 'porcentaje') {
      return subtotal * (valorDescuento / 100);
    }
    return valorDescuento;
  }, [subtotal, tipoDescuento, valorDescuento]);

  const total = subtotal + taxAmount - montoDescuento;

  const toggleItem = (product: Product) => {
    setSelectedItems(prev => {
      const existing = prev.find(p => p.product.id === product.id);
      if (existing) {
        return prev.filter(p => p.product.id !== product.id);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedItems(prev => prev.map(p => {
      if (p.product.id === productId) {
        const newQty = Math.max(1, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  const handleSave = async () => {
    if (!receptor || selectedItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      const timestamp = serverTimestamp();
      
      const deliveryNoteData = {
        receptor,
        items: selectedItems.map(item => ({
          productoId: item.product.id,
          nombre: item.product.nombre,
          cantidad: item.quantity,
          precioUnitario: item.product.precio || 0,
          subtotal: (item.product.precio || 0) * item.quantity
        })),
        subtotal,
        aplicarTax,
        taxRate: aplicarTax ? taxRate : 0,
        taxAmount,
        tipoDescuento,
        valorDescuento,
        montoDescuento,
        total,
        usuarioId: user.uid,
        observaciones,
        actualizadoEn: timestamp,
        ...(editNote ? {} : {
          statusArmado: false,
          statusEntregado: false,
          statusCobrado: false,
          archived: false
        })
      };

      if (editNote) {
        // UPDATE MODE
        const noteRef = doc(db, 'notas_entrega', editNote.id);
        batch.update(noteRef, deliveryNoteData);

        // Map old items for easy lookup
        const oldItemsMap = new Map(editNote.items.map(i => [i.productoId, i.cantidad]));
        const newItemsMap = new Map(selectedItems.map(i => [i.product.id, i.quantity]));

        // Get all unique product IDs involved
        const allProductIds = new Set([...oldItemsMap.keys(), ...newItemsMap.keys()]);

        allProductIds.forEach(productId => {
          const id = productId as string;
          const oldQty = (oldItemsMap.get(id) || 0) as number;
          const newQty = (newItemsMap.get(id) || 0) as number;
          const diff = newQty - oldQty; // Positive means we subtract more from stock

          if (diff !== 0) {
            const productRef = doc(db, 'productos', id);
            const product = products.find(p => p.id === id);
            
            const currentStock = typeof product?.stockActual === 'number' ? product.stockActual : 0;
            
            batch.update(productRef, {
              stockActual: increment(-diff),
              actualizadoEn: timestamp
            });

            // Log movement
            const movementRef = doc(collection(db, 'movimientos'));
            batch.set(movementRef, {
              productoId: id,
              lineaId: product?.lineaId || 'unknown',
              tipo: diff > 0 ? 'egreso' : 'ingreso',
              cantidad: Math.abs(diff),
              stockAnterior: currentStock,
              stockNuevo: currentStock - diff,
              nota: `Editable Nota ${editNote.nroNota}`,
              usuarioId: user.uid,
              fechaHora: timestamp
            });
          }
        });

      } else {
        // CREATE MODE
        const nroNota = `NE-${Date.now().toString().slice(-6)}`;
        const noteRef = doc(collection(db, 'notas_entrega'));
        batch.set(noteRef, { ...deliveryNoteData, nroNota, fecha: timestamp });

        selectedItems.forEach(item => {
          const productRef = doc(db, 'productos', item.product.id);
          const movementRef = doc(collection(db, 'movimientos'));

          batch.update(productRef, {
            stockActual: increment(-item.quantity),
            actualizadoEn: timestamp
          });

          batch.set(movementRef, {
            productoId: item.product.id,
            lineaId: item.product.lineaId,
            tipo: 'egreso',
            cantidad: item.quantity,
            stockAnterior: item.product.stockActual,
            stockNuevo: item.product.stockActual - item.quantity,
            nota: `Nota de Entrega ${nroNota}`,
            usuarioId: user.uid,
            fechaHora: timestamp
          });
        });
      }

      await batch.commit();
      onClose();
    } catch (error) {
      console.error("Error saving delivery note:", error);
      alert("Error al guardar la nota. Verifica los permisos de Firestore.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#060613]/98 backdrop-blur-2xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full h-full md:h-[85vh] md:max-w-5xl bg-[#0F0F1A] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-white/5"
      >
        {/* Header Minimalista */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-black/20">
          <div className="flex items-center space-x-6">
            <h2 className="text-white font-black text-xs uppercase tracking-[0.3em] flex items-center">
              <div className={`w-2 h-2 rounded-full mr-3 ${step === 'selection' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
              {step === 'selection' ? 'Seleccionar Productos' : 'Resumen de Entrega'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto md:overflow-hidden relative custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 'selection' ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col p-6 md:p-10 min-h-[500px]"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar en inventario..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-bold text-sm outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right px-4">
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Total</p>
                      <p className="text-white font-black text-xl italic">${subtotal.toFixed(2)}</p>
                    </div>
                    <button
                      disabled={selectedItems.length === 0}
                      onClick={() => setStep('preview')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 disabled:opacity-30 transition-all flex items-center space-x-2"
                    >
                      <span>Siguiente</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredProducts.map(product => {
                      const isSelected = selectedItems.some(i => i.product.id === product.id);
                      return (
                        <button
                          key={product.id}
                          onClick={() => toggleItem(product)}
                          className={`flex items-center p-4 rounded-2xl border transition-all text-left relative ${
                            isSelected 
                              ? 'bg-indigo-600/20 border-indigo-500/50' 
                              : 'bg-white/5 border-transparent hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/5'}`}>
                            {isSelected ? <CheckCircle2 size={24} /> : product.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm uppercase truncate text-white leading-tight">{product.nombre}</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">${product.precio?.toFixed(2)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col md:flex-row md:h-full"
              >
                {/* Cuerpo de la Factura Dark/Minimalista */}
                <div className="w-full md:flex-1 md:overflow-y-auto p-4 md:p-12 bg-[#0F0F1A] custom-scrollbar selection:bg-indigo-500/30">
                  <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-white font-black text-3xl italic tracking-tighter uppercase leading-none">RESUMEN <span className="text-indigo-500 font-black">ENTREGA</span></h2>
                        <p className="text-slate-500 text-[10px] font-black tracking-widest mt-2">DETALLE DE PRODUCTOS Y CANTIDADES</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">S Professional</p>
                        <p className="text-white/40 font-bold text-xs uppercase">Inventario Pro</p>
                      </div>
                    </div>

                    {/* Selector de Cliente */}
                    <div className="mb-8 bg-white/5 p-6 rounded-[32px] border border-white/5">
                      <label className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] mb-4 block">Cliente / Receptor</label>
                      <input
                        type="text"
                        autoFocus
                        value={receptor}
                        onChange={(e) => setReceptor(e.target.value)}
                        placeholder="Nombre del beneficiario..."
                        className="w-full bg-transparent border-b-2 border-indigo-500/30 py-2 text-white font-black text-2xl uppercase outline-none focus:border-indigo-500 transition-all placeholder:text-white/5"
                      />
                    </div>

                    {/* Lista de Productos Seleccionados */}
                    <div className="space-y-4 mb-12">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                        <h3 className="text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] flex items-center">
                          <Receipt size={14} className="mr-2 text-indigo-500" />
                          Listado a Entregar
                        </h3>
                        <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {selectedItems.length} Items
                        </span>
                      </div>
                      
                      {selectedItems.length === 0 ? (
                        <div className="py-20 text-center bg-white/5 rounded-[40px] border border-dashed border-white/10">
                          <AlertCircle size={40} className="mx-auto text-slate-700 mb-4" />
                          <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Sin productos</p>
                          <button onClick={() => setStep('selection')} className="mt-4 text-indigo-500 font-black text-[10px] uppercase tracking-widest">
                            Seleccionar Productos
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedItems.map(item => (
                            <motion.div 
                              layout
                              key={item.product.id} 
                              className="group bg-white/5 hover:bg-white/[0.08] p-3 sm:p-4 rounded-[24px] border border-white/5 transition-all relative overflow-hidden"
                            >
                              <div className="flex items-center justify-between gap-2 px-1">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <div className="w-10 h-10 bg-[#1A1A2E] rounded-xl flex items-center justify-center text-lg shadow-xl shrink-0 border border-white/10">
                                    {item.product.emoji}
                                  </div>
                                  <div className="min-w-0 pr-4 flex-1">
                                    <p className="text-white font-black text-xs uppercase leading-tight group-hover:whitespace-normal whitespace-normal">
                                      {item.product.nombre}
                                    </p>
                                    <p className="text-slate-500 font-bold text-[8px] uppercase mt-0.5">
                                      {lines.find(l => l.id === item.product.lineaId)?.nombre || 'General'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3 shrink-0">
                                  {/* Control de Cantidad más Compacto */}
                                  <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
                                    <button 
                                      onClick={() => updateQuantity(item.product.id, -1)} 
                                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <input 
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val)) updateQuantity(item.product.id, val - item.quantity);
                                      }}
                                      className="text-sm font-black text-white w-8 text-center bg-transparent border-none outline-none p-0 focus:ring-0 tabular-nums select-all"
                                    />
                                    <button 
                                      onClick={() => updateQuantity(item.product.id, 1)} 
                                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-emerald-500 hover:text-white transition-all"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                  
                                  <div className="text-right min-w-[70px]">
                                    <p className="text-white font-black text-sm italic leading-none">
                                      ${(item.quantity * (item.product.precio || 0)).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => toggleItem(item.product)}
                                className="absolute top-2 right-2 p-1.5 bg-[#1A1A2E]/80 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 sm:opacity-100"
                                title="Quitar"
                              >
                                <Trash2 size={12} />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Observaciones */}
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 mb-12">
                      <label className="text-slate-500 font-black text-[9px] uppercase tracking-[0.3em] mb-4 block">Observaciones</label>
                      <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="..."
                        className="w-full bg-black/20 rounded-2xl p-4 text-slate-400 text-sm outline-none resize-none h-24 font-medium border border-white/5 focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
                {/* Sidebar de Totales Mejorado */}
                <div className="w-full md:w-80 bg-[#0A0A16] border-l border-white/5 p-6 md:p-8 flex flex-col">
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em] pb-3 border-b border-white/5 mb-6">Impuestos y Ajustes</h3>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => setAplicarTax(!aplicarTax)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${aplicarTax ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-transparent text-slate-500'}`}
                        >
                          <div className="flex items-center space-x-3">
                            <Percent size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Incluir Tax (6.5%)</span>
                          </div>
                          {aplicarTax ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border border-white/10" />}
                        </button>

                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <label className="text-slate-500 font-black text-[9px] uppercase tracking-widest block mb-3">Descuento Global</label>
                          <div className="flex items-center space-x-2">
                            <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 shrink-0">
                              <button onClick={() => setTipoDescuento('porcentaje')} className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${tipoDescuento === 'porcentaje' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>%</button>
                              <button onClick={() => setTipoDescuento('monto_fijo')} className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${tipoDescuento === 'monto_fijo' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>$</button>
                            </div>
                            <input
                              type="number"
                              value={valorDescuento || ''}
                              onChange={(e) => setValorDescuento(Number(e.target.value))}
                              placeholder="0.00"
                              className="flex-1 bg-transparent text-white font-black text-sm outline-none text-right"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <h3 className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em] pb-3 border-b border-white/5 mb-4">Venta Final</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span className="tracking-widest">SUBTOTAL</span>
                          <span className="text-white tabular-nums">${subtotal.toFixed(2)}</span>
                        </div>
                        {aplicarTax && (
                          <div className="flex justify-between items-center text-[10px] font-bold text-indigo-400">
                            <span className="tracking-widest">TAX (6.5%)</span>
                            <span className="tabular-nums">+${taxAmount.toFixed(2)}</span>
                          </div>
                        )}
                        {montoDescuento > 0 && (
                          <div className="flex justify-between items-center text-[10px] font-bold text-rose-500">
                            <span className="tracking-widest capitalize">DESCUENTO ({tipoDescuento === 'porcentaje' ? `${valorDescuento}%` : 'Monto'})</span>
                            <span className="tabular-nums">-${montoDescuento.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="pt-4 mt-2 border-t border-white/10 flex flex-col items-end">
                          <span className="text-[9px] font-black text-indigo-500 tracking-[0.4em] uppercase mb-1">Total a Cobrar</span>
                          <span className="text-4xl font-black text-white italic tracking-tighter tabular-nums">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 space-y-3">
                    <button
                      disabled={!receptor || selectedItems.length === 0 || isSubmitting}
                      onClick={handleSave}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-20 flex items-center justify-center space-x-3"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          <span>Finalizar Nota</span>
                        </>
                      )}
                    </button>
                    <button onClick={() => setStep('selection')} className="w-full text-slate-600 hover:text-white font-bold text-[9px] uppercase tracking-widest transition-colors py-2 text-center">
                      Modificar Selección
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
