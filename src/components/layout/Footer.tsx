
import React from 'react';
import { NavHashLink as NavLink } from 'react-router-hash-link';
import { Link } from 'react-router-dom';
import { ArrowUpIcon, LockIcon } from '../ui/icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-900 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
          <div className="text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Sebastián Cárdenas. Todos los derechos reservados.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <NavLink to="/#home" smooth className="group w-12 h-12 rounded-full bg-gray-800 hover:bg-[#39f8b1] flex items-center justify-center transition-colors duration-300" aria-label="Volver al inicio">
              <ArrowUpIcon className="w-6 h-6 text-white group-hover:text-black" />
            </NavLink>
          </div>
        </div>
      </div>
      <Link to="/private/login" aria-label="Admin Login" className="absolute bottom-4 right-4 text-gray-600 hover:text-white transition-colors">
        <LockIcon className="w-6 h-6" />
      </Link>
    </footer>
  );
};

export default Footer;
