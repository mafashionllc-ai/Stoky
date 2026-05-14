import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2, Hash, DollarSign } from 'lucide-react';
import { Product, TreatmentLine } from '../types';
import { createProduct, updateProduct, deleteProduct } from '../services/firestoreService';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: TreatmentLine[];
  productToEdit?: Product | null;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({ isOpen, onClose, lines, productToEdit }) => {
  const [nombre, setNombre] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [codigo, setCodigo] = useState('');
  const [unidad, setUnidad] = useState('');
  const [lineaId, setLineaId] = useState('');
  const [precio, setPrecio] = useState('');
  const [costo, setCosto] = useState('');
  const [stockMinimo, setStockMinimo] = useState('5');
  const [stockActual, setStockActual] = useState('0');
  const [tipo, setTipo] = useState<Product['tipo']>('ambos');
  const [loading, setLoading] = useState(false);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setNombre(productToEdit.nombre || '');
      setEmoji(productToEdit.emoji || '📦');
      setCodigo(productToEdit.codigo || '');
      setUnidad(productToEdit.unidad || '');
      setLineaId(productToEdit.lineaId || '');
      setPrecio(productToEdit.precio?.toString() || '');
      setCosto(productToEdit.costo?.toString() || '');
      setStockMinimo(productToEdit.stockMinimo?.toString() || '5');
      setStockActual(productToEdit.stockActual?.toString() || '0');
      const initialTipo = productToEdit.tipo || 'ambos';
      setTipo((initialTipo as string) === 'cabina' ? 'salon' : initialTipo);
      setShowConfirmDelete(false);
    } else {
      setNombre('');
      setEmoji('📦');
      setCodigo('');
      setUnidad('');
      setLineaId(lines[0]?.id || '');
      setPrecio('');
      setCosto('');
      setStockMinimo('5');
      setStockActual('0');
      setTipo('ambos');
      setShowConfirmDelete(false);
    }
  }, [productToEdit, lines]);

  useEffect(() => {
    if (!productToEdit && lineaId) {
      const selectedLine = lines.find(l => l.id === lineaId);
      if (selectedLine && (emoji === '📦' || emoji === '🧴')) {
        setEmoji(selectedLine.emoji);
      }
    }
  }, [lineaId, lines, productToEdit, emoji]);

  const handleSave = async () => {
    if (!nombre.trim() || !lineaId) return;
    setLoading(true);
    try {
      const data = {
        nombre,
        emoji,
        codigo,
        unidad,
        lineaId,
        tipo,
        precio: parseFloat(precio) || 0,
        costo: parseFloat(costo) || 0,
        stockMinimo: parseInt(stockMinimo) || 5,
        stockActual: parseInt(stockActual) || 0
      };

      if (productToEdit?.id) {
        await updateProduct(productToEdit.id, data);
      } else {
        await createProduct(data);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToEdit?.id) return;
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }

    setLoading(true);
    try {
      await deleteProduct(productToEdit.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 max-h-[95vh] bg-[#1A1A2E] rounded-t-[40px] z-[90] flex flex-col border-t border-white/5">
            <div className="p-6 flex justify-between items-center">
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                {productToEdit ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
              </h2>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
              <div className="flex justify-center mb-6">
                <input 
                  value={emoji} 
                  onChange={e => setEmoji(e.target.value)}
                  className="w-24 h-24 bg-white/5 rounded-[32px] text-5xl flex items-center justify-center border-2 border-dashed border-indigo-500/30 text-center outline-none focus:border-indigo-500"
                  maxLength={2}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase text-gray-500 tracking-widest pl-2">Información Básica</p>
                  <input 
                    value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del producto"
                    className="w-full bg-[#24243E] border-none py-4 px-6 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Código"
                      className="w-full bg-[#24243E] border-none py-4 px-6 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <input 
                      value={unidad} onChange={e => setUnidad(e.target.value)} placeholder="Unidad (ej: 980ML)"
                      className="w-full bg-[#24243E] border-none py-4 px-6 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <select 
                    value={lineaId} onChange={e => setLineaId(e.target.value)}
                    className="w-full bg-[#24243E] border-none py-4 px-6 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-600 appearance-none"
                  >
                    <option value="" disabled>Selecciona una línea</option>
                    {lines.map(l => <option key={l.id} value={l.id}>{l.emoji} {l.nombre}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-gray-500 tracking-widest pl-2">Precio de Venta ($)</p>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                      <input 
                        type="number" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="0.00"
                        className="w-full bg-[#24243E] border-none py-4 pl-10 pr-4 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-gray-500 tracking-widest pl-2">Costo Pro (KPI) ($)</p>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16}/>
                      <input 
                        type="number" value={costo} onChange={e => setCosto(e.target.value)} placeholder="0.00"
                        className="w-full bg-[#24243E] border-none py-4 pl-10 pr-4 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-gray-500 tracking-widest pl-2">Stock Inicial</p>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                      <input 
                        type="number" value={stockActual} onChange={e => setStockActual(e.target.value)} placeholder="0"
                        className="w-full bg-[#24243E] border-none py-4 pl-10 pr-4 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                        disabled={!!productToEdit}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-black uppercase text-gray-500 tracking-widest pl-2">Uso del Producto</p>
                  <div className="flex bg-[#24243E] p-1 rounded-2xl relative shadow-inner">
                    <button
                      onClick={() => setTipo('salon')}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest z-10 transition-colors ${(tipo === 'salon' || (tipo as string) === 'cabina') ? 'text-white' : 'text-gray-500'}`}
                    >
                      Salon
                    </button>
                    <button
                      onClick={() => setTipo('after_care')}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest z-10 transition-colors ${tipo === 'after_care' ? 'text-white' : 'text-gray-500'}`}
                    >
                      Home Care
                    </button>
                    <button
                      onClick={() => setTipo('ambos')}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest z-10 transition-colors ${tipo === 'ambos' ? 'text-white' : 'text-gray-500'}`}
                    >
                      Mixto
                    </button>
                    <motion.div
                      layoutId="tipo-bg"
                      animate={{ 
                        x: (tipo === 'salon' || (tipo as string) === 'cabina') ? '0%' : tipo === 'after_care' ? '100%' : '200%' 
                      }}
                      className="absolute top-1 bottom-1 left-1 w-[calc(33.33%-4px)] bg-indigo-600 rounded-xl shadow-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-black uppercase text-gray-500 tracking-widest pl-2">Alerta Stock Bajo</p>
                  <input 
                    type="number" value={stockMinimo} onChange={e => setStockMinimo(e.target.value)} placeholder="Mínimo sugerido"
                    className="w-full bg-[#24243E] border-none py-4 px-6 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  disabled={loading}
                  onClick={handleSave}
                  className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Save size={20}/>
                  <span className="uppercase tracking-widest text-sm">{productToEdit ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}</span>
                </button>
                
                {productToEdit && (
                  <button 
                    disabled={loading}
                    onClick={handleDelete}
                    className={`w-full font-black py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all ${showConfirmDelete ? 'bg-red-600 text-white' : 'bg-red-600/10 text-red-500'}`}
                  >
                    <Trash2 size={18}/>
                    <span className="uppercase tracking-widest text-xs">
                      {showConfirmDelete ? '¿CONFIRMAR ELIMINAR?' : 'ELIMINAR PRODUCTO'}
                    </span>
                  </button>
                )}
                
                {showConfirmDelete && (
                  <button 
                    onClick={() => setShowConfirmDelete(false)}
                    className="w-full text-gray-500 font-bold py-2 text-xs uppercase tracking-widest"
                  >
                    Cancelar
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
