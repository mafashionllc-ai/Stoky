import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUpRight, ArrowDownRight, Package, Save, Check } from 'lucide-react';
import { Product } from '../types';
import { registerBatchMovement } from '../services/firestoreService';

interface BulkMovementModalProps {
  isOpen: boolean;
  selectedProducts: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkMovementModal: React.FC<BulkMovementModalProps> = ({ 
  isOpen, 
  selectedProducts, 
  onClose,
  onSuccess
}) => {
  const [type, setType] = useState<'ingreso' | 'egreso'>('egreso');
  const [quantities, setQuantities] = useState<Record<string, number>>(
    selectedProducts.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
  );
  const [nota, setNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    setLoading(true);
    setError('');
    
    try {
      const movements = selectedProducts.map(product => ({
        product,
        cantidad: quantities[product.id] || 0
      })).filter(m => m.cantidad > 0);

      if (movements.length === 0) {
        setError('Ingresa al menos una cantidad');
        setLoading(false);
        return;
      }

      await registerBatchMovement(movements, type, nota);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar el lote');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (id: string, val: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, val)
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-[#1A1A2E] rounded-t-[40px] z-[70] flex flex-col border-t border-white/5 shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 pb-2 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">MOVIMIENTO MASIVO</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ajuste de {selectedProducts.length} productos</p>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar">
              {/* Type Selector */}
              <div className="flex bg-[#24243E] p-1 rounded-2xl relative shadow-inner">
                <button
                  onClick={() => setType('egreso')}
                  className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 z-10 transition-colors ${type === 'egreso' ? 'text-white' : 'text-gray-500'}`}
                >
                  <ArrowUpRight size={16} className="text-rose-500" />
                  <span>SALIDA</span>
                </button>
                <button
                  onClick={() => setType('ingreso')}
                  className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 z-10 transition-colors ${type === 'ingreso' ? 'text-white' : 'text-gray-500'}`}
                >
                  <ArrowDownRight size={16} className="text-emerald-500" />
                  <span>ENTRADA</span>
                </button>
                <motion.div
                  layoutId="bulk-type-bg"
                  animate={{ x: type === 'egreso' ? '0%' : '100%' }}
                  className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30"
                />
              </div>

              {/* Product List */}
              <div className="space-y-3">
                {selectedProducts.map(product => (
                  <div 
                    key={product.id}
                    className="bg-[#24243E]/50 p-4 rounded-2xl border border-white/5 flex items-center space-x-4"
                  >
                    <span className="text-2xl">{product.emoji}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white leading-tight line-clamp-1">{product.nombre}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{product.stockActual} en stock</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => updateQuantity(product.id, (quantities[product.id] || 0) - 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white text-xl font-bold"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        value={quantities[product.id] || ''}
                        onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                        className="w-12 bg-transparent text-center text-white font-black text-lg focus:outline-none"
                      />
                      <button 
                        onClick={() => updateQuantity(product.id, (quantities[product.id] || 0) + 1)}
                        className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-xl font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest pl-2">Nota (Opcional)</p>
                <textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Ej: Lote semanal, Inventario..."
                  className="w-full bg-[#24243E] border border-white/5 rounded-2xl p-4 text-white text-sm focus:border-indigo-600/50 focus:outline-none transition-all resize-none h-24"
                />
              </div>

              {error && (
                <div className="text-red-400 text-[10px] font-bold uppercase text-center bg-red-400/10 p-2 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="p-6 pt-2 pb-10 bg-[#1A1A2E]/80 backdrop-blur-xl">
              <button
                disabled={loading}
                onClick={handleApply}
                className={`w-full py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all shadow-2xl ${type === 'ingreso' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-red-600 shadow-red-600/20'}`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={20} className="text-white" />
                    <span className="text-white font-black text-sm uppercase tracking-widest">
                      CONFIRMAR {selectedProducts.length} MOVIMIENTOS
                    </span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
