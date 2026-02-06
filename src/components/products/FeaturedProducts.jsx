import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { getAll as getAllProducts } from '../../api/products';
import { getAll as getAllReviews } from '../../api/reviews';
import { subscribeToChanges } from '../../api/utils';
import { useCart } from '../../context/CartContext';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsByProduct, setReviewsByProduct] = useState({});
  const [addedToCart, setAddedToCart] = useState(null);
  const scrollRef = useRef(null);
  const { addToCart } = useCart();

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [productsData, reviewsData] = await Promise.all([
        getAllProducts(),
        getAllReviews()
      ]);
      // Ordenar por fecha de creación o ID descendente (últimos ingresos primero)
      const sorted = [...productsData].sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return (b.id_key || b.id || 0) - (a.id_key || a.id || 0);
      });
      setProducts(sorted.slice(0, 10));

      const grouped = {};
      reviewsData.forEach(r => {
        if (!grouped[r.product_id]) grouped[r.product_id] = [];
        grouped[r.product_id].push(r);
      });
      setReviewsByProduct(grouped);
    } catch (err) {
      console.error('Error al obtener productos:', err);
      if (!silent) setError('No se pudieron cargar los productos');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Suscribirse a cambios de productos (recarga silenciosa)
    const unsubscribe = subscribeToChanges('products', () => fetchData(true));

    return () => {
      unsubscribe();
    };
  }, [fetchData]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedToCart(product.id_key);
    setTimeout(() => setAddedToCart(null), 1500);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="skeleton w-64 h-10 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl overflow-hidden">
                <div className="skeleton h-52"></div>
                <div className="p-3">
                  <div className="skeleton h-4 w-3/4 mb-2"></div>
                  <div className="skeleton h-5 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="productos" className="py-16 bg-gradient-to-b from-pink-50 to-white relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Nuevos ingresos <Sparkles className="inline w-7 h-7 text-pink-400" />
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative group/carousel">
          {/* Flecha izquierda */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Flecha derecha */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Products scroll */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <Link
                key={product.id_key}
                to={`/product/${product.id_key}`}
                className="flex-shrink-0 w-[calc(50%-10px)] md:w-[calc(25%-15px)] group"
              >
                <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Imagen */}
                  <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-500 group-hover:scale-105"
                      />
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
                  <div className="p-3 text-center">
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
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock === 0}
                      className={`w-full py-2.5 rounded-full font-medium text-xs transition-all duration-300 flex items-center justify-center gap-2 ${product.stock === 0
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
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 px-8 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            Ver todos los productos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {products.length === 0 && !loading && !error && (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No hay productos disponibles</h3>
            <p className="text-gray-600">Pronto agregaremos más productos</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
