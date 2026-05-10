
import { Product, TreatmentLine } from '../types';

export const INITIAL_LINES: Partial<TreatmentLine>[] = [
  { nombre: 'My Crown', emoji: '👑', color: '#BA7517', descripcion: 'Para cabellos encrespados y rizados', activa: true, orden: 1 },
  { nombre: 'Brushing', emoji: '✨', color: '#888780', descripcion: 'Bioplastia capilar', activa: true, orden: 2 },
  { nombre: 'Hidratherapy', emoji: '💧', color: '#378ADD', descripcion: 'Ozonoterapia', activa: true, orden: 3 },
  { nombre: 'Nutrology', emoji: '🌿', color: '#10b981', descripcion: 'Nutrición biotecnológica', activa: true, orden: 4 },
  { nombre: 'ProFusion', emoji: '🧪', color: '#8b5cf6', descripcion: 'Reconstrucción profunda', activa: true, orden: 5 },
  { nombre: 'Chromatiz', emoji: '🎨', color: '#f59e0b', descripcion: 'Matización profesional', activa: true, orden: 6 },
  { nombre: 'Metal Detox', emoji: '🧹', color: '#06b6d4', descripcion: 'Desintoxicación metálica', activa: true, orden: 7 },
  { nombre: 'Otros', emoji: '📦', color: '#94a3b8', descripcion: 'Productos varios', activa: true, orden: 8 },
];

export const INITIAL_PRODUCTS: (Partial<Product> & { lineaNombre: string })[] = [
  // My Crown
  { codigo: 'PA00535', nombre: 'My Crom Shampoo (SALON)', unidad: '980ML', tipo: 'cabina', costo: 10.67, precio: 30.00, lineaNombre: 'My Crown', emoji: '🧴' },
  { codigo: 'PA00536', nombre: 'My Crown Nutricion (SALON)', unidad: '980ML', tipo: 'cabina', costo: 14.94, precio: 42.00, lineaNombre: 'My Crown', emoji: '🧴' },
  { codigo: 'PA00537', nombre: 'My Crown Gel (SALON)', unidad: '980G', tipo: 'cabina', costo: 8.02, precio: 23.00, lineaNombre: 'My Crown', emoji: '🧴' },
  { codigo: 'PA00538', nombre: 'My Crown Activador (SALON)', unidad: '980ML', tipo: 'cabina', costo: 14.82, precio: 42.00, lineaNombre: 'My Crown', emoji: '🧴' },
  { codigo: 'PA00539', nombre: 'My Crown Shampoo (HOME CARE)', unidad: '480ML', tipo: 'after_care', costo: 4.98, precio: 13.00, lineaNombre: 'My Crown', emoji: '🧴' },
  { codigo: 'PA00540', nombre: 'My Crown Conditioner (HOME CARE)', unidad: '480G', tipo: 'after_care', costo: 5.64, precio: 15.00, lineaNombre: 'My Crown', emoji: '🧴' },
  { codigo: 'PA00541', nombre: 'My Crown Activador (HOME CARE)', unidad: '480G', tipo: 'after_care', costo: 8.18, precio: 22.00, lineaNombre: 'My Crown', emoji: '🧴' },
  
  // Brushing
  { codigo: 'PA00510', nombre: 'Brushing Shampoo Paso 1 (SALON)', unidad: '980ML', tipo: 'cabina', costo: 12.76, precio: 36.00, lineaNombre: 'Brushing', emoji: '✨' },
  { codigo: 'PA00511', nombre: 'Brushin Shampoo Paso 2 (SALON)', unidad: '980ML', tipo: 'cabina', costo: 60.60, precio: 169.00, lineaNombre: 'Brushing', emoji: '✨' },
  { codigo: 'PA00512', nombre: 'Brushing Mascarilla Paso 3 (SALON)', unidad: '980G', tipo: 'cabina', costo: 47.40, precio: 132.00, lineaNombre: 'Brushing', emoji: '✨' },
  { codigo: 'PA00529', nombre: 'Brushing Shampoo (HOME CARE)', unidad: '230ML', tipo: 'after_care', costo: 3.76, precio: 10.00, lineaNombre: 'Brushing', emoji: '✨' },
  { codigo: 'PA00514', nombre: 'Brushing Conditioner(HOME CARE)', unidad: '230G', tipo: 'after_care', costo: 3.76, precio: 10.00, lineaNombre: 'Brushing', emoji: '✨' },
  { codigo: 'PA00515', nombre: 'Brushing Leave 5x1 (HOME CARE)', unidad: '150G', tipo: 'after_care', costo: 4.13, precio: 11.00, lineaNombre: 'Brushing', emoji: '✨' },
  { codigo: 'PA00513', nombre: 'Brushing Shine Spray', unidad: '250ML', tipo: 'ambos', costo: 6.64, precio: 18.00, lineaNombre: 'Brushing', emoji: '✨' },
  
  // Hidratherapy
  { codigo: 'PA00497', nombre: 'Hidratherapy Shampoo Paso 1 (SALON)', unidad: '980ML', tipo: 'cabina', costo: 14.64, precio: 41.00, lineaNombre: 'Hidratherapy', emoji: '💧' },
  { codigo: 'PA00502', nombre: 'HIdratherapy Ampolla Paso 2 (SALON)', unidad: '15ML', tipo: 'cabina', costo: 2.67, precio: 8.00, lineaNombre: 'Hidratherapy', emoji: '💧' },
  { codigo: 'PA00498', nombre: 'Hidratherapy acondicionador Paso 3 (SALON)', unidad: '980G', tipo: 'cabina', costo: 15.30, precio: 43.00, lineaNombre: 'Hidratherapy', emoji: '💧' },
  { codigo: 'PA00499', nombre: 'Hidratherapy Shampoo (HOME CARE)', unidad: '230ML', tipo: 'after_care', costo: 3.76, precio: 10.00, lineaNombre: 'Hidratherapy', emoji: '💧' },
  { codigo: 'PA00500', nombre: 'Hidratherapy acondicionador (HOME CARE)', unidad: '200G', tipo: 'after_care', costo: 4.20, precio: 11.00, lineaNombre: 'Hidratherapy', emoji: '💧' },
  
  // Nutrology
  { codigo: 'PA00492', nombre: 'Nutrology Shampoo Paso 1 (SALON)', unidad: '980ML', tipo: 'cabina', costo: 14.38, precio: 40.00, lineaNombre: 'Nutrology', emoji: '🌿' },
  { codigo: 'PA00493', nombre: 'Nutrology Ultracondicionador Paso 2 (SALON)', unidad: '980G', tipo: 'cabina', costo: 21.71, precio: 61.00, lineaNombre: 'Nutrology', emoji: '🌿' },
  { codigo: 'PA00494', nombre: 'Nutrology Shampoo (HOME CARE)', unidad: '230ML', tipo: 'after_care', costo: 4.94, precio: 13.00, lineaNombre: 'Nutrology', emoji: '🌿' },
  { codigo: 'PA00495', nombre: 'Nutrology acondicionador (HOME CARE)', unidad: '230G', tipo: 'after_care', costo: 4.94, precio: 13.00, lineaNombre: 'Nutrology', emoji: '🌿' },
  { codigo: 'PA00496', nombre: 'Nutrology ultracondicionador (HOME CARE)', unidad: '200G', tipo: 'after_care', costo: 6.17, precio: 16.00, lineaNombre: 'Nutrology', emoji: '🌿' },
  
  // ProFusion
  { codigo: 'PA00469', nombre: 'ProFusion  Shampoo Paso 1 (SALON)', unidad: '980ML', tipo: 'cabina', costo: 20.90, precio: 59.00, lineaNombre: 'ProFusion', emoji: '🧪' },
  { codigo: 'PA00481', nombre: 'ProFusion Inner Paso 2 (SALON)', unidad: '500ML', tipo: 'cabina', costo: 14.90, precio: 42.00, lineaNombre: 'ProFusion', emoji: '🧪' },
  { codigo: 'PA00482', nombre: 'Profusion Ultracondicionador Paso 3 (SALON)', unidad: '980G', tipo: 'cabina', costo: 21.24, precio: 59.00, lineaNombre: 'ProFusion', emoji: '🧪' },
  { codigo: 'PA00483', nombre: 'ProFusion Shampoo (HOME CARE)', unidad: '230ML', tipo: 'after_care', costo: 4.94, precio: 13.00, lineaNombre: 'ProFusion', emoji: '🧪' },
  { codigo: 'PA00484', nombre: 'ProFusion Ultraacondicionador (HOME CARE)', unidad: '200G', tipo: 'after_care', costo: 4.94, precio: 13.00, lineaNombre: 'ProFusion', emoji: '🧪' },
  { codigo: 'PA00485', nombre: 'ProFusion Save Home (HOME CARE)', unidad: '150G', tipo: 'after_care', costo: 4.99, precio: 13.00, lineaNombre: 'ProFusion', emoji: '🧪' },
  
  // Otros
  { codigo: 'PA00521', nombre: 'SERUM 60ML', unidad: '60 ML', tipo: 'ambos', costo: 8.00, precio: 20.00, lineaNombre: 'Otros', emoji: '✨' },
  { codigo: 'PA00486', nombre: 'Decolorante -500G', unidad: '500GR', tipo: 'cabina', costo: 10.71, precio: 30.00, lineaNombre: 'Otros', emoji: '⚪' },
  { codigo: 'PA00491', nombre: 'Shampoo en polvo Metal Detox', unidad: '80 GR', tipo: 'ambos', costo: 4.50, precio: 13.00, lineaNombre: 'Metal Detox', emoji: '🧹' },
  { codigo: 'PA00680', nombre: 'Chromatiz matizador ultracondicionador ', unidad: '980ML', tipo: 'cabina', costo: 14.90, precio: 42.00, lineaNombre: 'Chromatiz', emoji: '🎨' },
];
