
import React, { useMemo } from 'react';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package, Layers, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { LINE_COLORS } from '../theme/colors';

export const ReportesScreen: React.FC = () => {
  const { products, lines, movements } = useApp();

  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMoves = movements.filter(m => {
      const mDate = (m.fechaHora as any)?.toDate ? (m.fechaHora as any).toDate() : new Date();
      mDate.setHours(0, 0, 0, 0);
      return mDate.getTime() === today.getTime();
    });

    const lowStock = products.filter(p => p.stockActual <= p.stockMinimo);
    const totalStockValue = products.reduce((acc, p) => acc + (p.stockActual * (p.costo || p.precio || 0)), 0);

    return [
      { label: 'Valor Stock', value: `$${totalStockValue.toLocaleString()}`, icon: TrendingUp, color: '#10B981' },
      { label: 'Stock Bajo', value: lowStock.length, icon: AlertTriangle, color: '#F59E0B' },
      { label: 'Productos', value: products.length, icon: Package, color: '#6C63FF' },
      { label: 'Líneas', value: lines.length, icon: Layers, color: '#FF6584' },
    ];
  }, [products, lines, movements]);

  const lineValueData = useMemo(() => {
    return lines.map(line => {
      const lineProducts = products.filter(p => p.lineaId === line.id);
      const total = lineProducts.reduce((acc, p) => acc + (p.stockActual * (p.costo || p.precio || 0)), 0);
      const cabin = lineProducts.filter(p => p.tipo === 'cabina').reduce((acc, p) => acc + (p.stockActual * (p.costo || p.precio || 0)), 0);
      const home = lineProducts.filter(p => p.tipo === 'after_care').reduce((acc, p) => acc + (p.stockActual * (p.costo || p.precio || 0)), 0);
      const ambos = lineProducts.filter(p => p.tipo === 'ambos').reduce((acc, p) => acc + (p.stockActual * (p.costo || p.precio || 0)), 0);
      
      return {
        name: line.nombre,
        total,
        cabin,
        home,
        ambos,
        color: line.color
      };
    }).sort((a, b) => b.total - a.total);
  }, [products, lines]);

  const topProductsData = useMemo(() => {
    const productCounts: Record<string, number> = {};
    movements.forEach(m => {
      productCounts[m.productoId] = (productCounts[m.productoId] || 0) + m.cantidad;
    });

    return Object.entries(productCounts)
      .map(([id, count]) => {
        const prod = products.find(p => p.id === id);
        return {
          name: prod?.nombre?.substring(0, 10) || 'Unknown',
          fullNombre: prod?.nombre || '',
          value: count,
          lineColor: prod ? (lines.find(l => l.id === prod.lineaId)?.color || '#6C63FF') : '#6C63FF'
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [movements, products, lines]);

  return (
    <div className="pb-28 px-4 pt-4 bg-[#1A1A2E] min-h-screen">
      <header className="flex items-center justify-between py-4 bg-opacity-50 backdrop-blur-md mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-500/20">R</div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Reportes</h1>
        </div>
      </header>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={metric.label}
              className="bg-[#24243E] p-4 rounded-3xl border border-white/5"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${metric.color}15`, color: metric.color }}>
                  <Icon size={20} />
                </div>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">{metric.label}</span>
              </div>
              <p className="text-3xl font-black text-white">{metric.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Financial Breakdown Section */}
      <div className="space-y-4 mb-8">
        <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest pl-2">Desglose Financiero por Línea</h3>
        <div className="grid grid-cols-1 gap-4">
          {lineValueData.map((line) => (
            <motion.div
              layout
              key={line.name}
              className="bg-[#24243E] rounded-3xl p-5 border border-white/5"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
                  <h4 className="text-white font-black uppercase italic tracking-tighter">{line.name}</h4>
                </div>
                <p className="text-xl font-black text-white italic">${line.total.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#1A1A2E] p-3 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1 leading-none">Profesional</p>
                  <p className="text-sm font-black text-white">${line.cabin.toLocaleString()}</p>
                </div>
                <div className="bg-[#1A1A2E] p-3 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1 leading-none">Home Care</p>
                  <p className="text-sm font-black text-white">${line.home.toLocaleString()}</p>
                </div>
                <div className="bg-[#1A1A2E] p-3 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1 leading-none">Mixto</p>
                  <p className="text-sm font-black text-white">${line.ambos.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#24243E] rounded-3xl p-6 border border-white/5 mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp size={18} className="text-[#6C63FF]" />
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">Top 5 Movilidad</h3>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsData}>
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                contentStyle={{ backgroundColor: '#1A1A2E', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {topProductsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.lineColor} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stock Alert List */}
      <div>
        <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Stock Crítico</h3>
        <div className="space-y-3">
          {products.filter(p => p.stockActual <= p.stockMinimo).map(p => (
            <div key={p.id} className="bg-[#24243E] p-4 rounded-2xl flex items-center justify-between border border-white/5">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <h4 className="text-white font-bold text-sm truncate w-40">{p.nombre}</h4>
                  <p className="text-red-500 text-[10px] font-bold">Mínimo: {p.stockMinimo} / Actual: {p.stockActual}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
