'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useTheaterPosts(userProfile: any, currentLang: 'fa' | 'en', setAuthUserProfile: any) {
  const [posts, setPosts] = useState<any[]>([]);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaName, setMediaName] = useState('');
  const [postCategory, setPostCategory] = useState<'educational' | 'rehearsal' | 'improvisation' | 'etude'>('rehearsal');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedDetailPost, setSelectedDetailPost] = useState<any | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editCaptionText, setEditCaptionText] = useState('');
  const [targetProfileUser, setTargetProfileUser] = useState<any | null>(null);

  useEffect(() => {
    const local = localStorage.getItem('tg_local_posts');
    if (local) setPosts(JSON.parse(local));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (!supabase) return;
      const { data } = await supabase.from('theater_posts').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setPosts(data);
        localStorage.setItem('tg_local_posts', JSON.stringify(data));
      }
    } catch (e) {}
  };

  const saveLocalPosts = (updatedPosts: any[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('tg_local_posts', JSON.stringify(updatedPosts));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');
    if (file) {
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 60) {
            setUploadError(currentLang === 'fa' ? '❌ خطا: مدت زمان ویدیو نمی‌تواند بیش از ۱ دقیقه باشد.' : '❌ Error: Video cannot exceed 1 minute.');
            setSelectedFile(null);
            setMediaName('');
          } else {
            setSelectedFile(file);
            setMediaName(file.name);
          }
        };
        video.src = URL.createObjectURL(file);
      } else {
        setSelectedFile(file);
        setMediaName(file.name);
      }
    }
  };

  const handlePublish = async (setLoading: (b: boolean) => void) => {
    if (!caption && !selectedFile) return;
    setLoading(true);
    setUploadStatus(currentLang === 'fa' ? 'در حال ارسال...' : 'Sending...');

    const convertToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = e => reject(e);
      });
    };

    let finalMediaUrl = '';
    if (selectedFile) {
      try { finalMediaUrl = await convertToBase64(selectedFile); } catch (err) { finalMediaUrl = URL.createObjectURL(selectedFile); }
    }

    const newPost = {
      id: 'post-' + Date.now(), caption, video_url: finalMediaUrl, likes: 0,
      artist_name: userProfile.name, username: userProfile.username, category: postCategory, status: 'pending', created_at: new Date().toISOString()
    };

    const updated = [newPost, ...posts];
    saveLocalPosts(updated);

    try {
      await supabase.from('theater_posts').insert([
        { caption, video_url: finalMediaUrl, likes: 0, artist_name: userProfile.name, username: userProfile.username, category: postCategory, status: 'pending' }
      ]);
    } catch (err) {}

    setCaption('');
    setSelectedFile(null);
    setMediaName('');
    setUploadStatus(currentLang === 'fa' ? '✓ منتقل شد.' : '✓ Sent.');
    setLoading(false);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  const handleDeletePost = async (id: string) => {
    if (confirm(currentLang === 'fa' ? 'آیا مطمئن هستید؟' : 'Are you sure?')) {
      const updated = posts.filter(p => p.id !== id);
      saveLocalPosts(updated);
      try { await supabase.from('theater_posts').delete().eq('id', id); } catch (e) {}
    }
  };

  const handleSavePostEdit = async (id: string) => {
    const updated = posts.map(p => p.id === id ? { ...p, caption: editCaptionText } : p);
    saveLocalPosts(updated);
    setEditingPostId(null);
    try { await supabase.from('theater_posts').update({ caption: editCaptionText }).eq('id', id); } catch (e) {}
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const updated = posts.map(p => p.id === id ? { ...p, status } : p).filter(p => p.status !== 'rejected');
    saveLocalPosts(updated);
    try { await supabase.from('theater_posts').update({ status }).eq('id', id); } catch (e) {}
  };

  return {
    posts, caption, setCaption, mediaName, postCategory, setPostCategory, uploadStatus, uploadError,
    searchQuery, setSearchQuery, selectedCategoryFilter, setSelectedCategoryFilter, selectedDetailPost,
    setSelectedDetailPost, editingPostId, setEditingPostId, editCaptionText, setEditCaptionText,
    targetProfileUser, setTargetProfileUser, handleFileChange, handlePublish, handleDeletePost,
    handleSavePostEdit, handleUpdateStatus
  };
}
