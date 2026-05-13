
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { SearchBar } from '../components/SearchBar';
import { LineaChip } from '../components/LineaChip';
import { ProductCard } from '../components/ProductCard';
import { MovementModal } from '../components/MovimientoModal';
import { BulkMovementModal } from '../components/BulkMovementModal';
import { AdminProductModal } from '../components/AdminProductModal';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Package, CheckSquare, Square, Trash2, ArrowUpDown, Download } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { products, lines, user, installApp, isInstallable, isInstalled } = useApp();
  const [search, setSearch] = useState('');
  const [selectedLineId, setSelectedLineId] = useState<'all' | string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Selection Logic
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isAdminProductOpen, setIsAdminProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesLine = selectedLineId === 'all' || p.lineaId === selectedLineId;
      return matchesSearch && matchesLine;
    });
  }, [products, search, selectedLineId]);

  const toggleProductSelection = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleProductClick = (product: Product) => {
    if (selectionMode) {
      toggleProductSelection(product.id);
    } else {
      setSelectedProduct(product);
    }
  };

  const selectedProductObjects = products.filter(p => selectedItems.includes(p.id));

  return (
    <div className="pb-28 px-4 pt-4 bg-[#1A1A2E] min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between py-4 bg-opacity-50 backdrop-blur-md mb-2">
        <div className="flex items-center space-x-3">
          <motion.div 
            key={selectedLineId}
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20 italic bg-[#24243E]"
            style={{ 
              backgroundColor: selectedLineId === 'all' ? '#6366f1' : lines.find(l => l.id === selectedLineId)?.color,
              boxShadow: `0 8px 16px -4px ${selectedLineId === 'all' ? '#6366f144' : lines.find(l => l.id === selectedLineId)?.color + '44'}`
            }}
          >
            {selectedLineId === 'all' ? 'S' : lines.find(l => l.id === selectedLineId)?.emoji}
          </motion.div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white uppercase italic leading-none">STOCKY</h1>
            <p className="text-[9px] font-black tracking-[0.2em] text-indigo-400/60 uppercase">
              {selectedLineId === 'all' ? 'Catálogo Completo' : lines.find(l => l.id === selectedLineId)?.nombre}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedItems([]);
            }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all ${selectionMode ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'}`}
          >
            {selectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{selectionMode ? 'CANCELAR' : 'MASIVO'}</span>
          </button>
          
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold ring-2 ring-indigo-500/20 uppercase">
            {user?.email?.charAt(0) || 'A'}
          </div>
        </div>
      </header>

      {/* Install Banner */}
      <AnimatePresence>
        {isInstallable && !isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 rounded-3xl p-5 flex items-center justify-between shadow-2xl shadow-indigo-500/30 border border-white/10">
              <div className="flex-1 pr-4">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                    <Download size={10} className="text-white" />
                  </div>
                  <h3 className="text-white font-black text-xs uppercase tracking-widest">App Móvil Disponible</h3>
                </div>
                <p className="text-white/80 text-[10px] font-bold leading-tight">
                  Instala para usar sin navegador y recibir actualizaciones automáticas.
                </p>
              </div>
              <button 
                onClick={installApp}
                className="bg-white text-indigo-600 px-5 py-2.5 rounded-2xl font-black text-[10px] shadow-xl active:scale-90 transition-all flex items-center space-x-2 border-none ring-4 ring-white/10"
              >
                <span>DESCARGAR</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="mb-5">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Lines Scroll */}
      <div className="mb-6 -mx-4 px-4 overflow-x-auto no-scrollbar flex space-x-2 items-end">
        <LineaChip 
          line={{ id: 'all', nombre: 'Todos', emoji: '📦', color: '#6366f1' }}
          isActive={selectedLineId === 'all'}
          onClick={() => setSelectedLineId('all')}
        />
        {lines.filter(l => l.activa !== false).map((line) => (
          <LineaChip
            key={line.id}
            line={line}
            isActive={selectedLineId === line.id}
            onClick={() => setSelectedLineId(line.id)}
          />
        ))}
      </div>

      {/* Products List */}
      <div className="flex flex-col space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => {
            const line = lines.find(l => l.id === product.lineaId);
            return (
              <ProductCard
                key={product.id}
                product={product}
                line={line}
                selectionMode={selectionMode}
                isSelected={selectedItems.includes(product.id)}
                onClick={() => handleProductClick(product)}
                onEdit={(p) => {
                  setProductToEdit(p);
                  setIsAdminProductOpen(true);
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Package size={64} className="mb-4 opacity-20" />
          <p className="font-bold">No se encontraron productos</p>
        </div>
      )}

      {/* Selection Action Bar */}
      <AnimatePresence>
        {selectionMode && selectedItems.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 bg-indigo-600 rounded-3xl p-4 flex items-center justify-between shadow-2xl z-40"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-indigo-200 tracking-widest">Seleccionados</span>
              <span className="text-white font-black text-xl leading-none">{selectedItems.length.toString().padStart(2, '0')}</span>
            </div>
            
            <div className="flex space-x-2">
              {selectedItems.length === 1 && (
                <button 
                  onClick={() => {
                    setProductToEdit(selectedProductObjects[0]);
                    setIsAdminProductOpen(true);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-2xl flex items-center space-x-2 transition-all active:scale-95"
                >
                  <Plus size={18} />
                  <span className="text-xs font-black uppercase tracking-widest leading-none">EDITAR</span>
                </button>
              )}
              <button 
                onClick={() => setIsBulkModalOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-2xl flex items-center space-x-2 transition-all active:scale-95"
              >
                <ArrowUpDown size={18} />
                <span className="text-xs font-black uppercase tracking-widest leading-none">MODIFICAR LOTE</span>
              </button>
              
              <button 
                onClick={() => setSelectedItems([])}
                className="w-12 h-12 bg-white/10 text-white/70 rounded-2xl flex items-center justify-center"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB - Floating Action Button */}
      {!selectionMode && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setProductToEdit(null);
            setIsAdminProductOpen(true);
          }}
          className="fixed bottom-24 right-8 w-14 h-14 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-600/50 flex items-center justify-center text-3xl text-white font-light z-30"
          id="fab-add"
        >
          <Plus size={32} />
        </motion.button>
      )}

      {/* Modals */}
      {selectedProduct && (
        <MovementModal
          isOpen={!!selectedProduct}
          product={selectedProduct}
          line={lines.find(l => l.id === selectedProduct.lineaId)}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <BulkMovementModal 
        isOpen={isBulkModalOpen}
        selectedProducts={selectedProductObjects}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          setSelectionMode(false);
          setSelectedItems([]);
        }}
      />

      <AdminProductModal 
        isOpen={isAdminProductOpen}
        onClose={() => {
          setIsAdminProductOpen(false);
          setProductToEdit(null);
          setSelectionMode(false);
          setSelectedItems([]);
        }}
        lines={lines}
        productToEdit={productToEdit}
      />
    </div>
  );
};
