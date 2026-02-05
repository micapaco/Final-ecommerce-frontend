import apiClient from './client';
import { fetchWithOptimizations, cacheClear } from './utils';

/**
 * Obtener todas las categorías con caché
 */
export const getAll = async (skip = 0, limit = 100) => {
  const cacheKey = `categories_all_${skip}_${limit}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get('/categories', {
        params: { skip, limit }
      });
      return response.data;
    },
    { useCache: true, cacheTTL: 5 * 60 * 1000 } // Caché 5 minutos (datos estables)
  );
};

/**
 * Obtener categoría por ID con caché
 */
export const getById = async (id) => {
  const cacheKey = `category_${id}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data;
    },
    { useCache: true, cacheTTL: 5 * 60 * 1000 }
  );
};

/**
 * Crear categoría - limpia caché
 */
export const create = async (categoryData) => {
  try {
    const response = await apiClient.post('/categories', categoryData);
    cacheClear('categor');
    return response.data;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error;
  }
};

/**
 * Actualizar categoría - limpia caché
 */
export const update = async (id, categoryData) => {
  try {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    cacheClear('categor');
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar categoría ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar categoría - limpia caché
 */
export const deleteCategory = async (id) => {
  try {
    await apiClient.delete(`/categories/${id}`);
    cacheClear('categor');
  } catch (error) {
    console.error(`Error al eliminar categoría ${id}:`, error);
    throw error;
  }
};
