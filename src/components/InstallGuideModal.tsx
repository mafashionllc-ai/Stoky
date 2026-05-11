
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share, PlusSquare, Smartphone, Download, CheckCircle2 } from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'ios' | 'android' | 'other';
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose, platform }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="relative w-full max-w-md bg-[#1A1A2E] rounded-t-[40px] sm:rounded-[40px] shadow-2xl p-8 border-t sm:border border-white/10"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Smartphone className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Instalar App</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {platform === 'ios' ? (
                <>
                  <div className="bg-indigo-500/10 p-4 rounded-3xl border border-indigo-500/20">
                    <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1 italic">Para iPhone / iPad</p>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Transforma esta web en una aplicación nativa siguiendo estos pasos:
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-xs font-black text-white">1</div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">Toca el botón de Compartir</p>
                        <p className="text-slate-500 text-xs mt-1">Busca el icono <Share size={14} className="inline mx-1 text-indigo-400" /> en la barra inferior de Safari.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-xs font-black text-white">2</div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">"Añadir a pantalla de inicio"</p>
                        <p className="text-slate-500 text-xs mt-1">Desliza hacia abajo hasta encontrar <PlusSquare size={14} className="inline mx-1 text-indigo-400" /> "Add to Home Screen".</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-xs font-black text-white">3</div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">¡Listo!</p>
                        <p className="text-slate-500 text-xs mt-1">Ahora tendrás el icono de MA Fashion en tu pantalla principal.</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20">
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1 italic">Para Android</p>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Instala la aplicación directamente en tu dispositivo:
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-xs font-black text-white">1</div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">Menú de Navegador</p>
                        <p className="text-slate-500 text-xs mt-1">Toca los tres puntos <span className="font-bold text-white px-1">⋮</span> en la esquina superior derecha.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-xs font-black text-white">2</div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">Instalar Aplicación</p>
                        <p className="text-slate-500 text-xs mt-1">Selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".</p>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center space-x-3">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <p className="text-slate-400 text-[10px] font-bold uppercase italic">Recomendado para la mejor experiencia</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={onClose}
              className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
