import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiLogOut, FiSettings, FiX } from 'react-icons/fi'
import { IoSparkles } from 'react-icons/io5'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { getAll as getAllProducts } from '../../api/products'
import FloatingCart from './FloatingCart'

function Navbar() {
  const { itemCount } = useCart()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const searchInputRef = useRef(null)

  // Cargar productos para búsqueda
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getAllProducts()
        setAllProducts(products)
      } catch (error) {
        console.error('Error al cargar productos para búsqueda:', error)
      }
    }
    loadProducts()
  }, [])

  // Focus en input cuando se abre búsqueda
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  // Filtrar productos según búsqueda
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allProducts.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5) // Máximo 5 resultados
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, allProducts])

  // Manejar selección de resultado
  const handleSelectProduct = (productId) => {
    setShowSearch(false)
    setSearchQuery('')
    navigate(`/product/${productId}`)
  }

  // Manejar búsqueda completa
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSearch(false)
      navigate(`/productos?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  // Función para hacer scroll a una sección
  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      // Si no estamos en home, navegar primero y luego hacer scroll
      navigate('/')
      // Esperar a que la navegación termine y luego hacer scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } else {
      // Si ya estamos en home, solo hacer scroll
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  // Manejar logout
  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    navigate('/')
  }

  return (
    <nav
      className="shadow-lg sticky top-0 z-50"
      style={{ backgroundColor: '#5C2E3E' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            {/* Ícono de brillo plateado */}
            <IoSparkles
              className="text-4xl"
              style={{
                color: '#C0C0C0',
                filter: 'drop-shadow(0 0 8px rgba(192, 192, 192, 0.8)) brightness(1.3)',
              }}
            />

            {/* Título con efecto plateado brillante */}
            <h1
              className="text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #B8B8B8 0%, #FFFFFF 50%, #B8B8B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 6px rgba(192, 192, 192, 0.4))',
              }}
            >
              The Essentials
            </h1>
          </Link>

          {/* Menú Desktop - centrado con más espaciado */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-12">
            <Link
              to="/"
              className="nav-link text-white font-medium transition-all duration-300 hover:scale-105"
              style={{
                textShadow: '0 0 0 transparent',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #B8B8B8 0%, #FFFFFF 50%, #B8B8B8 100%)';
                e.target.style.WebkitBackgroundClip = 'text';
                e.target.style.WebkitTextFillColor = 'transparent';
                e.target.style.filter = 'drop-shadow(0 0 8px rgba(192, 192, 192, 0.6))';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.WebkitBackgroundClip = 'unset';
                e.target.style.WebkitTextFillColor = 'white';
                e.target.style.filter = 'none';
              }}
            >
              Inicio
            </Link>
            <Link
              to="/productos"
              className="nav-link text-white font-medium transition-all duration-300 hover:scale-105"
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #B8B8B8 0%, #FFFFFF 50%, #B8B8B8 100%)';
                e.target.style.WebkitBackgroundClip = 'text';
                e.target.style.WebkitTextFillColor = 'transparent';
                e.target.style.filter = 'drop-shadow(0 0 8px rgba(192, 192, 192, 0.6))';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.WebkitBackgroundClip = 'unset';
                e.target.style.WebkitTextFillColor = 'white';
                e.target.style.filter = 'none';
              }}
            >
              Productos
            </Link>
            <Link
              to="/nosotros"
              className="nav-link text-white font-medium transition-all duration-300 hover:scale-105"
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #B8B8B8 0%, #FFFFFF 50%, #B8B8B8 100%)';
                e.target.style.WebkitBackgroundClip = 'text';
                e.target.style.WebkitTextFillColor = 'transparent';
                e.target.style.filter = 'drop-shadow(0 0 8px rgba(192, 192, 192, 0.6))';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.WebkitBackgroundClip = 'unset';
                e.target.style.WebkitTextFillColor = 'white';
                e.target.style.filter = 'none';
              }}
            >
              Nosotros
            </Link>
          </div>


          {/* Iconos de acciones */}
          <div className="flex items-center space-x-4">
            {/* Búsqueda expandible */}
            <div className="relative">
              {showSearch ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar productos..."
                      className="w-48 md:w-64 px-4 py-2 pr-10 rounded-full bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowSearch(false)
                        setSearchQuery('')
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
                    >
                      <FiX className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Dropdown de resultados */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                      {searchResults.map((product) => (
                        <button
                          key={product.id_key}
                          type="button"
                          onClick={() => handleSelectProduct(product.id_key)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-pink-50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <FiSearch className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{product.name}</p>
                            <p className="text-xs text-pink-600 font-bold">
                              ${product.price?.toLocaleString('es-AR')}
                            </p>
                          </div>
                        </button>
                      ))}
                      <button
                        type="submit"
                        className="w-full px-4 py-2 text-sm text-pink-600 font-medium hover:bg-pink-50 border-t"
                      >
                        Ver todos los resultados →
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <FiSearch className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            {/* Usuario - menú desplegable */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2"
              >
                <FiUser className="w-5 h-5 text-white" />
                {isAuthenticated && (
                  <span className="hidden md:block text-white text-sm font-medium">
                    {user?.name}
                  </span>
                )}
              </button>

              {/* Menú desplegable */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">{user?.name} {user?.lastname}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                        >
                          <FiSettings className="w-4 h-4" />
                          Panel Admin
                        </Link>
                      )}

                      <Link
                        to="/perfil"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                      >
                        <FiUser className="w-4 h-4" />
                        Mi Perfil
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Carrito */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <FiShoppingCart className="w-5 h-5 text-white" />
              {/* Badge de cantidad */}
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-dark text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Menú móvil */}
            <button className="md:hidden p-2">
              <FiMenu className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay para cerrar menú al hacer click fuera */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}

      {/* Carrito flotante */}
      <FloatingCart isOpen={showCart} onClose={() => setShowCart(false)} />
    </nav>
  )
}

export default Navbar
