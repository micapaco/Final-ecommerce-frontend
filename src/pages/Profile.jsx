import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit3, Save, X, Package, ChevronRight, Calendar, DollarSign, MapPin, Plus, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getById, update } from '../api/clients';
import { getAll as getAllOrders } from '../api/orders';
import { getByClientId as getAddressesByClient, create as createAddress, deleteAddress, update as updateAddress } from '../api/addresses';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { formatObjectDate, getDateValue } from '../utils/dateUtils';

const Profile = () => {
    const { user, logout } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const redirectTo = searchParams.get('redirect');

    const [clientData, setClientData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        telephone: ''
    });

    // Estado del formulario de dirección
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [deletingAddress, setDeletingAddress] = useState(null);
    const [editingAddress, setEditingAddress] = useState(null); // ID de la dirección que se está editando
    const [addressForm, setAddressForm] = useState({
        street: '',
        number: '',
        city: ''
    });

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Obtener datos del cliente
            const client = await getById(user.id);
            setClientData(client);
            setFormData({
                name: client.name || '',
                lastname: client.lastname || '',
                telephone: client.telephone || ''
            });

            // Obtener pedidos del cliente
            const allOrders = await getAllOrders();
            const userOrders = allOrders.filter(order => order.client_id === user.id);
            setOrders(userOrders.sort((a, b) => new Date(getDateValue(b) || 0) - new Date(getDateValue(a) || 0)));

            // Obtener direcciones del cliente
            try {
                const addressesData = await getAddressesByClient(user.id);
                setAddresses(addressesData);
            } catch (addrErr) {
                console.error('Error al cargar direcciones:', addrErr);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Enviar todos los campos que el backend espera
            const updateData = {
                name: formData.name,
                lastname: formData.lastname,
                telephone: formData.telephone || null,
                email: clientData.email // Incluir email aunque no cambie
            };
            console.log('Actualizando cliente:', updateData);
            await update(user.id, updateData);
            setClientData({ ...clientData, ...formData });
            setEditing(false);
        } catch (error) {
            console.error('Error al actualizar:', error);
            const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Error al actualizar los datos';
            alert(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setSaving(false);
        }
    };

    // Usar formatObjectDate de utils/dateUtils en lugar de función local

    const getStatusColor = (status) => {
        // El backend devuelve: 1=PENDING, 2=IN_PROGRESS, 3=DELIVERED, 4=CANCELED
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
            case 'completado':
            case 'entregado':
                return 'bg-green-500/20 text-green-400';
            case 'procesando':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'pendiente':
                return 'bg-gray-500/20 text-gray-400';
            case 'cancelado':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            1: 'Pendiente',
            2: 'Procesando',
            3: 'Entregado',
            4: 'Cancelado'
        };
        return typeof status === 'number'
            ? statusMap[status] || 'Pendiente'
            : (status || 'Pendiente');
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!addressForm.street || !addressForm.city) return;

        try {
            setSavingAddress(true);
            const newAddress = await createAddress({
                ...addressForm,
                client_id: user.id
            });
            setAddresses([...addresses, newAddress]);
            setAddressForm({ street: '', number: '', city: '' });
            setShowAddressForm(false);

            // Si viene del checkout, volver allá
            if (redirectTo === 'checkout') {
                navigate('/checkout');
            }
        } catch (error) {
            console.error('Error al agregar dirección:', error);
            alert('Error al agregar la dirección');
        } finally {
            setSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('¿Estás seguro de eliminar esta dirección?')) return;

        try {
            setDeletingAddress(addressId);
            await deleteAddress(addressId);
            setAddresses(addresses.filter(a => a.id_key !== addressId));
        } catch (error) {
            console.error('Error al eliminar dirección:', error);
            alert('Error al eliminar la dirección');
        } finally {
            setDeletingAddress(null);
        }
    };

    const handleStartEditAddress = (address) => {
        setEditingAddress(address.id_key);
        setAddressForm({
            street: address.street || '',
            number: address.number || '',
            city: address.city || ''
        });
        setShowAddressForm(true);
    };

    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        if (!addressForm.street || !addressForm.city) return;

        try {
            setSavingAddress(true);
            const updated = await updateAddress(editingAddress, {
                ...addressForm,
                client_id: user.id
            });
            setAddresses(addresses.map(a => a.id_key === editingAddress ? updated : a));
            setAddressForm({ street: '', number: '', city: '' });
            setShowAddressForm(false);
            setEditingAddress(null);
        } catch (error) {
            console.error('Error al actualizar dirección:', error);
            alert('Error al actualizar la dirección');
        } finally {
            setSavingAddress(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-4xl font-bold text-white">
                            {clientData?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {clientData?.name} {clientData?.lastname}
                    </h1>
                    <p className="text-gray-500">{clientData?.email}</p>
                </div>

                {/* Datos personales */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <User className="w-5 h-5 text-pink-500" />
                            Datos Personales
                        </h2>
                        {!editing ? (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors"
                            >
                                <Edit3 className="w-4 h-4" />
                                Editar
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditing(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Guardar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Nombre</label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium py-3">{clientData?.name || '-'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Apellido</label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={formData.lastname}
                                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium py-3">{clientData?.lastname || '-'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1 flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                Email
                            </label>
                            <p className="text-gray-800 font-medium py-3">{clientData?.email || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1 flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                Teléfono
                            </label>
                            {editing ? (
                                <input
                                    type="tel"
                                    value={formData.telephone}
                                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                                    placeholder="Ej: 11-1234-5678"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium py-3">{clientData?.telephone || 'No especificado'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mis Direcciones */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-pink-500" />
                            Mis Direcciones
                        </h2>
                        {!showAddressForm && (
                            <button
                                onClick={() => setShowAddressForm(true)}
                                className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Agregar
                            </button>
                        )}
                    </div>

                    {/* Formulario nueva/editar dirección */}
                    {showAddressForm && (
                        <form onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress} className="bg-gray-50 rounded-xl p-4 mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                {editingAddress ? 'Editar dirección' : 'Nueva dirección'}
                            </p>
                            <div className="grid md:grid-cols-3 gap-3 mb-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Calle *</label>
                                    <input
                                        type="text"
                                        value={addressForm.street}
                                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 text-sm"
                                        placeholder="Av. Corrientes"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Número</label>
                                    <input
                                        type="text"
                                        value={addressForm.number}
                                        onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 text-sm"
                                        placeholder="1234"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Ciudad *</label>
                                    <input
                                        type="text"
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 text-sm"
                                        placeholder="Buenos Aires"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddressForm(false);
                                        setAddressForm({ street: '', number: '', city: '' });
                                        setEditingAddress(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingAddress}
                                    className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors text-sm disabled:opacity-50"
                                >
                                    {savingAddress ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {editingAddress ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Lista de direcciones */}
                    {addresses.length === 0 ? (
                        <div className="text-center py-6">
                            <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 text-sm">No tenés direcciones guardadas</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {addresses.map((address) => (
                                <div
                                    key={address.id_key}
                                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-pink-100 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-pink-50 rounded-lg">
                                            <MapPin className="w-5 h-5 text-pink-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {address.street} {address.number}
                                            </p>
                                            <p className="text-sm text-gray-500">{address.city}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleStartEditAddress(address)}
                                            className="p-2 text-gray-400 hover:text-pink-500 transition-colors"
                                            title="Editar dirección"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAddress(address.id_key)}
                                            disabled={deletingAddress === address.id_key}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                            title="Eliminar dirección"
                                        >
                                            {deletingAddress === address.id_key ? (
                                                <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Trash2 className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Historial de pedidos */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                        <Package className="w-5 h-5 text-pink-500" />
                        Mis Pedidos
                    </h2>

                    {orders.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 mb-4">Aún no tenés pedidos</p>
                            <Link
                                to="/productos"
                                className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 transition-colors"
                            >
                                Explorar productos
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Link
                                    key={order.id_key}
                                    to={`/pedido/${order.id_key}`}
                                    className="block border border-gray-100 rounded-xl p-4 hover:border-pink-200 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-pink-50 rounded-xl">
                                                <Package className="w-6 h-6 text-pink-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Pedido #{order.id_key}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatObjectDate(order)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-pink-600 flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4" />
                                                    {order.total?.toLocaleString('es-AR') || '0'}
                                                </p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Botón cerrar sesión */}
                <div className="text-center">
                    <button
                        onClick={logout}
                        className="text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
