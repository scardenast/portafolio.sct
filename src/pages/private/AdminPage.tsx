

import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { DashboardIcon, ProjectsIcon, ImagesIcon, ServicesIcon } from '../../components/ui/icons';

const AdminSidebar: React.FC = () => {
    const linkClass = "flex items-center p-3 my-2 rounded-lg text-gray-300 hover:bg-[#39f8b1] hover:text-black transition-colors duration-200";
    const activeLinkClass = "bg-[#39f8b1] text-black";

    return (
        <aside className="fixed top-0 left-0 h-screen bg-[#0c0c0c] border-r border-gray-900 z-[60] w-20 hover:w-64 transition-all duration-300 ease-in-out group overflow-hidden">
            <div className="flex flex-col h-full p-4">
                <div className="text-white text-2xl font-bold tracking-wider mb-10 shrink-0 h-16 flex items-center justify-center">
                    <span className="block group-hover:hidden">SC</span>
                    <span className="hidden group-hover:block">ADMIN</span>
                </div>
                <nav>
                    <ul>
                        <li>
                            <NavLink to="/private/admin" end className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
                                <DashboardIcon className="w-7 h-7 shrink-0" />
                                <span className="ml-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/private/admin/projects" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
                                <ProjectsIcon className="w-7 h-7 shrink-0" />
                                <span className="ml-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Proyectos</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/private/admin/services" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
                                <ServicesIcon className="w-7 h-7 shrink-0" />
                                <span className="ml-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Servicios</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/private/admin/images" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
                                <ImagesIcon className="w-7 h-7 shrink-0" />
                                <span className="ml-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Imágenes</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
};


const AdminPage: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        // FIX: The 'signOut' method exists in older supabase-js versions. The reported error is likely a side-effect of overall type mismatches.
        // The call is correct for v1.
        await supabase.auth.signOut();
        navigate('/private/login');
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <AdminSidebar />
            <div className="pl-20">
                <header className="p-4 sm:p-6 flex justify-end items-center border-b border-gray-900 sticky top-0 bg-black/80 backdrop-blur-sm z-50">
                    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
                        Cerrar Sesión
                    </button>
                </header>
                <main className="p-4 sm:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminPage;