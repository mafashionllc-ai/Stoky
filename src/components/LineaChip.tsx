
import React from 'react';
import { TreatmentLine } from '../types';
import { motion } from 'motion/react';

interface LineaChipProps {
  line: TreatmentLine | { id: 'all'; nombre: 'Todo'; emoji: '📦'; color: string };
  isActive: boolean;
  onClick: () => void;
}

export const LineaChip: React.FC<LineaChipProps> = ({ line, isActive, onClick }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-1.5 rounded-full border transition-all shadow-lg whitespace-nowrap text-[11px] font-bold ${
        isActive 
          ? 'text-white' 
          : 'bg-opacity-20 backdrop-blur-sm'
      }`}
      style={{ 
        backgroundColor: isActive ? line.color : `${line.color}22`,
        borderColor: isActive ? 'transparent' : `${line.color}44`,
        color: isActive ? '#FFFFFF' : line.color,
        boxShadow: isActive ? `0 8px 12px -3px ${line.color}30` : 'none'
      }}
      id={`line-chip-${line.id}`}
    >
      <span className="text-sm">{line.emoji}</span>
      <span className="tracking-widest uppercase">{line.nombre}</span>
    </motion.button>
  );
};
