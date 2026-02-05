import apiClient from './client';
import { fetchWithOptimizations, cacheClear } from './utils';

/**
 * Obtener todas las reseñas con caché
 */
export const getAll = async () => {
  const cacheKey = 'reviews_all';
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get('/reviews', {
        params: { skip: 0, limit: 1000 }
      });
      return response.data;
    },
    { useCache: true, cacheTTL: 2 * 60 * 1000 }
  );
};

/**
 * Obtener reseñas por ID de producto
 */
export const getByProductId = async (productId) => {
  const allReviews = await getAll();
  return allReviews.filter((r) => r.product_id === parseInt(productId));
};

/**
 * Obtener reseña por ID con caché
 */
export const getById = async (id) => {
  const cacheKey = `review_${id}`;
  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get(`/reviews/${id}`);
      return response.data;
    },
    { useCache: true, cacheTTL: 2 * 60 * 1000 }
  );
};

/**
 * Crear reseña - limpia caché
 */
export const create = async (reviewData) => {
  try {
    const response = await apiClient.post('/reviews', reviewData);
    cacheClear('reviews');
    return response.data;
  } catch (error) {
    console.error('Error al crear reseña:', error);
    throw error;
  }
};

/**
 * Actualizar reseña - limpia caché
 */
export const update = async (id, reviewData) => {
  try {
    const response = await apiClient.put(`/reviews/${id}`, reviewData);
    cacheClear('reviews');
    cacheClear('review');
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar reseña ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar reseña - limpia caché
 */
export const deleteReview = async (id) => {
  try {
    await apiClient.delete(`/reviews/${id}`);
    cacheClear('reviews');
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    throw error;
  }
};
