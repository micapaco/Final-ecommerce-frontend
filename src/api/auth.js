import apiClient from './client';

/**
 * API de autenticación
 */

/**
 * Iniciar sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Datos del usuario autenticado
 */
export const login = async (email, password) => {
    try {
        const response = await apiClient.post('/auth/login', {
            email,
            password
        });
        return response.data;
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario (name, lastname, email, password, telephone)
 * @returns {Promise<Object>} Datos del usuario registrado
 */
export const register = async (userData) => {
    try {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Error en registro:', error);
        throw error;
    }
};
