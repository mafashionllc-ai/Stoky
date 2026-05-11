
import { Product, TreatmentLine } from '../types';

export const INITIAL_LINES: Partial<TreatmentLine>[] = [
  { nombre: 'Supreme', emoji: '🌸', color: '#D4537E', descripcion: 'Línea Supreme Professional', activa: true, orden: 1 },
  { nombre: 'My Crown', emoji: '👑', color: '#BA7517', descripcion: 'Cabellos rizados', activa: true, orden: 2 },
  { nombre: 'Brushing', emoji: '✨', color: '#888780', descripcion: 'Bioplastia capilar', activa: true, orden: 3 },
  { nombre: 'Hidratherapy', emoji: '💧', color: '#378ADD', descripcion: 'Ozonoterapia', activa: true, orden: 4 },
  { nombre: 'Nutrology', emoji: '🌿', color: '#10b981', descripcion: 'Nutrición biotecnológica', activa: true, orden: 5 },
  { nombre: 'ProFusion', emoji: '🧪', color: '#8b5cf6', descripcion: 'Reconstrucción profunda', activa: true, orden: 6 },
  { nombre: 'Chromatiz', emoji: '🎨', color: '#f59e0b', descripcion: 'Matización profesional', activa: true, orden: 7 },
  { nombre: 'SOS', emoji: '🆘', color: '#ef4444', descripcion: 'Reparación de emergencia', activa: true, orden: 8 },
  { nombre: 'The First', emoji: '🥇', color: '#facc15', descripcion: 'Alisado profesional', activa: true, orden: 9 },
  { nombre: 'Royal Colour', emoji: '💎', color: '#db2777', descripcion: 'Coloración permanente', activa: true, orden: 10 },
  { nombre: 'Cepillos', emoji: '🪮', color: '#6366f1', descripcion: 'Herramientas profesionales', activa: true, orden: 11 },
  { nombre: 'Otros', emoji: '📦', color: '#94a3b8', descripcion: 'Productos varios', activa: true, orden: 12 },
];

export const INITIAL_PRODUCTS: (Partial<Product> & { lineaNombre: string })[] = [
  // Supreme
  { codigo: 'PA00346', nombre: 'Supreme Shampoo Limpieza Ph 9.0', unidad: '980ML', tipo: 'cabina', costo: 13.43, precio: 41.00, lineaNombre: 'Supreme', emoji: '🌸' },
  { codigo: 'PA00348', nombre: 'Supreme Hair Treatment Ph 2.0', unidad: '980ML', tipo: 'cabina', costo: 79.90, precio: 152.00, lineaNombre: 'Supreme', emoji: '🌸' },
  { codigo: 'PA00350', nombre: 'Supreme Touch-Of Silk Mascarilla', unidad: '980GR', tipo: 'cabina', costo: 24.89, precio: 58.00, lineaNombre: 'Supreme', emoji: '🌸' },
  { codigo: 'PA00475', nombre: 'Supreme Blend Hydration Shampoo', unidad: '250ML', tipo: 'cabina', costo: 3.69, precio: 10.54, lineaNombre: 'Supreme', emoji: '🌸' },
  { codigo: 'PA00476', nombre: 'Supreme Blend Hydration Conditioner', unidad: '250ML', tipo: 'cabina', costo: 3.69, precio: 10.54, lineaNombre: 'Supreme', emoji: '🌸' },
  { codigo: 'PA00487', nombre: 'Supreme OX 5 VOL', unidad: '900ML', tipo: 'cabina', costo: 7.59, precio: 12.00, lineaNombre: 'Supreme', emoji: '🌸' },
  { codigo: 'PA00488', nombre: 'Supreme OX 20 VOL', unidad: '900ML', tipo: 'cabina', costo: 7.59, precio: 12.00, lineaNombre: 'Supreme', emoji: '🌸' },
  { codigo: 'PA00489', nombre: 'Supreme OX 30 VOL', unidad: '900ML', tipo: 'cabina', costo: 7.59, precio: 12.00, lineaNombre: 'Supreme', emoji: '🌸' },
  { codigo: 'PA00490', nombre: 'Supreme OX 40 VOL', unidad: '900ML', tipo: 'cabina', costo: 7.59, precio: 12.00, lineaNombre: 'Supreme', emoji: '🌸' },

  // My Crown
  { codigo: 'PA00535', nombre: 'My Crown Shampoo (SALON)', unidad: '980ML', tipo: 'cabina', costo: 10.67, precio: 30.00, lineaNombre: 'My Crown', emoji: '👑' },
  { codigo: 'PA00536', nombre: 'My Crown Nutrición (SALON)', unidad: '980ML', tipo: 'cabina', costo: 14.94, precio: 42.00, lineaNombre: 'My Crown', emoji: '👑' },
  { codigo: 'PA00537', nombre: 'My Crown Gel (SALON)', unidad: '980G', tipo: 'cabina', costo: 8.02, precio: 23.00, lineaNombre: 'My Crown', emoji: '👑' },
  { codigo: 'PA00538', nombre: 'My Crown Activador (SALON)', unidad: '980ML', tipo: 'cabina', costo: 14.82, precio: 42.00, lineaNombre: 'My Crown', emoji: '👑' },
  { codigo: 'PA00539', nombre: 'My Crown Shampoo (HOME)', unidad: '480ML', tipo: 'after_care', costo: 4.98, precio: 13.00, lineaNombre: 'My Crown', emoji: '👑' },
  { codigo: 'PA00540', nombre: 'My Crown Conditioner (HOME)', unidad: '480G', tipo: 'after_care', costo: 5.64, precio: 15.00, lineaNombre: 'My Crown', emoji: '👑' },

  // Royal Colour (Selección representativa)
  { codigo: 'PA00093', nombre: 'RC 1.0 Negro', unidad: '100GR', tipo: 'cabina', costo: 2.98, precio: 7.90, lineaNombre: 'Royal Colour', emoji: '💎' },
  { codigo: 'PA00098', nombre: 'RC 3.0 Castaño Oscuro', unidad: '100GR', tipo: 'cabina', costo: 2.98, precio: 7.90, lineaNombre: 'Royal Colour', emoji: '💎' },
  { codigo: 'PA00099', nombre: 'RC 4.0 Castaño', unidad: '100GR', tipo: 'cabina', costo: 2.98, precio: 7.90, lineaNombre: 'Royal Colour', emoji: '💎' },
  { codigo: 'PA00108', nombre: 'RC 6.0 Rubio Oscuro', unidad: '100GR', tipo: 'cabina', costo: 2.98, precio: 7.90, lineaNombre: 'Royal Colour', emoji: '💎' },
  { codigo: 'PA00116', nombre: 'RC 7.0 Rubio', unidad: '100GR', tipo: 'cabina', costo: 2.98, precio: 7.90, lineaNombre: 'Royal Colour', emoji: '💎' },
  { codigo: 'PA00124', nombre: 'RC 8.0 Rubio Claro', unidad: '100GR', tipo: 'cabina', costo: 2.98, precio: 7.90, lineaNombre: 'Royal Colour', emoji: '💎' },
  { codigo: 'PA00129', nombre: 'RC 9.0 Rubio Muy Claro', unidad: '100GR', tipo: 'cabina', costo: 2.98, precio: 7.90, lineaNombre: 'Royal Colour', emoji: '💎' },
  { codigo: 'PA00094', nombre: 'RC 10.0 Rubio Extra Claro', unidad: '100GR', tipo: 'cabina', costo: 2.98, precio: 7.90, lineaNombre: 'Royal Colour', emoji: '💎' },
  { codigo: 'PA00135', nombre: 'RC Mix Rubi', unidad: '100GR', tipo: 'cabina', costo: 2.98, precio: 7.90, lineaNombre: 'Royal Colour', emoji: '💎' },
  { codigo: 'PA00136', nombre: 'RC Mix Safira', unidad: '100GR', tipo: 'cabina', costo: 2.98, precio: 7.90, lineaNombre: 'Royal Colour', emoji: '💎' },

  // Cepillos
  { codigo: 'N32', nombre: 'Cepillo Negro N32', unidad: 'UN', tipo: 'ambos', costo: 4.57, precio: 16.00, lineaNombre: 'Cepillos', emoji: '🪮' },
  { codigo: 'N43', nombre: 'Cepillo Negro N43', unidad: 'UN', tipo: 'ambos', costo: 4.86, precio: 17.00, lineaNombre: 'Cepillos', emoji: '🪮' },
  { codigo: 'N53', nombre: 'Cepillo Negro N53', unidad: 'UN', tipo: 'ambos', costo: 5.14, precio: 18.00, lineaNombre: 'Cepillos', emoji: '🪮' },
  { codigo: 'N65', nombre: 'Cepillo Negro N65', unidad: 'UN', tipo: 'ambos', costo: 5.43, precio: 19.00, lineaNombre: 'Cepillos', emoji: '🪮' },
  { codigo: 'C1119', nombre: 'Cepillo Amarillo C1119', unidad: 'UN', tipo: 'ambos', costo: 10.48, precio: 25.00, lineaNombre: 'Cepillos', emoji: '🪮' },
  { codigo: 'C1143', nombre: 'Cepillo Amarillo C1143', unidad: 'UN', tipo: 'ambos', costo: 13.84, precio: 33.00, lineaNombre: 'Cepillos', emoji: '🪮' },

  // The First
  { codigo: 'PA00340', nombre: 'The First Shampoo que Alisa', unidad: '980ML', tipo: 'cabina', costo: 79.00, precio: 189.00, lineaNombre: 'The First', emoji: '🥇' },
  { codigo: 'PA00341', nombre: 'The First Shampoo 3.0', unidad: '500ML', tipo: 'cabina', costo: 43.45, precio: 95.00, lineaNombre: 'The First', emoji: '🥇' },
  
  // Otros
  { codigo: 'PA00521', nombre: 'Serum 60ML', unidad: '60ML', tipo: 'after_care', costo: 8.00, precio: 13.00, lineaNombre: 'Otros', emoji: '✨' },
  { codigo: 'MA00143', nombre: 'Plancha Flat Iron Sweet', unidad: 'UN', tipo: 'ambos', costo: 69.00, precio: 198.00, lineaNombre: 'Otros', emoji: '🔌' },
  { codigo: 'TOALLA_K', nombre: 'Kit 5 Toallas KCare', unidad: 'KIT', tipo: 'ambos', costo: 17.50, precio: 30.00, lineaNombre: 'Otros', emoji: '🧶' },
];
