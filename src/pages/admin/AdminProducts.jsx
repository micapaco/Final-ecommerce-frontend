import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react';
import { getAll as getAllProducts, deleteProduct } from '../../api/products';
import { getAll as getAllCategories } from '../../api/categories';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                getAllProducts(),
                getAllCategories()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryName = (categoryId) => {
        const cat = categories.find(c => c.id_key === categoryId);
        return cat ? cat.name : 'Sin categoría';
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id_key !== id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar el producto');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-400">Cargando productos...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Encabezado */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Productos</h1>
                    <p className="text-gray-400">{products.length} productos en total</p>
                </div>
                <Link
                    to="/admin/productos/nuevo"
                    className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Producto
                </Link>
            </div>

            {/* Búsqueda */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    />
                </div>
            </div>

            {/* Tabla de productos */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="text-left p-4 text-gray-400 font-medium">Producto</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Categoría</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Precio</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Stock</th>
                            <th className="text-right p-4 text-gray-400 font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id_key} className="border-t border-gray-700 hover:bg-gray-750">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                            <Package className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{product.name}</p>
                                            <p className="text-gray-400 text-sm truncate max-w-[200px]">
                                                {product.description || 'Sin descripción'}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm">
                                        {getCategoryName(product.category_id)}
                                    </span>
                                </td>
                                <td className="p-4 text-white font-medium">
                                    ${(product.precio || product.price || 0)?.toLocaleString('es-AR')}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-lg text-sm font-medium ${product.stock === 0 ? 'bg-red-500/20 text-red-400' :
                                        product.stock < 10 ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-green-500/20 text-green-400'
                                        }`}>
                                        {product.stock} unidades
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            to={`/admin/productos/${product.id_key}`}
                                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => setDeleteConfirm(product.id_key)}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredProducts.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        No se encontraron productos
                    </div>
                )}
            </div>

            {/* Modal de confirmación de eliminación */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 border border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-2">¿Eliminar producto?</h3>
                        <p className="text-gray-400 mb-4">Esta acción no se puede deshacer.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
