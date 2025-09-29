
import React, { useState, useEffect } from 'react';
import { NavHashLink as NavLink } from 'react-router-hash-link';
import { useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../../constants';
import { MenuIcon, XIcon, LinkedinIcon, GitHubIcon } from '../ui/icons';

const AnimatedLinkContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="relative inline-block overflow-hidden">
        <span className="inline-block transition-transform duration-[370ms] ease-out group-hover:-translate-y-full">
            {children}
        </span>
        <span className="absolute left-0 inline-block transition-transform duration-[370ms] ease-out translate-y-full group-hover:translate-y-0">
            {children}
        </span>
    </span>
);

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isProjectPage = location.pathname.startsWith('/work/');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const scrollWithOffset = (el: HTMLElement) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -80; 
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' }); 
  }

  const isHeaderVisible = isScrolled || isProjectPage;
  const headerVisibilityClasses = isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full';
  const headerBackgroundClasses = isHeaderVisible && !isMenuOpen ? 'bg-black/90 backdrop-blur-sm' : '';

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${headerVisibilityClasses} ${headerBackgroundClasses}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <NavLink to="/#home" smooth scroll={scrollWithOffset} className="group text-2xl font-bold tracking-wider text-white hover:text-[#39f8b1] transition-colors duration-300">
                <AnimatedLinkContent>SC</AnimatedLinkContent>
              </NavLink>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.id}
                  to={link.path}
                  smooth
                  scroll={scrollWithOffset}
                  className={({ isActive }) =>
                    `group text-sm font-bold uppercase tracking-widest transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`
                  }
                >
                  <AnimatedLinkContent>{link.title}</AnimatedLinkContent>
                </NavLink>
              ))}
            </nav>
            <div className="hidden md:block">
              <a href="mailto:sebastian.cardenas.t@gmail.com" className="group bg-[#39f8b1] text-black text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-md hover:bg-white transition-colors duration-300">
                <AnimatedLinkContent>Trabajemos Juntos</AnimatedLinkContent>
              </a>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white relative z-50">
                {isMenuOpen ? <XIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-[#0c0c0c] transition-transform duration-500 ease-in-out z-40 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="h-full flex flex-col justify-center items-center text-center p-8">
            <nav className="flex flex-col items-center space-y-6 my-auto">
                {NAV_LINKS.map((link, index) => (
                    <div className="overflow-hidden" key={link.id}>
                        <NavLink
                            to={link.path}
                            smooth
                            scroll={scrollWithOffset}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block text-3xl font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all duration-500 ease-out transform ${
                                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                            }`}
                            style={{ transitionDelay: `${isMenuOpen ? 200 + index * 75 : 0}ms` }}
                        >
                            {link.title}
                        </NavLink>
                    </div>
                ))}
            </nav>

            <div
                className={`absolute bottom-8 left-0 right-0 px-8 transition-opacity duration-500 ease-out ${
                    isMenuOpen ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ transitionDelay: `${isMenuOpen ? 500 : 0}ms` }}
            >
                <a
                    href="mailto:sebastian.cardenas.t@gmail.com"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full bg-[#39f8b1] text-black text-sm font-bold uppercase tracking-wider py-4 px-6 rounded-md hover:bg-white transition-colors duration-300 mb-8"
                >
                    Trabajemos Juntos
                </a>
                <div className="flex justify-center space-x-6">
                    <a href="https://github.com/scardenast" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><GitHubIcon className="w-6 h-6" /></a>
                    <a href="https://www.linkedin.com/in/scardenast/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><LinkedinIcon className="w-6 h-6" /></a>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default Header;
