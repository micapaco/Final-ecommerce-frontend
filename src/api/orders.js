import apiClient from './client';
import { fetchWithOptimizations, cacheClear } from './utils';

/**
 * Obtener todas las órdenes con caché
 */
export const getAll = async (skip = 0, limit = 100) => {
  const cacheKey = `orders_all_${skip}_${limit}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get('/orders', {
        params: { skip, limit }
      });
      return response.data;
    },
    { useCache: true, cacheTTL: 1 * 60 * 1000 } // Caché 1 minuto (datos cambian frecuentemente)
  );
};

/**
 * Obtener orden por ID con caché
 */
export const getById = async (id) => {
  const cacheKey = `order_${id}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    },
    { useCache: true, cacheTTL: 1 * 60 * 1000 }
  );
};

/**
 * Crear orden - limpia caché
 */
export const create = async (orderData) => {
  try {
    const response = await apiClient.post('/orders', orderData);
    cacheClear('orders');
    return response.data;
  } catch (error) {
    console.error('Error al crear orden:', error);
    throw error;
  }
};

/**
 * Actualizar orden - limpia caché
 */
export const update = async (id, orderData) => {
  try {
    const response = await apiClient.put(`/orders/${id}`, orderData);
    cacheClear('order');
    cacheClear('orders');
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar orden ${id}:`, error);
    throw error;
  }
};

/**
 * Actualizar estado de orden - usa PUT con datos completos (sin id_key)
 */
export const updateStatus = async (id, status) => {
  try {
    const order = await getById(id);
    // Excluir id_key porque el backend no permite actualizarlo
    const { id_key, ...orderData } = order;
    const response = await apiClient.put(`/orders/${id}`, { ...orderData, status });
    cacheClear('order');
    cacheClear('orders');
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar estado de orden ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar orden - limpia caché
 */
export const deleteOrder = async (id) => {
  try {
    await apiClient.delete(`/orders/${id}`);
    cacheClear('order');
    cacheClear('orders');
  } catch (error) {
    console.error(`Error al eliminar orden ${id}:`, error);
    throw error;
  }
};
