
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { AppState, Product, TreatmentLine, Movement, Promotion, DeliveryNote } from './types';
import { getLines, getProducts, getMovements, getPromotions, initializeAppCatalog, getDeliveryNotes } from './services/firestoreService';

interface AppContextType extends AppState {
  setDarkMode: (val: boolean) => void;
  logout: () => void;
  installApp: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [lines, setLines] = useState<TreatmentLine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está en modo standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      // Clear previous listeners if any
      unsubs.forEach(unsub => unsub());
      unsubs = [];

      setUser(u);
      if (u) {
        try {
          // Initialize catalog once if needed
          await initializeAppCatalog();
          
          // Set up listeners
          unsubs.push(getLines(setLines));
          unsubs.push(getProducts(setProducts));
          unsubs.push(getMovements(setMovements));
          unsubs.push(getPromotions(setPromotions));
          unsubs.push(getDeliveryNotes(setDeliveryNotes));
        } catch (error) {
          console.error("Error during app initialization:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  const logout = () => auth.signOut();

  const sortedLines = React.useMemo(() => {
    return [...lines].sort((a, b) => {
      if (a.orden !== undefined && b.orden !== undefined) {
        return a.orden - b.orden;
      }
      return a.nombre.localeCompare(b.nombre);
    });
  }, [lines]);

  const sortedProducts = React.useMemo(() => {
    const typeOrder: Record<string, number> = {
      'cabina': 0,
      'after_care': 1,
      'ambos': 2
    };

    return [...products].sort((a, b) => {
      const lineA = sortedLines.find(l => l.id === a.lineaId)?.nombre || '';
      const lineB = sortedLines.find(l => l.id === b.lineaId)?.nombre || '';
      
      // 1. Sort by Line
      if (lineA !== lineB) return lineA.localeCompare(lineB);
      
      // 2. Sort by Type (Salón first, then Home Care, then Ambos)
      const typeA = typeOrder[a.tipo || 'ambos'] ?? 3;
      const typeB = typeOrder[b.tipo || 'ambos'] ?? 3;
      if (typeA !== typeB) return typeA - typeB;

      // 3. Sort by Name
      return a.nombre.localeCompare(b.nombre);
    });
  }, [products, sortedLines]);

  const value: AppContextType = {
    user,
    lines: sortedLines,
    products: sortedProducts,
    movements,
    promotions,
    deliveryNotes,
    isLoading,
    isDarkMode,
    setDarkMode: setIsDarkMode,
    logout,
    installApp,
    isInstallable: !!deferredPrompt || (!isInstalled && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)),
    isInstalled
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
