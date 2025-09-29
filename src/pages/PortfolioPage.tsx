

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavHashLink as NavLink } from 'react-router-hash-link';
import { Link } from 'react-router-dom';
import { TESTIMONIALS, LOGOS } from '../constants';
import { ArrowDownIcon, ArrowRightUpIcon, LinkedinIcon, GitHubIcon, InfoIcon, XIcon } from '../components/ui/icons';
import useOnScreen from '../hooks/useOnScreen';
import { supabase } from '../lib/supabase';
import Loader from '../components/ui/Loader';

const scrollWithOffset = (el: HTMLElement) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -80; 
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' }); 
};

interface AnimatedTitleProps {
  outlineText: string;
  solidText: string;
  className?: string;
  mobileNoOutlineWords?: string[];
}

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ outlineText, solidText, className, mobileNoOutlineWords }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const onScreen = useOnScreen(ref, 0.2);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    setIsRevealed(onScreen);
  }, [onScreen]);

  const createAnimatedLetters = (text: string) =>
    text.split('').map((char, index) => (
      <span
        key={index}
        className="opacity-0 transition-opacity duration-500"
        style={{
          transitionDelay: `${isRevealed ? index * 50 : 0}ms`,
          opacity: isRevealed ? 1 : 0,
        }}
      >
        {char}
      </span>
    ));

  const renderOutlineText = () => {
    if (!mobileNoOutlineWords || mobileNoOutlineWords.length === 0) {
        return createAnimatedLetters(outlineText);
    }

    const words = outlineText.split(' ');
    return words.map((word, i) => {
        const isHiddenOnMobile = mobileNoOutlineWords.includes(word);
        const space = i < words.length - 1 ? createAnimatedLetters(' ') : null;
        return (
            <React.Fragment key={i}>
                <span className={isHiddenOnMobile ? 'hidden md:inline' : 'inline'}>
                    {createAnimatedLetters(word)}
                </span>
                {space}
            </React.Fragment>
        );
    });
  };

  return (
    <h2 ref={ref} className={`text-4xl md:text-5xl lg:text-[60px] font-medium relative leading-tight break-words ${className}`}>
        <span className="absolute text-outline transform -translate-y-6 md:-translate-y-8 left-0 right-0">
            {renderOutlineText()}
        </span>
        <span className="relative text-white">
            {createAnimatedLetters(solidText)}
        </span>
    </h2>
  );
};


const Section: React.FC<{id: string, children: React.ReactNode, className?: string}> = ({ id, children, className }) => (
    <section id={id} className={`py-20 md:py-32 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </div>
    </section>
);

const HeroSection: React.FC<{ siteContent: Record<string, string> }> = ({ siteContent }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isLoaded, setIsLoaded] = useState(false);
    const [floatY, setFloatY] = useState(0);
    const sideOffset = useRef(typeof window !== 'undefined' ? window.innerWidth * 0.6 : 500).current;
    const heroImageRef = useRef<HTMLImageElement>(null);


    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const { clientX, clientY } = event;
            // Normalize position from -1 to 1 for parallax effect
            const x = (clientX / window.innerWidth) * 2 - 1;
            const y = (clientY / window.innerHeight) * 2 - 1;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        
        // Check if the image is already loaded (from cache) when component mounts
        if (heroImageRef.current && heroImageRef.current.complete) {
            setIsLoaded(true);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        let animationFrameId: number;
        const startTime = performance.now();

        const animate = () => {
            const elapsedTime = performance.now() - startTime;
            // A gentle sine wave for floating effect, amplitude 5px, period ~7.5s
            const y = Math.sin(elapsedTime / 1200) * 5; 
            setFloatY(y);
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isLoaded]);

    const parallaxAndEntryStyle = (factor: number, initialOffsetX: number, additionalOffsetY: number = 0, finalOpacity: number = 1) => {
        const parallaxX = mousePos.x * factor;
        const parallaxY = mousePos.y * factor;
        const entryX = isLoaded ? 0 : initialOffsetX;
        
        const transformTransition = isLoaded ? 'transform 0.2s ease-out' : 'transform 4s cubic-bezier(0.22, 1, 0.36, 1)';
        const opacityTransition = 'opacity 3.5s ease-out 0.5s';
        
        return {
            transform: `translate(${parallaxX + entryX}px, ${parallaxY + additionalOffsetY}px)`,
            opacity: isLoaded ? finalOpacity : 0,
            transition: `${transformTransition}, ${opacityTransition}`
        };
    };
    
    return (
    <div id="home" className="h-screen min-h-[700px] flex flex-col items-center justify-center relative text-center overflow-hidden">
        <div className="relative z-10">
            <div className="grid place-items-center">
                {/* Layer 1: Solid text (behind image) */}
                <h1 className="col-start-1 row-start-1 font-ibm-plex-mono font-bold uppercase text-white" style={{ fontSize: 'clamp(60px, 14vw, 150px)', lineHeight: 0.91, letterSpacing: 'clamp(4px, 1.5vw, 12px)', ...parallaxAndEntryStyle(-8, sideOffset)}}>
                    <span className="block">SEBASTIÁN</span>
                    <span className="block">CÁRDENAS</span>
                </h1>

                {/* Floating Wrapper for images */}
                <div
                    className="col-start-1 row-start-1 grid place-items-center w-full h-full"
                    style={{ transform: `translateY(${isLoaded ? floatY : 0}px)` }}
                >
                    {/* Shadow Image */}
                    <img
                        src={siteContent.hero_shadow_image || "https://themes.boldway.agency/deep/freelancer/wp-content/uploads/sites/17/2025/06/shadow1.png"}
                        alt=""
                        aria-hidden="true"
                        className="col-start-1 row-start-1 w-[440px] md:w-[580px] lg:w-[670px] h-auto pointer-events-none"
                        style={parallaxAndEntryStyle(20, -sideOffset, 40, 0.6)}
                    />

                    {/* Layer 2: Image */}
                    <img
                        ref={heroImageRef}
                        onLoad={() => setIsLoaded(true)}
                        src={siteContent.hero_image || "https://themes.boldway.agency/deep/freelancer/wp-content/uploads/sites/17/2025/08/freelancer-demo.png"}
                        alt="Sebastián Cárdenas"
                        className="col-start-1 row-start-1 w-[340px] md:w-[480px] lg:w-[567px] h-auto grayscale contrast-125 pointer-events-none"
                        style={parallaxAndEntryStyle(12, -sideOffset, -40)}
                    />
                </div>
                
                {/* Layer 3: Outlined text (in front of image) */}
                <h1 className="col-start-1 row-start-1 font-ibm-plex-mono font-bold uppercase" style={{ fontSize: 'clamp(60px, 14vw, 150px)', lineHeight: 0.91, letterSpacing: 'clamp(4px, 1.5vw, 12px)', ...parallaxAndEntryStyle(-8, sideOffset)}}>
                    <span className="block text-transparent" style={{ WebkitTextStroke: '0.825px white' }}>SEBASTIÁN</span>
                    <span className="block text-transparent" style={{ WebkitTextStroke: '0.825px white' }}>CÁRDENAS</span>
                </h1>
            </div>
        </div>

        <div 
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 text-center transition-opacity duration-[3s] ease-out w-full px-4"
            style={{ opacity: isLoaded ? 1 : 0, transitionDelay: '1s' }}
        >
            <div className="flex items-center justify-center space-x-4">
                <div className="h-[1px] w-12 bg-gray-600"></div>
                <h3 className="font-plus-jakarta-sans text-sm md:text-base font-medium uppercase tracking-[0.3em] text-gray-300 whitespace-nowrap">
                    Web Developer
                </h3>
                <div className="h-[1px] w-12 bg-gray-600"></div>
            </div>
            <div className="mt-12 w-full max-w-4xl mx-auto overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)' }}>
                <div className="flex w-max">
                    <div className="flex animate-scroll items-center gap-16 pr-16">
                        {[...LOGOS, ...LOGOS].map((logo, index) => (
                            <div key={`${logo.name}-${index}`} title={logo.name} className="flex-shrink-0 text-gray-600 hover:text-white transition-colors duration-300">
                                {logo.icon}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        <NavLink to="/#about" smooth scroll={scrollWithOffset} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
            <div className="w-9 h-9 rounded-full border border-white flex items-center justify-center animate-bounce hover:bg-white hover:text-black transition-colors">
                <ArrowDownIcon className="w-5 h-5" />
            </div>
        </NavLink>
    </div>
)};

const AboutSection: React.FC<{ siteContent: Record<string, string> }> = ({ siteContent }) => {
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const [imageTransform, setImageTransform] = useState('perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
    
    const imageColumnRef = useRef<HTMLDivElement>(null);
    const isImageVisible = useOnScreen(imageColumnRef, 0.3);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageContainerRef.current) return;
        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        const rotateX = (-(y - height / 2) / (height / 2)) * 8; // Max 8 degrees rotation
        const rotateY = ((x - width / 2) / (width / 2)) * 8; // Max 8 degrees rotation
        setImageTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`);
    };

    const handleMouseLeave = () => {
        setImageTransform('perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
    };

    return (
    <Section id="about" className="bg-[#0c0c0c]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
                <AnimatedTitle outlineText="SOBRE MÍ" solidText="SOBRE MÍ" />
                <div className="mt-8 space-y-4 text-gray-300 max-w-2xl text-[19px]">
                    <p>Me dedico a ayudar a personas y empresas que sienten que su sitio web ya no refleja lo que realmente son. Mi enfoque es el rediseño web: tomo la base de lo que tienes y lo convierto en una página moderna, clara y atractiva. Trabajo con tecnologías actuales como React, Tailwind y Supabase, siempre pensando en que tu web sea rápida, fácil de usar y se adapte a cualquier dispositivo.</p>
                    <p>Y si aún no cuentas con un sitio web, también puedo ayudarte a crear uno desde cero para que tu presencia digital empiece con el pie derecho. Para mí, cada proyecto es una oportunidad de demostrar que una web bien hecha no solo se ve mejor, también transmite confianza y abre nuevas oportunidades.</p>
                </div>
            </div>
            <div 
                ref={imageColumnRef}
                className={`lg:col-span-4 flex flex-col items-center lg:items-start transition-all duration-1000 ease-out ${isImageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
                 <div 
                    ref={imageContainerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="w-full max-w-xs lg:max-w-none rounded-lg group"
                    style={{ perspective: '1000px' }}
                >
                    <div 
                        className="relative w-full shadow-2xl rounded-lg transition-transform duration-300 ease-out"
                        style={{ transform: imageTransform, transformStyle: 'preserve-3d' }}
                    >
                        <img 
                            src={siteContent.about_image || "https://themes.boldway.agency/deep/freelancer/wp-content/uploads/sites/17/2025/08/freelancer-demo.png"} 
                            alt="Retrato de Sebastián Cárdenas" 
                            className="rounded-lg object-cover w-full h-full"
                        />
                        <div 
                            className="absolute -inset-2 bg-gradient-to-br from-[#39f8b1]/50 to-transparent rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"
                            style={{ transform: 'translateZ(-50px)' }}
                            aria-hidden="true"
                        ></div>
                        <div 
                            className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/0 to-white/20 rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                            aria-hidden="true"
                        ></div>
                    </div>
                </div>
                 <div className="flex space-x-4 mt-6">
                    <a href="https://github.com/scardenast" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all duration-300"><GitHubIcon className="w-4 h-4" /></a>
                    <a href="https://www.linkedin.com/in/scardenast/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all duration-300"><LinkedinIcon className="w-4 h-4" /></a>
                </div>
            </div>
        </div>
    </Section>
    )
};

const ServiceItem: React.FC<{ service: { title: string; image: string; description: string }; index: number; onClick: (service: any) => void; }> = ({ service, index, onClick }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
    const [textTransformX, setTextTransformX] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const onScreen = useOnScreen(containerRef, 0.3);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        setCardPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });

        const centerX = rect.width / 2;
        const mouseX = e.clientX - rect.left;
        const offset = mouseX - centerX;
        const maxMovement = 16;
        const normalizedOffset = offset / centerX;
        const moveX = -normalizedOffset * maxMovement;
        setTextTransformX(moveX);
    };

    const handleMouseLeave = () => {
        if (isMobile) return;
        setTextTransformX(0);
    };

    const handleClick = () => {
        if (isMobile) {
            onClick(service);
        }
    };

    const transformOriginClass = index % 2 === 0 ? 'origin-right' : 'origin-left';
    const textAlignmentClass = index % 2 === 0 ? 'md:text-right' : 'md:text-left';

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            className={`group relative ${isMobile ? 'cursor-pointer' : 'cursor-none'} hover:z-10`}
        >
            <div className={`block py-8 md:py-12 px-8 md:px-16 lg:px-24 transition-all duration-700 ease-out ${onScreen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: onScreen ? `${100 * index}ms` : '0ms' }}>
                <h3 
                    className={`text-4xl md:text-7xl lg:text-8xl font-black text-white group-hover:text-outline-hover transition-transform duration-300 ease-out text-center ${textAlignmentClass}`}
                    style={{ transform: `translateX(${textTransformX}px)` }}
                >
                    {service.title}
                </h3>
            </div>
            {!isMobile && (
                <div
                    className="pointer-events-none absolute w-96 h-[480px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 rotate-3 group-hover:rotate-0 overflow-hidden shadow-2xl"
                    style={{
                        left: 0,
                        top: 0,
                        transform: `translate(${cardPosition.x}px, ${cardPosition.y}px) translate(-50%, -50%) translateZ(0)`,
                    }}
                >
                    <img
                        src={service.image}
                        alt={service.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-center text-center p-6">
                        <h4 className="text-white text-2xl font-bold">{service.title}</h4>
                        <p className="text-gray-300 text-lg font-mulish leading-relaxed mt-4">{service.description}</p>
                    </div>
                </div>
            )}
            <div className={`absolute bottom-0 h-[1px] bg-gray-800 w-full transition-transform duration-1000 ease-out ${transformOriginClass} ${onScreen ? 'scale-x-100' : 'scale-x-0'}`} style={{transitionDelay: onScreen ? `${200 + 100 * index}ms` : '0ms'}}/>
        </div>
    );
};

const ServiceModal: React.FC<{ service: { title: string; image: string; description: string }; onClose: () => void }> = ({ service, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(onClose, 300); 
    }, [onClose]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);

    const modalAnimation = isClosing ? 'opacity-0' : 'opacity-100';
    const cardAnimation = isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100';

    return (
        <div 
            className={`fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 transition-opacity duration-300 ${modalAnimation}`}
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className={`relative bg-[#0c0c0c] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden transition-all duration-300 transform ${cardAnimation}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={handleClose} 
                    className="absolute top-2 right-2 z-10 p-2 text-gray-400 hover:text-white rounded-full bg-black/50 hover:bg-black/80 transition-colors"
                    aria-label="Cerrar modal"
                >
                   <XIcon className="w-6 h-6" />
                </button>
                <div className="relative">
                    <img src={service.image} alt={service.title} className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    <h3 className="absolute bottom-4 left-4 text-3xl font-bold text-white">{service.title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-300 leading-relaxed font-mulish">{service.description}</p>
                </div>
            </div>
        </div>
    );
};

const ServicesSection: React.FC<{ services: any[] }> = ({ services }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const onScreen = useOnScreen(containerRef, 0.2);
    const [selectedService, setSelectedService] = useState<any | null>(null);

    const handleServiceClick = (service: any) => {
        setSelectedService(service);
    };

    const handleCloseModal = () => {
        setSelectedService(null);
    };

    return (
        <Section id="services" className="overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
                <AnimatedTitle outlineText="MIS SERVICIOS" solidText="MIS SERVICIOS" />
                <NavLink to="/#work" smooth scroll={scrollWithOffset} className="group inline-flex items-center space-x-2 mt-4 md:mt-0 text-gray-400 hover:text-white transition-colors duration-300">
                    <span className="text-sm uppercase font-bold tracking-widest">Ver Proyectos</span>
                    <ArrowDownIcon className="w-5 h-5"/>
                </NavLink>
            </div>
            <div ref={containerRef} className="relative">
                <div className={`absolute top-0 left-0 h-[1px] bg-gray-800 w-full origin-left transition-transform duration-1000 ease-out ${onScreen ? 'scale-x-100' : 'scale-x-0'}`}/>
                {services.map((service, index) => (
                    <ServiceItem key={service.id} service={{...service, title: service.name}} index={index} onClick={handleServiceClick} />
                ))}
            </div>
            <div className="mt-20 py-10 border-t border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-8">
                <h4 className="text-2xl md:text-3xl font-bold text-center md:text-left">¿Tienes un proyecto en mente? Démosle vida.</h4>
                <NavLink to="/#contact" smooth scroll={scrollWithOffset} className="bg-[#39f8b1] text-black text-sm font-bold uppercase tracking-wider py-4 px-8 rounded-md hover:bg-white transition-colors duration-300 flex items-center gap-2">
                    Obtener una Propuesta <ArrowRightUpIcon className="w-5 h-5"/>
                </NavLink>
            </div>
             {selectedService && <ServiceModal service={selectedService} onClose={handleCloseModal} />}
        </Section>
    );
};

const WorkSection = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [filter, setFilter] = useState('Todos');
    
    useEffect(() => {
        const fetchProjects = async () => {
            const { data, error } = await supabase.from('projects').select('*').order('id', { ascending: false });
            if (error) {
                console.error('Error fetching projects:', error);
            } else if (data) {
                setProjects(data);
            }
        };
        fetchProjects();
    }, []);

    const categories = ['Todos', ...Array.from(new Set(projects.map(p => p.category)))];
    const filteredProjects = filter === 'Todos' ? projects : projects.filter(p => p.category === filter);

    return (
        <Section id="work" className="bg-[#0c0c0c]">
            <AnimatedTitle outlineText="MI TRABAJO" solidText="MI TRABAJO" className="mb-8" />
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 mb-12">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} className={`text-sm uppercase tracking-widest font-bold transition-colors ${filter === cat ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
                        {cat}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                {filteredProjects.map(project => (
                    <div className="project-card-wrapper" key={project.id}>
                        <Link to={`/work/${project.slug}`}>
                            <div className="e-card">
                                <img src={project.image} alt={project.title} className="card-image"/>
                                <div className="wave"></div>
                                <div className="wave"></div>
                                <div className="wave"></div>
                                <div className="infotop">
                                    <div className="title">{project.title}</div>
                                    <div className="name">{project.category}</div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </Section>
    );
};

const TestimonialsSection = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Section id="testimonials">
            <AnimatedTitle 
                outlineText="HISTORIAS DE CLIENTES" 
                solidText="HISTORIAS DE CLIENTES" 
                className="mb-16 max-w-4xl mx-auto text-center"
                mobileNoOutlineWords={['CLIENTES']}
            />
            <div className="relative max-w-4xl mx-auto overflow-hidden">
                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
                    {TESTIMONIALS.map((testimonial, index) => (
                        <div key={index} className="flex-shrink-0 w-full px-4 text-center">
                            <p className="text-xl md:text-2xl leading-relaxed text-gray-300 italic">"{testimonial.quote}"</p>
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <img src={testimonial.image} alt={testimonial.author} className="w-14 h-14 rounded-full"/>
                                <div>
                                    <h4 className="font-bold text-white">{testimonial.author}</h4>
                                    <p className="text-gray-400 text-sm">{testimonial.title}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="absolute bottom-[-4rem] left-1/2 -translate-x-1/2 flex space-x-2">
                    {TESTIMONIALS.map((_, index) => (
                        <button key={index} onClick={() => setCurrent(index)} className={`w-3 h-3 rounded-full ${current === index ? 'bg-[#39f8b1]' : 'bg-gray-700'}`}></button>
                    ))}
                </div>
            </div>
        </Section>
    );
};

interface FormFieldProps {
    label: string;
    name: string;
    type?: string;
    as?: 'input' | 'textarea';
    rows?: number;
    children?: React.ReactNode;
    delay: number;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const FormField: React.FC<FormFieldProps> = ({ label, name, type = 'text', as = 'input', rows, children, delay, value, onChange }) => {
    const ref = useRef<HTMLDivElement>(null);
    const onScreen = useOnScreen(ref, 0.5);

    const commonClasses = "w-full bg-black border border-white/40 rounded-[28px] pt-8 pb-4 px-5 text-white focus:outline-none focus:border-white transition-all duration-300";
    
    return (
        <div ref={ref} className={`relative transition-all duration-700 ${onScreen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${onScreen ? delay : 0}ms`}}>
            <label htmlFor={name} className="absolute top-4 left-5 text-xs font-bold uppercase tracking-wider text-white/70 pointer-events-none">{label}</label>
            {as === 'textarea' ? (
                <textarea id={name} name={name} rows={rows} className={commonClasses} value={value} onChange={onChange} required />
            ) : (
                <input type={type} id={name} name={name} className={commonClasses} value={value} onChange={onChange} required />
            )}
            {children}
        </div>
    );
};

const ContactSection = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormStatus('submitting');
        setStatusMessage('');

        try {
            const { error } = await supabase
                .from('contacts')
                .insert([formData]);

            if (error) {
                throw error;
            }

            setFormStatus('success');
            setStatusMessage('¡Mensaje enviado con éxito! Gracias por contactarme.');
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setFormStatus('idle'), 5000);
        } catch (error: any) {
            console.error('Error submitting form:', error);
            setStatusMessage(error.message || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
            setFormStatus('error');
            setTimeout(() => setFormStatus('idle'), 5000);
        }
    };

    return (
        <Section id="contact" className="bg-[#0c0c0c]">
            <AnimatedTitle 
                outlineText="TRABAJEMOS JUNTOS" 
                solidText="TRABAJEMOS JUNTOS"
                className="mb-16"
                mobileNoOutlineWords={['JUNTOS']}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div>
                    <h3 className="text-xl text-white">¿Tienes una pregunta, feedback, o simplemente quieres saludar?</h3>
                    <p className="text-lg text-gray-300 mt-2">Nos encantaría saber de ti.</p>
                </div>
                <div className="space-y-6">
                    <p className="text-gray-300 text-lg uppercase">LLÁMANOS: <a href="tel:+56945148820" className="text-white font-bold hover:text-[#39f8b1] transition-colors">+569 4514 8820</a></p>
                    <p className="text-gray-300 text-lg uppercase">SALUDA: <a href="mailto:sebastian.cardenas.t@gmail.com" className="text-white font-bold hover:text-[#39f8b1] transition-colors">sebastian.cardenas.t@gmail.com</a></p>
                </div>
                <div className="flex space-x-4">
                    <a href="https://github.com/scardenast" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center text-white/70 hover:bg-white hover:text-black transition-all duration-300"><GitHubIcon className="w-5 h-5" /></a>
                    <a href="https://www.linkedin.com/in/scardenast/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center text-white/70 hover:bg-white hover:text-black transition-all duration-300"><LinkedinIcon className="w-5 h-5" /></a>
                </div>
            </div>
            
            <form className="space-y-6 mt-16" onSubmit={handleSubmit}>
                <FormField label="NOMBRE" name="name" delay={100} value={formData.name} onChange={handleChange}>
                     <div className="absolute top-1/2 right-5 -translate-y-1/2 bg-gray-700/50 rounded-md w-8 h-6 flex items-center justify-center space-x-0.5 pointer-events-none">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    </div>
                </FormField>
                <FormField label="EMAIL" name="email" type="email" delay={200} value={formData.email} onChange={handleChange} />
                <FormField label="MENSAJE" name="message" as="textarea" rows={6} delay={300} value={formData.message} onChange={handleChange} />
                
                {formStatus === 'success' && <p className="text-green-400 text-center">{statusMessage}</p>}
                {formStatus === 'error' && <p className="text-red-400 text-center">{statusMessage}</p>}
                
                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 pt-4">
                    <div className="flex items-start gap-3 flex-1">
                        <InfoIcon className="w-6 h-6 text-gray-500 flex-shrink-0" />
                        <p className="text-xs text-gray-500">
                            Todos los campos son obligatorios. Al enviar el formulario, aceptas los <a href="#" className="underline hover:text-white">Términos y Condiciones</a> y la <a href="#" className="underline hover:text-white">Política de Privacidad</a>.
                        </p>
                    </div>
                    <button type="submit" disabled={formStatus === 'submitting'} className="w-full md:w-auto bg-[#29e984] text-black text-sm font-bold uppercase tracking-wider py-4 px-10 rounded-xl hover:bg-white transition-colors duration-300 flex-shrink-0 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {formStatus === 'submitting' ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                </div>
            </form>
        </Section>
    );
};

const PortfolioPage: React.FC = () => {
    const [siteContent, setSiteContent] = useState<Record<string, string>>({});
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);

            // Fetch site content
            const siteContentPromise = supabase.from('site_content').select('key,value');
            // Fetch services
            const servicesPromise = supabase.from('services').select('*').order('id');

            const [siteContentResult, servicesResult] = await Promise.all([siteContentPromise, servicesPromise]);
            
            // Handle site content
            if (siteContentResult.error) {
                console.error("Error fetching site content", siteContentResult.error);
            } else if (siteContentResult.data) {
                const contentMap = siteContentResult.data.reduce((acc, item) => {
                    acc[item.key] = item.value;
                    return acc;
                }, {} as Record<string, string>);
                setSiteContent(contentMap);
            }

            // Handle services
            if (servicesResult.error) {
                console.error("Error fetching services", servicesResult.error);
            } else if (servicesResult.data) {
                setServices(servicesResult.data);
            }

            setLoading(false);
        };
        fetchContent();
    }, []);

    if(loading) {
        return <Loader fullScreen />;
    }

    return (
        <>
           <HeroSection siteContent={siteContent} />
           <AboutSection siteContent={siteContent} />
           <ServicesSection services={services} />
           <WorkSection />
           <TestimonialsSection />
           <ContactSection />
        </>
    );
};

export default PortfolioPage;