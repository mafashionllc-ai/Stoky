
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
      className={`bg-[#24243E]/40 px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-[24px] flex items-center relative group cursor-pointer transition-all border ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-500/10' : ''}`}
      style={{ borderColor }}
      id={`product-card-${product.id}`}
    >
      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white rounded-full p-1 z-10 shadow-lg ring-2 ring-[#0F0F1B]">
          <Plus size={10} className="rotate-45" />
        </div>
      )}
      
      {/* Container Principal - Horizontal Layout Optimized for Single Column */}
      <div className="flex items-center w-full min-w-0">
        {/* Left: Icon & Line Name */}
        <div className="flex flex-col items-center justify-center min-w-[40px] sm:min-w-[58px] mr-2 sm:mr-4 border-r border-white/5 pr-2 sm:pr-4">
          <span className="text-xl sm:text-3xl transition-all mb-0.5 sm:mb-1">
            {line?.emoji || '✨'}
          </span>
          <span className="text-xs sm:text-sm font-black tracking-widest uppercase opacity-40 truncate max-w-full text-center hidden sm:block" style={{ color: lineThemeColor }}>
             {line?.nombre || 'Gral'}
          </span>
        </div>

        {/* Middle: Product Content */}
        <div className="flex-1 min-w-0 pr-2 sm:pr-4">
          <h4 className="text-[16px] sm:text-[17px] font-normal text-white leading-tight tracking-tight line-clamp-1 mb-1 sm:mb-1.5">
            {product.nombre}
          </h4>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
             <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-md ${typeColor}`}>
                <span className="scale-75 sm:scale-100 -ml-0.5 sm:ml-0">{typeIcon}</span>
                <span className="text-xs sm:text-sm font-black tracking-widest uppercase hidden sm:inline">{typeLabel}</span>
             </div>
             {product.codigo && <span className="text-xs sm:text-sm text-gray-500 font-medium tracking-widest uppercase">#{product.codigo}</span>}
          </div>
        </div>

        {/* Right: Prices & Stock */}
        <div className="flex items-center space-x-3 sm:space-x-8">
          <div className="flex flex-col items-end">
            <span className="text-white text-sm sm:text-base font-medium italic opacity-95 tracking-tighter">${product.precio?.toFixed(2)}</span>
            <span className="text-emerald-500/50 text-xs sm:text-[13px] font-medium italic tracking-tighter">${product.costo?.toFixed(2)}</span>
          </div>
          
          <div className="flex flex-col items-center min-w-[28px] sm:min-w-[36px]">
            <span className="text-[16px] sm:text-xl font-black leading-none ${isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-white'}">
              {product.stockActual}
            </span>
            <span className="text-xs sm:text-sm text-gray-600 uppercase font-black tracking-tighter mt-0.5 hidden sm:block">unid</span>
          </div>

          <div className="hidden sm:block">
            {onEdit && !selectionMode ? (
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all active:scale-90 border border-white/5"
              >
                <Edit2 size={12} />
              </button>
            ) : (
                <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'} shadow-lg shadow-black/50`} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

