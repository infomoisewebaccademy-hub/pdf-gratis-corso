
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { X, Save, Plus, Trash, Upload, Bold, Underline, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../services/supabase';
import { ImagePicker } from './ImagePicker';

interface CourseFormProps {
  initialData?: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  allCourses?: Course[]; // Aggiunto per l'upsell
}

export const CourseForm: React.FC<CourseFormProps> = ({ initialData, isOpen, onClose, onSave, allCourses = [] }) => {
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    price: 0,
    image: '',
    level: 'Principiante',
    features: [''],
    lessons: 0,
    duration: '',
    upsell_course_id: '',
    show_features: true,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        upsell_course_id: initialData.upsell_course_id || '',
        show_features: initialData.show_features !== false,
      });
    } else {
      // Reset for new course
      setFormData({
        title: '',
        description: '',
        price: 0,
        image: 'https://picsum.photos/800/600?random=' + Math.floor(Math.random() * 100),
        level: 'Principiante',
        features: [''],
        lessons: 0,
        duration: '',
        upsell_course_id: '',
        show_features: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `course-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image: publicUrl });
    } catch (error: any) {
      console.error('Errore caricamento immagine:', error);
      const msg = error.message || '';
      if (msg.includes('row-level security')) {
        alert('Errore di permessi (RLS): Esegui lo script SQL fornito per configurare le policy del bucket "course-images".');
      } else {
        alert('Errore durante il caricamento dell\'immagine. Assicurati che il bucket "course-images" esista e sia pubblico.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const applyFormatting = (tag: 'b' | 'u') => {
    if (!descriptionRef.current) return;
    
    const textarea = descriptionRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const openTag = `<${tag}>`;
    const closeTag = `</${tag}>`;
    
    const newText = text.substring(0, start) + openTag + selectedText + closeTag + text.substring(end);
    
    setFormData({ ...formData, description: newText });
    
    // Ripristina il focus e la selezione
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, end + openTag.length);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.title || !formData.price) return;
    
    onSave({
      ...formData,
      id: initialData?.id || `course_${Date.now()}`, // Generate ID if new
      features: formData.features?.filter(f => f.trim() !== '') || []
    } as Course);
    
    onClose();
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...(formData.features || []), ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                  {initialData ? 'Modifica Corso' : 'Crea Nuovo Corso'}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Titolo Corso</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Prezzo (€)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                 </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Descrizione</label>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => applyFormatting('b')}
                      className="p-1 hover:bg-gray-100 rounded border border-gray-200 text-gray-600"
                      title="Grassetto"
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => applyFormatting('u')}
                      className="p-1 hover:bg-gray-100 rounded border border-gray-200 text-gray-600"
                      title="Sottolineato"
                    >
                      <Underline className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <textarea 
                  ref={descriptionRef}
                  rows={6}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Usa i pulsanti sopra per formattare il testo..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Livello</label>
                    <select 
                      value={formData.level}
                      onChange={e => setFormData({...formData, level: e.target.value as any})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option>Principiante</option>
                      <option>Intermedio</option>
                      <option>Avanzato</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Durata (es. "10 Ore")</label>
                    <input 
                      type="text"
                      value={formData.duration}
                      onChange={e => setFormData({...formData, duration: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">N. Lezioni</label>
                    <input 
                      type="number"
                      value={formData.lessons}
                      onChange={e => setFormData({...formData, lessons: Number(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Corso Upsell (Opzionale)</label>
                    <select 
                      value={formData.upsell_course_id}
                      onChange={e => setFormData({...formData, upsell_course_id: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="">Nessun Upsell</option>
                      {allCourses
                        .filter(c => c.id !== initialData?.id)
                        .map(course => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))
                      }
                    </select>
                    <p className="text-[10px] text-gray-400 mt-1">Verrà mostrato come offerta speciale se questo è il percorso gratuito.</p>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Immagine Copertina</label>
                    <div className="mt-1 flex items-center gap-3">
                      <label className="cursor-pointer bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Carica Immagine
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setIsPickerOpen(true)}
                        className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Libreria
                      </button>
                      {formData.image && (
                        <div className="h-10 w-10 rounded border border-gray-200 overflow-hidden">
                          <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                 </div>
              </div>

              <div className="hidden">
                <label className="block text-sm font-medium text-gray-700">URL Immagine (Manuale)</label>
                <input 
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Cosa Imparerai (Features)</label>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={formData.show_features !== false}
                        onChange={(e) => setFormData({...formData, show_features: e.target.checked})}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${formData.show_features !== false ? 'bg-brand-500' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.show_features !== false ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">Mostra Sezione</span>
                  </label>
                </div>
                
                {formData.show_features !== false && (
                  <>
                    {formData.features?.map((feat, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={feat}
                          onChange={e => updateFeature(idx, e.target.value)}
                          className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                          placeholder={`Punto ${idx + 1}`}
                        />
                        <button type="button" onClick={() => removeFeature(idx)} className="text-red-500 hover:text-red-700 p-2">
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addFeature} className="text-sm text-brand-600 font-medium flex items-center mt-2 hover:text-brand-800">
                      <Plus className="h-4 w-4 mr-1" /> Aggiungi punto
                    </button>
                  </>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Annulla
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-brand-700 flex items-center">
                  <Save className="h-4 w-4 mr-2" /> Salva Corso
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ImagePicker 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onSelect={(url) => setFormData({ ...formData, image: url })} 
      />
    </div>
  );
};
