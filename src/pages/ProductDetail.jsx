import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Star, ArrowLeft, Minus, Plus, Package, Truck, Shield, Check, Send, Edit2, Trash2, X } from 'lucide-react';
import { getById } from '../api/products';
import { getByProductId as getReviews, getById as getReviewById, create as createReview, update as updateReview, deleteReview } from '../api/reviews';
import { getById as getCategoryById } from '../api/categories';
import { getAll as getAllClients } from '../api/clients';
import { subscribeToChanges } from '../api/utils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [categoryName, setCategoryName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Estado de reseñas
  const [reviews, setReviews] = useState([]);
  const [clients, setClients] = useState({});
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Verificar si el producto ya está en el carrito
  const cartItem = cart.find(item => item.id_key === parseInt(id));
  const currentCartQuantity = cartItem ? cartItem.quantity : 0;

  const fetchProduct = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const data = await getById(id);
      setProduct(data);

      // Obtener el nombre de la categoría si existe
      if (data.category_id) {
        try {
          const category = await getCategoryById(data.category_id);
          setCategoryName(category.name);
        } catch (catErr) {
          console.error('Error al obtener la categoría:', catErr);
          // Si falla, no mostramos nada de categoría
          setCategoryName(null);
        }
      }
      // Obtener reseñas y clientes
      try {
        const [reviewsData, clientsData] = await Promise.all([
          getReviews(id),
          getAllClients()
        ]);
        setReviews(reviewsData);
        // Crear un mapa de clientes por ID para acceso rápido
        const clientsMap = {};
        clientsData.forEach(client => {
          clientsMap[client.id_key] = client;
        });
        setClients(clientsMap);
      } catch (revErr) {
        console.error('Error al obtener reseñas:', revErr);
      }
    } catch (err) {
      console.error('Error al obtener el producto:', err);
      if (!silent) {
        if (err.response?.status === 404) {
          setError('Producto no encontrado');
        } else {
          setError('Error al cargar el producto');
        }
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();

    // Suscribirse a cambios de productos (recarga silenciosa)
    const unsubscribe = subscribeToChanges('products', () => fetchProduct(true));

    return () => {
      unsubscribe();
    };
  }, [fetchProduct]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newRating === 0) {
      setReviewError('Seleccioná una calificación');
      return;
    }
    if (newComment.trim().length > 0 && newComment.trim().length < 10) {
      setReviewError('El comentario debe tener al menos 10 caracteres');
      return;
    }
    try {
      setSubmittingReview(true);
      setReviewError(null);
      const reviewData = {
        product_id: parseInt(id),
        client_id: user?.id,
        rating: newRating,
        ...(newComment.trim() && { comment: newComment.trim() })
      };

      if (editingReview) {
        // Actualizar reseña existente
        await updateReview(editingReview, reviewData);
        setEditingReview(null);
      } else {
        // Crear nueva reseña
        await createReview(reviewData);
      }

      const updatedReviews = await getReviews(id);
      setReviews(updatedReviews);
      setNewRating(0);
      setNewComment('');
    } catch (err) {
      console.error('Error al enviar reseña:', err);
      setReviewError('Error al enviar la reseña');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Iniciar edición de reseña - usa getById para obtener la versión más reciente
  const handleStartEditReview = async (review) => {
    try {
      // Obtener la reseña actualizada desde el servidor usando getById
      const freshReview = await getReviewById(review.id_key);
      setEditingReview(freshReview.id_key);
      setNewRating(freshReview.rating);
      setNewComment(freshReview.comment || '');
      setReviewError(null);
      // Scroll al formulario
      window.scrollTo({ top: document.querySelector('form')?.offsetTop - 100, behavior: 'smooth' });
    } catch (err) {
      console.error('Error al obtener reseña:', err);
      // Fallback a datos locales si falla
      setEditingReview(review.id_key);
      setNewRating(review.rating);
      setNewComment(review.comment || '');
      setReviewError(null);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingReview(null);
    setNewRating(0);
    setNewComment('');
    setReviewError(null);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      const updatedReviews = await getReviews(id);
      setReviews(updatedReviews);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error al eliminar reseña:', err);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    const maxAvailable = product.stock - currentCartQuantity;

    if (newQuantity >= 1 && newQuantity <= maxAvailable) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      // Agregar producto con la cantidad seleccionada
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setAddedToCart(true);
      setQuantity(1);

      // Resetear el mensaje de "agregado" después de 3 segundos
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Cargando producto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{error}</h2>
            <p className="text-gray-600 mb-8">
              El producto que buscas no está disponible
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const maxAvailable = product.stock - currentCartQuantity;
  const isOutOfStock = product.stock === 0;
  const noMoreAvailable = maxAvailable <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8">
      <div className="container mx-auto px-4">
        {/* Migas de pan */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link to="/" className="text-pink-600 hover:text-pink-700 transition-colors">
                Inicio
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600 truncate max-w-[200px]">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Imagen del producto */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl flex items-center justify-center overflow-hidden shadow-xl">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-32 h-32 text-pink-300" />
                )}

                {/* Etiquetas */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.stock < 10 && product.stock > 0 && (
                    <span className="bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                      ¡Últimas {product.stock} unidades!
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                      Agotado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Información del producto */}
            <div className="flex flex-col">
              {/* Etiqueta de categoría */}
              {categoryName && (
                <span className="inline-flex w-fit px-4 py-1 bg-pink-100 text-pink-700 text-sm font-medium rounded-full mb-4">
                  {categoryName}
                </span>
              )}

              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>

              {/* Calificación */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                {reviews.length > 0 ? (
                  <>
                    <span className="text-gray-600 font-medium">({averageRating.toFixed(1)})</span>
                    <span className="text-sm text-gray-500">• {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Sin reseñas aún</span>
                )}
              </div>

              {/* Precio */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-5xl font-bold text-pink-600">
                  ${(product.precio || product.price || 0)?.toLocaleString('es-AR')}
                </span>
              </div>

              {/* Descripción */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'Este producto de skincare está formulado con ingredientes de alta calidad para brindarte los mejores resultados en el cuidado de tu piel.'}
                </p>
              </div>

              {/* Info de stock */}
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-5 h-5 text-gray-500" />
                {isOutOfStock ? (
                  <span className="text-red-600 font-semibold">Sin stock disponible</span>
                ) : (
                  <span className="text-gray-600">
                    <span className="font-semibold text-green-600">{product.stock}</span> unidades disponibles
                    {currentCartQuantity > 0 && (
                      <span className="text-pink-600"> ({currentCartQuantity} en tu carrito)</span>
                    )}
                  </span>
                )}
              </div>

              {/* Selector de cantidad y agregar al carrito */}
              {!isOutOfStock && !noMoreAvailable && (
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  {/* Cantidad */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-2">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className={`p-3 rounded-lg transition-all ${quantity <= 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-pink-600 hover:bg-pink-100 active:scale-95'
                        }`}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-gray-800 min-w-[3rem] text-center text-xl">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= maxAvailable}
                      className={`p-3 rounded-lg transition-all ${quantity >= maxAvailable
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-pink-600 hover:bg-pink-100 active:scale-95'
                        }`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Botón agregar al carrito */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                    className={`flex-1 py-4 px-8 rounded-xl font-bold text-lg transition-all shadow-lg ${addedToCart
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 hover:shadow-xl active:scale-95'
                      }`}
                  >
                    {addedToCart ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        ¡Agregado al carrito!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Agregar al carrito
                      </span>
                    )}
                  </button>
                </div>
              )}

              {noMoreAvailable && !isOutOfStock && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
                  <p className="text-orange-800 font-medium">
                    Ya tienes todas las unidades disponibles en tu carrito ({currentCartQuantity})
                  </p>
                  <Link
                    to="/cart"
                    className="text-orange-600 hover:text-orange-700 font-semibold underline mt-2 inline-block"
                  >
                    Ver carrito →
                  </Link>
                </div>
              )}

              {isOutOfStock && (
                <button
                  disabled
                  className="w-full py-4 px-8 rounded-xl font-bold text-lg bg-gray-300 text-gray-500 cursor-not-allowed mb-8"
                >
                  Sin stock
                </button>
              )}

              {/* Características */}
              <div className="grid sm:grid-cols-2 gap-4 border-t border-gray-200 pt-8">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                  <div className="p-3 bg-pink-100 rounded-full">
                    <Truck className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Envío gratis</p>
                    <p className="text-sm text-gray-500">En compras +$119.999</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                  <div className="p-3 bg-pink-100 rounded-full">
                    <Shield className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Garantía</p>
                    <p className="text-sm text-gray-500">30 días de devolución</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de reseñas */}
          <div className="mt-16 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              Reseñas {reviews.length > 0 && `(${reviews.length})`}
            </h2>

            {/* Formulario de reseña */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingReview ? 'Editar reseña' : 'Dejá tu reseña'}
                </h3>
                {editingReview && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmitReview}>
                {/* Estrellas clickeables */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewRating(i + 1)}
                      onMouseEnter={() => setHoverRating(i + 1)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${i < (hoverRating || newRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    </button>
                  ))}
                  {newRating > 0 && (
                    <span className="ml-2 text-sm text-gray-500">{newRating}/5</span>
                  )}
                </div>

                {/* Comentario */}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Contanos tu experiencia con este producto (opcional, mín. 10 caracteres)"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 resize-none mb-4"
                />

                {reviewError && (
                  <p className="text-red-500 text-sm mb-3">{reviewError}</p>
                )}

                <button
                  type="submit"
                  disabled={submittingReview || newRating === 0}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${submittingReview || newRating === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-md'
                    }`}
                >
                  <Send className="w-4 h-4" />
                  {submittingReview ? 'Enviando...' : editingReview ? 'Actualizar reseña' : 'Enviar reseña'}
                </button>
              </form>
            </div>

            {/* Lista de reseñas */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const client = clients[review.client_id];
                  const userName = client ? `${client.name} ${client.lastname || ''}`.trim() : 'Usuario';
                  const isOwner = user?.id === review.client_id;
                  return (
                    <div key={review.id_key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                      {/* Header con nombre de usuario y estrellas */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{userName}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="ml-1 text-xs text-gray-500">{review.rating}/5</span>
                            </div>
                          </div>
                        </div>
                        {/* Botones editar/eliminar - solo para el dueño de la reseña */}
                        {isOwner && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEditReview(review)}
                              className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                              title="Editar reseña"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(review.id_key)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar reseña"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      )}

                      {/* Modal de confirmación de eliminación */}
                      {deleteConfirm === review.id_key && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 font-medium mb-3">¿Eliminar esta reseña?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id_key)}
                              className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Sé el primero en dejar una reseña</p>
            )}
          </div>

          {/* Botón volver */}
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
