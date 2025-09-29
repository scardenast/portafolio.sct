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


const ServicesAdminPage: React.FC = () => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<any | null>(null);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('services').select('*').order('id', { ascending: true });
        if (error) {
            console.error('Error fetching services:', error);
        } else {
            setServices(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleEdit = (service: any) => {
        setEditingService(service);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingService(null);
        setShowForm(true);
    };

    const handleDelete = (service: any) => {
        setServiceToDelete(service);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!serviceToDelete) return;

        const { error } = await supabase.from('services').delete().eq('id', serviceToDelete.id);
        if (error) {
            alert('Error al eliminar el servicio: ' + error.message);
        } else {
            alert('Servicio eliminado con éxito.');
            fetchServices();
        }
        setServiceToDelete(null);
    };

    const handleFormSave = () => {
        setShowForm(false);
        setEditingService(null);
        fetchServices();
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Gestionar Servicios</h1>
                 {!showForm && (
                     <button onClick={handleAddNew} className="bg-[#39f8b1] hover:bg-white text-black font-bold py-2 px-6 rounded transition-colors">
                        + Añadir Nuevo Servicio
                    </button>
                 )}
            </div>

            {showForm ? (
                <ServiceForm 
                    serviceToEdit={editingService} 
                    onSave={handleFormSave} 
                    onCancel={() => { setShowForm(false); setEditingService(null); }} 
                />
            ) : (
                <div className="bg-[#0c0c0c] border border-gray-900 rounded-lg overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-800">
                            <tr>
                                <th className="p-4">Imagen</th>
                                <th className="p-4">Nombre</th>
                                <th className="p-4 hidden md:table-cell">Descripción</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id} className="border-b border-gray-800 last:border-b-0">
                                    <td className="p-4">
                                        <img src={service.image} alt={service.name} className="w-16 h-16 object-cover rounded-md bg-black" />
                                    </td>
                                    <td className="p-4 font-semibold">{service.name}</td>
                                    <td className="p-4 hidden md:table-cell text-gray-400 max-w-sm truncate">{service.description}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleEdit(service)} className="text-blue-400 hover:text-blue-300 font-semibold mr-4">Editar</button>
                                        <button onClick={() => handleDelete(service)} className="text-red-500 hover:text-red-400 font-semibold">Eliminar</button>
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
                message={`¿Estás seguro de que quieres eliminar el servicio "${serviceToDelete?.name}"? Esta acción no se puede deshacer.`}
            />
        </div>
    );
};

const ServiceForm: React.FC<{ serviceToEdit: any | null, onSave: () => void, onCancel: () => void }> = ({ serviceToEdit, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: '', description: '', image: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (serviceToEdit) {
            setFormData(serviceToEdit);
        } else {
            setFormData({ name: '', description: '', image: '' });
        }
    }, [serviceToEdit]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setImageFile(files[0]);
        }
    };

    const uploadFile = async (file: File): Promise<string | null> => {
        try {
            const webpFile = await convertToWebP(file, { quality: 0.8, maxWidth: 1200 });
            const fileName = `service-${crypto.randomUUID()}-${webpFile.name}`;
            const { data, error: uploadError } = await supabase.storage.from('website-assets').upload(fileName, webpFile);
            if (uploadError) {
                throw uploadError;
            }
            const { data: { publicUrl } } = supabase.storage.from('website-assets').getPublicUrl(data.path);
            return publicUrl;
        } catch (err: any) {
            console.error('Error uploading file:', err);
            setError(`Error al subir imagen: ${err.message}`);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        let imageUrl = formData.image;
        if (imageFile) {
            const uploadedUrl = await uploadFile(imageFile);
            if (uploadedUrl) {
                imageUrl = uploadedUrl;
            } else {
                setIsSubmitting(false);
                return; // Stop if upload failed
            }
        }

        // Explicitly build the data object to prevent sending 'id' on insert.
        const dataToSave = {
            name: formData.name,
            description: formData.description,
            image: imageUrl,
        };

        try {
            let response;
            if (serviceToEdit) {
                // UPDATE: Use .update() and provide the ID in the .eq() filter.
                response = await supabase
                    .from('services')
                    .update(dataToSave)
                    .eq('id', serviceToEdit.id)
                    .select()
                    .single();
            } else {
                // INSERT: The dataToSave object does NOT contain an ID.
                response = await supabase
                    .from('services')
                    .insert(dataToSave)
                    .select()
                    .single();
            }
            
            const { error: dbError } = response;
            if (dbError) throw dbError;


            alert(serviceToEdit ? 'Servicio actualizado con éxito.' : 'Servicio creado con éxito.');
            onSave();
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-3 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#39f8b1]";
    const labelClass = "block text-sm font-bold text-gray-400 mb-2";

    return (
        <form onSubmit={handleSubmit} className="bg-[#0c0c0c] border border-gray-900 rounded-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold mb-4">{serviceToEdit ? 'Editar Servicio' : 'Crear Nuevo Servicio'}</h2>
            
            <div>
                <label className={labelClass} htmlFor="name">Nombre del Servicio</label>
                <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
            </div>

            <div>
                <label className={labelClass} htmlFor="description">Descripción</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={inputClass} rows={4} required />
            </div>

            <div>
                <label className={labelClass}>Imagen del Servicio</label>
                <input type="file" onChange={handleFileChange} accept="image/*,.webp" className={inputClass} />
                {formData.image && <img src={formData.image} alt="Preview" className="w-24 h-24 object-cover mt-2 rounded"/>}
            </div>
           
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
                <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="bg-[#39f8b1] hover:bg-white text-black font-bold py-2 px-6 rounded transition-colors disabled:bg-gray-500">
                    {isSubmitting ? 'Guardando...' : 'Guardar Servicio'}
                </button>
            </div>
        </form>
    );
};

export default ServicesAdminPage;