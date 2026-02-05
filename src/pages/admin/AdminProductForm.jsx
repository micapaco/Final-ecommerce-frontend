import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { getById, create, update } from '../../api/products';
import { getAll as getAllCategories } from '../../api/categories';

const AdminProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        precio: '',
        stock: '',
        category_id: '',
        image_url: ''
    });

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await getById(id);
            console.log('Producto cargado:', data);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                precio: data.price || data.precio || '',
                stock: data.stock || '',
                category_id: data.category_id || '',
                image_url: data.image_url || ''
            });
        } catch (error) {
            console.error('Error al cargar producto:', error);
            alert('Error al cargar el producto');
            navigate('/admin/productos');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.name || !formData.precio || !formData.stock) {
            alert('Por favor completa los campos requeridos');
            return;
        }

        try {
            setSaving(true);

            const productData = {
                name: formData.name,
                description: formData.description || '',
                price: parseFloat(formData.precio),
                stock: parseInt(formData.stock),
                category_id: formData.category_id ? parseInt(formData.category_id) : null,
                image_url: formData.image_url || null
            };

            console.log('Enviando producto:', productData);

            if (isEditing) {
                await update(id, productData);
            } else {
                await create(productData);
            }

            navigate('/admin/productos');
        } catch (error) {
            console.error('Error al guardar:', error);
            const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Error al guardar el producto';
            alert(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-400">Cargando producto...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Encabezado */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/productos')}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                    </h1>
                    <p className="text-gray-400">
                        {isEditing ? 'Modifica los datos del producto' : 'Completa los datos del nuevo producto'}
                    </p>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
                    {/* Nombre */}
                    <div>
                        <label className="block text-gray-300 font-medium mb-2">
                            Nombre del producto *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej: Crema Hidratante Facial"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                            required
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-gray-300 font-medium mb-2">
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe el producto..."
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none"
                        />
                    </div>

                    {/* Precio y Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 font-medium mb-2">
                                Precio *
                            </label>
                            <input
                                type="number"
                                name="precio"
                                value={formData.precio}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 font-medium mb-2">
                                Stock *
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-gray-300 font-medium mb-2">
                            Categoría
                        </label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                        >
                            <option value="">Sin categoría</option>
                            {categories.map(cat => (
                                <option key={cat.id_key} value={cat.id_key}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* URL de imagen */}
                    <div>
                        <label className="block text-gray-300 font-medium mb-2">
                            URL de imagen
                        </label>
                        <input
                            type="url"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                        />
                        <p className="text-gray-500 text-sm mt-1">
                            URL de la imagen del producto (opcional)
                        </p>

                        {/* Preview de imagen */}
                        {formData.image_url && (
                            <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
                                <p className="text-gray-400 text-sm mb-2">Vista previa:</p>
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="max-h-40 rounded-lg object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                    onLoad={(e) => {
                                        e.target.style.display = 'block';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/productos')}
                        className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductForm;
