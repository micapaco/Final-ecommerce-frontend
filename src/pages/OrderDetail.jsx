import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, DollarSign, MapPin, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getById as getOrderById } from '../api/orders';
import { getByOrderId as getOrderDetails } from '../api/orderDetails';
import { getById as getProductById } from '../api/products';
import { formatObjectDate } from '../utils/dateUtils';

const OrderDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchOrderData();
        }
    }, [id]);

    const fetchOrderData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Obtener orden
            const orderData = await getOrderById(id);

            // Verificar que el pedido pertenece al usuario
            if (orderData.client_id !== user?.id) {
                setError('No tenés acceso a este pedido');
                return;
            }

            setOrder(orderData);

            // Obtener detalles del pedido
            const details = await getOrderDetails(id);

            // Filtrar por order_id en caso de que el backend no lo haga
            const filteredDetails = details.filter(d =>
                String(d.order_id) === String(id)
            );

            // Obtener información de productos
            const itemsWithProducts = await Promise.all(
                filteredDetails.map(async (detail) => {
                    try {
                        const product = await getProductById(detail.product_id);
                        return {
                            ...detail,
                            product
                        };
                    } catch {
                        return {
                            ...detail,
                            product: { name: 'Producto no disponible', price: detail.unit_price || 0 }
                        };
                    }
                })
            );

            setOrderItems(itemsWithProducts);
        } catch (err) {
            console.error('Error al cargar pedido:', err);
            setError('Error al cargar el pedido');
        } finally {
            setLoading(false);
        }
    };

    // Usar formatObjectDate de utils/dateUtils en lugar de función local

    const getStatusConfig = (status) => {
        // El backend puede devolver un número o string
        const statusMap = {
            1: 'pendiente',
            2: 'procesando',
            3: 'entregado',
            4: 'cancelado'
        };

        const statusStr = typeof status === 'number'
            ? statusMap[status]
            : (status?.toLowerCase?.() || 'pendiente');

        switch (statusStr) {
            case 'entregado':
            case 'completado':
                return { color: 'text-green-500 bg-green-500/10', icon: CheckCircle, label: 'Entregado' };
            case 'procesando':
                return { color: 'text-yellow-500 bg-yellow-500/10', icon: Clock, label: 'Procesando' };
            case 'cancelado':
                return { color: 'text-red-500 bg-red-500/10', icon: XCircle, label: 'Cancelado' };
            default:
                return { color: 'text-gray-500 bg-gray-500/10', icon: Clock, label: 'Pendiente' };
        }
    };

    // Función auxiliar para obtener índice del timeline
    const getStatusIndex = (status) => {
        const statusMap = { 1: 0, 2: 1, 3: 2 };
        if (typeof status === 'number') return statusMap[status] ?? 0;
        const strMap = { 'pendiente': 0, 'procesando': 1, 'entregado': 2 };
        return strMap[status?.toLowerCase?.()] ?? 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Cargando pedido...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-12">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{error}</h1>
                    <Link
                        to="/perfil"
                        className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mt-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a mi perfil
                    </Link>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order?.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/perfil"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a mi perfil
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Pedido #{order?.id_key}</h1>
                            <p className="text-gray-500 flex items-center gap-2 mt-1">
                                <Calendar className="w-4 h-4" />
                                {formatObjectDate(order, { includeTime: true })}
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.color}`}>
                            <StatusIcon className="w-5 h-5" />
                            <span className="font-medium">{statusConfig.label}</span>
                        </div>
                    </div>
                </div>

                {/* Timeline de estado */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Estado del pedido</h2>
                    <div className="flex items-center justify-between">
                        {['Pendiente', 'Procesando', 'Entregado'].map((step, index) => {
                            const currentIndex = getStatusIndex(order?.status);
                            const isActive = index <= currentIndex;
                            const isCurrent = index === currentIndex;

                            return (
                                <div key={step} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400'
                                            } ${isCurrent ? 'ring-4 ring-pink-200' : ''}`}>
                                            {index + 1}
                                        </div>
                                        <span className={`text-xs mt-2 ${isActive ? 'text-pink-600 font-medium' : 'text-gray-400'}`}>
                                            {step}
                                        </span>
                                    </div>
                                    {index < 2 && (
                                        <div className={`flex-1 h-1 mx-2 rounded ${index < currentIndex ? 'bg-pink-500' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Productos */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-pink-500" />
                        Productos ({orderItems.length})
                    </h2>

                    <div className="divide-y divide-gray-100">
                        {orderItems.map((item, index) => (
                            <div key={index} className="py-4 flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    {item.product?.image_url ? (
                                        <img
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <Package className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-800">{item.product?.name || 'Producto'}</h3>
                                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800">
                                        ${((item.unit_price || item.product?.price || 0) * item.quantity).toLocaleString('es-AR')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        ${(item.unit_price || item.product?.price || 0).toLocaleString('es-AR')} c/u
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-800">
                                ${orderItems.reduce((sum, item) => sum + ((item.price || item.unit_price || item.product?.price || 0) * item.quantity), 0).toLocaleString('es-AR')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-gray-600">Envío</span>
                            <span className="text-green-600 font-medium">Gratis</span>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                            <span className="text-xl font-bold text-gray-800">Total</span>
                            <span className="text-2xl font-bold text-pink-600">
                                ${orderItems.reduce((sum, item) => sum + ((item.price || item.unit_price || item.product?.price || 0) * item.quantity), 0).toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Información de envío */}
                {order?.address && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-pink-500" />
                            Dirección de envío
                        </h2>
                        <p className="text-gray-600">
                            {order.address.street} {order.address.number}<br />
                            {order.address.city}, {order.address.province}<br />
                            CP: {order.address.postal_code}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetail;
