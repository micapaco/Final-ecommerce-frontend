import React, { useState, useEffect } from 'react';
import { MapPin, Search, User, Trash2 } from 'lucide-react';
import { getAll as getAllAddresses, deleteAddress } from '../../api/addresses';
import { getAll as getAllClients } from '../../api/clients';

const AdminAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [addressesData, clientsData] = await Promise.all([
                getAllAddresses(),
                getAllClients()
            ]);
            setAddresses(addressesData);
            setClients(clientsData);
        } catch (error) {
            console.error('Error al cargar direcciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const getClientName = (clientId) => {
        const client = clients.find(c => c.id_key === clientId);
        if (!client) return 'Cliente desconocido';
        return `${client.first_name || client.name || ''} ${client.last_name || client.lastname || ''}`.trim() || 'Cliente desconocido';
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta dirección?')) return;
        try {
            await deleteAddress(id);
            fetchData();
        } catch (error) {
            console.error('Error al eliminar dirección:', error);
            alert('Error al eliminar dirección');
        }
    };

    const filteredAddresses = addresses.filter(address => {
        const clientName = getClientName(address.client_id).toLowerCase();
        const street = (address.street || '').toLowerCase();
        const city = (address.city || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return clientName.includes(search) || street.includes(search) || city.includes(search);
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-400">Cargando direcciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Encabezado */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Direcciones</h1>
                <p className="text-gray-400">{addresses.length} direcciones registradas</p>
            </div>

            {/* Búsqueda */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, calle o ciudad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    />
                </div>
            </div>

            {/* Grid de direcciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAddresses.map((address) => (
                    <div
                        key={address.id_key}
                        className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors relative"
                    >
                        <button
                            onClick={() => handleDeleteAddress(address.id_key)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Eliminar dirección"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm">ID: {address.id_key}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-white font-medium">
                                {address.street} {address.number}
                            </p>
                            {(address.floor || address.apartment) && (
                                <p className="text-gray-400 text-sm">
                                    {address.floor && `Piso ${address.floor}`}
                                    {address.floor && address.apartment && ' - '}
                                    {address.apartment && `Depto ${address.apartment}`}
                                </p>
                            )}
                            <p className="text-gray-400 text-sm">
                                {address.city}{address.province && `, ${address.province}`}
                            </p>
                            {address.zip_code && (
                                <p className="text-gray-500 text-sm">CP: {address.zip_code}</p>
                            )}

                            <div className="pt-3 border-t border-gray-700 mt-3">
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <User className="w-4 h-4" />
                                    <span>{getClientName(address.client_id)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredAddresses.length === 0 && (
                <div className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">
                        {searchTerm ? 'No se encontraron direcciones' : 'No hay direcciones registradas'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminAddresses;
