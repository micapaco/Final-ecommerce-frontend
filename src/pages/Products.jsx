import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Filter, X, Sparkles, Search } from 'lucide-react';
import { getAll as getAllProducts } from '../api/products';
import { getAll as getAllCategories } from '../api/categories';
import { getAll as getAllReviews } from '../api/reviews';
import { subscribeToChanges } from '../api/utils';
import { useCart } from '../context/CartContext';

// Esqueleto de carga para productos
const ProductSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="skeleton skeleton-image h-64"></div>
        <div className="p-6">
            <div className="skeleton skeleton-title"></div>
            <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton w-4 h-4 rounded"></div>
                ))}
            </div>
            <div className="skeleton w-1/3 h-8 mb-4"></div>
            <div className="skeleton skeleton-button"></div>
        </div>
    </div>
);

// Esqueleto de carga para categorías del sidebar
const CategorySkeleton = () => (
    <div className="flex items-center gap-3 p-3">
        <div className="skeleton w-8 h-8 rounded-lg"></div>
        <div className="skeleton w-24 h-4"></div>
    </div>
);

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [showFilters, setShowFilters] = useState(false);
    const [addedToCart, setAddedToCart] = useState(null);
    const [reviewsByProduct, setReviewsByProduct] = useState({});
    const { addToCart } = useCart();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData, reviewsData] = await Promise.all([
                getAllProducts(),
                getAllCategories(),
                getAllReviews()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);

            // Agrupar reseñas por producto
            const grouped = {};
            reviewsData.forEach(r => {
                if (!grouped[r.product_id]) grouped[r.product_id] = [];
                grouped[r.product_id].push(r);
            });
            setReviewsByProduct(grouped);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Suscribirse a cambios de productos (ej: después de una compra)
        const unsubscribe = subscribeToChanges('products', fetchData);

        return () => {
            unsubscribe();
        };
    }, [fetchData]);

    // Filtrar y ordenar productos
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Filtrar por categoría
        if (selectedCategory) {
            result = result.filter(p => p.category_id === selectedCategory.id_key);
        }

        // Filtrar por búsqueda
        if (searchTerm) {
            result = result.filter(p =>
                p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Ordenar
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => (a.precio || a.price || 0) - (b.precio || b.price || 0));
                break;
            case 'price-desc':
                result.sort((a, b) => (b.precio || b.price || 0) - (a.precio || a.price || 0));
                break;
            case 'name':
                result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            default:
                break;
        }

        return result;
    }, [products, selectedCategory, searchTerm, sortBy]);

    const handleAddToCart = (product) => {
        addToCart(product);
        setAddedToCart(product.id_key);
        setTimeout(() => setAddedToCart(null), 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-20 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Título y contador */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {selectedCategory ? selectedCategory.name : 'Todos los Productos'}
                            </h1>
                            <p className="text-gray-500 text-sm">
                                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Controles */}
                        <div className="flex items-center gap-3">
                            {/* Búsqueda */}
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                                />
                            </div>

                            {/* Ordenar */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-white"
                            >
                                <option value="default">Ordenar por</option>
                                <option value="name">Nombre A-Z</option>
                                <option value="price-asc">Menor precio</option>
                                <option value="price-desc">Mayor precio</option>
                            </select>

                            {/* Toggle filtros móvil */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="md:hidden p-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Sidebar de filtros */}
                    <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-40">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-gray-800">Categorías</h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="md:hidden p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {loading ? (
                                <div className="space-y-2">
                                    {[...Array(6)].map((_, i) => (
                                        <CategorySkeleton key={i} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-0.5">
                                    {/* Ver todos */}
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-sm ${!selectedCategory
                                            ? 'bg-pink-50 text-pink-600 font-semibold border-l-[3px] border-pink-500'
                                            : 'hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <span>Ver todos</span>
                                        <span className={`text-xs ${!selectedCategory ? 'text-pink-400' : 'text-gray-400'}`}>{products.length}</span>
                                    </button>

                                    {categories.map((category) => {
                                        const count = products.filter(p => p.category_id === category.id_key).length;
                                        const isSelected = selectedCategory?.id_key === category.id_key;

                                        return (
                                            <button
                                                key={category.id_key}
                                                onClick={() => setSelectedCategory(isSelected ? null : category)}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-sm ${isSelected
                                                    ? 'bg-pink-50 text-pink-600 font-semibold border-l-[3px] border-pink-500'
                                                    : 'hover:bg-gray-50 text-gray-600'
                                                    }`}
                                            >
                                                <span className="truncate">{category.name}</span>
                                                <span className={`text-xs ${isSelected ? 'text-pink-400' : 'text-gray-400'}`}>{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Limpiar filtros */}
                            {(selectedCategory || searchTerm) && (
                                <button
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setSearchTerm('');
                                        setSortBy('default');
                                    }}
                                    className="w-full mt-6 py-2 text-sm text-pink-600 hover:text-pink-700 font-medium"
                                >
                                    Limpiar todos los filtros
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* Grid de productos */}
                    <main className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(9)].map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-pink-100 flex items-center justify-center">
                                    <ShoppingBag className="w-12 h-12 text-pink-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay productos</h3>
                                <p className="text-gray-600 mb-6">
                                    {searchTerm
                                        ? `No encontramos productos con "${searchTerm}"`
                                        : 'No hay productos en esta categoría'}
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setSearchTerm('');
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl btn-premium"
                                >
                                    Ver todos los productos
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {filteredProducts.map((product) => (
                                    <Link
                                        key={product.id_key}
                                        to={`/product/${product.id_key}`}
                                        className="group"
                                    >
                                        <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                                            {/* Imagen */}
                                            <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-500 group-hover:scale-105" />
                                                ) : (
                                                    <ShoppingBag className="w-10 h-10 text-gray-200" />
                                                )}

                                                {product.stock < 10 && product.stock > 0 && (
                                                    <span className="absolute top-2 right-2 bg-pink-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                                        ¡Últimas!
                                                    </span>
                                                )}
                                                {product.stock === 0 && (
                                                    <span className="absolute top-2 right-2 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                                        Agotado
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="p-3 text-center flex flex-col flex-1">
                                                <h3 className="text-xs font-semibold text-gray-700 uppercase line-clamp-2 mb-2 min-h-[2rem] group-hover:text-pink-600 transition-colors">
                                                    {product.name}
                                                </h3>

                                                {/* Estrellas */}
                                                {(() => {
                                                    const pReviews = reviewsByProduct[product.id_key] || [];
                                                    const avg = pReviews.length > 0 ? pReviews.reduce((s, r) => s + r.rating, 0) / pReviews.length : 0;
                                                    return (
                                                        <div className="flex items-center justify-center gap-0.5 mb-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-3 h-3 ${i < Math.round(avg) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                            ))}
                                                            {pReviews.length > 0 && (
                                                                <span className="text-[10px] text-gray-500 ml-1">({avg.toFixed(1)})</span>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                <p className="text-lg font-bold text-gray-900 mb-2">
                                                    ${(product.precio || product.price || 0).toLocaleString('es-AR')}
                                                </p>

                                                {/* Botón agregar */}
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product); }}
                                                    disabled={product.stock === 0}
                                                    className={`w-full py-2.5 rounded-full font-medium text-xs transition-all duration-300 flex items-center justify-center gap-2 mt-auto ${product.stock === 0
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : addedToCart === product.id_key
                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                            : 'bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20 hover:-translate-y-0.5 active:translate-y-0'
                                                        }`}
                                                >
                                                    {addedToCart === product.id_key ? (
                                                        <><Sparkles className="w-3.5 h-3.5" /> ¡Agregado!</>
                                                    ) : (
                                                        <><ShoppingBag className="w-3.5 h-3.5" /> Agregar</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Products;
