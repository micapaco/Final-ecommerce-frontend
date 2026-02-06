import apiClient from './client';
import { fetchWithOptimizations, cacheClear } from './utils';

/**
 * Obtener todos los detalles de órdenes con caché
 */
export const getAll = async (skip = 0, limit = 100) => {
  const cacheKey = `orderDetails_all_${skip}_${limit}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get('/order_details', {
        params: { skip, limit }
      });
      return response.data;
    },
    { useCache: true, cacheTTL: 1 * 60 * 1000 }
  );
};

/**
 * Obtener detalles de orden por ID de orden con caché
 */
export const getByOrderId = async (orderId) => {
  const cacheKey = `orderDetails_order_${orderId}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get('/order_details', {
        params: { order_id: orderId }
      });
      return response.data;
    },
    { useCache: true, cacheTTL: 1 * 60 * 1000 }
  );
};

/**
 * Obtener detalle de orden por ID con caché
 */
export const getById = async (id) => {
  const cacheKey = `orderDetail_${id}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get(`/order_details/${id}`);
      return response.data;
    },
    { useCache: true, cacheTTL: 1 * 60 * 1000 }
  );
};

/**
 * Crear detalle de orden - limpia caché
 */
export const create = async (orderDetailData) => {
  try {
    const response = await apiClient.post('/order_details/', orderDetailData);
    cacheClear('orderDetail');
    // Limpiar caché de productos porque el backend descuenta el stock
    cacheClear('product');
    return response.data;
  } catch (error) {
    console.error('Error al crear detalle de orden:', error);
    throw error;
  }
};

/**
 * Actualizar detalle de orden - limpia caché
 */
export const update = async (id, orderDetailData) => {
  try {
    const response = await apiClient.put(`/order_details/${id}`, orderDetailData);
    cacheClear('orderDetail');
    // Limpiar caché de productos porque el backend ajusta el stock
    cacheClear('product');
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar detalle de orden ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar detalle de orden - limpia caché
 */
export const deleteOrderDetail = async (id) => {
  try {
    await apiClient.delete(`/order_details/${id}`);
    cacheClear('orderDetail');
    // Limpiar caché de productos porque el backend restaura el stock
    cacheClear('product');
  } catch (error) {
    console.error(`Error al eliminar detalle de orden ${id}:`, error);
    throw error;
  }
};
