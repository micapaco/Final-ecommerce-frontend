import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    MapPin,
    Database,
    Server,
    Cpu
} from 'lucide-react';
import { getAll as getAllProducts } from '../../api/products';
import { getAll as getAllOrders } from '../../api/orders';
import { getAll as getAllClients } from '../../api/clients';
import { getAll as getAllCategories } from '../../api/categories';
import { getAll as getAllAddresses } from '../../api/addresses';
import { getHealthCheck } from '../../api/healthCheck';
import { formatObjectDate } from '../../utils/dateUtils';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalClients: 0,
        totalCategories: 0,
        totalAddresses: 0,
        lowStockProducts: [],
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);
    const [healthData, setHealthData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Primero obtener health check (1 sola petición para métricas reales)
                const health = await getHealthCheck();
                setHealthData(health);
                await new Promise(r => setTimeout(r, 300));

                // Luego cargar datos secuencialmente con delays
                const products = await getAllProducts();
                await new Promise(r => setTimeout(r, 200));

                const orders = await getAllOrders();
                await new Promise(r => setTimeout(r, 200));

                const clients = await getAllClients();
                await new Promise(r => setTimeout(r, 200));

                const categories = await getAllCategories();
                await new Promise(r => setTimeout(r, 200));

                const addresses = await getAllAddresses();

                const lowStock = products.filter(p => p.stock < 10 && p.stock > 0);
                const recent = orders.slice(-5).reverse();

                setStats({
                    totalProducts: products.length,
                    totalOrders: orders.length,
                    totalClients: clients.length,
                    totalCategories: categories.length,
                    totalAddresses: addresses.length,
                    lowStockProducts: lowStock,
                    recentOrders: recent
                });
            } catch (error) {
                console.error('Error al cargar datos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper para obtener color según health status
    const getHealthColor = (health) => {
        switch (health) {
            case 'healthy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'degraded': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getHealthLabel = (health) => {
        switch (health) {
            case 'healthy': return '● HEALTHY';
            case 'warning': return '● WARNING';
            case 'degraded': return '● DEGRADED';
            case 'critical': return '● CRITICAL';
            default: return '● CHECKING';
        }
    };

    // Tarjeta de estadística
    const StatCard = ({ icon: Icon, label, value, color, link }) => (
        <Link
            to={link}
            className={`bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-${color}-500 transition-all group`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm mb-1">{label}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                </div>
                <div className={`p-4 bg-${color}-500/20 rounded-xl`}>
                    <Icon className={`w-8 h-8 text-${color}-500`} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-400 group-hover:text-pink-400 transition-colors">
                <span>Ver detalles</span>
                <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
        </Link>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-400">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Encabezado */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-gray-400">Resumen general de tu tienda</p>
            </div>

            {/* System Metrics (desde Health Check real) */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">System Metrics</h2>
                    {healthData && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getHealthColor(healthData.status)}`}>
                            Sistema: {getHealthLabel(healthData.status)}
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Database */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-400" />
                                <h3 className="text-white font-semibold">Database</h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getHealthColor(healthData?.checks?.database?.health)}`}>
                                {getHealthLabel(healthData?.checks?.database?.health)}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Latencia:</span>
                                <span className="text-white font-medium">
                                    {healthData?.checks?.database?.latency_ms ?? '--'} ms
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Status:</span>
                                <span className={healthData?.checks?.database?.status === 'up' ? 'text-green-400' : 'text-red-400'}>
                                    {healthData?.checks?.database?.status === 'up' ? 'Conectado' : 'Desconectado'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Redis Cache */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Server className="w-5 h-5 text-red-400" />
                                <h3 className="text-white font-semibold">Redis Cache</h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getHealthColor(healthData?.checks?.redis?.health)}`}>
                                {getHealthLabel(healthData?.checks?.redis?.health)}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Status:</span>
                                <span className={healthData?.checks?.redis?.status === 'up' ? 'text-green-400' : 'text-orange-400'}>
                                    {healthData?.checks?.redis?.status === 'up' ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tipo:</span>
                                <span className="text-white">In-Memory Cache</span>
                            </div>
                        </div>
                    </div>

                    {/* DB Pool */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-purple-400" />
                                <h3 className="text-white font-semibold">Connection Pool</h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getHealthColor(healthData?.checks?.db_pool?.health)}`}>
                                {getHealthLabel(healthData?.checks?.db_pool?.health)}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Utilización:</span>
                                <span className="text-white font-medium">
                                    {healthData?.checks?.db_pool?.utilization_percent ?? '--'}%
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Conexiones:</span>
                                <span className="text-white">
                                    {healthData?.checks?.db_pool?.checked_out ?? 0}/{healthData?.checks?.db_pool?.total_capacity ?? 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard icon={Package} label="Productos" value={stats.totalProducts} color="blue" link="/admin/productos" />
                <StatCard icon={ShoppingCart} label="Pedidos" value={stats.totalOrders} color="green" link="/admin/pedidos" />
                <StatCard icon={Users} label="Clientes" value={stats.totalClients} color="purple" link="/admin/clientes" />
                <StatCard icon={TrendingUp} label="Categorías" value={stats.totalCategories} color="pink" link="/admin/categorias" />
                <StatCard icon={MapPin} label="Direcciones" value={stats.totalAddresses} color="cyan" link="/admin/direcciones" />
            </div>

            {/* Sección inferior */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Productos con stock bajo */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <h2 className="text-lg font-semibold text-white">Stock Bajo</h2>
                    </div>
                    {stats.lowStockProducts.length === 0 ? (
                        <p className="text-gray-400 text-sm">No hay productos con stock bajo</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.lowStockProducts.slice(0, 5).map(product => (
                                <div key={product.id_key} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                                    <span className="text-gray-300">{product.name}</span>
                                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium">
                                        {product.stock} unidades
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pedidos recientes */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <ShoppingCart className="w-5 h-5 text-green-500" />
                        <h2 className="text-lg font-semibold text-white">Pedidos Recientes</h2>
                    </div>
                    {stats.recentOrders.length === 0 ? (
                        <p className="text-gray-400 text-sm">No hay pedidos aún</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentOrders.map(order => (
                                <Link
                                    key={order.id_key}
                                    to={`/admin/pedidos/${order.id_key}`}
                                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0 hover:bg-gray-700/50 -mx-2 px-2 rounded transition-colors"
                                >
                                    <div>
                                        <span className="text-gray-300">Pedido #{order.id_key}</span>
                                        <p className="text-xs text-gray-500">{formatObjectDate(order)}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-sm font-medium ${order.status === 'entregado' ? 'bg-green-500/20 text-green-400' :
                                            order.status === 'enviado' ? 'bg-blue-500/20 text-blue-400' :
                                                order.status === 'procesando' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {order.status || 'pendiente'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
