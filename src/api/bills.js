import apiClient from './client';
import { fetchWithOptimizations, cacheClear } from './utils';

/**
 * Obtener todas las facturas con caché
 */
export const getAll = async (skip = 0, limit = 100) => {
  const cacheKey = `bills_all_${skip}_${limit}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get('/bills', {
        params: { skip, limit }
      });
      return response.data;
    },
    { useCache: true, cacheTTL: 2 * 60 * 1000 } // Caché 2 minutos
  );
};

/**
 * Obtener factura por ID con caché
 */
export const getById = async (id) => {
  const cacheKey = `bill_${id}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get(`/bills/${id}`);
      return response.data;
    },
    { useCache: true, cacheTTL: 2 * 60 * 1000 }
  );
};

/**
 * Crear factura - limpia caché
 */
export const create = async (billData) => {
  try {
    const response = await apiClient.post('/bills', billData);
    cacheClear('bills');
    return response.data;
  } catch (error) {
    console.error('Error al crear factura:', error);
    throw error;
  }
};

/**
 * Actualizar factura - limpia caché
 */
export const update = async (id, billData) => {
  try {
    const response = await apiClient.put(`/bills/${id}`, billData);
    cacheClear('bill');
    cacheClear('bills');
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar factura ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar factura - limpia caché
 */
export const deleteBill = async (id) => {
  try {
    await apiClient.delete(`/bills/${id}`);
    cacheClear('bill');
    cacheClear('bills');
  } catch (error) {
    console.error(`Error al eliminar factura ${id}:`, error);
    throw error;
  }
};
