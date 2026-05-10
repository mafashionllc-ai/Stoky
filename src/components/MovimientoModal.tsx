
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Product, TreatmentLine } from '../types';
import { registerMovement } from '../services/firestoreService';

interface MovementModalProps {
  product: Product;
  line?: TreatmentLine;
  isOpen: boolean;
  onClose: () => void;
}

export const MovementModal: React.FC<MovementModalProps> = ({ product, line, isOpen, onClose }) => {
  const [cantidad, setCantidad] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const handleMovement = async (tipo: 'ingreso' | 'egreso') => {
    setIsSubmitting(true);
    try {
      await registerMovement(product, tipo, cantidad);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al registrar movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="relative w-full max-w-md bg-[#1A1A2E] rounded-t-[32px] sm:rounded-3xl p-8 overflow-hidden border-t sm:border border-white/10"
          id="movement-modal"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-2xl font-bold">Movimiento</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="bg-[#24243E] p-4 rounded-2xl mb-8 flex items-center space-x-4">
            <span className="text-4xl">{product.emoji}</span>
            <div>
              <h3 className="text-white font-bold text-lg">{product.nombre}</h3>
              <p className="text-sm font-black uppercase tracking-widest" style={{ color: line?.color || '#6366f1' }}>{line?.nombre || 'General'}</p>
              <p className="text-slate-400 text-xs mt-1">Stock actual: <span className="text-white font-bold">{product.stockActual}</span> uds</p>
            </div>
          </div>

          <div className="mb-8">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-4">Cantidad</label>
            <div className="flex items-center justify-center space-x-8">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 active:scale-95 transition-all"
              >
                <Minus size={24} />
              </button>
              
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-transparent text-white text-5xl font-black w-24 text-center focus:outline-none"
              />

              <button
                onClick={() => setCantidad(cantidad + 1)}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 active:scale-95 transition-all"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              disabled={isSubmitting}
              onClick={() => handleMovement('ingreso')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white transition-all disabled:opacity-50"
            >
              <ArrowDownCircle size={32} className="mb-2" />
              <span className="font-bold">INGRESO</span>
            </button>

            <button
              disabled={isSubmitting || product.stockActual < cantidad}
              onClick={() => handleMovement('egreso')}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl text-white transition-all disabled:opacity-50 ${
                product.stockActual < cantidad ? 'bg-slate-700 cursor-not-allowed' : 'bg-[#F59E0B] hover:bg-[#D97706]'
              }`}
            >
              <ArrowUpCircle size={32} className="mb-2" />
              <span className="font-bold">EGRESO</span>
            </button>
          </div>
          
          {product.stockActual < cantidad && (
            <p className="text-red-500 text-xs text-center mt-4">Stock insuficiente para este egreso</p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
