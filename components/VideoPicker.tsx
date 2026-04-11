import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { X, Loader2, Video as VideoIcon, Search, RefreshCw, FolderOpen } from 'lucide-react';

interface VideoPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  bucketName?: string;
}

export const VideoPicker: React.FC<VideoPickerProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  bucketName = 'course-videos' 
}) => {
  const [videos, setVideos] = useState<{ name: string; path: string }[]>([]);
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
        const newVideos: { name: string; path: string }[] = [];

        data.forEach(file => {
          if (file.name === '.emptyFolderPlaceholder') return;
          
          if (!file.id) {
            newFolders.push(file.name);
          } else {
            const filePath = path ? `${path}/${file.name}` : file.name;
            newVideos.push({ name: file.name, path: filePath });
          }
        });
        
        setFolders(newFolders);
        setVideos(newVideos);
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

  const filteredVideos = videos.filter(vid => 
    vid.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <VideoIcon className="h-5 w-5 text-brand-600" />
              Libreria Video
            </h3>
            <p className="text-xs text-gray-500">Sfoglia i video caricati nello storage</p>
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
          ) : (folders.length > 0 || filteredVideos.length > 0) ? (
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

              {/* Videos */}
              {filteredVideos.map((vid, idx) => (
                <button 
                  key={`vid-${idx}`}
                  onClick={() => {
                    onSelect(vid.path);
                    onClose();
                  }}
                  className="group relative aspect-square bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-brand-500 hover:ring-2 hover:ring-brand-500/20 transition-all text-left flex flex-col items-center justify-center p-2"
                >
                  <VideoIcon className="h-12 w-12 text-gray-300 group-hover:text-brand-400 mb-2 transition-colors" />
                  <p className="text-[10px] font-medium text-gray-700 truncate w-full text-center">{vid.name}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <VideoIcon className="h-12 w-12 mb-2 opacity-20" />
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
