/**
 * Utilidades para normalizar datos entre frontend y backend
 * Maneja las diferencias de nombres de campos entre ambos
 */

// ==================== STATUS ====================

// Valores enum de estado del backend
export const STATUS_ENUM = {
    PENDING: 1,
    PROCESSING: 2,
    DELIVERED: 3,
    CANCELLED: 4
};

// Etiquetas de estado para mostrar en la UI
export const STATUS_LABELS = {
    1: 'Pendiente',
    2: 'Procesando',
    3: 'Entregado',
    4: 'Cancelado',
    'pendiente': 'Pendiente',
    'procesando': 'Procesando',
    'entregado': 'Entregado',
    'cancelado': 'Cancelado'
};

// Convertir estado a string (para mostrar)
export const statusToString = (status) => {
    if (typeof status === 'number') {
        const map = { 1: 'pendiente', 2: 'procesando', 3: 'entregado', 4: 'cancelado' };
        return map[status] || 'pendiente';
    }
    return String(status || 'pendiente').toLowerCase();
};

// Convertir estado a enum (para enviar al backend)
export const statusToEnum = (status) => {
    if (typeof status === 'number') return status;
    const map = { 'pendiente': 1, 'procesando': 2, 'entregado': 3, 'cancelado': 4 };
    return map[String(status).toLowerCase()] || 1;
};

// Obtener etiqueta para mostrar
export const getStatusLabel = (status) => {
    const str = statusToString(status);
    return STATUS_LABELS[str] || 'Pendiente';
};

// Obtener estilo CSS según estado
export const getStatusStyle = (status) => {
    const str = statusToString(status);
    switch (str) {
        case 'entregado': return 'bg-green-500/20 text-green-400';
        case 'procesando': return 'bg-yellow-500/20 text-yellow-400';
        case 'cancelado': return 'bg-red-500/20 text-red-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};

// ==================== PAYMENT ====================

// Enum de tipo de pago del backend
export const PAYMENT_TYPE_ENUM = {
    CASH: 1,
    CARD: 2,
    TRANSFER: 3
};

// Mapear tipo de pago a etiqueta
export const getPaymentLabel = (paymentType) => {
    if (typeof paymentType === 'number') {
        const map = { 1: 'Efectivo', 2: 'Tarjeta', 3: 'Transferencia' };
        return map[paymentType] || 'No especificado';
    }
    // Si viene como texto del backend
    const strMap = {
        'cash': 'Efectivo',
        'card': 'Tarjeta',
        'credit_card': 'Tarjeta',
        'transfer': 'Transferencia',
        'tarjeta': 'Tarjeta',
        'efectivo': 'Efectivo',
        'transferencia': 'Transferencia'
    };
    return strMap[String(paymentType).toLowerCase()] || paymentType || 'No especificado';
};

// Convertir método de pago a enum del backend
export const paymentMethodToEnum = (method) => {
    const map = { 'cash': 1, 'card': 2, 'transfer': 3 };
    return map[method] || 1;
};

// ==================== DELIVERY ====================

// Enum de método de entrega del backend
export const DELIVERY_METHOD_ENUM = {
    PICKUP: 1,
    ON_HAND: 2
};

// Mapear método de entrega a etiqueta
export const getDeliveryLabel = (deliveryMethod) => {
    if (typeof deliveryMethod === 'number') {
        return deliveryMethod === 1 ? 'Retiro en tienda' : 'Envío a domicilio';
    }
    return deliveryMethod === 'pickup' ? 'Retiro en tienda' : 'Envío a domicilio';
};

// Convertir método de entrega a enum del backend
export const deliveryMethodToEnum = (method) => {
    return method === 'delivery' ? 2 : 1;
};

// ==================== IDS ====================

// Obtener ID de un objeto (maneja id e id_key)
export const getId = (obj) => {
    if (!obj) return null;
    return obj.id_key ?? obj.id ?? null;
};

// ==================== PRECIO ====================

// Obtener precio de un item de order detail
export const getItemPrice = (item) => {
    return item?.unit_price ?? item?.price ?? item?.product?.price ?? 0;
};

// Formatear precio
export const formatPrice = (price, locale = 'es-AR') => {
    const num = typeof price === 'number' ? price : parseFloat(price) || 0;
    return `$${num.toLocaleString(locale)}`;
};
