import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Contenido principal */}
            <main className="flex-1 p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
