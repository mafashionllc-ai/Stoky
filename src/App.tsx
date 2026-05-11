
import React, { useState } from 'react';
import { useApp } from './AppContext';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MovimientosScreen } from './screens/MovimientosScreen';
import { PromocionesScreen } from './screens/PromocionesScreen';
import { ReportesScreen } from './screens/ReportesScreen';
import { EntregasScreen } from './screens/EntregasScreen';
import { ConfigScreen } from './screens/ConfigScreen';
import { BottomTabNavigator } from './navigation/BottomTabNavigator';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { user, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState('home');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen />;
      case 'moves': return <MovimientosScreen />;
      case 'promos': return <PromocionesScreen />;
      case 'delivery': return <EntregasScreen />;
      case 'reports': return <ReportesScreen />;
      case 'config': return <ConfigScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="bg-[#1A1A2E] min-h-screen text-slate-200">
      <main className="max-w-md mx-auto relative h-screen overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pb-24"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
        <BottomTabNavigator activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
}
