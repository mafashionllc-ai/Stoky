import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2, Percent, DollarSign, Package, Check, Plus, Minus } from 'lucide-react';
import { Product, TreatmentLine, Promotion, PromoDiscountType } from '../types';
import { createPromotion, updatePromotion, deletePromotion } from '../services/firestoreService';
import { LineaChip } from './LineaChip';

interface AdminPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  lines: TreatmentLine[];
  promotionToEdit?: Promotion | null;
}

export const AdminPromotionModal: React.FC<AdminPromotionModalProps> = ({ 
  isOpen, 
  onClose, 
  products, 
  lines, 
  promotionToEdit 
}) => {
  const [nombre, setNombre] = useState('');
  const [selectedProductQuantities, setSelectedProductQuantities] = useState<Record<string, number>>({});
  const [tipoDescuento, setTipoDescuento] = useState<PromoDiscountType>('porcentaje');
  const [valorDescuento, setValorDescuento] = useState(0);
  const [selectedLineId, setSelectedLineId] = useState<'all' | string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (promotionToEdit) {
      setNombre(promotionToEdit.nombre || '');
      const quantities: Record<string, number> = {};
      promotionToEdit.productos.forEach(p => {
        quantities[p.productoId] = p.cantidad;
      });
      setSelectedProductQuantities(quantities);
      setTipoDescuento(promotionToEdit.tipoDescuento || 'porcentaje');
      setValorDescuento(promotionToEdit.valorDescuento || 0);
    } else {
      setNombre('');
      setSelectedProductQuantities({});
      setTipoDescuento('porcentaje');
      setValorDescuento(0);
    }
  }, [promotionToEdit, isOpen]);

  const selectedProducts = useMemo(() => {
    return products.filter(p => selectedProductQuantities[p.id] > 0);
  }, [products, selectedProductQuantities]);

  const subtotal = useMemo(() => {
    return selectedProducts.reduce((acc, p) => acc + (p.precio || 0) * (selectedProductQuantities[p.id] || 0), 0);
  }, [selectedProducts, selectedProductQuantities]);

  const totalFinal = useMemo(() => {
    if (tipoDescuento === 'porcentaje') {
      return subtotal * (1 - valorDescuento / 100);
    }
    return Math.max(0, subtotal - valorDescuento);
  }, [subtotal, tipoDescuento, valorDescuento]);

  const totalDescuento = subtotal - totalFinal;
  const porcentajeAhorro = subtotal > 0 ? (totalDescuento / subtotal) * 100 : 0;

  const handleUpdateQuantity = (id: string, delta: number) => {
    setSelectedProductQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleSave = async () => {
    if (!nombre || selectedProducts.length === 0) return;
    setLoading(true);
    
    try {
      const data = {
        nombre,
        productos: selectedProducts.map(p => ({
          productoId: p.id,
          nombre: p.nombre,
          precioUnitario: p.precio || 0,
          cantidad: selectedProductQuantities[p.id]
        })),
        subtotalRegular: subtotal,
        tipoDescuento,
        valorDescuento,
        totalFinal
      };

      if (promotionToEdit?.id) {
        await updatePromotion(promotionToEdit.id, data);
      } else {
        await createPromotion(data);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!promotionToEdit?.id || !confirm('¿Eliminar esta promoción definitivamente?')) return;
    setLoading(true);
    try {
      await deletePromotion(promotionToEdit.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => selectedLineId === 'all' || p.lineaId === selectedLineId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 max-h-[95vh] bg-[#1A1A2E] rounded-t-[40px] z-[90] flex flex-col border-t border-white/5">
            <div className="p-6 flex justify-between items-center">
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                {promotionToEdit ? 'EDITAR PROMOCIÓN' : 'NUEVA PROMOCIÓN'}
              </h2>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre de la promoción"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#24243E] border border-white/5 py-4 px-4 rounded-2xl text-white font-bold focus:ring-2 focus:ring-indigo-600 outline-none"
                />

                <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
                  <LineaChip 
                    line={{ id: 'all', nombre: 'TODO', emoji: '📦', color: '#6366f1', descripcion: '', activa: true, orden: 0, creadoEn: new Date() }}
                    isActive={selectedLineId === 'all'}
                    onClick={() => setSelectedLineId('all')}
                  />
                  {lines.map((line) => (
                    <LineaChip
                      key={line.id}
                      line={line}
                      isActive={selectedLineId === line.id}
                      onClick={() => setSelectedLineId(line.id)}
                    />
                  ))}
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-2">Seleccionar Productos y Cantidad</p>
                   <div className="grid grid-cols-1 gap-2">
                    {filteredProducts.map(p => {
                      const qty = selectedProductQuantities[p.id] || 0;
                      return (
                        <div key={p.id} className={`flex items-center p-3 rounded-2xl border transition-all ${qty > 0 ? 'bg-indigo-600/10 border-indigo-600/50' : 'bg-[#24243E] border-white/5'}`}>
                          <span className="text-2xl mr-4">{p.emoji}</span>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-white line-clamp-1">{p.nombre}</h4>
                            <p className="text-[10px] text-gray-500 font-bold">${p.precio?.toFixed(2)} / ud</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => handleUpdateQuantity(p.id, -1)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${qty > 0 ? 'bg-white/5' : 'opacity-20 cursor-not-allowed'}`}
                              disabled={qty === 0}
                            >
                              <Minus size={16}/>
                            </button>
                            <span className={`w-6 text-center font-black ${qty > 0 ? 'text-white' : 'text-gray-600'}`}>{qty}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(p.id, 1)}
                              className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center"
                            >
                              <Plus size={16}/>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                   </div>
                </div>
              </div>

              <div className="bg-[#24243E] rounded-[32px] p-6 border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold uppercase tracking-tighter">Tipo de Descuento</h3>
                  <div className="flex bg-[#1A1A2E] p-1 rounded-xl">
                    <button onClick={() => setTipoDescuento('porcentaje')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center ${tipoDescuento === 'porcentaje' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}><Percent size={14} className="mr-1"/>%</button>
                    <button onClick={() => setTipoDescuento('monto_fijo')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center ${tipoDescuento === 'monto_fijo' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}><DollarSign size={14} className="mr-1"/>USD</button>
                  </div>
                </div>

                <div className="relative">
                  <input type="number" value={valorDescuento} onChange={(e) => setValorDescuento(parseFloat(e.target.value) || 0)} className="w-full bg-[#1A1A2E] text-center py-6 rounded-2xl text-4xl font-black text-indigo-400 focus:outline-none" />
                </div>

                <div className="space-y-2 border-t border-white/5 pt-4">
                  <div className="flex justify-between text-gray-500 text-xs font-bold uppercase tracking-widest">
                    <span>Subtotal:</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs font-bold uppercase tracking-widest">
                    <span>Descuento:</span>
                    <span className="text-red-400">-${totalDescuento.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-white font-black text-lg uppercase italic tracking-tighter">Total Promo:</span>
                    <div className="text-right">
                      <p className="text-indigo-400 text-4xl font-black italic tracking-tighter leading-none">${totalFinal.toFixed(2)}</p>
                      <span className="bg-emerald-500/20 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter mt-1 block">AHORRO {porcentajeAhorro.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={loading || !nombre || selectedProducts.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-2 disabled:opacity-30 transition-all shadow-xl shadow-indigo-600/20"
                >
                  {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                    <>
                      <Save size={20} />
                      <span className="uppercase tracking-widest text-sm">{promotionToEdit ? 'ACTUALIZAR' : 'GUARDAR PROMOCIÓN'}</span>
                    </>
                  )}
                </button>

                {promotionToEdit && (
                  <button 
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full bg-red-600/10 text-red-500 font-black py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all"
                  >
                    <Trash2 size={18}/>
                    <span className="uppercase tracking-widest text-[10px]">ELIMINAR PROMOCIÓN</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
