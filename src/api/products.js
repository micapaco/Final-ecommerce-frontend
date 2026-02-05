import apiClient from './client';
import { fetchWithOptimizations, cacheClear } from './utils';

/**
 * Obtener todos los productos con paginación opcional
 * Usa caché y reintentos para mejor rendimiento
 */
export const getAll = async (skip = 0, limit = 100) => {
  const cacheKey = `products_all_${skip}_${limit}`;

  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get('/products', {
        params: { skip, limit }
      });
      return response.data;
    },
    { useCache: true, cacheTTL: 2 * 60 * 1000 } // Caché 2 minutos
  );
};

/**
 * Obtener un producto por ID
 * Usa caché y reintentos
 */
export const getById = async (id) => {
  const cacheKey = `product_${id}`;

  return fetchWithOptimizations(
    cacheKey,
    async () => {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    },
    { useCache: true, cacheTTL: 5 * 60 * 1000 } // Caché 5 minutos
  );
};

/**
 * Crear un nuevo producto
 * Limpia caché después de crear
 */
export const create = async (productData) => {
  try {
    const response = await apiClient.post('/products', productData);
    // Limpiar caché de productos
    cacheClear('products');
    return response.data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

/**
 * Actualizar un producto existente
 * Limpia caché después de actualizar
 */
export const update = async (id, productData) => {
  try {
    const response = await apiClient.put(`/products/${id}`, productData);
    // Limpiar caché del producto y lista
    cacheClear('product');
    cacheClear('products');
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar producto ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar un producto
 * Limpia caché después de eliminar
 */
export const deleteProduct = async (id) => {
  try {
    await apiClient.delete(`/products/${id}`);
    // Limpiar caché
    cacheClear('product');
    cacheClear('products');
  } catch (error) {
    console.error(`Error al eliminar producto ${id}:`, error);
    throw error;
  }
};
