
import { Timestamp } from 'firebase/firestore';

export type ProductType = 'after_care' | 'cabina' | 'ambos';
export type MovementType = 'ingreso' | 'egreso';
export type PromoDiscountType = 'porcentaje' | 'monto_fijo';
export type DeliveryDiscountType = 'porcentaje' | 'monto_fijo';

export interface TreatmentLine {
  id: string;
  nombre: string;
  color: string;
  emoji: string;
  descripcion: string;
  activa: boolean;
  orden: number;
  creadoEn: Timestamp | Date;
}

export interface Product {
  id: string;
  nombre: string;
  lineaId: string;
  emoji: string;
  descripcion: string;
  tipo: ProductType;
  stockActual: number;
  stockMinimo: number;
  precio?: number; // Added to help with promo calculations
  costo?: number; // Acquisition cost for inventory KPIs
  unidad: string;
  codigo?: string;
  activo: boolean;
  creadoEn: Timestamp | Date;
  actualizadoEn: Timestamp | Date;
}

export interface Movement {
  id: string;
  productoId: string;
  lineaId: string;
  tipo: MovementType;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  nota: string;
  usuarioId: string;
  fechaHora: Timestamp | Date;
}

export interface Promotion {
  id: string;
  nombre: string;
  productos: {
    productoId: string;
    nombre: string;
    precioUnitario: number;
    cantidad: number;
  }[];
  subtotalRegular: number;
  tipoDescuento: PromoDiscountType;
  valorDescuento: number;
  totalFinal: number;
  activa: boolean;
  creadoEn: Timestamp | Date;
  usuarioId: string;
}

export interface DeliveryNoteItem {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface DeliveryNote {
  id: string;
  nroNota: string;
  receptor: string;
  fecha: Timestamp | Date;
  items: DeliveryNoteItem[];
  subtotal: number;
  aplicarTax: boolean;
  taxRate: number;
  taxAmount: number;
  tipoDescuento: DeliveryDiscountType;
  valorDescuento: number;
  montoDescuento: number;
  total: number;
  usuarioId: string;
  observaciones?: string;
  statusArmado?: boolean;
  statusEntregado?: boolean;
  statusCobrado?: boolean;
  archived?: boolean;
}

export interface AppState {
  lines: TreatmentLine[];
  products: Product[];
  movements: Movement[];
  promotions: Promotion[];
  deliveryNotes: DeliveryNote[];
  isLoading: boolean;
  user: any; // Firebase User or null
  isDarkMode: boolean;
}
