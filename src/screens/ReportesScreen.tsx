
import React, { useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';
import { Package, Layers, Activity, AlertTriangle, TrendingUp, Download, Calendar, Filter } from 'lucide-react';
import { LINE_COLORS } from '../theme/colors';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval, startOfYear, endOfYear, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';

type TimeFilter = 'hoy' | 'semana' | 'mes' | 'año' | 'personalizado';

export const ReportesScreen: React.FC = () => {
  const { products, lines, movements } = useApp();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('mes');
  const [customRange, setCustomRange] = useState({ start: format(subDays(new Date(), 30), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') });
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMoves = movements.filter(m => {
      const mDate = (m.fechaHora as any)?.toDate ? (m.fechaHora as any).toDate() : new Date();
      mDate.setHours(0, 0, 0, 0);
      return mDate.getTime() === today.getTime();
    });

    const lowStock = products.filter(p => p.stockActual <= p.stockMinimo);
    const totalStockValue = products.reduce((acc, p) => {
      const stock = Number(p.stockActual) || 0;
      const cost = Number(p.costo) || 0;
      return acc + (stock * cost);
    }, 0);

    return [
      { label: 'Valor Inventario', value: `$${totalStockValue.toLocaleString()}`, icon: TrendingUp, color: '#10B981', helper: totalStockValue === 0 && products.length > 0 ? 'Registra ingresos para ver valor' : 'Costo total de productos en stock' },
      { label: 'Stock Bajo', value: lowStock.length, icon: AlertTriangle, color: '#F59E0B' },
      { label: 'Productos', value: products.length, icon: Package, color: '#6C63FF' },
      { label: 'Líneas', value: lines.length, icon: Layers, color: '#FF6584' },
    ];
  }, [products, lines, movements]);

  const lineValueData = useMemo(() => {
    return lines.map(line => {
      const lineProducts = products.filter(p => p.lineaId === line.id);
      
      const calcTotalValue = (prods: any[]) => prods.reduce((acc, p) => {
        const stock = Number(p.stockActual) || 0;
        const cost = Number(p.costo) || 0;
        return acc + (stock * cost);
      }, 0);

      const total = calcTotalValue(lineProducts);
      const cabin = calcTotalValue(lineProducts.filter(p => p.tipo === 'salon' || (p.tipo as string) === 'cabina'));
      const home = calcTotalValue(lineProducts.filter(p => p.tipo === 'after_care'));
      const ambos = calcTotalValue(lineProducts.filter(p => p.tipo === 'ambos'));
      
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

  const timelineData = useMemo(() => {
    let start: Date;
    let end: Date = endOfDay(new Date());

    switch (timeFilter) {
      case 'hoy':
        start = startOfDay(new Date());
        break;
      case 'semana':
        start = startOfWeek(new Date());
        break;
      case 'mes':
        start = startOfMonth(new Date());
        break;
      case 'año':
        start = startOfYear(new Date());
        break;
      case 'personalizado':
        start = startOfDay(parseISO(customRange.start));
        end = endOfDay(parseISO(customRange.end));
        break;
      default:
        start = startOfMonth(new Date());
    }

    const filteredMovements = movements.filter(m => {
      const mDate = (m.fechaHora as any)?.toDate ? (m.fechaHora as any).toDate() : new Date();
      return isWithinInterval(mDate, { start, end });
    });

    const days = eachDayOfInterval({ start, end });
    return days.map(day => {
      const dayStr = format(day, 'MMM dd');
      const dayMoves = filteredMovements.filter(m => {
        const mDate = (m.fechaHora as any)?.toDate ? (m.fechaHora as any).toDate() : new Date();
        return format(mDate, 'MMM dd') === dayStr;
      });

      const ingresos = dayMoves.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + (m.cantidad || 0), 0);
      const egresos = dayMoves.filter(m => m.tipo === 'egreso').reduce((acc, m) => acc + (m.cantidad || 0), 0);

      return {
        date: dayStr,
        fullDate: format(day, 'yyyy-MM-dd'),
        ingresos,
        egresos,
      };
    });
  }, [movements, timeFilter, customRange]);

  const exportToExcel = () => {
    const dataToExport = movements.map(m => {
      const prod = products.find(p => p.id === m.productoId);
      const line = lines.find(l => l.id === m.lineaId);
      return {
        Fecha: (m.fechaHora as any)?.toDate ? format((m.fechaHora as any).toDate(), 'yyyy-MM-dd HH:mm') : '',
        Producto: prod?.nombre || 'N/A',
        Linea: line?.nombre || 'N/A',
        Tipo: m.tipo === 'ingreso' ? 'ENTRADA' : 'SALIDA',
        Cantidad: m.cantidad,
        StockAnterior: m.stockAnterior,
        StockNuevo: m.stockNuevo,
        CostoUnitario: prod?.costo || 0,
        ValorMovimiento: (m.cantidad * (prod?.costo || 0)).toFixed(2),
        Nota: m.note || m.nota || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    XLSX.writeFile(wb, `Reporte_Movimientos_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="pb-28 px-4 pt-4 bg-[#1A1A2E] min-h-screen">
      <header className="flex items-center justify-between py-4 bg-opacity-50 backdrop-blur-md mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-500/20">R</div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Reportes</h1>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center space-x-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all font-black text-xs tracking-widest uppercase"
        >
          <Download size={16} />
          <span>DESCARGAR EXCEL</span>
        </button>
      </header>

      {/* Timeline Filter */}
      <div className="bg-[#24243E] p-2 rounded-2xl border border-white/5 mb-6 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 min-w-max">
          {(['hoy', 'semana', 'mes', 'año', 'personalizado'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setTimeFilter(f);
                if (f === 'personalizado') setShowCustomPicker(true);
                else setShowCustomPicker(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
                timeFilter === f ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              {f === 'hoy' ? 'Hoy' : f === 'semana' ? 'Semana' : f === 'mes' ? 'Mes' : f === 'año' ? 'Año' : 'Filtro'}
            </button>
          ))}
        </div>
        {timeFilter === 'personalizado' && (
          <button 
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <Calendar size={16} />
          </button>
        )}
      </div>

      {showCustomPicker && timeFilter === 'personalizado' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-[#24243E] p-4 rounded-3xl border border-white/5 mb-6 grid grid-cols-2 gap-3"
        >
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Desde</label>
            <input 
              type="date" 
              value={customRange.start}
              onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl p-2 text-white text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Hasta</label>
            <input 
              type="date" 
              value={customRange.end}
              onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl p-2 text-white text-xs"
            />
          </div>
        </motion.div>
      )}

      {/* Timeline Chart */}
      <div className="bg-[#24243E] rounded-3xl p-6 border border-white/5 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Activity size={18} className="text-emerald-500" />
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Flujo de Inventario</h3>
          </div>
          <button 
            onClick={exportToExcel}
            className="p-2 bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-500 rounded-xl transition-all border border-white/5"
            title="Descargar Reporte Completo"
          >
            <Download size={16} />
          </button>
        </div>
        
        <div className="flex items-center justify-end space-x-6 mb-6">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Salidas</p>
            <p className="text-xs font-black text-rose-500">{timelineData.reduce((acc, d) => acc + d.egresos, 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Entradas</p>
            <p className="text-xs font-black text-emerald-500">{timelineData.reduce((acc, d) => acc + d.ingresos, 0)}</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                axisLine={false} 
                tickLine={false}
                interval={timelineData.length > 10 ? Math.floor(timelineData.length / 5) : 0}
              />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A2E', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                itemStyle={{ padding: '0px' }}
              />
              <Line type="monotone" dataKey="ingresos" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="egresos" stroke="#F43F5E" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

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
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest leading-none">{metric.label}</span>
              </div>
              <p className="text-3xl font-black text-white">{metric.value}</p>
              {(metric as any).helper && (
                <p className="text-[11px] text-emerald-500 font-bold mt-1 uppercase tracking-tight">{(metric as any).helper}</p>
              )}
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
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1 leading-none">Salon</p>
                  <p className="text-sm font-black text-white">${line.cabin.toLocaleString()}</p>
                </div>
                <div className="bg-[#1A1A2E] p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1 leading-none">Home Care</p>
                  <p className="text-sm font-black text-white">${line.home.toLocaleString()}</p>
                </div>
                <div className="bg-[#1A1A2E] p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1 leading-none">Mixto</p>
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
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-white font-black text-sm uppercase leading-tight break-words">{p.nombre}</h4>
                  <p className="text-red-500 text-xs font-bold">Mínimo: {p.stockMinimo} / Actual: {p.stockActual}</p>
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
