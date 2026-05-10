
import React from 'react';
import { Product, TreatmentLine } from '../types';
import { motion } from 'motion/react';
import { Plus, Edit2, User, Home, Layers } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  line?: TreatmentLine;
  onClick: () => void;
  onEdit?: (product: Product) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  line, 
  onClick, 
  onEdit,
  isSelected = false,
  selectionMode = false
}) => {
  const isLowStock = product.stockActual <= product.stockMinimo && product.stockActual > 0;
  const isOutOfStock = product.stockActual <= 0;

  const typeIcon = product.tipo === 'cabina' ? <User size={10} /> : product.tipo === 'after_care' ? <Home size={10} /> : <Layers size={10} />;
  const typeLabel = product.tipo === 'cabina' ? 'PROFESIONAL' : product.tipo === 'after_care' ? 'HOME CARE' : 'MIXTO';
  const typeColor = product.tipo === 'cabina' ? 'bg-indigo-500/20 text-indigo-400' : product.tipo === 'after_care' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400';

  const lineThemeColor = line?.color || '#6366f1';
  const borderColor = isSelected 
    ? '#6366f1' 
    : `${lineThemeColor}44`;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-[#24243E]/40 px-3 py-3.5 rounded-[24px] flex items-center relative group cursor-pointer transition-all border ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-500/10' : ''}`}
      style={{ borderColor }}
      id={`product-card-${product.id}`}
    >
      {isSelected && (
        <div className="absolute -left-1 -top-1 bg-indigo-500 text-white rounded-full p-0.5 z-10 shadow-lg">
          <Plus size={10} className="rotate-45" />
        </div>
      )}
      
      {/* Columna Lateral Izquierda (Línea + Icono) */}
      <div className="flex flex-col items-center justify-center min-w-[48px] mr-2.5 py-1 border-r border-white/5 pr-2.5">
        <span className="text-[7px] font-black tracking-[0.2em] opacity-40 uppercase mb-1 truncate max-w-full text-center" style={{ color: lineThemeColor }}>
          {line?.nombre || 'Gral'}
        </span>
        <span className="text-3xl">{line?.emoji || '✨'}</span>
      </div>
      
      {/* Bloque de Contenido Derecha (Uso + Nombre) */}
      <div className="flex-1 min-w-0 mr-2 py-1">
        <div className="flex flex-col space-y-1">
          {/* Uso/Tipo en la parte superior */}
          <div className="flex items-center space-x-1.5 mb-0.5">
            <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-md ${typeColor}`}>
              <span className="scale-75 -ml-0.5">{typeIcon}</span>
              <span className="text-[7px] font-black tracking-widest uppercase">{typeLabel}</span>
            </div>
          </div>
          
          {/* Nombre del Producto */}
          <div className="flex items-start flex-col">
            <div className="flex items-center space-x-1.5 w-full">
              <h4 className="text-[15px] font-semibold text-white leading-[1.25] tracking-tight line-clamp-2">
                {product.nombre}
              </h4>
              <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${isOutOfStock ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : isLowStock ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} />
            </div>
            {product.codigo && <span className="text-[9px] text-gray-500 font-medium tracking-[0.1em] leading-none mt-1.5 uppercase">#{product.codigo}</span>}
          </div>
          
          {product.unidad && (
            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-wider">
              {product.unidad}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {onEdit && !selectionMode && (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all active:scale-90 border border-white/5"
          >
            <Edit2 size={14} />
          </button>
        )}
        <div className="text-right flex flex-col items-end justify-center min-w-[70px]">
          {product.precio !== undefined && (
            <p className="text-[11px] font-black text-indigo-400 italic mb-0.5 tracking-tighter">
              ${product.precio.toFixed(2)}
            </p>
          )}
          {product.costo !== undefined && (
            <p className="text-[9px] font-bold text-emerald-500/40 tracking-tighter mb-1 uppercase">
              Costo: ${product.costo.toFixed(2)}
            </p>
          )}
          <p className={`text-base font-black leading-none ${isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-white'}`}>
            {product.stockActual.toString().padStart(2, '0')}
            <span className="text-[8px] text-gray-600 block font-bold uppercase tracking-tighter mt-0.5">unidades</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

