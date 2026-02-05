import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Search, Filter } from 'lucide-react';
import { getAll as getAllOrders } from '../../api/orders';
import { getAll as getAllClients } from '../../api/clients';
import { formatObjectDate } from '../../utils/dateUtils';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersData, clientsData] = await Promise.all([
                getAllOrders(),
                getAllClients()
            ]);
            setOrders(ordersData);
            setClients(clientsData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getClientName = (clientId) => {
        const client = clients.find(c => c.id_key === clientId);
        return client ? `${client.name || ''} ${client.lastname || ''}`.trim() || 'Cliente desconocido' : 'Cliente desconocido';
    };

    const getStatusStyle = (status) => {
        const statusStr = String(status || 'pendiente').toLowerCase();
        switch (statusStr) {
            case 'entregado':
                return 'bg-green-500/20 text-green-400';
            case 'enviado':
                return 'bg-blue-500/20 text-blue-400';
            case 'procesando':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'cancelado':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const filteredOrders = orders
        .filter(order => {
            if (filterStatus === 'all') return true;
            return (order.status || 'pendiente').toLowerCase() === filterStatus;
        })
        .filter(order => {
            if (!searchTerm) return true;
            const clientName = getClientName(order.client_id).toLowerCase();
            return clientName.includes(searchTerm.toLowerCase()) ||
                order.id_key.toString().includes(searchTerm);
        })
        .sort((a, b) => b.id_key - a.id_key);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-400">Cargando pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Encabezado */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Pedidos</h1>
                <p className="text-gray-400">{orders.length} pedidos en total</p>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Búsqueda */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o # de pedido..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    />
                </div>

                {/* Filtro por estado */}
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="procesando">Procesando</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
            </div>

            {/* Tabla de pedidos */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="text-left p-4 text-gray-400 font-medium"># Pedido</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Cliente</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Fecha</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Estado</th>
                            <th className="text-right p-4 text-gray-400 font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id_key} className="border-t border-gray-700 hover:bg-gray-750">
                                <td className="p-4">
                                    <span className="text-white font-medium">#{order.id_key}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-gray-300">{getClientName(order.client_id)}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-gray-400">
                                        {formatObjectDate(order)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(order.status)}`}>
                                        {order.status || 'pendiente'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end">
                                        <Link
                                            to={`/admin/pedidos/${order.id_key}`}
                                            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span className="text-sm">Ver detalle</span>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOrders.length === 0 && (
                    <div className="p-8 text-center">
                        <ShoppingCart className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-400">No se encontraron pedidos</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
