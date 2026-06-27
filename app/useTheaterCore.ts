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
    const savedPosts = localStorage.getItem('theatergram_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      fetchData();
    }

    const savedComments = localStorage.getItem('theatergram_comments');
    if (savedComments) setCommentsMap(JSON.parse(savedComments));

    const savedLikes = localStorage.getItem('theatergram_likes');
    if (savedLikes) setLikedPosts(JSON.parse(savedLikes));

    const session = localStorage.getItem('theatergram_user');
    if (session) {
      const profile = JSON.parse(session);
      setIsAuthenticated(true);
      setUserProfile(prev => ({ ...prev, ...profile }));
      setEditForm(prev => ({ ...prev, ...profile }));
    } else {
      const guestProfile = {
        id: 'guest-' + Date.now(),
        name: 'مهمان',
        username: 'guest',
        bio: 'کاربر مهمان',
        avatar: '',
        followers: 0,
        following: 0
      };
      localStorage.setItem('theatergram_user', JSON.stringify(guestProfile));
      setIsAuthenticated(true);
      setUserProfile(guestProfile);
      setEditForm(guestProfile);
    }

    const savedFollows = localStorage.getItem('theatergram_follows');
    if (savedFollows) {
      const parsed = JSON.parse(savedFollows);
      setFollowedUsers(parsed);
      setUserProfile(prev => ({ ...prev, following: parsed.length }));
    }
  }, []);

  useEffect(() => {
    if (posts.length > 0) localStorage.setItem('theatergram_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    if (Object.keys(commentsMap).length > 0) localStorage.setItem('theatergram_comments', JSON.stringify(commentsMap));
  }, [commentsMap]);

  useEffect(() => {
    if (likedPosts.length > 0) localStorage.setItem('theatergram_likes', JSON.stringify(likedPosts));
  }, [likedPosts]);

  const fetchData = async () => {
    try {
      if (!supabase) return;
      const { data } = await supabase
        .from('theater_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data && data.length > 0) {
        setPosts(data);
        localStorage.setItem('theatergram_posts', JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Supabase not available, using localStorage');
    }
  };

  const savePosts = (updatedPosts: any[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('theatergram_posts', JSON.stringify(updatedPosts));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const uName = authUsername.trim().toLowerCase();
    
    if (!uName || !authPassword) {
      setAuthError(lang === 'fa' ? 'لطفاً تمام فیلدها را پر کنید.' : 'Please fill all fields.');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'register') {
        if (!authName) {
          setAuthError(lang === 'fa' ? 'لطفاً نام خود را وارد کنید.' : 'Please enter your name.');
          setLoading(false);
          return;
        }
        try {
          const { data: newUser } = await supabase
            .from('theater_users')
            .insert([{ username: uName, password: authPassword, name: authName, bio: lang === 'fa' ? 'هنرمند تئاتر' : 'Theater Artist', avatar: '' }])
            .select().single();

          if (newUser) {
            const profileData = { id: newUser.id, name: newUser.name, username: newUser.username, bio: newUser.bio, avatar: newUser.avatar, followers: 0, following: 0 };
            localStorage.setItem('theatergram_user', JSON.stringify(profileData));
            setUserProfile(prev => ({ ...prev, ...profileData }));
            setEditForm(prev => ({ ...prev, ...profileData }));
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }
        } catch (e) {}
      } else {
        try {
          const { data: user } = await supabase
            .from('theater_users')
            .select('*')
            .eq('username', uName)
            .eq('password', authPassword)
            .maybeSingle();

          if (user) {
            const profileData = { id: user.id, name: user.name, username: user.username, bio: user.bio, avatar: user.avatar, followers: 0, following: 0 };
            localStorage.setItem('theatergram_user', JSON.stringify(profileData));
            setUserProfile(prev => ({ ...prev, ...profileData }));
            setEditForm(prev => ({ ...prev, ...profileData }));
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      const fallbackProfile = {
        id: uName === 'mehdisoheilinia' ? 'admin-id' : 'user-' + Date.now(),
        name: uName === 'mehdisoheilinia' ? 'Mehdi Soheilinia' : (authName || (lang === 'fa' ? 'هنرمند تئاتر' : 'Theater Artist')),
        username: uName,
        bio: uName === 'mehdisoheilinia' ? (lang === 'fa' ? 'کارگردان و بازیگر' : 'Director & Actor') : (lang === 'fa' ? 'عضو جامعه تئاتر' : 'Theater Member'),
        avatar: '', followers: 0, following: 0
      };
      localStorage.setItem('theatergram_user', JSON.stringify(fallbackProfile));
      setUserProfile(prev => ({ ...prev, ...fallbackProfile }));
      setEditForm(prev => ({ ...prev, ...fallbackProfile }));
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('theatergram_user');
    setIsAuthenticated(false);
    setIsMenuOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(lang === 'fa' ? '❌ حجم فایل نباید بیش از ۱۰ مگابایت باشد.' : '❌ File size must not exceed 10MB.');
        return;
      }
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 60) {
            setUploadError(lang === 'fa' ? '❌ مدت زمان ویدیو نمی‌تواند بیش از ۱ دقیقه باشد.' : '❌ Video cannot exceed 1 minute.');
          } else {
            setSelectedFile(file);
            setMediaName(file.name);
          }
        };
        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setMediaName(file.name);
      } else {
        setUploadError(lang === 'fa' ? '❌ فرمت فایل پشتیبانی نمی‌شود.' : '❌ File format not supported.');
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
    localStorage.setItem('theatergram_follows', JSON.stringify(updatedFollows));
    setUserProfile(prev => ({ ...prev, following: updatedFollows.length }));
  };

  const handlePublish = async () => {
    if (!caption && !selectedFile) return;
    setLoading(true);
    setUploadStatus(lang === 'fa' ? 'در حال ارسال...' : 'Sending...');

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
      created_at: new Date().toISOString(),
      avatar: userProfile.avatar || ''
    };

    savePosts([newPost, ...posts]);

    try {
      await supabase.from('theater_posts').insert([{ caption, video_url: finalMediaUrl, likes: 0, artist_name: userProfile.name, username: userProfile.username, category: postCategory, status: 'pending', avatar: userProfile.avatar || '' }]);
    } catch (err) {}

    setCaption(''); setSelectedFile(null); setMediaName('');
    setUploadStatus(lang === 'fa' ? '✓ با موفقیت ارسال شد.' : '✓ Sent successfully.');
    setLoading(false);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm(lang === 'fa' ? 'آیا از حذف این پست مطمئن هستید؟' : 'Are you sure?')) return;
    savePosts(posts.filter(p => p.id !== id));
    try { await supabase.from('theater_posts').delete().eq('id', id); } catch (e) {}
    if (selectedDetailPost && selectedDetailPost.id === id) setSelectedDetailPost(null);
  };

  const handleSavePostEdit = async (id: string) => {
    savePosts(posts.map(p => p.id === id ? { ...p, caption: editCaptionText } : p));
    setEditingPostId(null); setEditCaptionText('');
    try { await supabase.from('theater_posts').update({ caption: editCaptionText }).eq('id', id); } catch (e) {}
    if (selectedDetailPost && selectedDetailPost.id === id) setSelectedDetailPost((prev: any) => ({ ...prev, caption: editCaptionText }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatarData = reader.result as string;
        setEditForm(prev => ({ ...prev, avatar: avatarData }));
        const updatedProfile = { ...userProfile, avatar: avatarData };
        localStorage.setItem('theatergram_user', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    const updatedProfile = { ...userProfile, ...editForm };
    setUserProfile(updatedProfile);
    localStorage.setItem('theatergram_user', JSON.stringify(updatedProfile));
    setIsEditingProfile(false);
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const updated = posts.map(p => p.id === id ? { ...p, status } : p);
    savePosts(updated.filter(p => p.status !== 'rejected'));
    try { await supabase.from('theater_posts').update({ status }).eq('id', id); } catch (e) {}
  };

  const handleToggleLike = (postId: string) => {
    let updatedLikes = [...likedPosts];
    const isLiked = likedPosts.includes(postId);
    if (isLiked) { updatedLikes = updatedLikes.filter(id => id !== postId); } else { updatedLikes.push(postId); }
    setLikedPosts(updatedLikes);
    localStorage.setItem('theatergram_likes', JSON.stringify(updatedLikes));

    const updatedPosts = posts.map(p => p.id === postId ? { ...p, likes: isLiked ? Math.max(0, (p.likes || 0) - 1) : (p.likes || 0) + 1 } : p);
    savePosts(updatedPosts);
    try {
      const cnt = updatedPosts.find(p => p.id === postId)?.likes || 0;
      supabase.from('theater_posts').update({ likes: cnt }).eq('id', postId);
    } catch (e) {}
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;
    const newComment = { id: Date.now().toString(), username: userProfile.username, artist_name: userProfile.name, text: newCommentText.trim(), timestamp: Date.now() };
    const updatedMap = { ...commentsMap, [postId]: [...(commentsMap[postId] || []), newComment] };
    setCommentsMap(updatedMap);
    localStorage.setItem('theatergram_comments', JSON.stringify(updatedMap));
    setNewCommentText('');
  };

  return {
    isAuthenticated, authMode, setAuthMode, authUsername, setAuthUsername, authPassword, setAuthPassword, authName, setAuthName, authError, setAuthError, handleAuth, handleLogout,
    activeTab, setActiveTab, isDarkMode, setIsDarkMode, currentLang, setCurrentLang, isMenuOpen, setIsMenuOpen, isEditingProfile, setIsEditingProfile,
    posts, caption, setCaption, selectedFile, mediaName, postCategory, setPostCategory, loading, uploadStatus, uploadError, handleFileChange, handlePublish, handleDeletePost, handleSavePostEdit, editingPostId, setEditingPostId, editCaptionText, setEditCaptionText,
    searchQuery, setSearchQuery, selectedCategoryFilter, setSelectedCategoryFilter, selectedDetailPost, setSelectedDetailPost,
    userProfile, editForm, setEditForm, followedUsers, targetProfileUser, setTargetProfileUser, handleAvatarChange, handleSaveProfile, toggleFollowUser,
    isAdmin, handleUpdateStatus,
    approvedPosts: posts.filter(p => p.status === 'approved'),
    pendingPosts: posts.filter(p => p.status === 'pending'),
    myApprovedPosts: posts.filter(p => p.status === 'approved' && p.username === userProfile.username),
    myAllPosts: posts.filter(p => p.username === userProfile.username),
    commentsMap, likedPosts, newCommentText, setNewCommentText, handleToggleLike, getPostLikesCount: (p: any) => p.likes || 0, handleAddComment
  };
}
