import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingCart,
    Users,
    FileText,
    ArrowLeft,
    Sparkles,
    MapPin
} from 'lucide-react';

const AdminSidebar = () => {
    // Estilos para los links activos/inactivos
    const linkClass = ({ isActive }) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
    ${isActive
            ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }
  `;

    const menuItems = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/productos', icon: Package, label: 'Productos' },
        { to: '/admin/categorias', icon: FolderTree, label: 'Categorías' },
        { to: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos' },
        { to: '/admin/clientes', icon: Users, label: 'Clientes' },
        { to: '/admin/direcciones', icon: MapPin, label: 'Direcciones' },
        { to: '/admin/facturas', icon: FileText, label: 'Facturas' },
    ];

    return (
        <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-pink-500" />
                    <div>
                        <h1 className="text-white font-bold text-lg">The Essentials</h1>
                        <span className="text-xs text-gray-400">Panel Admin</span>
                    </div>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={linkClass}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Volver a la tienda */}
            <div className="p-4 border-t border-gray-700">
                <NavLink
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Volver a la tienda</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default AdminSidebar;
