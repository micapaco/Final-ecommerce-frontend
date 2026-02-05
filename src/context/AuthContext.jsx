import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';

// Contexto de autenticación
const AuthContext = createContext(null);

// Provider de autenticación
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cargar usuario desde localStorage al iniciar
    useEffect(() => {
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('auth_user');
            }
        }
        setLoading(false);
    }, []);

    // Login - usa API con email y password
    const login = async (email, password) => {
        try {
            const response = await apiLogin(email, password);

            const userData = {
                id: response.id_key ?? response.id, // Soporta ambos formatos del backend
                name: response.name,
                lastname: response.lastname,
                email: response.email,
                telephone: response.telephone,
                isAdmin: response.is_admin
            };

            setUser(userData);
            localStorage.setItem('auth_user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error('Error en login:', error);
            if (error.response?.status === 401) {
                throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
            }
            throw new Error('Error al iniciar sesión. Intenta nuevamente.');
        }
    };

    // Registro - crear nuevo usuario con password
    const register = async (userData) => {
        try {
            const response = await apiRegister({
                name: userData.name,
                lastname: userData.lastname,
                email: userData.email,
                password: userData.password,
                telephone: userData.telephone || null
            });

            const authUser = {
                id: response.id_key ?? response.id, // Soporta ambos formatos del backend
                name: response.name,
                lastname: response.lastname,
                email: response.email,
                isAdmin: response.is_admin
            };

            setUser(authUser);
            localStorage.setItem('auth_user', JSON.stringify(authUser));
            return authUser;
        } catch (error) {
            console.error('Error en registro:', error);
            if (error.response?.status === 400) {
                throw new Error('Este email ya está registrado. Intenta iniciar sesión.');
            }
            throw new Error('Error al registrar. Intenta nuevamente.');
        }
    };

    // Logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('cart'); // Vaciar carrito al cerrar sesión
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;

