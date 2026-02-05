import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Package, Truck, CheckCircle, Clock, XCircle, Trash2, Edit2, Check, X } from 'lucide-react';
import { getById as getOrderById, updateStatus, deleteOrder } from '../../api/orders';
import { getById as getClientById } from '../../api/clients';
import { getById as getProductById } from '../../api/products';
import { getByOrderId as getOrderDetailsByOrderId, getById as getOrderDetailById, update as updateOrderDetail, deleteOrderDetail } from '../../api/orderDetails';
import { getById as getAddressById } from '../../api/addresses';
import apiClient from '../../api/client';
import { formatObjectDate, getDateValue, toISODate } from '../../utils/dateUtils';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [client, setClient] = useState(null);
    const [address, setAddress] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editQuantity, setEditQuantity] = useState(1);

    const statusFlow = ['pendiente', 'procesando', 'entregado'];

    useEffect(() => {
        fetchOrderData();
    }, [id]);

    const fetchOrderData = async () => {
        try {
            setLoading(true);

            // Obtener orden
            const orderData = await getOrderById(id);
            setOrder(orderData);

            // Obtener cliente
            if (orderData.client_id) {
                try {
                    const clientData = await getClientById(orderData.client_id);
                    setClient(clientData);
                } catch (e) {
                    console.log('No se pudo obtener cliente');
                }
            }

            // Obtener dirección
            if (orderData.address_id) {
                try {
                    const addressData = await getAddressById(orderData.address_id);
                    setAddress(addressData);
                } catch (e) {
                    console.log('No se pudo obtener dirección');
                }
            }

            // Obtener detalles del pedido usando getByOrderId
            try {
                const orderDetailsData = await getOrderDetailsByOrderId(id);

                // Obtener productos para cada detalle
                const itemsWithProducts = await Promise.all(
                    orderDetailsData.map(async (detail) => {
                        try {
                            // También probamos getById de orderDetails
                            const detailById = await getOrderDetailById(detail.id_key);
                            const product = await getProductById(detailById.product_id);
                            return { ...detailById, product };
                        } catch {
                            return { ...detail, product: { name: 'Producto no encontrado', price: detail.unit_price } };
                        }
                    })
                );
                setOrderItems(itemsWithProducts);
            } catch (e) {
                console.log('No se pudieron obtener detalles');
            }

        } catch (error) {
            console.error('Error al cargar pedido:', error);
            alert('Error al cargar el pedido');
            navigate('/admin/pedidos');
        } finally {
            setLoading(false);
        }
    };

    // Mapeo de status string -> enum (para enviar al backend)
    const statusToEnum = {
        'pendiente': 1,
        'procesando': 2,
        'entregado': 3,
        'cancelado': 4
    };

    // Mapeo de status enum -> string (para recibir del backend)
    const enumToStatus = {
        1: 'pendiente',
        2: 'procesando',
        3: 'entregado',
        4: 'cancelado'
    };

    // Obtener status normalizado (puede venir como número o string)
    const getNormalizedStatus = (status) => {
        if (typeof status === 'number') {
            return enumToStatus[status] || 'pendiente';
        }
        return status || 'pendiente';
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            setUpdating(true);

            // Usar la función updateStatus del API
            const statusEnum = statusToEnum[newStatus] || 1;
            await updateStatus(id, statusEnum);

            // Actualizar estado local
            setOrder({ ...order, status: newStatus });
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            alert('Error al actualizar el estado');
        } finally {
            setUpdating(false);
        }
    };

    // Eliminar orden y sus detalles
    const handleDeleteOrder = async () => {
        if (!window.confirm('¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            setUpdating(true);

            // Primero eliminar los detalles de la orden
            for (const item of orderItems) {
                if (item.id_key) {
                    await deleteOrderDetail(item.id_key);
                }
            }

            // Luego eliminar la orden
            await deleteOrder(id);

            alert('Pedido eliminado correctamente');
            navigate('/admin/pedidos');
        } catch (error) {
            console.error('Error al eliminar pedido:', error);
            alert('Error al eliminar el pedido');
        } finally {
            setUpdating(false);
        }
    };

    // Iniciar edición de cantidad de un item
    const handleStartEditItem = (item) => {
        setEditingItem(item.id_key);
        setEditQuantity(item.quantity || 1);
    };

    // Guardar cambios en la cantidad del item
    const handleSaveItemQuantity = async (item) => {
        if (editQuantity < 1) return;
        try {
            setUpdating(true);
            await updateOrderDetail(item.id_key, {
                order_id: parseInt(id),
                product_id: item.product_id,
                quantity: editQuantity,
                unit_price: item.unit_price || item.product?.price
            });
            // Actualizar estado local
            setOrderItems(orderItems.map(i =>
                i.id_key === item.id_key ? { ...i, quantity: editQuantity } : i
            ));
            setEditingItem(null);
        } catch (error) {
            console.error('Error al actualizar item:', error);
            alert('Error al actualizar la cantidad');
        } finally {
            setUpdating(false);
        }
    };

    // Eliminar un item individual del pedido
    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('¿Eliminar este producto del pedido?')) return;
        try {
            setUpdating(true);
            await deleteOrderDetail(itemId);
            setOrderItems(orderItems.filter(i => i.id_key !== itemId));
        } catch (error) {
            console.error('Error al eliminar item:', error);
            alert('Error al eliminar el producto');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pendiente': return Clock;
            case 'procesando': return Package;
            case 'enviado': return Truck;
            case 'entregado': return CheckCircle;
            case 'cancelado': return XCircle;
            default: return Clock;
        }
    };

    const getStatusStyle = (status, isActive) => {
        if (!isActive) return 'bg-gray-700 text-gray-400';
        switch (status) {
            case 'pendiente': return 'bg-gray-500/20 text-gray-300';
            case 'procesando': return 'bg-yellow-500/20 text-yellow-400';
            case 'enviado': return 'bg-blue-500/20 text-blue-400';
            case 'entregado': return 'bg-green-500/20 text-green-400';
            case 'cancelado': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => sum + ((item.unit_price || item.product?.price || 0) * (item.quantity || 1)), 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-400">Cargando pedido...</p>
                </div>
            </div>
        );
    }

    const currentStatus = getNormalizedStatus(order?.status);
    const currentStatusIndex = statusFlow.indexOf(currentStatus);

    return (
        <div>
            {/* Encabezado */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/pedidos')}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Pedido #{id}</h1>
                        <p className="text-gray-400">
                            {formatObjectDate(order, { includeTime: false })}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDeleteOrder}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                    <Trash2 className="w-5 h-5" />
                    Eliminar Pedido
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Columna principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Estado del pedido */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Estado del Pedido</h2>

                        {/* Timeline de estados */}
                        <div className="flex items-center justify-between mb-6">
                            {statusFlow.map((status, index) => {
                                const Icon = getStatusIcon(status);
                                const isActive = index <= currentStatusIndex;
                                const isCurrent = status === currentStatus;

                                return (
                                    <React.Fragment key={status}>
                                        <div className="flex flex-col items-center">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCurrent ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-800' : ''
                                                } ${getStatusStyle(status, isActive)}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <span className={`text-xs mt-2 capitalize ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                                {status}
                                            </span>
                                        </div>
                                        {index < statusFlow.length - 1 && (
                                            <div className={`flex-1 h-1 mx-2 rounded ${index < currentStatusIndex ? 'bg-pink-500' : 'bg-gray-700'
                                                }`}></div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* Botones de cambio de estado */}
                        <div className="flex flex-wrap gap-2">
                            {statusFlow.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleUpdateStatus(status)}
                                    disabled={updating || status === currentStatus}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${status === currentStatus
                                        ? 'bg-pink-600 text-white cursor-default'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        } disabled:opacity-50`}
                                >
                                    {status}
                                </button>
                            ))}
                            <button
                                onClick={() => handleUpdateStatus('cancelado')}
                                disabled={updating || currentStatus === 'cancelado'}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>

                    {/* Productos del pedido */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Productos</h2>

                        <div className="space-y-3">
                            {orderItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                            <Package className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{item.product?.name}</p>
                                            <p className="text-gray-400 text-sm">
                                                ${(item.unit_price || item.product?.price || 0).toLocaleString('es-AR')} x {editingItem === item.id_key ? (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={editQuantity}
                                                        onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                                                        className="w-16 px-2 py-0.5 bg-gray-600 border border-gray-500 rounded text-white text-center"
                                                    />
                                                ) : (item.quantity || 1)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-white font-medium">
                                            ${((item.unit_price || item.product?.price || 0) * (editingItem === item.id_key ? editQuantity : (item.quantity || 1))).toLocaleString('es-AR')}
                                        </span>
                                        {editingItem === item.id_key ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleSaveItemQuantity(item)}
                                                    disabled={updating}
                                                    className="p-1.5 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingItem(null)}
                                                    className="p-1.5 text-gray-400 hover:bg-gray-600 rounded transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleStartEditItem(item)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                                                    title="Editar cantidad"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id_key)}
                                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                                    title="Eliminar producto"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-700 mt-4 pt-4 flex justify-between">
                            <span className="text-gray-400 text-lg">Total</span>
                            <span className="text-white text-xl font-bold">
                                ${calculateTotal().toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Columna lateral */}
                <div className="space-y-6">
                    {/* Info del cliente */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="w-5 h-5 text-pink-500" />
                            <h2 className="text-lg font-semibold text-white">Cliente</h2>
                        </div>

                        {client ? (
                            <div className="space-y-2 text-gray-300">
                                <p className="font-medium">{client.name || ''} {client.lastname || ''}</p>
                                <p className="text-sm text-gray-400">{client.email}</p>
                                {client.phone && <p className="text-sm text-gray-400">{client.phone}</p>}
                            </div>
                        ) : (
                            <p className="text-gray-400">Información no disponible</p>
                        )}
                    </div>

                    {/* Dirección de envío */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="w-5 h-5 text-pink-500" />
                            <h2 className="text-lg font-semibold text-white">Dirección de Envío</h2>
                        </div>

                        {address ? (
                            <div className="space-y-1 text-gray-300">
                                <p>{address.street} {address.number}</p>
                                {address.floor && <p>Piso: {address.floor} - Depto: {address.apartment}</p>}
                                <p>{address.city}, {address.province}</p>
                                <p className="text-gray-400 text-sm">CP: {address.zip_code}</p>
                            </div>
                        ) : (
                            <p className="text-gray-400">Retira en tienda</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
