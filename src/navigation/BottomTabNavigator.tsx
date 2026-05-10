
import React from 'react';
import { Home, History, Tag, BarChart3, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomTabNavigatorProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'moves', icon: History, label: 'Moves' },
    { id: 'promos', icon: Tag, label: 'Promos' },
    { id: 'reports', icon: BarChart3, label: 'Stats' },
    { id: 'config', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-indigo-950/40 backdrop-blur-xl border-t border-indigo-900/30 flex items-center justify-around px-4 z-40">
      <div className="max-w-md mx-auto w-full flex justify-between items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center group p-0"
            >
              <div className={`transition-all duration-300 ${isActive ? 'text-indigo-400 scale-105' : 'text-gray-500 hover:text-gray-300'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <span className={`text-[8px] font-black uppercase mt-1 tracking-wider transition-all ${isActive ? 'text-indigo-400 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}>
                {tab.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-1.5 w-1 h-1 bg-indigo-400 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
