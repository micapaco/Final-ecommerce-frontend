import apiClient from './client';
import { fetchWithOptimizations, cacheClear } from './utils';

/**
 * Crear dirección - limpia caché
 */
export const create = async (addressData) => {
  try {
    const response = await apiClient.post('/addresses', addressData);
    cacheClear('address');
    return response.data;
  } catch (error) {
    console.error('Error al crear dirección:', error);
    throw error;
  }
};

/**
 * Obtener dirección por ID con caché
 */
export const getById = async (id) => {
  const cacheKey = `address_${id}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get(`/addresses/${id}`);
      return response.data;
    },
    { useCache: true, cacheTTL: 5 * 60 * 1000 } // Caché 5 minutos
  );
};

/**
 * Obtener todas las direcciones con caché
 */
export const getAll = async (skip = 0, limit = 100) => {
  const cacheKey = `addresses_all_${skip}_${limit}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get('/addresses', {
        params: { skip, limit }
      });
      return response.data;
    },
    { useCache: true, cacheTTL: 5 * 60 * 1000 }
  );
};

/**
 * Obtener direcciones por ID de cliente con caché
 */
export const getByClientId = async (clientId) => {
  const cacheKey = `addresses_client_${clientId}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get('/addresses', {
        params: { client_id: clientId }
      });
      return response.data;
    },
    { useCache: true, cacheTTL: 5 * 60 * 1000 }
  );
};

/**
 * Actualizar dirección - limpia caché
 */
export const update = async (id, addressData) => {
  try {
    const response = await apiClient.put(`/addresses/${id}`, addressData);
    cacheClear('address');
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar dirección ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar dirección - limpia caché
 */
export const deleteAddress = async (id) => {
  try {
    await apiClient.delete(`/addresses/${id}`);
    cacheClear('address');
  } catch (error) {
    console.error(`Error al eliminar dirección ${id}:`, error);
    throw error;
  }
};
