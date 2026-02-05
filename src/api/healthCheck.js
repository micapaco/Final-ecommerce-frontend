import apiClient from './client';

/**
 * Obtener el estado de salud del sistema
 * @returns {Promise<Object>} Estado de salud con database, redis, db_pool
 */
export const getHealthCheck = async () => {
    try {
        const response = await apiClient.get('/health_check/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener health check:', error);
        // Retornar estado de error si falla la llamada
        return {
            status: 'critical',
            checks: {
                database: { status: 'down', health: 'critical', latency_ms: null },
                redis: { status: 'down', health: 'degraded' },
                db_pool: { health: 'critical', utilization_percent: 0 }
            }
        };
    }
};
