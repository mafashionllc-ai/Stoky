
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Filter, ArrowDownCircle, ArrowUpCircle, Clock, History } from 'lucide-react';
import { LineaChip } from '../components/LineaChip';

export const MovimientosScreen: React.FC = () => {
  const { movements, products, lines } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'ingreso' | 'egreso'>('all');
  const [selectedLineId, setSelectedLineId] = useState<'all' | string>('all');

  const filteredMovements = React.useMemo(() => {
    return [...movements].filter(m => {
      const matchesType = filterType === 'all' || m.tipo === filterType;
      const matchesLine = selectedLineId === 'all' || m.lineaId === selectedLineId;
      return matchesType && matchesLine;
    }).sort((a, b) => {
      const dateA = (a.fechaHora as any)?.toDate ? (a.fechaHora as any).toDate() : new Date();
      const dateB = (b.fechaHora as any)?.toDate ? (b.fechaHora as any).toDate() : new Date();
      return dateB.getTime() - dateA.getTime();
    });
  }, [movements, filterType, selectedLineId]);

  return (
    <div className="pb-28 px-4 pt-4 bg-[#1A1A2E] min-h-screen">
      <header className="flex items-center justify-between py-4 bg-opacity-50 backdrop-blur-md mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-pink-500 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-pink-500/20">M</div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Movimientos</h1>
        </div>
      </header>

      {/* Filters */}
      <div className="flex space-x-2 mb-5">
        <button 
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === 'all' ? 'bg-[#6C63FF] text-white' : 'bg-[#24243E] text-slate-400'}`}
        >
          TODOS
        </button>
        <button 
          onClick={() => setFilterType('ingreso')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === 'ingreso' ? 'bg-[#10B981] text-white' : 'bg-[#24243E] text-slate-400'}`}
        >
          INGRESOS
        </button>
        <button 
          onClick={() => setFilterType('egreso')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === 'egreso' ? 'bg-[#F59E0B] text-white' : 'bg-[#24243E] text-slate-400'}`}
        >
          EGRESOS
        </button>
      </div>

      <div className="mb-8 -mx-6 px-6 overflow-x-auto no-scrollbar flex space-x-3">
        <LineaChip 
          line={{ id: 'all', nombre: 'Todas las líneas', emoji: '🏢', color: '#6C63FF' }}
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

      {/* History List */}
      <div className="space-y-4">
        {filteredMovements.map((move, index) => {
          const product = products.find(p => p.id === move.productoId);
          const date = (move.fechaHora as any)?.toDate ? (move.fechaHora as any).toDate() : new Date();
          
          return (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={move.id}
              className="bg-[#24243E] p-4 rounded-2xl flex items-center justify-between border border-white/5"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${move.tipo === 'ingreso' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
                  {move.tipo === 'ingreso' ? <ArrowDownCircle size={28} /> : <ArrowUpCircle size={28} />}
                </div>
                <div>
                  <h4 className="text-white font-bold">{product?.nombre || 'Producto eliminado'}</h4>
                  <p className="text-slate-400 text-[10px] uppercase font-bold flex items-center">
                    <Clock size={10} className="mr-1" />
                    {format(date, "d MMM, HH:mm", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-xl font-black ${move.tipo === 'ingreso' ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                  {move.tipo === 'ingreso' ? '+' : '-'}{move.cantidad}
                </p>
                <p className="text-slate-500 text-[10px] font-bold">STOCK: {move.stockNuevo}</p>
              </div>
            </motion.div>
          );
        })}

        {filteredMovements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <History size={64} className="mb-4 opacity-20" />
            <p className="font-bold">No hay movimientos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};
