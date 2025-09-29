import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Loader from '../../components/ui/Loader';

interface SiteContent {
    id: number;
    key: string;
    value: string;
    description: string;
}

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


const SiteImagesPage: React.FC = () => {
    const [siteImages, setSiteImages] = useState<SiteContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        const { error: siteImagesError, data: siteImagesData } = await supabase
            .from('site_content')
            .select('*')
            .ilike('key', '%image%');

        if (siteImagesError) {
            console.error("Error fetching site images:", siteImagesError);
            setError("No se pudieron cargar las imágenes del sitio. Revisa la configuración.");
        } else {
            setSiteImages(siteImagesData as SiteContent[]);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSiteImageChange = async (e: React.ChangeEvent<HTMLInputElement>, itemKey: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(`site-${itemKey}`);
        setError(null);

        try {
            const webpFile = await convertToWebP(file, { quality: 0.8, maxWidth: 1920 });
            const fileName = `${itemKey}-${crypto.randomUUID()}-${webpFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('website-assets')
                .upload(fileName, webpFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('website-assets')
                .getPublicUrl(fileName);
            
            const { error: dbError } = await supabase
                .from('site_content')
                .update({ value: publicUrl })
                .eq('key', itemKey);

            if (dbError) throw dbError;

            alert('Imagen actualizada con éxito!');
            fetchData();

        } catch (err: any) {
            console.error(err);
            setError('Error al subir la imagen: ' + err.message);
        } finally {
            setUploading(null);
        }
    };
    
    if (loading) return <Loader />;

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">Gestionar Imágenes del Sitio</h1>
            {error && <div className="bg-red-900 border border-red-500 text-white p-4 rounded-md mb-6">{error}</div>}
            
            <div className="space-y-8">
                {siteImages.length > 0 ? siteImages.map((item) => (
                    <div key={item.key} className="bg-[#0c0c0c] border border-gray-800 p-6 rounded-lg flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-shrink-0">
                            <img src={item.value} alt={item.description} className="w-40 h-40 object-cover rounded-md bg-black" />
                        </div>
                        <div className="flex-grow">
                            <h2 className="text-xl font-bold text-white">{item.description}</h2>
                            <p className="text-gray-400 text-sm mb-4">Clave: <code className="bg-black px-1 rounded">{item.key}</code></p>
                            <input
                                type="file"
                                accept="image/*,.webp"
                                onChange={(e) => handleSiteImageChange(e, item.key)}
                                disabled={uploading === `site-${item.key}`}
                                className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#39f8b1] file:text-black hover:file:bg-white"
                            />
                            {uploading === `site-${item.key}` && <p className="text-sm text-blue-400 mt-2">Subiendo...</p>}
                        </div>
                    </div>
                )) : (
                    <div className="bg-[#0c0c0c] border border-gray-800 p-6 rounded-lg">
                        <p className="text-center text-gray-400">No se encontraron imágenes del sitio para gestionar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteImagesPage;
