
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { X, Loader2, Image as ImageIcon, Search, RefreshCw, FolderOpen } from 'lucide-react';

interface ImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  bucketName?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  bucketName = 'course-images' 
}) => {
  const [images, setImages] = useState<{ name: string; url: string; path: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [folders, setFolders] = useState<string[]>([]);

  const fetchContent = async (path: string = '') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(bucketName).list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'desc' },
      });

      if (error) throw error;

      if (data) {
        const newFolders: string[] = [];
        const newImages: { name: string; url: string; path: string }[] = [];

        data.forEach(file => {
          if (file.name === '.emptyFolderPlaceholder') return;
          
          // Se non ha metadata o id, è probabilmente una cartella (dipende dalla versione di Supabase)
          // In genere, se non ha 'id' o 'metadata' è una cartella
          if (!file.id) {
            newFolders.push(file.name);
          } else {
            const filePath = path ? `${path}/${file.name}` : file.name;
            const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            newImages.push({ name: file.name, url: publicUrl, path: filePath });
          }
        });
        
        setFolders(newFolders);
        setImages(newImages);
      }
    } catch (err) {
      console.error('Error fetching storage content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchContent(currentPath);
    }
  }, [isOpen, currentPath]);

  if (!isOpen) return null;

  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigateUp = () => {
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-brand-600" />
              Libreria Media
            </h3>
            <p className="text-xs text-gray-500">Sfoglia i file caricati nello storage</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Breadcrumbs & Search */}
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => setCurrentPath('')}
              className={`hover:text-brand-600 font-medium ${currentPath === '' ? 'text-brand-600' : 'text-gray-500'}`}
            >
              Root
            </button>
            {currentPath.split('/').filter(Boolean).map((part, idx, arr) => (
              <React.Fragment key={idx}>
                <span className="text-gray-300">/</span>
                <button 
                  onClick={() => setCurrentPath(arr.slice(0, idx + 1).join('/'))}
                  className={`hover:text-brand-600 font-medium ${idx === arr.length - 1 ? 'text-brand-600' : 'text-gray-500'}`}
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cerca in questa cartella..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => fetchContent(currentPath)} 
              disabled={loading}
              className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-50"
              title="Aggiorna"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="h-10 w-10 animate-spin mb-2" />
              <p className="text-sm font-medium">Caricamento contenuti...</p>
            </div>
          ) : (folders.length > 0 || filteredImages.length > 0) ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Folder Up */}
              {currentPath && (
                <button 
                  onClick={navigateUp}
                  className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group"
                >
                  <FolderOpen className="h-10 w-10 text-gray-300 group-hover:text-brand-400 mb-2" />
                  <span className="text-xs font-bold text-gray-500">.. Torna su</span>
                </button>
              )}

              {/* Folders */}
              {folders.map((folder, idx) => (
                <button 
                  key={`folder-${idx}`}
                  onClick={() => setCurrentPath(currentPath ? `${currentPath}/${folder}` : folder)}
                  className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group"
                >
                  <FolderOpen className="h-10 w-10 text-brand-200 group-hover:text-brand-400 mb-2" />
                  <span className="text-xs font-bold text-gray-700 truncate w-full text-center">{folder}</span>
                </button>
              ))}

              {/* Images */}
              {filteredImages.map((img, idx) => (
                <button 
                  key={`img-${idx}`}
                  onClick={() => {
                    onSelect(img.url);
                    onClose();
                  }}
                  className="group relative aspect-square bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-brand-500 hover:ring-2 hover:ring-brand-500/20 transition-all text-left"
                >
                  <img 
                    src={img.url} 
                    alt={img.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 backdrop-blur-sm border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-medium text-gray-700 truncate">{img.name}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">Cartella vuota</p>
              {currentPath && (
                <button onClick={navigateUp} className="mt-4 text-brand-600 font-bold text-sm hover:underline">Torna su</button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
