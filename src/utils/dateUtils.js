/**
 * Utilidades para formateo de fechas
 * Maneja los diferentes formatos y campos de fecha del backend
 */

// Campos de fecha posibles que puede enviar el backend
const DATE_FIELDS = ['date', 'created_at', 'order_date', 'bill_date'];

/**
 * Obtiene el valor de fecha de un objeto, buscando en los campos conocidos
 * @param {Object} obj - Objeto que contiene el campo de fecha
 * @returns {string|null} - Valor de fecha encontrado o null
 */
export const getDateValue = (obj) => {
    if (!obj) return null;

    for (const field of DATE_FIELDS) {
        if (obj[field]) {
            return obj[field];
        }
    }
    return null;
};

/**
 * Formatea una fecha de forma segura
 * @param {string|Date|null} dateValue - Valor de fecha a formatear
 * @param {Object} options - Opciones de formateo
 * @returns {string} - Fecha formateada o texto por defecto
 */
export const formatDate = (dateValue, options = {}) => {
    const {
        fallback = 'Sin fecha',
        includeTime = false,
        locale = 'es-AR'
    } = options;

    if (!dateValue) return fallback;

    try {
        const date = new Date(dateValue);

        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) return fallback;

        const formatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        if (includeTime) {
            formatOptions.hour = '2-digit';
            formatOptions.minute = '2-digit';
        }

        return date.toLocaleDateString(locale, formatOptions);
    } catch {
        return fallback;
    }
};

/**
 * Formatea la fecha de un objeto buscando en los campos conocidos
 * @param {Object} obj - Objeto con campo de fecha
 * @param {Object} options - Opciones de formateo
 * @returns {string} - Fecha formateada
 */
export const formatObjectDate = (obj, options = {}) => {
    const dateValue = getDateValue(obj);
    return formatDate(dateValue, options);
};

/**
 * Convierte una fecha a formato ISO para enviar al backend
 * @param {Date} date - Fecha a convertir
 * @returns {string} - Fecha en formato ISO
 */
export const toISODate = (date = new Date()) => {
    return date.toISOString();
};

/**
 * Convierte una fecha a formato YYYY-MM-DD para el backend
 * @param {Date} date - Fecha a convertir
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const toDateString = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};
