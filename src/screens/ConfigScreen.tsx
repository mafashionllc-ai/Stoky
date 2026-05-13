
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import { LogOut, Sun, Moon, Info, ShieldCheck, ChevronRight, MessageSquare, Layers, Download, Trash2 } from 'lucide-react';
import { AdminLinesModal } from '../components/AdminLinesModal';
import { InstallGuideModal } from '../components/InstallGuideModal';
import { clearMovementHistory } from '../services/firestoreService';

interface ConfigItem {
  label: string;
  icon: any;
  action?: () => void;
  value?: string | boolean;
  toggle?: boolean;
  color?: string;
  visible?: boolean;
}

interface ConfigSection {
  title: string;
  items: ConfigItem[];
}

export const ConfigScreen: React.FC = () => {
  const { logout, isDarkMode, setDarkMode, user, lines, installApp, isInstallable, isInstalled } = useApp();

  const [isAdminLinesOpen, setIsAdminLinesOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const platform = isIOS ? 'ios' : 'android';

  const handleInstallClick = () => {
    if (platform === 'android') {
      installApp(); // Try native install first
      // If no native prompt, we can optionally show the guide modal too
      // But installApp already handles showing an alert if no prompt exists.
      // Let's make it more elegant:
      setIsInstallGuideOpen(true);
    } else {
      setIsInstallGuideOpen(true);
    }
  };

  const sections: ConfigSection[] = [
    {
      title: 'APP MÓVIL',
      items: [
        { 
          label: isInstalled ? 'App Instalada' : 'Instalar en este Dispositivo', 
          icon: Download, 
          action: handleInstallClick, 
          visible: !isInstalled,
          color: 'text-emerald-500'
        },
        { 
          label: 'Compartir App', 
          icon: ChevronRight, 
          action: () => {
            if (navigator.share) {
              navigator.share({
                title: 'MA Fashion - Inventario',
                text: 'Sistema de gestión de inventario para MA Fashion',
                url: window.location.origin
              });
            }
          } 
        },
      ]
    },
    {
      title: 'ADMINISTRACIÓN',
      items: [
        { label: 'Gestionar Líneas', icon: Layers, action: () => setIsAdminLinesOpen(true) },
      ]
    },
    {
      title: 'CUENTA',
      items: [
        { label: 'Usuario', icon: ShieldCheck, value: user?.email?.split('@')[0] || 'Admin' },
        { label: 'Cerrar Sesión', icon: LogOut, action: logout, color: 'text-red-500' },
      ]
    },
    {
      title: 'APARIENCIA',
      items: [
        { 
          label: 'Modo Oscuro', 
          icon: isDarkMode ? Moon : Sun, 
          toggle: true, 
          value: isDarkMode, 
          action: () => setDarkMode(!isDarkMode) 
        },
      ]
    },
    {
      title: 'PRODUCTOS & LÍNEAS',
      items: [
        { label: 'Gestionar Líneas', icon: ChevronRight, action: () => setIsAdminLinesOpen(true) },
        { label: 'Listado Maestro de Productos', icon: ChevronRight },
        { label: 'Configuración de Alertas', icon: ChevronRight },
      ]
    },
    {
      title: 'SOPORTE',
      items: [
        { label: 'Contactar Soporte S Prof.', icon: MessageSquare },
        { label: 'Acerca de STOCKY', icon: Info, value: 'v1.0.0' },
      ]
    },
    {
      title: 'MANTENIMIENTO',
      items: [
        { 
          label: 'Limpiar Historial Movimientos', 
          icon: Trash2, 
          color: 'text-rose-500', 
          action: () => {
            if (confirm('¿Estás seguro de borrar TODO el historial de movimientos? Esta acción no se puede deshacer.')) {
              clearMovementHistory().then(() => alert('Historial borrado exitosamente.'));
            }
          } 
        },
      ]
    }
  ];

  return (
    <div className="pb-28 px-4 pt-4 bg-[#1A1A2E] min-h-screen">
      <header className="flex items-center justify-between py-4 bg-opacity-50 backdrop-blur-md mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-600/20">C</div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Configuración</h1>
        </div>
      </header>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-slate-500 text-[10px] font-black tracking-[0.2em] mb-4">{section.title}</h3>
            <div className="bg-[#24243E] rounded-3xl overflow-hidden border border-white/5">
              {section.items.filter(item => item.visible !== false).map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${item.color || 'text-white'}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1A1A2E] flex items-center justify-center text-slate-400">
                      <item.icon size={20} />
                    </div>
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  
                  {item.toggle ? (
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${item.value ? 'bg-[#6C63FF]' : 'bg-slate-700'}`}>
                      <motion.div 
                        animate={{ x: item.value ? 24 : 0 }}
                        className="w-4 h-4 bg-white rounded-full shadow-md" 
                      />
                    </div>
                  ) : item.value ? (
                    <span className="text-slate-500 text-xs">{item.value}</span>
                  ) : (
                    <ChevronRight size={16} className="text-slate-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center pb-8">
        <p className="text-slate-600 text-[10px] font-bold tracking-widest italic uppercase">Simplemente Diferente</p>
        <p className="text-slate-700 text-[9px] mt-1 tracking-widest">© 2026 S Professional USA</p>
      </div>

      <AdminLinesModal 
        isOpen={isAdminLinesOpen}
        onClose={() => setIsAdminLinesOpen(false)}
        lines={lines}
      />

      <InstallGuideModal 
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
        platform={platform}
      />
    </div>
  );
};
