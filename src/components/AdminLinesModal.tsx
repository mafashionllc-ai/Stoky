import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2, Palette, Smile, Hash, AlignLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { TreatmentLine } from '../types';
import { createLine, updateLine, deleteLine } from '../services/firestoreService';

interface AdminLinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: TreatmentLine[];
}

const EMOJI_PRESETS = [
  '👑', '👸', '🤴', '🏰', '💎', '✨', '🧴', '💆', '🧖', '🚿', '💄', '🧼', '🫧',
  // Realeza y Premios
  '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '🎫', '🎟', '🎗', '⚜️', '🔱',
  // Naturaleza y Plantas
  '🌿', '🌱', '🌵', '🎄', '🌲', '🌳', '🌴', '🍀', '🍃', '🍂', '🍁', '🍄', 
  '🌺', '🌻', '🌹', '🌷', '🌼', '🌸', '🎋', '🎍', '🌾',
  // Vegetales y Frutas
  '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', 
  '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌽', '🥕',
  // Salud, Belleza y Cuidado
  '🧪', '🧬', '🔬', '🧺', '🧽', '🧼', '🧹', '💄', '🪮', '💇‍♀️', '💇‍♂️', '🧖‍♀️', '🧖‍♂️', '💆‍♀️', '💆‍♂️', '💅', '💈', '🗜️', '🔌', '🌡️'
];

export const AdminLinesModal: React.FC<AdminLinesModalProps> = ({ isOpen, onClose, lines }) => {
  const [editingLine, setEditingLine] = useState<Partial<TreatmentLine> | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [emoji, setEmoji] = useState(EMOJI_PRESETS[0]);
  const [order, setOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  // Sort lines by order
  const sortedLines = [...lines].sort((a, b) => (a.orden || 0) - (b.orden || 0));

  useEffect(() => {
    if (editingLine) {
      setName(editingLine.nombre || '');
      setDescription(editingLine.descripcion || '');
      setColor(editingLine.color || '#6366f1');
      setEmoji(editingLine.emoji || EMOJI_PRESETS[0]);
      setOrder(String(editingLine.orden || sortedLines.length + 1));
      setIsActive(editingLine.activa !== false);
    } else {
      reset();
    }
  }, [editingLine, sortedLines.length]);

  const reset = () => {
    setName('');
    setDescription('');
    setColor('#6366f1');
    setEmoji(EMOJI_PRESETS[0]);
    setOrder(String(sortedLines.length + 1));
    setIsActive(true);
    setEditingLine(null);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const data = { 
        nombre: name, 
        descripcion: description,
        color, 
        emoji,
        orden: parseInt(order) || 0,
        activa: isActive
      };
      
      if (editingLine?.id) {
        await updateLine(editingLine.id, data);
      } else {
        await createLine(data);
      }
      reset();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro? Se borrarán todos los productos asociados a esta línea.')) return;
    try {
      await deleteLine(id);
      if (editingLine?.id === id) reset();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80]" />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[95vh] bg-[#1A1A2E] rounded-t-[48px] z-[90] flex flex-col border-t border-white/10"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2" />
            
            <div className="p-6 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                  <Palette size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white italic tracking-tighter">GESTIÓN DE LÍNEAS</h2>
                  <p className="text-[10px] text-indigo-400/60 font-black tracking-widest uppercase">Personaliza tu catálogo</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-40">
              {/* Form Section */}
              <div className="bg-[#24243E] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
                <div className="bg-gradient-to-r from-indigo-600/10 to-transparent p-4 border-b border-white/5">
                  <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">
                    {editingLine ? 'Editando Línea' : 'Nueva Línea de Tratamiento'}
                  </p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2 flex items-center">
                        <Smile size={12} className="mr-1 opacity-50" /> Nombre
                      </label>
                      <input 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        placeholder="Ej. Hidratherapy"
                        className="w-full bg-[#1A1A2E] border-none py-4 px-6 rounded-2xl text-white font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2 flex items-center">
                        <Hash size={12} className="mr-1 opacity-50" /> Orden
                      </label>
                      <input 
                        type="number"
                        value={order} 
                        onChange={e => setOrder(e.target.value)}
                        placeholder="Posición"
                        className="w-full bg-[#1A1A2E] border-none py-4 px-6 rounded-2xl text-white font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2 flex items-center">
                      <AlignLeft size={12} className="mr-1 opacity-50" /> Descripción Corta
                    </label>
                    <textarea 
                      value={description} 
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describre para qué sirve esta línea..."
                      rows={2}
                      className="w-full bg-[#1A1A2E] border-none py-4 px-6 rounded-2xl text-white font-medium text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Color de Marca</label>
                      <div className="flex items-center space-x-3 bg-[#1A1A2E] p-3 rounded-2xl">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-inner border border-white/10">
                          <input 
                            type="color"
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-none p-0"
                          />
                        </div>
                        <input 
                          value={color.toUpperCase()} 
                          onChange={e => setColor(e.target.value)}
                          className="bg-transparent border-none text-xs font-mono text-gray-400 outline-none w-20"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Estado</label>
                      <button 
                        onClick={() => setIsActive(!isActive)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                          <CheckCircle2 size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{isActive ? 'ACTIVA' : 'INACTIVA'}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Icono de la Línea</p>
                      <div className="px-3 py-1 bg-white/5 rounded-full flex items-center space-x-2">
                        <span className="text-2xl">{emoji}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 p-4 bg-[#1A1A2E] rounded-3xl max-h-[200px] overflow-y-auto custom-scrollbar border border-white/5">
                      {EMOJI_PRESETS.map(e => (
                        <button 
                          key={e} 
                          onClick={() => setEmoji(e)}
                          className={`w-full aspect-square rounded-xl text-xl flex items-center justify-center transition-all ${emoji === e ? 'bg-indigo-600 scale-110 shadow-lg shadow-indigo-600/40 ring-2 ring-white/50 border border-white/20' : 'bg-white/5 hover:bg-white/10 opacity-60 hover:opacity-100'}`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    {editingLine && (
                      <button 
                        onClick={reset} 
                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] transition-colors"
                      >
                        Descartar
                      </button>
                    )}
                    <button 
                      disabled={loading}
                      onClick={handleSave}
                      className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Save size={18}/>
                      <span className="uppercase tracking-widest text-xs">{editingLine ? 'GUARDAR CAMBIOS' : 'CREAR LÍNEA'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* List Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Catálogo de Líneas ({lines.length})</p>
                  <p className="text-[10px] font-black uppercase text-indigo-400/60 tracking-widest">Ordenadas por prioridad</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {sortedLines.map(line => (
                    <motion.div 
                      layout
                      key={line.id} 
                      className={`group relative bg-[#24243E]/40 hover:bg-[#24243E] p-4 rounded-[28px] border border-white/5 flex items-center justify-between transition-all ${!line.activa && 'opacity-60 grayscale'}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                            {line.emoji}
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1A1A2E] flex items-center justify-center text-[10px] font-bold text-gray-500 border border-white/10">
                            {line.orden}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-black text-white uppercase tracking-tight truncate">{line.nombre}</h4>
                            {!line.activa && <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">OCULTA</span>}
                          </div>
                          {line.descripcion && <p className="text-[10px] text-gray-500 font-medium line-clamp-1 mb-1">{line.descripcion}</p>}
                          <div className="w-16 h-1 rounded-full overflow-hidden bg-white/5 mt-1">
                            <div className="h-full" style={{ backgroundColor: line.color, width: '100%' }} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => setEditingLine(line)} 
                          className="p-3 text-gray-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-2xl transition-all"
                          title="Editar"
                        >
                          <ChevronRight size={20}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(line.id)} 
                          className="p-3 text-red-400/30 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
