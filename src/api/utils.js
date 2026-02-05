// Utilidades para optimizar llamadas a la API

// ==========================================
// CACHÉ EN MEMORIA
// ==========================================
const cache = new Map();
const inFlightRequests = new Map(); // Rastrea peticiones en progreso
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos (aumentado para evitar rate limiting)

export const cacheGet = (key) => {
    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }

    return item.data;
};

export const cacheSet = (key, data, ttl = CACHE_TTL) => {
    cache.set(key, {
        data,
        expiry: Date.now() + ttl,
    });
};

// Obtener petición en progreso si existe
export const getInFlight = (key) => inFlightRequests.get(key);

// Registrar petición en progreso
export const setInFlight = (key, promise) => inFlightRequests.set(key, promise);

// Limpiar petición en progreso
export const clearInFlight = (key) => inFlightRequests.delete(key);

export const cacheClear = (keyPattern) => {
    if (keyPattern) {
        for (const key of cache.keys()) {
            if (key.includes(keyPattern)) {
                cache.delete(key);
            }
        }
    } else {
        cache.clear();
    }
};

// ==========================================
// DEBOUNCE (Retardo de ejecución)
// ==========================================
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ==========================================
// THROTTLE (Limitador de frecuencia)
// ==========================================
export const throttle = (func, limit = 1000) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ==========================================
// REINTENTO CON BACKOFF EXPONENCIAL
// ==========================================
export const retryWithBackoff = async (
    fn,
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000
) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Si es un error 429 (límite de tasa), esperamos y reintentamos
            const isRateLimited = error.response?.status === 429;

            // Si no es límite de tasa y no es un error de servidor, no reintentamos
            if (!isRateLimited && error.response?.status < 500) {
                throw error;
            }

            if (attempt < maxRetries) {
                // Backoff exponencial: 1s, 2s, 4s, etc.
                const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
                console.log(`Reintento ${attempt + 1}/${maxRetries} después de ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
};

// ==========================================
// COLA DE PETICIONES (limita peticiones concurrentes)
// ==========================================
class RequestQueue {
    constructor(maxConcurrent = 5, delayBetween = 100) {
        this.maxConcurrent = maxConcurrent;
        this.delayBetween = delayBetween;
        this.running = 0;
        this.queue = [];
    }

    async add(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.running >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        this.running++;
        const { fn, resolve, reject } = this.queue.shift();

        try {
            const result = await fn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.running--;
            // Pequeño delay entre peticiones
            setTimeout(() => this.process(), this.delayBetween);
        }
    }
}

export const requestQueue = new RequestQueue(1, 600); // 1 concurrente con 600ms delay para respetar rate limit

// ==========================================
// WRAPPER PARA FETCH CON TODAS LAS OPTIMIZACIONES
// ==========================================
export const fetchWithOptimizations = async (
    key,
    fetchFn,
    options = {}
) => {
    const {
        useCache = true,
        cacheTTL = CACHE_TTL,
        useRetry = true,
        useQueue = true,
    } = options;

    // Verificar caché primero
    if (useCache) {
        const cached = cacheGet(key);
        if (cached) {
            console.log(`Caché encontrado: ${key}`);
            return cached;
        }
    }

    // Si ya hay una petición en progreso para esta key, reutilizarla
    const inFlight = getInFlight(key);
    if (inFlight) {
        console.log(`Reutilizando petición en progreso: ${key}`);
        return inFlight;
    }

    // Función para ejecutar
    const execute = async () => {
        const data = await fetchFn();

        // Guardar en caché
        if (useCache) {
            cacheSet(key, data, cacheTTL);
        }

        return data;
    };

    // Crear promesa y registrarla como en progreso
    let requestPromise;

    if (useQueue && useRetry) {
        requestPromise = requestQueue.add(() => retryWithBackoff(execute));
    } else if (useQueue) {
        requestPromise = requestQueue.add(execute);
    } else if (useRetry) {
        requestPromise = retryWithBackoff(execute);
    } else {
        requestPromise = execute();
    }

    // Registrar como en progreso
    setInFlight(key, requestPromise);

    // Limpiar en progreso cuando termine
    requestPromise
        .then(() => clearInFlight(key))
        .catch(() => clearInFlight(key));

    return requestPromise;
};
