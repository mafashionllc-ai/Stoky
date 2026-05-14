
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, Plus, Trash2, ShoppingBag, Edit2, Share2, MessageSquareText } from 'lucide-react';
import { deletePromotion } from '../services/firestoreService';
import { AdminPromotionModal } from '../components/AdminPromotionModal';
import { Promotion } from '../types';

export const PromocionesScreen: React.FC = () => {
  const { products, lines, promotions } = useApp();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [promotionToEdit, setPromotionToEdit] = useState<Promotion | null>(null);

  const handleEdit = (promo: Promotion) => {
    setPromotionToEdit(promo);
    setIsAdminModalOpen(true);
  };

  const handleShare = (promo: Promotion) => {
    const productsList = promo.productos
      .map(p => {
        const prod = products.find(prod => prod.id === p.productoId);
        const line = lines.find(l => l.id === prod?.lineaId);
        const lineText = line ? ` _(${line.nombre})_` : '';
        return `🔹 ${p.cantidad}x ${p.nombre.toUpperCase()}${lineText}`;
      })
      .join('\n');

    const message = `🔥 *PROMOCIÓN ESPECIAL: ${promo.nombre.toUpperCase()}* 🔥
⚠️ _Precios no incluyen TAX (6.5%)_
━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ ¡Aprovecha esta oferta por tiempo limitado!

📦 *LO QUE INCLUYE:*
${productsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *INVERSIÓN:*
🔸 Antes: $${promo.subtotalRegular.toFixed(2)}
✨ *OFERTA:* *$${promo.totalFinal.toFixed(2)}*
💎 *AHORRAS:* $${(promo.subtotalRegular - promo.totalFinal).toFixed(2)} (${((1 - promo.totalFinal / promo.subtotalRegular) * 100).toFixed(0)}% OFF)

━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 *MÉTODOS DE PAGO:*
📌 *ZELLE:* MA Fashion LLC
📱 *Número:* 407 2181294

🚀 ¡Pide la tuya ahora mismo!
_MA Fashion - S Professional_`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleCreate = () => {
    setPromotionToEdit(null);
    setIsAdminModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta promoción definitivamente?')) {
      await deletePromotion(id);
    }
  };

  return (
    <div className="pb-28 px-4 pt-4 bg-[#1A1A2E] min-h-screen">
      <header className="flex items-center justify-between py-4 bg-opacity-50 backdrop-blur-md mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-amber-500/20">P</div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Promos</h1>
        </div>
        <button 
          onClick={handleCreate}
          className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={20} />
        </button>
      </header>

      <div className="space-y-4">
        {promotions.map(promo => (
          <motion.div 
            layout
            key={promo.id} 
            className="bg-[#24243E] rounded-3xl p-5 border border-white/5 relative group overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-black text-xl italic tracking-tighter uppercase leading-tight">{promo.nombre}</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                  {promo.productos.reduce((acc, p) => acc + p.cantidad, 0)} unidades en total
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${promo.activa ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-700 text-gray-400'}`}>
                {promo.activa ? 'ACTIVA' : 'INACTIVA'}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {promo.productos.map((p, idx) => {
                const prodInfo = products.find(prod => prod.id === p.productoId);
                const lineInfo = lines.find(l => l.id === prodInfo?.lineaId);
                return (
                  <div key={idx} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col">
                         <div className="flex items-center space-x-2 py-1">
                            <span className="text-xl">{prodInfo?.emoji || '📦'}</span>
                            <span className="text-sm font-black text-gray-200 uppercase leading-tight break-words">{p.nombre}</span>
                         </div>
                        {lineInfo && (
                          <span className="text-[9px] font-black uppercase tracking-widest ml-7" style={{ color: lineInfo.color }}>
                            {lineInfo.nombre}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-black text-indigo-400">{p.cantidad} ud</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-end border-t border-white/5 pt-4">
              <div>
                <p className="text-gray-600 text-[11px] font-bold line-through tracking-tighter">${promo.subtotalRegular.toFixed(2)}</p>
                <div className="flex items-baseline space-x-1">
                  <p className="text-indigo-400 text-3xl font-black italic tracking-tighter leading-none">${promo.totalFinal.toFixed(2)}</p>
                  <span className="text-emerald-500 text-[10px] font-black uppercase tracking-tighter">-{((1 - promo.totalFinal/promo.subtotalRegular)*100).toFixed(0)}%</span>
                </div>
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1 opacity-80">* No incluye TAX</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleShare(promo)}
                  className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                  title="Compartir por WhatsApp"
                >
                  <MessageSquareText size={16} />
                </button>
                <button 
                  onClick={() => handleEdit(promo)}
                  className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(promo.id)}
                  className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {promotions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <ShoppingBag size={64} className="mb-4 opacity-10" />
            <p className="font-black uppercase tracking-widest text-xs opacity-50">No hay promociones activas</p>
            <button onClick={handleCreate} className="text-indigo-400 font-bold mt-4 uppercase tracking-tighter italic">Crea la primera</button>
          </div>
        )}
      </div>

      <AdminPromotionModal 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        products={products}
        lines={lines}
        promotionToEdit={promotionToEdit}
      />
    </div>
  );
};
