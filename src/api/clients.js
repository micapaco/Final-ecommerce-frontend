import apiClient from './client';
import { fetchWithOptimizations, cacheClear } from './utils';

/**
 * Obtener todos los clientes con caché
 */
export const getAll = async (skip = 0, limit = 100) => {
  const cacheKey = `clients_all_${skip}_${limit}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get('/clients', {
        params: { skip, limit }
      });
      return response.data;
    },
    { useCache: true, cacheTTL: 2 * 60 * 1000 } // Caché 2 minutos
  );
};

/**
 * Obtener cliente por ID con caché
 */
export const getById = async (id) => {
  const cacheKey = `client_${id}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get(`/clients/${id}`);
      return response.data;
    },
    { useCache: true, cacheTTL: 5 * 60 * 1000 } // Caché 5 minutos (datos del perfil no cambian frecuentemente)
  );
};

/**
 * Crear cliente - limpia caché
 */
export const create = async (clientData) => {
  try {
    const response = await apiClient.post('/clients', clientData);
    cacheClear('clients');
    return response.data;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error;
  }
};

/**
 * Actualizar cliente - limpia caché
 */
export const update = async (id, clientData) => {
  try {
    const response = await apiClient.put(`/clients/${id}`, clientData);
    cacheClear('client');
    cacheClear('clients');
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar cliente ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar cliente - limpia caché
 */
export const deleteClient = async (id) => {
  try {
    await apiClient.delete(`/clients/${id}`);
    cacheClear('client');
    cacheClear('clients');
  } catch (error) {
    console.error(`Error al eliminar cliente ${id}:`, error);
    throw error;
  }
};
