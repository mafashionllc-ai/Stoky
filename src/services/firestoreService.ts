
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  onSnapshot, 
  Timestamp, 
  writeBatch,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Product, TreatmentLine, Movement, Promotion, MovementType, DeliveryNote } from '../types';
import { INITIAL_LINES, INITIAL_PRODUCTS } from '../data/catalogoSProfessional';

const ERROR_COLLECTION = 'errors';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// -----------------------------------------------------------------------------
// APP INITIALIZATION
// -----------------------------------------------------------------------------

export const initializeAppCatalog = async () => {
  try {
    console.log('Sincronizando catálogo automático...');
    const batch = writeBatch(db);

    // 1. Obtener líneas y productos actuales
    const linesSnap = await getDocs(collection(db, 'lineas_tratamiento'));
    const productsSnap = await getDocs(collection(db, 'productos'));

    const existingLines = linesSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
    const existingProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

    // 2. Sincronizar Líneas
    const lineMap: Record<string, string> = {};
    for (const lineDef of INITIAL_LINES) {
      const existing = existingLines.find(l => l.nombre === lineDef.nombre);
      if (!existing) {
        const newRef = doc(collection(db, 'lineas_tratamiento'));
        batch.set(newRef, {
          ...lineDef,
          creadoEn: serverTimestamp()
        });
        lineMap[lineDef.nombre!] = newRef.id;
      } else {
        lineMap[lineDef.nombre!] = existing.id;
        // Opcionalmente actualizar si hubo cambios en color/emoji/orden
        if (existing.color !== lineDef.color || existing.emoji !== lineDef.emoji || existing.orden !== lineDef.orden) {
          batch.update(doc(db, 'lineas_tratamiento', existing.id), {
            ...lineDef,
            actualizadoEn: serverTimestamp()
          });
        }
      }
    }

    // 3. Sincronizar Productos
    for (const prodDef of INITIAL_PRODUCTS) {
      const existing = existingProducts.find(p => p.codigo === prodDef.codigo);
      const lineaId = lineMap[prodDef.lineaNombre] || lineMap['Otros'] || '';
      
      const productData = {
        nombre: prodDef.nombre,
        codigo: prodDef.codigo || '',
        costo: prodDef.costo || 0,
        precio: prodDef.precio || 0,
        lineaId,
        emoji: prodDef.emoji || '🧴',
        tipo: prodDef.tipo || 'ambos',
        unidad: prodDef.unidad || 'unidades',
        activo: true,
        actualizadoEn: serverTimestamp()
      };

      if (!existing) {
        const newRef = doc(collection(db, 'productos'));
        batch.set(newRef, {
          ...productData,
          stockActual: 0,
          stockMinimo: 5,
          descripcion: '',
          creadoEn: serverTimestamp()
        });
      } else if (existing.costo !== prodDef.costo || existing.precio !== prodDef.precio || existing.nombre !== prodDef.nombre) {
        // Actualizamos si cambió el precio, costo o nombre
        const productRef = doc(db, 'productos', existing.id);
        batch.update(productRef, {
          ...productData,
          actualizadoEn: serverTimestamp()
        });
      }
    }

    await batch.commit();
    console.log('Sincronización de catálogo completada.');
  } catch (error) {
    console.error('Error en sincronización automática:', error);
    // No lanzamos error para no bloquear la app si falla el seed inicial (ej. falta de internet)
  }
};

// -----------------------------------------------------------------------------
// SERVICES
// -----------------------------------------------------------------------------

export const getLines = (callback: (lines: TreatmentLine[]) => void) => {
  const q = query(collection(db, 'lineas_tratamiento'));
  return onSnapshot(q, (snapshot) => {
    const lines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TreatmentLine));
    callback(lines);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'lineas_tratamiento'));
};

export const getProducts = (callback: (products: Product[]) => void) => {
  const q = query(collection(db, 'productos'));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    callback(products);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'productos'));
};

export const registerMovement = async (
  product: Product, 
  tipo: MovementType, 
  cantidad: number, 
  nota: string = ''
) => {
  return registerBatchMovement([{ product, cantidad }], tipo, nota);
};

export const registerBatchMovement = async (
  movements: { product: Product; cantidad: number }[], 
  tipo: MovementType,
  nota: string = ''
) => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  if (movements.length === 0) return;

  const batch = writeBatch(db);
  const userId = auth.currentUser.uid;
  const now = serverTimestamp();

  for (const { product, cantidad } of movements) {
    const stockAnterior = product.stockActual;
    const stockNuevo = tipo === 'ingreso' ? stockAnterior + cantidad : stockAnterior - cantidad;

    if (stockNuevo < 0) throw new Error(`Stock insuficiente para ${product.nombre}`);

    // 1. Create movement record
    const movementRef = doc(collection(db, 'movimientos'));
    batch.set(movementRef, {
      productoId: product.id,
      lineaId: product.lineaId,
      tipo,
      cantidad,
      stockAnterior,
      stockNuevo,
      nota,
      usuarioId: userId,
      fechaHora: now
    });

    // 2. Update product stock
    const productRef = doc(db, 'productos', product.id);
    batch.update(productRef, {
      stockActual: stockNuevo,
      actualizadoEn: now
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch_movements');
  }
};

export const getMovements = (callback: (movements: Movement[]) => void) => {
  const q = query(collection(db, 'movimientos')); // In prod: orderBy('fechaHora', 'desc')
  return onSnapshot(q, (snapshot) => {
    const movements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement));
    // Manual sort since we don't have indexes yet
    movements.sort((a: any, b: any) => b.fechaHora?.seconds - a.fechaHora?.seconds);
    callback(movements);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'movimientos'));
};

export const createPromotion = async (promoData: Partial<Promotion>) => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  
  try {
    await addDoc(collection(db, 'promociones'), {
      ...promoData,
      usuarioId: auth.currentUser.uid,
      creadoEn: serverTimestamp(),
      activa: true
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'promociones');
  }
};

export const getPromotions = (callback: (promotions: Promotion[]) => void) => {
  const q = query(collection(db, 'promociones'));
  return onSnapshot(q, (snapshot) => {
    const promotions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion));
    callback(promotions);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'promociones'));
};

export const createLine = async (lineData: Partial<TreatmentLine>) => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  try {
    const ref = collection(db, 'lineas_tratamiento');
    await addDoc(ref, {
      ...lineData,
      creadoEn: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'lineas_tratamiento');
  }
};

export const updateLine = async (id: string, lineData: Partial<TreatmentLine>) => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  try {
    const ref = doc(db, 'lineas_tratamiento', id);
    await updateDoc(ref, lineData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'lineas_tratamiento');
  }
};

export const deleteLine = async (id: string) => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  try {
    const batch = writeBatch(db);
    
    // 1. Get all products in this line
    const productsQuery = query(collection(db, 'productos'), where('lineaId', '==', id));
    const productsSnap = await getDocs(productsQuery);
    
    for (const prodDoc of productsSnap.docs) {
      // 2. Get and delete all movements for each product
      const movesQuery = query(collection(db, 'movimientos'), where('productoId', '==', prodDoc.id));
      const movesSnap = await getDocs(movesQuery);
      movesSnap.docs.forEach(m => batch.delete(m.ref));
      
      // 3. Delete the product
      batch.delete(prodDoc.ref);
    }

    // 4. Delete the line itself
    batch.delete(doc(db, 'lineas_tratamiento', id));
    
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'lineas_tratamiento');
  }
};

export const createProduct = async (productData: Partial<Product>) => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  try {
    const ref = collection(db, 'productos');
    await addDoc(ref, {
      ...productData,
      stockActual: productData.stockActual || 0,
      stockMinimo: productData.stockMinimo || 5,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'productos');
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>) => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  try {
    const ref = doc(db, 'productos', id);
    await updateDoc(ref, {
      ...productData,
      actualizadoEn: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'productos');
  }
};

export const deleteProduct = async (id: string) => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  try {
    const batch = writeBatch(db);
    
    // 1. Delete associated movements
    const movementsQuery = query(collection(db, 'movimientos'), where('productoId', '==', id));
    const movementsSnap = await getDocs(movementsQuery);
    movementsSnap.docs.forEach(d => {
      batch.delete(doc(db, 'movimientos', d.id));
    });

    // 2. Delete product
    batch.delete(doc(db, 'productos', id));
    
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'productos');
  }
};

export const updatePromotion = async (id: string, promoData: Partial<Promotion>) => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  try {
    const ref = doc(db, 'promociones', id);
    await updateDoc(ref, promoData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'promociones');
  }
};

export const deletePromotion = async (id: string) => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  try {
    const ref = doc(db, 'promociones', id);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'promociones');
  }
};

export const getDeliveryNotes = (callback: (notes: DeliveryNote[]) => void) => {
  const q = query(collection(db, 'notas_entrega'));
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeliveryNote));
    callback(notes);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'notas_entrega'));
};
