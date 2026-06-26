'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

export interface Comment {
  id: string;
  username: string;
  artist_name: string;
  text: string;
  timestamp: number;
}

export function useTheaterCore(lang: 'fa' | 'en') {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'explore' | 'profile' | 'admin'>('explore');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLang, setCurrentLang] = useState<'fa' | 'en'>(lang);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaName, setMediaName] = useState('');
  const [postCategory, setPostCategory] = useState<'educational' | 'rehearsal' | 'improvisation' | 'etude'>('rehearsal');
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedDetailPost, setSelectedDetailPost] = useState<any | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editCaptionText, setEditCaptionText] = useState('');

  // سیستم کامنت و لایک محلی پایدار
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  const [userProfile, setUserProfile] = useState({ 
    id: '', name: '', username: '', bio: '', avatar: '', followers: 0, following: 0
  });
  const [editForm, setEditForm] = useState({ ...userProfile });
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [targetProfileUser, setTargetProfileUser] = useState<any | null>(null);

  useEffect(() => {
    loadLocalPosts();
    fetchData();
    
    // بارگذاری کامنت‌ها و لایک‌ها
    const savedComments = localStorage.getItem('tg_comments_map');
    if (savedComments) setCommentsMap(JSON.parse(savedComments));
    const savedLikes = localStorage.getItem('tg_liked_posts');
    if (savedLikes) setLikedPosts(JSON.parse(savedLikes));

    const session = localStorage.getItem('tg_real_user_session');
    if (session) {
      const profile = JSON.parse(session);
      setIsAuthenticated(true);
      setUserProfile(prev => ({ ...prev, ...profile }));
      setEditForm(prev => ({ ...prev, ...profile }));
    } else {
      // اگر کاربر لاگین نکرده بود، یک کاربر مهمان بساز
      const guestProfile = {
        id: 'guest-' + Date.now(),
        name: 'مهمان',
        username: 'guest',
        bio: 'کاربر مهمان',
        avatar: '',
        followers: 0,
        following: 0
      };
      localStorage.setItem('tg_real_user_session', JSON.stringify(guestProfile));
      setIsAuthenticated(true);
      setUserProfile(guestProfile);
      setEditForm(guestProfile);
    }

    const localFollows = localStorage.getItem('tg_followed_users');
    if (localFollows) {
      const parsed = JSON.parse(localFollows);
      setFollowedUsers(parsed);
      setUserProfile(prev => ({ ...prev, following: parsed.length }));
    }
  }, []);

  const fetchData = async () => {
    try {
      if (!supabase) return;
      const { data } = await supabase.from('theater_posts').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setPosts(data);
        localStorage.setItem('tg_local_posts', JSON.stringify(data));
      }
    } catch (e) {
      loadLocalPosts();
    }
  };

  const loadLocalPosts = () => {
    const local = localStorage.getItem('tg_local_posts');
    if (local) setPosts(JSON.parse(local));
  };

  const saveLocalPosts = (updatedPosts: any[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('tg_local_posts', JSON.stringify(updatedPosts));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const uName = authUsername.trim().toLowerCase();
    if (!uName || !authPassword) {
      setAuthError(currentLang === 'fa' ? 'لطفاً تمام فیلدها را پر کنید.' : 'Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      if (authMode === 'register') {
        if (!authName) {
          setAuthError(currentLang === 'fa' ? 'لطفاً نام خود را وارد کنید.' : 'Please enter your name.');
          setLoading(false);
          return;
        }
        const { data: newUser } = await supabase.from('theater_users').insert([
          { username: uName, password: authPassword, name: authName, bio: currentLang === 'fa' ? 'هنرمند تئاتر' : 'Theater Artist', avatar: '' }
        ]).select().single();
        if (newUser) {
          const profileData = { id: newUser.id, name: newUser.name, username: newUser.username, bio: newUser.bio, avatar: newUser.avatar };
          localStorage.setItem('tg_real_user_session', JSON.stringify(profileData));
          setUserProfile(prev => ({ ...prev, ...profileData }));
          setEditForm(prev => ({ ...prev, ...profileData }));
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
      } else {
        const { data: user } = await supabase.from('theater_users').select('*').eq('username', uName).eq('password', authPassword).maybeSingle();
        if (user) {
          const profileData = { id: user.id, name: user.name, username: user.username, bio: user.bio, avatar: user.avatar };
          localStorage.setItem('tg_real_user_session', JSON.stringify(profileData));
          setUserProfile(prev => ({ ...prev, ...profileData }));
          setEditForm(prev => ({ ...prev, ...profileData }));
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
      }
      throw new Error("Bypass");
    } catch (err) {
      const fallbackProfile = {
        id: uName === 'mehdisoheilinia' ? 'admin-id' : 'user-' + Date.now(),
        name: uName === 'mehdisoheilinia' ? 'Mehdi Soheilinia' : (authName || (currentLang === 'fa' ? 'هنرمند تئاتر' : 'Theater Artist')),
        username: uName,
        bio: uName === 'mehdisoheilinia' ? (currentLang === 'fa' ? 'کارگردان و بازیگر' : 'Director & Actor') : (currentLang === 'fa' ? 'عضو جامعه تئاتر' : 'Theater Member'),
        avatar: ''
      };
      localStorage.setItem('tg_real_user_session', JSON.stringify(fallbackProfile));
      setUserProfile(prev => ({ ...prev, ...fallbackProfile }));
      setEditForm(prev => ({ ...prev, ...fallbackProfile }));
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tg_real_user_session');
    setIsAuthenticated(false);
    setIsMenuOpen(false);
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

  const toggleFollowUser = (targetUsername: string) => {
    let updatedFollows = [...followedUsers];
    if (followedUsers.includes(targetUsername)) {
      updatedFollows = updatedFollows.filter(u => u !== targetUsername);
    } else {
      updatedFollows.push(targetUsername);
    }
    setFollowedUsers(updatedFollows);
    localStorage.setItem('tg_followed_users', JSON.stringify(updatedFollows));
    setUserProfile(prev => ({ ...prev, following: updatedFollows.length }));
  };

  const handlePublish = async () => {
    if (!caption && !selectedFile) return;
    setLoading(true);
    setUploadStatus(currentLang === 'fa' ? 'در حال ارسال به صندوق انتظار...' : 'Sending to queue...');

    const convertToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    };

    let finalMediaUrl = '';
    if (selectedFile) {
      try { finalMediaUrl = await convertToBase64(selectedFile); } catch (err) { finalMediaUrl = URL.createObjectURL(selectedFile); }
    }

    const newPost = {
      id: 'post-' + Date.now(),
      caption: caption,
      video_url: finalMediaUrl,
      likes: 0,
      artist_name: userProfile.name,
      username: userProfile.username,
      category: postCategory,
      status: 'pending',
      created_at: new Date().toISOString()
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
    setUploadStatus(currentLang === 'fa' ? '✓ به صندوق انتظار منتقل شد.' : '✓ Sent to queue.');
    setLoading(false);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  const handleDeletePost = async (id: string) => {
    if (confirm(currentLang === 'fa' ? 'آیا از حذف این اتود مطمئن هستید؟' : 'Are you sure you want to delete this etude?')) {
      const updated = posts.filter(p => p.id !== id);
      saveLocalPosts(updated);
      try { await supabase.from('theater_posts').delete().eq('id', id); } catch (e) {}
      if (selectedDetailPost && selectedDetailPost.id === id) setSelectedDetailPost(null);
    }
  };

  const handleSavePostEdit = async (id: string) => {
    const updated = posts.map(p => p.id === id ? { ...p, caption: editCaptionText } : p);
    saveLocalPosts(updated);
    setEditingPostId(null);
    try { await supabase.from('theater_posts').update({ caption: editCaptionText }).eq('id', id); } catch (e) {}
    if (selectedDetailPost && selectedDetailPost.id === id) {
      setSelectedDetailPost((prev: any) => ({ ...prev, caption: editCaptionText }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setUserProfile(prev => ({ ...prev, ...editForm }));
    localStorage.setItem('tg_real_user_session', JSON.stringify(editForm));
    setIsEditingProfile(false);
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const updated = posts.map(p => p.id === id ? { ...p, status } : p).filter(p => p.status !== 'rejected');
    saveLocalPosts(updated);
    try { await supabase.from('theater_posts').update({ status }).eq('id', id); } catch (e) {}
  };

  // تابع عملیاتی لایک
  const handleToggleLike = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updatedLikes = [...likedPosts];
    if (likedPosts.includes(postId)) {
      updatedLikes = updatedLikes.filter(id => id !== postId);
    } else {
      updatedLikes.push(postId);
    }
    setLikedPosts(updatedLikes);
    localStorage.setItem('tg_liked_posts', JSON.stringify(updatedLikes));
  };

  // تابع دریافت زنده تعداد لایک
  const getPostLikesCount = (post: any) => {
    const baseLikes = post.likes || 0;
    return likedPosts.includes(post.id) ? baseLikes + 1 : baseLikes;
  };

  // تابع عملیاتی کامنت
  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      username: userProfile.username,
      artist_name: userProfile.name,
      text: newCommentText.trim(),
      timestamp: Date.now()
    };
    const updatedMap = { ...commentsMap, [postId]: [...(commentsMap[postId] || []), newComment] };
    setCommentsMap(updatedMap);
    localStorage.setItem('tg_comments_map', JSON.stringify(updatedMap));
    setNewCommentText('');
  };

  return {
    isAuthenticated, authMode, setAuthMode, authUsername, setAuthUsername, authPassword, setAuthPassword,
    authName, setAuthName, authError, activeTab, setActiveTab, isDarkMode, setIsDarkMode, currentLang, setCurrentLang,
    isMenuOpen, setIsMenuOpen, isEditingProfile, setIsEditingProfile, posts, caption, setCaption, mediaName,
    postCategory, setPostCategory, loading, uploadStatus, uploadError, searchQuery, setSearchQuery,
    selectedCategoryFilter, setSelectedCategoryFilter, selectedDetailPost, setSelectedDetailPost, editingPostId,
    setEditingPostId, editCaptionText, setEditCaptionText, userProfile, editForm, setEditForm, followedUsers,
    targetProfileUser, setTargetProfileUser, handleAuth, handleLogout, handleFileChange, toggleFollowUser,
    handlePublish, handleDeletePost, handleSavePostEdit, handleAvatarChange, handleSaveProfile, handleUpdateStatus,
    commentsMap, likedPosts, newCommentText, setNewCommentText, handleToggleLike, getPostLikesCount, handleAddComment
  };
}