import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Search, Plus, Trash2, X } from 'lucide-react';
import { getAll as getAllClients, create as createClient, deleteClient } from '../../api/clients';

const AdminClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClient, setNewClient] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: ''
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const data = await getAllClients();
            setClients(data);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClient = async (e) => {
        e.preventDefault();
        try {
            await createClient(newClient);
            setShowCreateModal(false);
            setNewClient({ first_name: '', last_name: '', email: '', phone: '', password: '' });
            fetchClients();
        } catch (error) {
            console.error('Error al crear cliente:', error);
            alert('Error al crear cliente');
        }
    };

    const handleDeleteClient = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
        try {
            await deleteClient(id);
            fetchClients();
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            alert('Error al eliminar cliente');
        }
    };

    const filteredClients = clients.filter(client => {
        const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
        const email = (client.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || email.includes(search);
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-400">Cargando clientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
                    <p className="text-gray-400">{clients.length} clientes registrados</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Cliente
                </button>
            </div>

            {/* Búsqueda */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    />
                </div>
            </div>

            {/* Grid de clientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map((client) => (
                    <div
                        key={client.id_key}
                        className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors relative"
                    >
                        <button
                            onClick={() => handleDeleteClient(client.id_key)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Eliminar cliente"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                                <span className="text-pink-400 font-bold text-lg">
                                    {client.first_name?.[0]}{client.last_name?.[0]}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">
                                    {client.first_name} {client.last_name}
                                </h3>
                                <span className="text-gray-500 text-sm">ID: {client.id_key}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {client.email && (
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Mail className="w-4 h-4" />
                                    <span className="truncate">{client.email}</span>
                                </div>
                            )}
                            {client.phone && (
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Phone className="w-4 h-4" />
                                    <span>{client.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">
                        {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                    </p>
                </div>
            )}

            {/* Modal crear cliente */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Nuevo Cliente</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateClient} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={newClient.first_name}
                                    onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Apellido</label>
                                <input
                                    type="text"
                                    value={newClient.last_name}
                                    onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newClient.email}
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={newClient.phone}
                                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Contraseña</label>
                                <input
                                    type="password"
                                    value={newClient.password}
                                    onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
                            >
                                Crear Cliente
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminClients;
