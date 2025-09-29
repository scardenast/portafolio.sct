

import React from 'react';
import { useAuth } from '../../context/AuthProvider';
import { Link } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
    const { user } = useAuth();

    return (
        <div>
            <h1 className="text-4xl font-bold mb-4">¡Bienvenido al Panel de Administración!</h1>
            <p className="text-lg text-gray-300 mb-8">
                Hola, <span className="font-bold text-white">{user?.email}</span>! Desde aquí puedes gestionar el contenido de tu portafolio.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="projects" className="bg-[#0c0c0c] border border-gray-800 p-6 rounded-lg hover:border-[#39f8b1] transition-colors duration-300 transform hover:-translate-y-1">
                    <h2 className="text-2xl font-bold text-white mb-2">Gestionar Proyectos</h2>
                    <p className="text-gray-400">Añade, edita o elimina los proyectos de tu portafolio.</p>
                </Link>
                <Link to="services" className="bg-[#0c0c0c] border border-gray-800 p-6 rounded-lg hover:border-[#39f8b1] transition-colors duration-300 transform hover:-translate-y-1">
                    <h2 className="text-2xl font-bold text-white mb-2">Gestionar Servicios</h2>
                    <p className="text-gray-400">Crea, edita y elimina los servicios que ofreces.</p>
                </Link>
                <Link to="images" className="bg-[#0c0c0c] border border-gray-800 p-6 rounded-lg hover:border-[#39f8b1] transition-colors duration-300 transform hover:-translate-y-1">
                    <h2 className="text-2xl font-bold text-white mb-2">Gestionar Imágenes</h2>
                    <p className="text-gray-400">Actualiza las imágenes principales del sitio.</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboardPage;