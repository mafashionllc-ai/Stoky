
import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(ios);

    // Chrome / Android install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }
  };

  if (isStandalone) return null;

  return (
    <div className="w-full mt-6">
      <button 
        onClick={() => setShowPrompt(true)}
        className="w-full bg-[#24243E]/80 border border-indigo-500/30 py-3 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all"
      >
        <Download size={16} className="text-indigo-400" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-200">
          Descargar Aplicación
        </span>
      </button>

      <AnimatePresence>
        {showPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A1A2E] border border-indigo-500/20 w-full max-w-sm rounded-[32px] p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
                  <Smartphone className="text-indigo-400" size={32} />
                </div>
                
                <h3 className="text-xl font-black italic uppercase tracking-tight mb-2">Instalar Stocky</h3>
                <p className="text-gray-400 text-xs mb-8">
                  Instala la aplicación en tu pantalla de inicio para un acceso rápido y ligero. Siempre actualizada.
                </p>

                {isIOS ? (
                  <div className="space-y-6 w-full">
                    <div className="flex items-start space-x-4 text-left">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                        <Share size={14} className="text-indigo-400" />
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                        Presiona el botón <span className="text-white font-bold">Compartir</span> en la barra inferior de tu navegador Safari.
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-4 text-left">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                        <PlusSquare size={14} className="text-indigo-400" />
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                        Baja hasta encontrar la opción <span className="text-white font-bold">Agregar al inicio</span>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleInstallClick}
                    disabled={!deferredPrompt}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Download size={18} />
                    <span className="uppercase tracking-widest text-xs font-black">Instalar Ahora</span>
                  </button>
                )}

                <button 
                  onClick={() => setShowPrompt(false)}
                  className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/50 hover:text-indigo-400 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
