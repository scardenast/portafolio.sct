
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { LOGOS } from '../constants';
import { ArrowLeftIcon, ArrowRightIcon, ArrowRightUpIcon } from '../components/ui/icons';
import { supabase } from '../lib/supabase';
import Loader from '../components/ui/Loader';

const ProjectDetailPage: React.FC = () => {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [projectIndex, setProjectIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [defaultHeroImage, setDefaultHeroImage] = useState<string>('');

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      
      const { data: heroImageData, error: heroImageError } = await supabase
        .from('site_content')
        .select('value')
        .eq('key', 'project_default_hero_image')
        .single();
        
      if (heroImageData) {
        setDefaultHeroImage(heroImageData.value);
      }

      const { data: allData, error: allError } = await supabase
        .from('projects')
        .select('id, slug, title')
        .order('id', { ascending: true });

      if (allError) {
        console.error('Error fetching all projects:', allError);
        navigate('/');
        return;
      }
      setAllProjects(allData);

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          project_services(services(id, name)),
          project_tech_stacks(tech_stacks(id, name))
        `)
        .eq('slug', projectSlug)
        .single();
      
      if (projectError || !projectData) {
        console.error('Error fetching project:', projectError);
        navigate('/');
      } else {
        setProject(projectData);
        const currentIndex = allData.findIndex(p => p.slug === projectSlug);
        setProjectIndex(currentIndex);
      }
      setLoading(false);
    };

    fetchProjectData();
    window.scrollTo(0, 0);
  }, [projectSlug, navigate]);

  if (loading || !project) {
    return <Loader fullScreen />;
  }
  
  const prevProject = projectIndex > 0 ? allProjects[projectIndex - 1] : null;
  const nextProject = projectIndex < allProjects.length - 1 ? allProjects[projectIndex + 1] : null;

  const getTechIcon = (techName: string) => {
    const logo = LOGOS.find(l => l.name === techName);
    return logo ? React.cloneElement(logo.icon, { className: 'h-8 w-8' }) : null;
  };
  
  const services = project.project_services.map((s: any) => s.services.name);
  const techStack = project.project_tech_stacks.map((t: any) => t.tech_stacks.name);
  const contentToRender = project.content || `${project.description || ''}\n\n${(project.details || []).join('\n\n')}`;


  return (
    <div className="text-white pt-20 animate-fade-in">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
      <header className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center overflow-hidden">
        <img src={defaultHeroImage || project.image} alt={project.title} className="absolute top-0 left-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        <div className="relative z-10 p-4">
          <p className="text-gray-400 uppercase tracking-widest font-bold">{project.category}</p>
          <h1 className="text-5xl md:text-7xl font-bold mt-4 font-plus-jakarta-sans">{project.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <div className="markdown-content text-gray-300">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{contentToRender}</ReactMarkdown>
            </div>
            
             {project.gallery && project.gallery.length > 0 && (
                <div className="pt-8">
                    <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-[#39f8b1] pl-4">Galería</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {project.gallery.map((imgSrc: string, index: number) => (
                        <img key={index} src={imgSrc} alt={`${project.title} gallery image ${index + 1}`} className="rounded-lg shadow-lg w-full h-auto object-cover hover:scale-105 transition-transform duration-300" />
                    ))}
                    </div>
                </div>
            )}
          </div>
          
          <aside className="lg:col-span-4 lg:sticky top-28 self-start space-y-8 bg-[#0c0c0c] p-8 rounded-lg border border-gray-900">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold">Cliente</h3>
                <p className="text-lg text-white mt-1">{project.client}</p>
              </div>
               <div className="border-t border-gray-800"></div>
              <div>
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold">Servicios</h3>
                <p className="text-lg text-white mt-1">{services.join(', ')}</p>
              </div>
               <div className="border-t border-gray-800"></div>
              <div>
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold">Fecha</h3>
                <p className="text-lg text-white mt-1">{new Date(project.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</p>
              </div>
              {project.website_url && project.website_url !== '#' && (
                 <>
                    <div className="border-t border-gray-800"></div>
                    <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#39f8b1] text-black text-sm font-bold uppercase tracking-wider py-3 px-6 rounded-md hover:bg-white transition-colors duration-300 w-full justify-center">
                    Visitar Sitio Web <ArrowRightUpIcon className="w-5 h-5"/>
                    </a>
                 </>
              )}
            </div>
            <div className="border-t border-gray-800 pt-6">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-4">Tecnologías Utilizadas</h3>
                <div className="flex flex-wrap gap-4">
                    {techStack.map((tech: string) => (
                        <div key={tech} title={tech} className="p-3 bg-black rounded-lg text-gray-300 hover:text-white transition-colors">
                           {getTechIcon(tech)}
                        </div>
                    ))}
                </div>
            </div>
          </aside>
        </div>
      </main>

      <nav className="border-t border-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 items-center h-32">
          <div className="text-left">
            {prevProject && (
              <Link to={`/work/${prevProject.slug}`} className="group inline-flex items-center gap-4 text-left">
                <ArrowLeftIcon className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors" />
                <div className="hidden md:block">
                  <p className="text-xs uppercase tracking-widest text-gray-500">Anterior</p>
                  <h4 className="text-lg font-bold text-gray-400 group-hover:text-white transition-colors mt-1">{prevProject.title}</h4>
                </div>
              </Link>
            )}
          </div>
          
          <Link to="/#work" className="text-gray-500 hover:text-white transition-colors uppercase text-sm font-bold tracking-widest text-center">
            Volver a Proyectos
          </Link>

          <div className="text-right">
            {nextProject && (
              <Link to={`/work/${nextProject.slug}`} className="group inline-flex items-center gap-4 text-right justify-end">
                <div className="hidden md:block">
                  <p className="text-xs uppercase tracking-widest text-gray-500">Siguiente</p>
                  <h4 className="text-lg font-bold text-gray-400 group-hover:text-white transition-colors mt-1">{nextProject.title}</h4>
                </div>
                <ArrowRightIcon className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors" />
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default ProjectDetailPage;