import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Loader from '../../components/ui/Loader';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const convertToWebP = (
  file: File,
  options: { quality?: number; maxWidth?: number; maxHeight?: number } = {}
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const { quality = 0.8, maxWidth = 1920, maxHeight = 1080 } = options;
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("FileReader failed to read the file."));
      }
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        const aspectRatio = width / height;

        if (width > maxWidth || height > maxHeight) {
            if (aspectRatio > 1) { // Landscape
                if (width > maxWidth) {
                    width = maxWidth;
                    height = width / aspectRatio;
                }
            } else { // Portrait or square
                if (height > maxHeight) {
                    height = maxHeight;
                    width = height * aspectRatio;
                }
            }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas to Blob conversion failed'));
            }
            const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
            const webpFile = new File([blob], `${originalName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = (error) => reject(error);
      img.src = event.target.result as string;
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


const ProjectsAdminPage: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<any | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('projects').select('*').order('id', { ascending: false });
        if (error) {
            console.error('Error fetching projects:', error);
        } else {
            setProjects(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleEdit = (project: any) => {
        setEditingProject(project);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingProject(null);
        setShowForm(true);
    };

    const handleDelete = (project: any) => {
        setProjectToDelete(project);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        
        const { error } = await supabase.from('projects').delete().eq('id', projectToDelete.id);
        if (error) {
            alert('Error al eliminar el proyecto: ' + error.message);
        } else {
            alert('Proyecto eliminado con éxito.');
            fetchProjects();
        }
        setProjectToDelete(null);
    };

    const handleFormSave = () => {
        setShowForm(false);
        setEditingProject(null);
        fetchProjects();
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Gestionar Proyectos</h1>
                 {!showForm && (
                     <button onClick={handleAddNew} className="bg-[#39f8b1] hover:bg-white text-black font-bold py-2 px-6 rounded transition-colors">
                        + Añadir Nuevo Proyecto
                    </button>
                 )}
            </div>

            {showForm ? (
                <ProjectForm 
                    projectToEdit={editingProject} 
                    onSave={handleFormSave} 
                    onCancel={() => { setShowForm(false); setEditingProject(null); }} 
                />
            ) : (
                <div className="bg-[#0c0c0c] border border-gray-900 rounded-lg overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-800">
                            <tr>
                                <th className="p-4">Título</th>
                                <th className="p-4 hidden md:table-cell">Categoría</th>
                                <th className="p-4 hidden lg:table-cell">Fecha</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr key={project.id} className="border-b border-gray-800 last:border-b-0">
                                    <td className="p-4 font-semibold">{project.title}</td>
                                    <td className="p-4 hidden md:table-cell">{project.category}</td>
                                    <td className="p-4 hidden lg:table-cell">{new Date(project.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleEdit(project)} className="text-blue-400 hover:text-blue-300 font-semibold mr-4">Editar</button>
                                        <button onClick={() => handleDelete(project)} className="text-red-500 hover:text-red-400 font-semibold">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
             <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar el proyecto "${projectToDelete?.title}"? Esta acción no se puede deshacer.`}
            />
        </div>
    );
};

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-') // Replace spaces and underscores with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
};


const ProjectForm: React.FC<{ projectToEdit: any | null, onSave: () => void, onCancel: () => void }> = ({ projectToEdit, onSave, onCancel }) => {
    const [formData, setFormData] = useState<any>({
        slug: '', title: '', category: '', client: '', date: '', website_url: '#',
        content: '',
        image: '', gallery: [] as string[]
    });
    
    const [allServices, setAllServices] = useState<{id: number, name: string}[]>([]);
    const [allTechStacks, setAllTechStacks] = useState<{id: number, name: string}[]>([]);
    const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
    const [selectedTechStacks, setSelectedTechStacks] = useState<Set<number>>(new Set());

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: servicesData } = await supabase.from('services').select('*');
            if(servicesData) setAllServices(servicesData);
            
            const { data: techStacksData } = await supabase.from('tech_stacks').select('*');
            if(techStacksData) setAllTechStacks(techStacksData);

            if (projectToEdit) {
                 // Data migration for old projects: combine description and details into content if content doesn't exist
                const projectContent = projectToEdit.content || `${projectToEdit.description || ''}\n\n${(projectToEdit.details || []).join('\n\n')}`;
                
                const { description, details, ...restOfProject } = projectToEdit;

                setFormData({
                    ...restOfProject,
                    content: projectContent,
                    gallery: projectToEdit.gallery || [],
                });
                
                const { data: projectServices } = await supabase.from('project_services').select('service_id').eq('project_id', projectToEdit.id);
                if (projectServices) setSelectedServices(new Set(projectServices.map(s => s.service_id)));

                const { data: projectTechStacks } = await supabase.from('project_tech_stacks').select('tech_stack_id').eq('project_id', projectToEdit.id);
                if (projectTechStacks) setSelectedTechStacks(new Set(projectTechStacks.map(t => t.tech_stack_id)));

            } else {
                 setFormData({
                    slug: '', title: '', category: '', client: '', date: '', website_url: '#',
                    content: '',
                    image: '', gallery: []
                });
                setSelectedServices(new Set());
                setSelectedTechStacks(new Set());
            }
        };
        fetchData();
    }, [projectToEdit]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'title') {
            setFormData(prev => ({ ...prev, title: value, slug: generateSlug(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSelectionChange = (id: number, type: 'service' | 'tech_stack') => {
        if (type === 'service') {
            setSelectedServices(prev => {
                const newSet = new Set(prev);
                if (newSet.has(id)) newSet.delete(id);
                else newSet.add(id);
                return newSet;
            });
        } else {
            setSelectedTechStacks(prev => {
                const newSet = new Set(prev);
                if (newSet.has(id)) newSet.delete(id);
                else newSet.add(id);
                return newSet;
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'gallery') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        if (fileType === 'image') setImageFile(files[0]);
        if (fileType === 'gallery') setGalleryFiles(files);
    };

    const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
        try {
            const webpFile = await convertToWebP(file, { quality: 0.8, maxWidth: 1920 });
            const fileName = `${crypto.randomUUID()}-${webpFile.name}`;
            const { data, error } = await supabase.storage.from(bucket).upload(fileName, webpFile);
            if (error) {
                console.error('Error uploading file:', error);
                setError(`Error al subir ${file.name}: ${error.message}`);
                return null;
            }
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
            return publicUrl;
        } catch (conversionError: any) {
            console.error(`Error converting ${file.name} to WebP:`, conversionError);
            setError(`Error al convertir ${file.name} a WebP: ${conversionError.message}`);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Check for slug uniqueness before attempting to save.
        const { data: existingProject, error: slugCheckError } = await supabase
            .from('projects')
            .select('id')
            .eq('slug', formData.slug)
            .single();

        // Handle potential errors during the check, but ignore 'PGRST116' which means "no rows found" (the slug is unique).
        if (slugCheckError && slugCheckError.code !== 'PGRST116') {
            setError(`Error al verificar el slug: ${slugCheckError.message}`);
            setIsSubmitting(false);
            return;
        }

        // If a project with the slug exists and it's not the one we are editing, it's a duplicate.
        if (existingProject && existingProject.id !== projectToEdit?.id) {
            setError('El "slug" generado por este título ya existe. Por favor, modifica el título.');
            setIsSubmitting(false);
            return;
        }

        const { description, details, ...dataToUpsert } = formData;
        
        try {
            if (imageFile) {
                const imageUrl = await uploadFile(imageFile, 'project-images');
                if (imageUrl) {
                    dataToUpsert.image = imageUrl;
                } else {
                    setIsSubmitting(false);
                    return; // Stop submission if image upload fails
                }
            }

            if (galleryFiles && galleryFiles.length > 0) {
                const galleryUrls = await Promise.all(
                    Array.from(galleryFiles).map(file => uploadFile(file, 'project-images'))
                );
                if (galleryUrls.some(url => url === null)) {
                    setIsSubmitting(false);
                    return; // Stop submission if any gallery image fails
                }
                dataToUpsert.gallery = galleryUrls as string[];
            }
            
            // Upsert project
            const { data: projectData, error: upsertError } = await supabase.from('projects').upsert(dataToUpsert).select().single();
            if (upsertError) throw upsertError;
            const projectId = projectData.id;
            
            // Handle services
            await supabase.from('project_services').delete().eq('project_id', projectId);
            const servicesToInsert = Array.from(selectedServices).map(service_id => ({ project_id: projectId, service_id }));
            if (servicesToInsert.length) await supabase.from('project_services').insert(servicesToInsert);

            // Handle tech stacks
            await supabase.from('project_tech_stacks').delete().eq('project_id', projectId);
            const techStacksToInsert = Array.from(selectedTechStacks).map(tech_stack_id => ({ project_id: projectId, tech_stack_id }));
            if (techStacksToInsert.length) await supabase.from('project_tech_stacks').insert(techStacksToInsert);

            alert(projectToEdit ? 'Proyecto actualizado con éxito.' : 'Proyecto creado con éxito.');
            onSave();
        } catch (err: any) {
             // The pre-emptive check should prevent this, but as a fallback:
            if (err.message?.includes('projects_slug_key')) {
                setError('El "slug" generado por este título ya existe. Por favor, modifica el título.');
            } else {
                setError(err.message);
            }
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-3 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#39f8b1]";
    const labelClass = "block text-sm font-bold text-gray-400 mb-2";

    return (
        <form onSubmit={handleSubmit} className="bg-[#0c0c0c] border border-gray-900 rounded-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold mb-4">{projectToEdit ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={labelClass}>Título</label><input type="text" name="title" value={formData.title} onChange={handleChange} className={inputClass} required /></div>
                <div><label className={labelClass}>Slug (Automático)</label><input type="text" name="slug" value={formData.slug} onChange={handleChange} className={inputClass} readOnly disabled /></div>
                <div><label className={labelClass}>Categoría</label><input type="text" name="category" value={formData.category} onChange={handleChange} className={inputClass} required /></div>
                <div><label className={labelClass}>Cliente</label><input type="text" name="client" value={formData.client} onChange={handleChange} className={inputClass} required /></div>
                <div><label className={labelClass}>Fecha</label><input type="date" name="date" value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''} onChange={handleChange} className={inputClass} required /></div>
                <div><label className={labelClass}>URL del Sitio Web</label><input type="text" name="website_url" value={formData.website_url} onChange={handleChange} className={inputClass} /></div>
            </div>

            <div>
                <label className={labelClass}>Contenido del Proyecto</label>
                <textarea name="content" value={formData.content} onChange={handleChange} className={inputClass} rows={10} required />
                <p className="text-xs text-gray-500 mt-2">Este campo soporta Markdown para formatear el texto (ej. # Título, *cursiva*, **negrita**, - lista).</p>
            </div>

            <div>
                <label className={labelClass}>Servicios</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-black border border-gray-700 rounded-md">
                    {allServices.map(service => (
                        <label key={service.id} className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={selectedServices.has(service.id)} onChange={() => handleSelectionChange(service.id, 'service')} className="form-checkbox h-5 w-5 bg-black border-gray-600 rounded text-[#39f8b1] focus:ring-[#39f8b1]" />
                            <span>{service.name}</span>
                        </label>
                    ))}
                </div>
            </div>
            
             <div>
                <label className={labelClass}>Stack Tecnológico</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-black border border-gray-700 rounded-md">
                    {allTechStacks.map(stack => (
                        <label key={stack.id} className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={selectedTechStacks.has(stack.id)} onChange={() => handleSelectionChange(stack.id, 'tech_stack')} className="form-checkbox h-5 w-5 bg-black border-gray-600 rounded text-[#39f8b1] focus:ring-[#39f8b1]" />
                            <span>{stack.name}</span>
                        </label>
                    ))}
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
                <div><label className={labelClass}>Imagen Principal (Thumbnail)</label><input type="file" onChange={e => handleFileChange(e, 'image')} className={inputClass} /> {formData.image && <img src={formData.image} alt="Preview" className="w-24 h-24 object-cover mt-2 rounded"/>}</div>
                <div><label className={labelClass}>Galería</label><input type="file" multiple onChange={e => handleFileChange(e, 'gallery')} className={inputClass} />
                    <div className="flex gap-2 mt-2 flex-wrap">{formData.gallery.map(img => <img key={img} src={img} alt="Preview" className="w-16 h-16 object-cover rounded"/>)}</div>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
                <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="bg-[#39f8b1] hover:bg-white text-black font-bold py-2 px-6 rounded transition-colors disabled:bg-gray-500">
                    {isSubmitting ? 'Guardando...' : 'Guardar Proyecto'}
                </button>
            </div>
        </form>
    );
};


export default ProjectsAdminPage;