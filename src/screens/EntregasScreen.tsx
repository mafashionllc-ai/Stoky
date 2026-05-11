
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Calendar, User, Receipt, Download, ChevronRight, FileText, X, Printer, Share2, Edit, Trash2 } from 'lucide-react';
import { DeliveryNoteModal } from '../components/DeliveryNoteModal';
import { DeliveryNote } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { doc, writeBatch, collection, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';

export const EntregasScreen: React.FC = () => {
  const { deliveryNotes, products, user, lines } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<DeliveryNote | null>(null);
  const [noteToEdit, setNoteToEdit] = useState<DeliveryNote | null>(null);

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    
    setIsDeleting(true);
    try {
      const batch = writeBatch(db);
      const timestamp = serverTimestamp();

      console.log("Iniciando eliminación de nota:", noteToDelete.nroNota);

      // 1. Revert stock for each item in the note
      for (const item of noteToDelete.items) {
        const productRef = doc(db, 'productos', item.productoId);
        const currentProduct = products.find(p => p.id === item.productoId);
        
        batch.update(productRef, {
          stockActual: increment(item.cantidad),
          actualizadoEn: timestamp
        });

        // 2. Log reversion movement
        const movementRef = doc(collection(db, 'movimientos'));
        batch.set(movementRef, {
          productoId: item.productoId,
          lineaId: currentProduct?.lineaId || 'unknown',
          tipo: 'ingreso',
          cantidad: item.cantidad,
          stockAnterior: currentProduct?.stockActual || 0,
          stockNuevo: (currentProduct?.stockActual || 0) + item.cantidad,
          nota: `REVERSION: Eliminación Nota ${noteToDelete.nroNota}`,
          usuarioId: user.uid,
          fechaHora: timestamp
        });
      }

      // 3. Delete the note
      const noteRef = doc(db, 'notas_entrega', noteToDelete.id);
      batch.delete(noteRef);

      await batch.commit();
      console.log("Nota eliminada y stock revertido exitosamente:", noteToDelete.nroNota);
      alert(`Nota ${noteToDelete.nroNota} eliminada correctamente. El inventario ha sido actualizado.`);
      setNoteToDelete(null);
      setSelectedNote(null);
    } catch (error) {
      console.error("Error detallado al eliminar la nota:", error);
      alert("No se pudo eliminar la nota. Detalle: " + (error instanceof Error ? error.message : "Error desconocido"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async (note: DeliveryNote) => {
    const itemsText = note.items.map(item => `${item.cantidad}x ${item.nombre} - $${item.subtotal.toFixed(2)}`).join('\n');
    const shareText = `Nota de Entrega: ${note.nroNota}\nCliente: ${note.receptor}\nFecha: ${formatDate(note.fecha)}\n\nProductos:\n${itemsText}\n\nTotal: $${note.total.toFixed(2)}\n${note.observaciones ? `\nObs: ${note.observaciones}` : ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Nota de Entrega ${note.nroNota}`,
          text: shareText,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Copiado al portapapeles');
      } catch (err) {
        console.error("Error copying:", err);
      }
    }
  };

  const handleEditNote = (note: DeliveryNote) => {
    setNoteToEdit(note);
    setIsModalOpen(true);
    setSelectedNote(null);
  };

  const handleOpenNewNote = () => {
    setNoteToEdit(null);
    setIsModalOpen(true);
  };

  const filteredNotes = useMemo(() => {
    return (deliveryNotes || []).filter(note => 
      note.receptor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.nroNota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.items.some(item => item.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => {
      const dateA = a.fecha instanceof Date ? a.fecha : (a.fecha as any)?.toDate ? (a.fecha as any).toDate() : new Date(a.fecha as any);
      const dateB = b.fecha instanceof Date ? b.fecha : (b.fecha as any)?.toDate ? (b.fecha as any).toDate() : new Date(b.fecha as any);
      return dateB.getTime() - dateA.getTime();
    });
  }, [deliveryNotes, searchTerm]);

  const formatDate = (fecha: any) => {
    try {
      const d = fecha instanceof Date ? fecha : (fecha?.toDate ? fecha.toDate() : new Date(fecha));
      return format(d, "dd 'de' MMMM, HH:mm", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="pb-24">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase italic bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent">
            ENTREGAS
          </h1>
          <p className="text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase mt-1">Notas de Entrega e Inventario</p>
        </div>
        <button 
          onClick={handleOpenNewNote}
          className="flex items-center space-x-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all font-black text-[10px] tracking-widest uppercase active:scale-95"
        >
          <Plus size={16} />
          <span>NUEVA NOTA</span>
        </button>
      </header>

      {/* Search */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 pointer-events-none">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="BUSCAR POR RECEPTOR O Nº DE NOTA..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#24243E] rounded-[30px] py-5 pl-14 pr-6 text-white text-xs font-black uppercase tracking-[0.1em] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all border border-white/5 shadow-xl"
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredNotes.map((note, index) => (
            <motion.div
              layout
              key={note.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedNote(note)}
              className="group bg-[#1E1E35] p-6 rounded-[35px] border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                <Receipt size={100} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-500 tracking-[0.2em] uppercase mb-1">{note.nroNota}</span>
                    <h3 className="text-white font-black text-lg uppercase leading-none tracking-tight truncate max-w-[180px]">
                      {note.receptor}
                    </h3>
                  </div>
                    <div className="flex items-start space-x-3">
                    <div className="text-right">
                      <p className="text-white font-black text-2xl italic tracking-tighter leading-none">${note.total.toFixed(2)}</p>
                      <p className="text-slate-500 text-[8px] font-bold uppercase mt-1">Total Nota</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(note);
                      }}
                      className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-md active:scale-90"
                      title="Eliminar Nota"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex -space-x-3">
                    {note.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-10 h-10 rounded-2xl bg-[#131325] border-2 border-[#1E1E35] flex items-center justify-center text-lg shadow-xl shrink-0">
                        {products.find(p => p.id === item.productoId)?.emoji || '📦'}
                      </div>
                    ))}
                    {note.items.length > 3 && (
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500 border-2 border-[#1E1E35] flex items-center justify-center text-[10px] font-black text-white shrink-0">
                        +{note.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-black text-xs leading-none">{note.items.length} PRODUCTOS</p>
                    <p className="text-slate-500 text-[9px] font-bold uppercase mt-1">{formatDate(note.fecha)}</p>
                  </div>
                </div>

                <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                  <div className="bg-white/5 px-4 py-2 rounded-full">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ver Detalle</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Receipt size={40} />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-center">No se encontraron entregas</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] mt-2 text-slate-700">Intenta con otro término de búsqueda</p>
        </div>
      )}

      {/* Modals */}
      <DeliveryNoteModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNoteToEdit(null);
        }}
        editNote={noteToEdit}
      />

      {/* Note Detail Modal */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#131325] rounded-[40px] shadow-2xl overflow-hidden border border-white/10"
            >
              {/* Factura Layout in Mobile/Modal */}
              <div className="bg-white flex flex-col h-full max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="bg-slate-100 p-8 border-b-2 border-dashed border-slate-300">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-slate-900 font-black text-2xl tracking-tighter uppercase italic leading-none">NOTA <span className="text-indigo-600">DETALLE</span></h3>
                      <p className="text-slate-400 text-[10px] font-black tracking-widest mt-1">Nº {selectedNote.nroNota}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleEditNote(selectedNote)}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                        title="Editar Nota"
                      >
                        <Edit size={16} />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      <button 
                        onClick={() => setNoteToDelete(selectedNote)}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 hover:bg-rose-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm disabled:opacity-50"
                        title="Eliminar Nota"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                      <button 
                        onClick={() => setSelectedNote(null)} 
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">RECEPTOR</label>
                      <p className="text-slate-900 font-black text-sm uppercase">{selectedNote.receptor}</p>
                    </div>
                    <div className="text-right">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">FECHA</label>
                      <p className="text-slate-900 font-black text-xs uppercase">{formatDate(selectedNote.fecha)}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-light">
                  <table className="w-full">
                    <thead className="border-b border-slate-100">
                      <tr>
                        <th className="text-left py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">PRODUCTO</th>
                        <th className="text-center py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">CANT</th>
                        <th className="text-right py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedNote.items.map((item, i) => (
                        <tr key={i}>
                          <td className="py-4">
                            <p className="text-slate-900 font-black text-xs uppercase whitespace-normal leading-tight mb-1">{item.nombre}</p>
                            <p className="text-slate-400 font-bold text-[8px] uppercase">
                              {lines.find(l => l.id === products.find(p => p.id === item.productoId)?.lineaId)?.nombre || 'General'}
                            </p>
                          </td>
                          <td className="py-4 text-center">
                            <span className="text-xs font-black text-slate-900">{item.cantidad}</span>
                          </td>
                          <td className="py-4 text-right">
                            <p className="text-slate-900 font-black text-xs italic">${item.subtotal.toFixed(2)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {selectedNote.observaciones && (
                    <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">NOTAS ADICIONALES</p>
                      <p className="text-slate-600 text-xs font-medium italic">"{selectedNote.observaciones}"</p>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="bg-slate-950 p-8 text-white">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span>SUBTOTAL</span>
                      <span>${selectedNote.subtotal.toFixed(2)}</span>
                    </div>
                    {(selectedNote.taxAmount || 0) > 0 && (
                      <div className="flex justify-between text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        <span>TAX APLICADO</span>
                        <span>+${selectedNote.taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {(selectedNote.montoDescuento || 0) > 0 && (
                      <div className="flex justify-between text-[10px] font-black text-rose-400 uppercase tracking-widest">
                        <span>DESCUENTO</span>
                        <span>-${selectedNote.montoDescuento.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">TOTAL</span>
                    <span className="text-4xl font-black italic tracking-tighter">${selectedNote.total.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <button className="bg-white/5 hover:bg-white/10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all">
                      <Printer size={16} />
                      <span>Imprimir</span>
                    </button>
                    <button 
                      onClick={() => handleShare(selectedNote)}
                      className="bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-xl shadow-indigo-600/20"
                    >
                      <Share2 size={16} />
                      <span>Compartir</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Custom Deletion Confirmation Modal */}
      <AnimatePresence>
        {noteToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1E1E35] p-8 rounded-[40px] border border-white/10 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-white font-black text-xl uppercase italic tracking-tighter mb-4">¿Eliminar Nota?</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8">
                Esta acción es irreversible y regresará los productos al inventario automáticamente.
              </p>
              <div className="flex flex-col space-y-3">
                <button
                  disabled={isDeleting}
                  onClick={handleDeleteNote}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Confirmar Eliminación</span>
                  )}
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() => setNoteToDelete(null)}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
