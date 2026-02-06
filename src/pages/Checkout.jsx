import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, CreditCard, Truck, MapPin, Package, Ticket, Plus, Minus, ArrowLeft } from 'lucide-react';
import * as billsAPI from '../api/bills';
import * as ordersAPI from '../api/orders';
import * as orderDetailsAPI from '../api/orderDetails';
import { getByClientId as getAddressesByClient } from '../api/addresses';
import { cacheClear } from '../api/utils';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, shipping, total, clearCart, updateQuantity, removeFromCart, itemCount } = useCart();
  const { user } = useAuth();

  // Umbral para envío gratis
  const FREE_SHIPPING_THRESHOLD = 119999;
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Estado de direcciones
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    deliveryMethod: 'pickup',
    paymentMethod: 'cash',
  });

  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar direcciones del usuario
  useEffect(() => {
    const fetchAddresses = async () => {
      if (user?.id) {
        try {
          setLoadingAddresses(true);
          const addresses = await getAddressesByClient(user.id);
          setSavedAddresses(addresses);
          if (addresses.length > 0) {
            setSelectedAddressId(addresses[0].id_key);
          }
        } catch (err) {
          console.error('Error al cargar direcciones:', err);
        } finally {
          setLoadingAddresses(false);
        }
      }
    };
    fetchAddresses();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    // Solo validar dirección si es envío a domicilio
    if (formData.deliveryMethod === 'delivery') {
      if (!selectedAddressId) newErrors.address = 'Seleccioná una dirección de envío';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateBillNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BILL-${timestamp}-${random}`;
  };

  const mapPaymentType = (method) => {
    const types = { cash: 1, card: 2, transfer: 3 };
    return types[method] || 1;
  };

  const mapDeliveryMethod = (method) => {
    return method === 'delivery' ? 2 : 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    setLoading(true);

    try {
      const clientId = user.id;

      // Usamos la dirección seleccionada si es delivery
      const selectedAddress = formData.deliveryMethod === 'delivery'
        ? savedAddresses.find(a => a.id_key === selectedAddressId)
        : null;

      const billData = {
        bill_number: generateBillNumber(),
        discount: 0,
        date: new Date().toISOString().split('T')[0],
        total: total,
        payment_type: mapPaymentType(formData.paymentMethod),
        client_id: clientId,
      };
      const createdBill = await billsAPI.create(billData);

      const orderData = {
        date: new Date().toISOString(),
        total: total,
        delivery_method: mapDeliveryMethod(formData.deliveryMethod),
        status: 1,
        client_id: clientId,
        bill_id: createdBill.id_key,
      };
      const createdOrder = await ordersAPI.create(orderData);

      const orderDetailsPromises = cart.map(async (item) => {
        const orderDetailData = {
          quantity: item.quantity,
          price: item.price,
          order_id: createdOrder.id_key,
          product_id: item.id_key,
        };
        return await orderDetailsAPI.create(orderDetailData);
      });

      await Promise.all(orderDetailsPromises);

      // Limpiar caché de productos para que se vea el stock actualizado por el backend
      cacheClear('product');

      clearCart();
      navigate('/checkout/success', { state: { orderId: createdOrder.id_key } });
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      alert('Error al procesar el pedido. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-pink-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Tu carrito está vacío</h2>
            <Link to="/productos" className="text-pink-600 hover:text-pink-700 font-medium">
              Ver productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Mi carrito</h1>
            <span className="bg-pink-500 text-white text-sm px-3 py-1 rounded-full font-medium">
              {itemCount} {itemCount === 1 ? 'unidad' : 'unidades'}
            </span>
          </div>
          <Link to="/cart" className="text-gray-500 hover:text-pink-600 text-sm font-medium">
            Volver al carrito
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos - Columna izquierda */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id_key} className="bg-white rounded-xl shadow-sm p-6 flex gap-6">
                {/* Imagen */}
                <div className="w-24 h-24 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ShoppingBag className="w-10 h-10 text-pink-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 line-clamp-2">{item.name}</h4>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id_key, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id_key, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id_key)}
                    className="mt-3 text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Eliminar
                  </button>
                </div>

                {/* Precio */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-gray-800">
                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-sm text-gray-500">${item.price.toLocaleString('es-AR')} c/u</p>
                  )}
                </div>
              </div>
            ))}

            {/* Selector de dirección - solo si es delivery */}
            {formData.deliveryMethod === 'delivery' && (
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-pink-500" />
                  Dirección de envío
                </h3>

                {loadingAddresses ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    Cargando direcciones...
                  </div>
                ) : savedAddresses.length === 0 ? (
                  <div className="text-center py-6">
                    <MapPin className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 mb-3">No tenés direcciones guardadas</p>
                    <Link
                      to="/perfil?redirect=checkout"
                      className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
                    >
                      Agregar dirección en mi perfil
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedAddresses.map((address) => (
                      <label
                        key={address.id_key}
                        className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                          selectedAddressId === address.id_key
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-pink-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedAddress"
                          value={address.id_key}
                          checked={selectedAddressId === address.id_key}
                          onChange={() => setSelectedAddressId(address.id_key)}
                          className="text-pink-500 focus:ring-pink-500"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {address.street} {address.number}
                          </p>
                          <p className="text-sm text-gray-500">{address.city}</p>
                        </div>
                      </label>
                    ))}
                    <Link
                      to="/perfil?redirect=checkout"
                      className="inline-flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar otra dirección
                    </Link>
                  </div>
                )}
                {errors.address && <p className="text-red-500 text-sm mt-2">{errors.address}</p>}
              </div>
            )}
          </div>

          {/* Resumen - Columna derecha */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Resumen de mi compra</h2>

                {/* Input cupón */}
                <div className="flex gap-2 mb-6">
                  <div className="flex-1 relative">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ingresá tu cupón acá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                  <button type="button" className="px-4 py-2.5 bg-pink-500 text-white text-sm font-semibold rounded-lg hover:bg-pink-600">
                    Agregar
                  </button>
                </div>

                {/* Método de entrega */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Método de entrega</h4>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.deliveryMethod === 'pickup' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={formData.deliveryMethod === 'pickup'}
                        onChange={handleChange}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Retiro en local</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.deliveryMethod === 'delivery' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="delivery"
                        checked={formData.deliveryMethod === 'delivery'}
                        onChange={handleChange}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <Truck className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Envío a domicilio</span>
                    </label>
                  </div>
                </div>

                {/* Método de pago */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Método de pago</h4>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'cash' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-lg">💵</span>
                      <span className="text-sm">Efectivo</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'card' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Tarjeta de crédito/débito</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'transfer' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={formData.paymentMethod === 'transfer'}
                        onChange={handleChange}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-lg">🏦</span>
                      <span className="text-sm">Transferencia bancaria</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800 font-medium">${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{formData.deliveryMethod === 'pickup' ? 'Retiro en local' : 'Envío'}</span>
                    <span className={formData.deliveryMethod === 'pickup' || shipping === 0 ? 'text-green-600 font-medium' : 'text-gray-800'}>
                      {formData.deliveryMethod === 'pickup' ? 'Gratis' : (shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-AR')}`)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="font-bold text-xl text-gray-800">
                      ${formData.deliveryMethod === 'pickup' ? subtotal.toLocaleString('es-AR') : total.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Mensaje envío gratis */}
                {formData.deliveryMethod === 'pickup' ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg mb-6">
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">¡Tenés retiro gratis!</span>
                  </div>
                ) : shipping === 0 ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg mb-6">
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">¡Tenés envío gratis!</span>
                  </div>
                ) : amountForFreeShipping > 0 && (
                  <div className="p-3 bg-orange-50 rounded-lg mb-6">
                    <p className="text-sm text-orange-800">
                      Sumá <span className="font-bold">${amountForFreeShipping.toLocaleString('es-AR')}</span> para envío gratis
                    </p>
                  </div>
                )}

                {/* Botones */}
                <button
                  type="submit"
                  disabled={loading}
                  className="block w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-center rounded-xl hover:shadow-lg transition-all mb-3 disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Finalizar compra'}
                </button>

                <Link
                  to="/productos"
                  className="block w-full py-3 border-2 border-pink-500 text-pink-600 font-semibold text-center rounded-xl hover:bg-pink-50"
                >
                  Seguir comprando
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Link volver */}
        <Link to="/productos" className="inline-flex items-center gap-2 mt-8 text-gray-600 hover:text-pink-600">
          <ArrowLeft className="w-4 h-4" />
          Volver a productos
        </Link>
      </div>
    </div>
  );
};

export default Checkout;
