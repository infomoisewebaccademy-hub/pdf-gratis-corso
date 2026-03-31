
import React, { useState, useEffect, useRef } from 'react';
import { Course, Lesson } from '../types';
import { Save, ArrowLeft, Trash, Plus, Image as ImageIcon, Layout, DollarSign, Video, GripVertical, X, Book, Sparkles, AlertCircle, Fingerprint, UploadCloud, FileText, ExternalLink, Loader2, CheckCircle2, Star, Bold, Underline } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ImagePicker } from '../components/ImagePicker';

interface AdminEditCourseProps {
  courses: Course[];
  onSave: (course: Course) => void;
}

export const AdminEditCourse: React.FC<AdminEditCourseProps> = ({ courses, onSave }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Course>>({
    id: '',
    title: '',
    description: '',
    price: 0,
    discounted_price: 0,
    image: '',
    level: 'Principiante',
    features: [''],
    lessons: 0,
    duration: '',
    lessons_content: [],
    status: 'active',
    is_hidden: false,
    resource_file_url: '',
    resource_file_name: '',
    rating: 5,
    show_discount_badge: true,
    upsell_course_id: '',
    show_features: true,
  });

  const [imgError, setImgError] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({ title: '', description: '', videoUrl: '', video_storage_path: '' });
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState<number | null>(null); // -1 per nuova lezione, altrimenti index

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>, lessonIndex: number) => {
    const file = event.target.files?.[0];
    const courseId = isNew ? formData.id : id;

    if (!file || !courseId) {
        if (!courseId) alert("Per favore, imposta prima un 'ID Corso' per poter caricare file.");
        return;
    }

    setIsUploadingVideo(lessonIndex);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${courseId}/videos/${fileName}`;
        const { error } = await supabase.storage.from('course-videos').upload(filePath, file, { upsert: true });
        if (error) throw error;

        if (lessonIndex === -1) { // Nuova lezione
            setNewLesson(prev => ({ ...prev, video_storage_path: filePath }));
        } else { // Lezione esistente
            const updatedLessons = [...(formData.lessons_content || [])];
            updatedLessons[lessonIndex].video_storage_path = filePath;
            setFormData(prev => ({ ...prev, lessons_content: updatedLessons }));
        }
    } catch (err: any) {
        console.error("Errore upload video:", err);
        const msg = err.message || '';
        if (msg.includes('row-level security')) {
            alert('Errore di permessi (RLS): Esegui lo script SQL per configurare le policy del bucket "course-videos".');
        } else {
            alert("Errore upload video: " + err.message);
        }
    } finally {
        setIsUploadingVideo(null);
    }
  };

  const handleVideoRemove = async (lessonIndex: number) => {
    const lesson = formData.lessons_content?.[lessonIndex];
    if (!lesson || !lesson.video_storage_path) return;
    if (!confirm("Sei sicuro di voler rimuovere questo video? L'azione è permanente.")) return;

    try {
        await supabase.storage.from('course-videos').remove([lesson.video_storage_path]);
        const updatedLessons = [...(formData.lessons_content || [])];
        updatedLessons[lessonIndex].video_storage_path = undefined;
        setFormData(prev => ({ ...prev, lessons_content: updatedLessons }));
    } catch (err: any) {
        alert("Errore rimozione video: " + err.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const courseId = isNew ? formData.id : id;

    if (!file || !courseId) {
        if (!courseId) alert("Per favore, imposta prima un 'ID Corso' per poter caricare l'immagine.");
        return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${courseId}/covers/${fileName}`;

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
        alert('Errore di permessi (RLS): Esegui lo script SQL per configurare le policy del bucket "course-images".');
      } else {
        alert('Errore durante il caricamento dell\'immagine: ' + error.message);
      }
    } finally {
      setIsUploadingImage(false);
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

  useEffect(() => {
    if (!isNew && id) {
      const courseToEdit = courses.find(c => c.id === id);
      if (courseToEdit) {
        setFormData({
            ...courseToEdit,
            lessons_content: courseToEdit.lessons_content || [],
            discounted_price: courseToEdit.discounted_price || 0,
            status: courseToEdit.status || 'active',
            is_hidden: courseToEdit.is_hidden || false,
            resource_file_url: courseToEdit.resource_file_url || '',
            resource_file_name: courseToEdit.resource_file_name || '',
            rating: courseToEdit.rating || 5,
            show_discount_badge: courseToEdit.show_discount_badge !== undefined ? courseToEdit.show_discount_badge : true,
            upsell_course_id: courseToEdit.upsell_course_id || '',
            show_features: courseToEdit.show_features !== false,
        });
      }
    } else {
        setFormData({
            id: '', title: '', description: '', price: 0, discounted_price: 0,
            image: 'https://picsum.photos/800/600?random=' + Math.floor(Math.random() * 100),
            level: 'Principiante', features: [''], lessons: 0, duration: '',
            lessons_content: [], status: 'active', is_hidden: false, resource_file_url: '', resource_file_name: '',
            rating: 5, show_discount_badge: true, upsell_course_id: '', show_features: true,
        });
    }
  }, [id, courses, isNew]);

  useEffect(() => { setImgError(false); }, [formData.image]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || (isNew && !formData.id)) {
        alert("ID Corso e Titolo sono obbligatori."); return;
    }
    if (formData.discounted_price && formData.discounted_price >= formData.price) {
        alert("Il prezzo fedeltà deve essere inferiore al prezzo standard."); return;
    }
    const courseToSave = {
      ...formData,
      id: isNew ? formData.id : id,
      features: formData.features?.filter(f => f.trim() !== '') || [],
      lessons: formData.lessons_content?.length || 0,
      lessons_content: (formData.lessons_content || []).map(l => ({...l, videoUrl: l.video_storage_path ? '' : l.videoUrl})),
      discounted_price: formData.discounted_price || null,
      status: formData.status || 'active',
      is_hidden: formData.is_hidden || false,
      resource_file_url: formData.resource_file_url || null,
      resource_file_name: formData.resource_file_name || null,
      rating: formData.rating || 5,
      show_discount_badge: formData.show_discount_badge !== undefined ? formData.show_discount_badge : true,
      upsell_course_id: formData.upsell_course_id || null,
      show_features: formData.show_features !== false,
    } as Course;
    onSave(courseToSave);
    navigate('/admin');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const courseId = isNew ? formData.id : id;

    if (!file || !courseId) {
        if (!courseId) alert("Per favore, imposta prima un 'ID Corso' per poter caricare file.");
        return;
    }
    
    setIsUploadingFile(true);
    try {
        const filePath = `${courseId}/${file.name}`;
        const { error } = await supabase.storage.from('course-resources').upload(filePath, file, { upsert: true });
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage.from('course-resources').getPublicUrl(filePath);
        setFormData({ ...formData, resource_file_url: publicUrl, resource_file_name: file.name });
    } catch (err: any) { 
        console.error("Errore upload file:", err);
        const msg = err.message || '';
        if (msg.includes('row-level security')) {
            alert('Errore di permessi (RLS): Esegui lo script SQL per configurare le policy del bucket "course-resources".');
        } else {
            alert("Errore upload: " + err.message); 
        }
    } 
    finally { setIsUploadingFile(false); }
  };
  
  const handleFileRemove = async () => {
      if (!formData.resource_file_url) return;
      if (!confirm("Sei sicuro di voler rimuovere questo file? L'azione è permanente.")) return;

      setIsUploadingFile(true);
      try {
          const filePath = new URL(formData.resource_file_url).pathname.split('/course-resources/')[1];
          if (!filePath) throw new Error("Percorso file non valido");
          
          await supabase.storage.from('course-resources').remove([decodeURIComponent(filePath)]);
          setFormData({ ...formData, resource_file_url: '', resource_file_name: '' });
      } catch (err: any) { alert("Errore rimozione file: " + err.message); }
      finally { setIsUploadingFile(false); }
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])]; newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };
  const addFeature = () => setFormData({ ...formData, features: [...(formData.features || []), ''] });
  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])]; newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };
  const addLesson = () => {
    if (!newLesson.title) return;
    const lesson: Lesson = { id: `lesson_${Date.now()}`, title: newLesson.title || 'Nuova Lezione', description: newLesson.description || '', videoUrl: newLesson.videoUrl || '', video_storage_path: newLesson.video_storage_path, duration: '10:00' };
    setFormData({ ...formData, lessons_content: [...(formData.lessons_content || []), lesson] });
    setNewLesson({ title: '', description: '', videoUrl: '', video_storage_path: '' }); setIsAddingLesson(false);
  };
  const removeLesson = (index: number) => {
    const updated = [...(formData.lessons_content || [])]; updated.splice(index, 1);
    setFormData({ ...formData, lessons_content: updated });
  };
  const updateLesson = (index: number, field: keyof Lesson, value: string) => {
    const updated = [...(formData.lessons_content || [])]; updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, lessons_content: updated });
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50 pb-20">
      <form onSubmit={handleSubmit} className="w-full px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
                <button type="button" onClick={() => navigate('/admin')} className="mr-4 p-2 rounded-full hover:bg-gray-200 text-gray-500"><ArrowLeft className="h-6 w-6" /></button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{isNew ? 'Crea Nuovo Corso' : 'Modifica Corso'}</h1>
                    <p className="text-gray-500 text-sm">{isNew ? 'Compila i campi per creare un nuovo prodotto.' : `Modifica dettagli per: ${formData.title}`}</p>
                </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
                <button type="button" onClick={() => navigate('/admin')} className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-100">Annulla</button>
                <button type="submit" className="flex-1 sm:flex-none px-6 py-3 bg-brand-600 text-white rounded-lg font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 flex items-center justify-center"><Save className="h-5 w-5 mr-2" />{isNew ? 'Pubblica' : 'Salva'}</button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Layout className="h-5 w-5 mr-2 text-brand-600" /> Informazioni Generali</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Corso (Identificativo Unico)</label>
                            <input type="text" required value={formData.id} onChange={e => setFormData({...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '_')})} className={`block w-full border rounded-lg p-3 font-mono text-sm ${!isNew ? 'bg-gray-100 text-gray-500' : 'border-gray-300'}`} placeholder="es. corso_base_ai" disabled={!isNew} />
                            <p className="text-xs text-gray-500 mt-1">{!isNew ? "L'ID non può essere modificato." : "Importante: non potrà essere modificato. Usa lettere, numeri, underscore."}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo del Corso</label>
                            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 text-lg" placeholder="Es. Master in React..." />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Descrizione Completa</label>
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
                                rows={8} 
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})} 
                                className="block w-full border border-gray-300 rounded-lg p-3" 
                                placeholder="Descrivi cosa impareranno gli studenti... (Usa i pulsanti sopra per formattare)" 
                            />
                        </div>
                    </div>
                </div>

                {/* NUOVA SEZIONE MATERIALE DIDATTICO */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><FileText className="h-5 w-5 mr-2 text-brand-600" /> Materiale Didattico</h2>
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6">
                        {isUploadingFile ? (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <Loader2 className="h-8 w-8 animate-spin text-brand-500 mb-2"/>
                                <span className="text-sm font-bold">Caricamento...</span>
                            </div>
                        ) : formData.resource_file_url ? (
                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-2">File caricato:</p>
                                <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="h-5 w-5 flex-shrink-0"/>
                                        <span className="font-bold text-sm truncate">{formData.resource_file_name}</span>
                                    </div>
                                    <a href={formData.resource_file_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 p-1"><ExternalLink className="h-4 w-4"/></a>
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50">Sostituisci</button>
                                    <button type="button" onClick={handleFileRemove} className="text-sm bg-red-50 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-100 flex items-center gap-1"><Trash className="h-4 w-4"/> Rimuovi</button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <UploadCloud className="mx-auto h-10 w-10 text-gray-300 mb-2"/>
                                <h4 className="font-bold text-gray-800">Carica file</h4>
                                <p className="text-xs text-gray-500 mb-4">Allega un PDF, ZIP o altro materiale per gli studenti.</p>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-brand-50 text-brand-700 px-4 py-2 rounded-lg font-bold hover:bg-brand-100 text-sm" disabled={isNew && !formData.id}>Seleziona File</button>
                                {(isNew && !formData.id) && <p className="text-red-500 text-xs mt-2">Salva il corso o imposta un ID prima di caricare.</p>}
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center"><Video className="h-5 w-5 mr-2 text-brand-600" /> Piano di Studi ({formData.lessons_content?.length || 0})</h2>
                        {!isAddingLesson && <button type="button" onClick={() => setIsAddingLesson(true)} className="text-sm bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg font-bold hover:bg-brand-100 flex items-center"><Plus className="h-4 w-4 mr-1" /> Aggiungi Lezione</button>}
                    </div>
                    {isAddingLesson && (
                        <div className="bg-brand-50/50 border border-brand-100 rounded-lg p-4 mb-6">
                            <div className="flex justify-between items-center mb-3"><h4 className="font-bold text-sm text-brand-800">Nuova Lezione</h4><button type="button" onClick={() => setIsAddingLesson(false)}><X className="h-4 w-4 text-gray-400 hover:text-gray-600"/></button></div>
                            <div className="space-y-3">
                                <input type="text" placeholder="Titolo Lezione" className="w-full border border-gray-300 rounded p-2 text-sm" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} />
                                <div className="w-full bg-white border border-gray-300 rounded p-2 text-sm">
                                    <label className="text-xs font-bold text-gray-500">Video Lezione (Carica File)</label>
                                    <input type="file" accept="video/*" onChange={(e) => handleVideoUpload(e, -1)} className="w-full text-xs" />
                                </div>
                                <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div><div className="relative flex justify-center text-xs"><span className="bg-brand-50/50 px-2 text-gray-500">o</span></div></div>
                                <input type="text" placeholder="URL Video Esterno (es. YouTube)" className="w-full border border-gray-300 rounded p-2 text-sm font-mono" value={newLesson.videoUrl} onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})} />
                                <textarea placeholder="Breve descrizione" className="w-full border border-gray-300 rounded p-2 text-sm" rows={2} value={newLesson.description} onChange={e => setNewLesson({...newLesson, description: e.target.value})} />
                                <button type="button" onClick={addLesson} disabled={!newLesson.title} className="w-full bg-brand-600 text-white py-2 rounded font-bold text-sm hover:bg-brand-700 disabled:opacity-50">Conferma</button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-3">
                        {(!formData.lessons_content || formData.lessons_content.length === 0) && !isAddingLesson && <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">Nessuna lezione inserita.</div>}
                        {formData.lessons_content?.map((lesson, idx) => (
                            <div key={idx} className="border border-gray-100 rounded-lg p-4 bg-gray-50/30 group hover:bg-white">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 text-gray-300 cursor-move"><GripVertical className="h-5 w-5" /></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2"><span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded">{idx + 1}</span><input type="text" value={lesson.title} onChange={e => updateLesson(idx, 'title', e.target.value)} className="font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-brand-500 w-full" /></div>
                                         <div className="text-xs text-gray-500 w-full bg-transparent border-b border-transparent hover:border-gray-200 focus-within:border-brand-300 rounded p-1">
                                            <input type="text" value={lesson.videoUrl} onChange={e => updateLesson(idx, 'videoUrl', e.target.value)} placeholder="URL video..." className="w-full bg-transparent font-mono" />
                                         </div>
                                         <div className="text-xs text-gray-500 w-full bg-transparent border border-transparent hover:border-gray-200 rounded p-1">
                                            {lesson.video_storage_path ? (
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono text-green-600 truncate">{lesson.video_storage_path.split('/').pop()}</span>
                                                    <button type="button" onClick={() => handleVideoRemove(idx)} className="text-red-400 hover:text-red-600 p-1"><X className="h-3 w-3" /></button>
                                                </div>
                                            ) : isUploadingVideo === idx ? (
                                                <div className='flex items-center gap-2 text-blue-500'><Loader2 className="h-3 w-3 animate-spin"/> Caricamento...</div>
                                            ) : (
                                                <input type="file" accept="video/*" onChange={(e) => handleVideoUpload(e, idx)} className="w-full text-xs" />
                                            )}
                                         </div>
                                    </div>
                                    <button type="button" onClick={() => removeLesson(idx)} className="text-gray-400 hover:text-red-500 p-1"><Trash className="h-4 w-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><AlertCircle className="h-5 w-5 mr-2 text-brand-600" /> Disponibilità</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                            <select value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value as any})} className="block w-full border border-gray-300 rounded-lg p-3 font-semibold"><option value="active">Attivo</option><option value="full">Pieno</option><option value="coming_soon">In Arrivo</option></select>
                            <p className="mt-2 text-xs text-gray-500">{formData.status === 'full' && "Acquisto disabilitato."}{formData.status === 'coming_soon' && "Acquisto disabilitato."}{formData.status === 'active' && "Corso acquistabile."}</p>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Nascondi dal Catalogo</label>
                                <p className="text-xs text-gray-500">Il corso sarà accessibile solo tramite link diretto.</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setFormData({...formData, is_hidden: !formData.is_hidden})}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.is_hidden ? 'bg-brand-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_hidden ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><DollarSign className="h-5 w-5 mr-2 text-brand-600" /> Prezzi & Offerte</h2>
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo Standard (€)</label>
                            <input type="number" required min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="block w-full border border-gray-300 rounded-lg p-3 font-bold text-lg" />
                         </div>
                         <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                             <label className="block text-sm font-bold text-purple-800 mb-1 flex items-center"><Sparkles className="h-3 w-3 mr-1" /> Prezzo Fedeltà</label>
                             <p className="text-xs text-purple-600 mb-2">Prezzo per chi ha già acquistato. Lascia 0 per disattivare.</p>
                             <input type="number" min="0" step="0.01" value={formData.discounted_price || 0} onChange={e => setFormData({...formData, discounted_price: Number(e.target.value)})} className="block w-full border border-purple-200 rounded-lg p-2 font-bold text-purple-700" />
                         </div>
                         <hr className="border-gray-100" />
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Corso Upsell (Opzionale)</label>
                            <select 
                                value={formData.upsell_course_id || ''} 
                                onChange={e => setFormData({...formData, upsell_course_id: e.target.value})} 
                                className="block w-full border border-gray-300 rounded-lg p-3 text-sm"
                            >
                                <option value="">Nessun Upsell</option>
                                {courses
                                    .filter(c => c.id !== id)
                                    .map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))
                                }
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1">Verrà mostrato come offerta speciale se questo è il percorso gratuito.</p>
                         </div>
                         <hr className="border-gray-100" />
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Livello</label>
                            <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as any})} className="block w-full border border-gray-300 rounded-lg p-3"><option>Principiante</option><option>Intermedio</option><option>Avanzato</option></select>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                             <div><label className="block text-sm font-medium mb-1">Durata</label><input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="block w-full border rounded-lg p-2 text-sm" /></div>
                             <div><label className="block text-sm font-medium mb-1">Lezioni (Auto)</label><input type="number" disabled value={formData.lessons_content?.length || 0} className="block w-full bg-gray-50 border text-gray-500 rounded-lg p-2 text-sm" /></div>
                         </div>
                         <hr className="border-gray-100" />
                         <div className="space-y-3">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-current" /> Valutazione (Stelle)</label>
                                 <input 
                                     type="number" 
                                     min="1" 
                                     max="5" 
                                     step="0.1" 
                                     value={formData.rating || 5} 
                                     onChange={e => setFormData({...formData, rating: Number(e.target.value)})} 
                                     className="block w-full border border-gray-300 rounded-lg p-2 text-sm font-bold" 
                                 />
                                 <p className="text-[10px] text-gray-400 mt-1 italic">Valore da 1.0 a 5.0</p>
                             </div>
                             <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                                 <label className="text-sm font-medium text-gray-700">Mostra Badge Sconto</label>
                                 <button 
                                     type="button" 
                                     onClick={() => setFormData({...formData, show_discount_badge: !formData.show_discount_badge})}
                                     className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${formData.show_discount_badge ? 'bg-green-600' : 'bg-gray-200'}`}
                                 >
                                     <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${formData.show_discount_badge ? 'translate-x-6' : 'translate-x-1'}`} />
                                 </button>
                             </div>
                         </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center"><CheckCircle2 className="h-5 w-5 mr-2 text-brand-600" /> Cosa Imparerai</h2>
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
                            <span className="ml-2 text-sm text-gray-600 font-medium">Mostra Sezione</span>
                        </label>
                    </div>
                    {formData.show_features !== false && (
                        <div className="space-y-3">
                            {formData.features?.map((feat, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input type="text" value={feat} onChange={e => updateFeature(idx, e.target.value)} className="flex-1 block w-full border border-gray-300 rounded-lg p-3" placeholder="Es. Creare un sito web da zero..." />
                                    <button type="button" onClick={() => removeFeature(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"><Trash className="h-4 w-4" /></button>
                                </div>
                            ))}
                            <button type="button" onClick={addFeature} className="text-sm bg-brand-50 text-brand-700 px-4 py-2 rounded-lg font-bold hover:bg-brand-100 flex items-center"><Plus className="h-4 w-4 mr-2" /> Aggiungi Punto</button>
                        </div>
                    )}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><ImageIcon className="h-5 w-5 mr-2 text-brand-600" /> Copertina</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer bg-brand-50 text-brand-700 px-4 py-2 rounded-lg font-bold hover:bg-brand-100 text-sm flex items-center gap-2">
                                {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                                Carica Immagine
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage || (isNew && !formData.id)} />
                            </label>
                            <button 
                                type="button" 
                                onClick={() => setIsPickerOpen(true)}
                                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 text-sm flex items-center gap-2"
                            >
                                <ImageIcon className="h-4 w-4" />
                                Libreria
                            </button>
                            {isNew && !formData.id && <p className="text-red-500 text-[10px]">Imposta ID prima.</p>}
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                            <div className="relative flex justify-center text-[10px]"><span className="bg-white px-2 text-gray-400 uppercase tracking-widest">oppure URL</span></div>
                        </div>
                        <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="block w-full border rounded-lg p-2 text-xs" placeholder="URL Immagine..." />
                        <div className={`relative w-full h-40 bg-gray-50 rounded-lg overflow-hidden border flex items-center justify-center ${imgError ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                            {formData.image && !imgError ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={() => setImgError(true)} /> : <ImageIcon className="h-10 w-10 text-gray-300" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </form>

      <ImagePicker 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onSelect={(url) => setFormData({ ...formData, image: url })} 
      />
    </div>
  );
};
