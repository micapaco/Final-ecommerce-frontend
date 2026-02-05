import React, { useState, useEffect } from 'react';
import { FileText, Search, Eye, CreditCard, Building2, Trash2, Edit2, X } from 'lucide-react';
import { getAll as getAllBills, getById as getBillById, update as updateBill, deleteBill } from '../../api/bills';
import { getAll as getAllClients } from '../../api/clients';
import { formatObjectDate } from '../../utils/dateUtils';
import { getPaymentLabel } from '../../utils/dataUtils';

const AdminBills = () => {
    const [bills, setBills] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);
    const [editingBill, setEditingBill] = useState(null);
    const [editForm, setEditForm] = useState({ payment_type: 1, total: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [billsData, clientsData] = await Promise.all([
                getAllBills(),
                getAllClients()
            ]);
            setBills(billsData);
            setClients(clientsData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Ver detalle usando getById
    const handleViewBill = async (billId) => {
        try {
            const billData = await getBillById(billId);
            setSelectedBill(billData);
        } catch (error) {
            console.error('Error al obtener factura:', error);
        }
    };

    // Iniciar edición
    const handleStartEdit = async (billId) => {
        try {
            const billData = await getBillById(billId);
            setEditingBill(billData);
            setEditForm({
                payment_type: billData.payment_type || billData.payment_method || 1,
                total: billData.total || 0,
                client_id: billData.client_id,
                date: billData.date
            });
        } catch (error) {
            console.error('Error al obtener factura:', error);
        }
    };

    // Guardar edición
    const handleSaveEdit = async () => {
        try {
            await updateBill(editingBill.id_key, editForm);
            setEditingBill(null);
            fetchData();
        } catch (error) {
            console.error('Error al actualizar factura:', error);
            alert('Error al actualizar factura');
        }
    };

    // Eliminar factura
    const handleDeleteBill = async (billId) => {
        if (!window.confirm('¿Estás seguro de eliminar esta factura?')) return;
        try {
            await deleteBill(billId);
            fetchData();
        } catch (error) {
            console.error('Error al eliminar factura:', error);
            alert('Error al eliminar factura');
        }
    };

    const getClientName = (clientId) => {
        const client = clients.find(c => c.id_key === clientId);
        return client ? `${client.name || ''} ${client.lastname || ''}`.trim() || 'Cliente desconocido' : 'Cliente desconocido';
    };

    // Obtener tipo de pago del bill (puede ser payment_type o payment_method)
    const getPaymentType = (bill) => {
        return bill.payment_type ?? bill.payment_method;
    };

    const getPaymentMethodIcon = (method) => {
        // Normalizar: puede ser número (1,2,3) o string
        const normalized = typeof method === 'number'
            ? { 1: 'cash', 2: 'card', 3: 'transfer' }[method]
            : String(method || '').toLowerCase();

        switch (normalized) {
            case 'card':
            case 'credit_card':
            case 'tarjeta':
            case '2':
                return CreditCard;
            case 'transfer':
            case 'transferencia':
            case '3':
                return Building2;
            default:
                return CreditCard;
        }
    };

    const filteredBills = bills.filter(bill => {
        const clientName = getClientName(bill.client_id).toLowerCase();
        return clientName.includes(searchTerm.toLowerCase()) ||
            bill.id_key.toString().includes(searchTerm);
    }).sort((a, b) => b.id_key - a.id_key);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-400">Cargando facturas...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Encabezado */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Facturas</h1>
                <p className="text-gray-400">{bills.length} facturas generadas</p>
            </div>

            {/* Búsqueda */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o # de factura..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    />
                </div>
            </div>

            {/* Tabla de facturas */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="text-left p-4 text-gray-400 font-medium"># Factura</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Cliente</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Fecha</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Método de Pago</th>
                            <th className="text-right p-4 text-gray-400 font-medium">Total</th>
                            <th className="text-right p-4 text-gray-400 font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBills.map((bill) => {
                            const PaymentIcon = getPaymentMethodIcon(getPaymentType(bill));

                            return (
                                <tr key={bill.id_key} className="border-t border-gray-700 hover:bg-gray-750">
                                    <td className="p-4">
                                        <span className="text-white font-medium">#{bill.id_key}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-gray-300">{getClientName(bill.client_id)}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-gray-400">
                                            {formatObjectDate(bill)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <PaymentIcon className="w-4 h-4" />
                                            <span className="capitalize">{getPaymentLabel(getPaymentType(bill))}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="text-white font-medium">
                                            ${bill.total?.toLocaleString('es-AR') || '0'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewBill(bill.id_key)}
                                                className="p-2 text-gray-400 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors"
                                                title="Ver detalle"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleStartEdit(bill.id_key)}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBill(bill.id_key)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredBills.length === 0 && (
                    <div className="p-8 text-center">
                        <FileText className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-400">No se encontraron facturas</p>
                    </div>
                )}
            </div>

            {/* Modal de detalle de factura */}
            {selectedBill && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Factura #{selectedBill.id_key}</h3>
                            <button
                                onClick={() => setSelectedBill(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-gray-700">
                                <span className="text-gray-400">Cliente</span>
                                <span className="text-white">{getClientName(selectedBill.client_id)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-700">
                                <span className="text-gray-400">Fecha</span>
                                <span className="text-white">
                                    {formatObjectDate(selectedBill)}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-700">
                                <span className="text-gray-400">Método de Pago</span>
                                <span className="text-white capitalize">{getPaymentLabel(getPaymentType(selectedBill))}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400 text-lg">Total</span>
                                <span className="text-pink-500 text-xl font-bold">
                                    ${selectedBill.total?.toLocaleString('es-AR') || '0'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedBill(null)}
                            className="w-full mt-6 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de edición de factura */}
            {editingBill && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Editar Factura #{editingBill.id_key}</h3>
                            <button
                                onClick={() => setEditingBill(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Método de Pago</label>
                                <select
                                    value={editForm.payment_type}
                                    onChange={(e) => setEditForm({ ...editForm, payment_type: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                >
                                    <option value={1}>Efectivo</option>
                                    <option value={2}>Tarjeta</option>
                                    <option value={3}>Transferencia</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Total</label>
                                <input
                                    type="number"
                                    value={editForm.total}
                                    onChange={(e) => setEditForm({ ...editForm, total: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingBill(null)}
                                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBills;
