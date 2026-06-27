'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { categories } from './constants';

// ====== ۱. تعریف اینترفیس‌ها ======
export interface Comment {
  id: string;
  username: string;
  artist_name: string;
  text: string;
  timestamp: number;
}

// ====== ۲. هوک تخصصی منطق برنامه (useTheaterCore) ======
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

  // بارگذاری داده‌ها از LocalStorage یا سرویس آنلاین
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
    if (posts.length > 0) {
      localStorage.setItem('theatergram_posts', JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    if (Object.keys(commentsMap).length > 0) {
      localStorage.setItem('theatergram_comments', JSON.stringify(commentsMap));
    }
  }, [commentsMap]);

  useEffect(() => {
    if (likedPosts.length > 0) {
      localStorage.setItem('theatergram_likes', JSON.stringify(likedPosts));
    }
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

        try {
          const { data: newUser } = await supabase
            .from('theater_users')
            .insert([
              { 
                username: uName, 
                password: authPassword, 
                name: authName, 
                bio: currentLang === 'fa' ? 'هنرمند تئاتر' : 'Theater Artist', 
                avatar: '' 
              }
            ])
            .select()
            .single();

          if (newUser) {
            const profileData = { 
              id: newUser.id, 
              name: newUser.name, 
              username: newUser.username, 
              bio: newUser.bio, 
              avatar: newUser.avatar,
              followers: 0,
              following: 0
            };
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
            const profileData = { 
              id: user.id, 
              name: user.name, 
              username: user.username, 
              bio: user.bio, 
              avatar: user.avatar,
              followers: 0,
              following: 0
            };
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
        name: uName === 'mehdisoheilinia' ? 'Mehdi Soheilinia' : (authName || (currentLang === 'fa' ? 'هنرمند تئاتر' : 'Theater Artist')),
        username: uName,
        bio: uName === 'mehdisoheilinia' ? (currentLang === 'fa' ? 'کارگردان و بازیگر' : 'Director & Actor') : (currentLang === 'fa' ? 'عضو جامعه تئاتر' : 'Theater Member'),
        avatar: '',
        followers: 0,
        following: 0
      };
      
      localStorage.setItem('theatergram_user', JSON.stringify(fallbackProfile));
      setUserProfile(prev => ({ ...prev, ...fallbackProfile }));
      setEditForm(prev => ({ ...prev, ...fallbackProfile }));
      setIsAuthenticated(true);

    } {
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
        setUploadError(currentLang === 'fa' ? '❌ حجم فایل نباید بیش از ۱۰ مگابایت باشد.' : '❌ File size must not exceed 10MB.');
        setSelectedFile(null);
        setMediaName('');
        return;
      }

      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 60) {
            setUploadError(currentLang === 'fa' ? '❌ مدت زمان ویدیو نمی‌تواند بیش از ۱ دقیقه باشد.' : '❌ Video cannot exceed 1 minute.');
            setSelectedFile(null);
            setMediaName('');
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
        setUploadError(currentLang === 'fa' ? '❌ فرمت فایل پشتیبانی نمی‌شود.' : '❌ File format not supported.');
        setSelectedFile(null);
        setMediaName('');
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
    if (!caption && !selectedFile) {
      setUploadError(currentLang === 'fa' ? 'لطفاً کپشن یا فایل را وارد کنید.' : 'Please enter a caption or file.');
      return;
    }
    if (uploadError) return;

    setLoading(true);
    setUploadStatus(currentLang === 'fa' ? 'در حال ارسال...' : 'Sending...');

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
      try {
        finalMediaUrl = await convertToBase64(selectedFile);
      } catch (err) {
        finalMediaUrl = URL.createObjectURL(selectedFile);
      }
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

    const updated = [newPost, ...posts];
    savePosts(updated);

    try {
      await supabase
        .from('theater_posts')
        .insert([{ 
          caption, 
          video_url: finalMediaUrl, 
          likes: 0, 
          artist_name: userProfile.name, 
          username: userProfile.username, 
          category: postCategory, 
          status: 'pending',
          avatar: userProfile.avatar || ''
        }]);
    } catch (err) {}

    setCaption('');
    setSelectedFile(null);
    setMediaName('');
    setUploadError('');
    setUploadStatus(currentLang === 'fa' ? '✓ با موفقیت ارسال شد.' : '✓ Sent successfully.');
    setLoading(false);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm(currentLang === 'fa' ? 'آیا از حذف این پست مطمئن هستید؟' : 'Are you sure you want to delete this post?')) return;

    const updated = posts.filter(p => p.id !== id);
    savePosts(updated);

    try {
      await supabase.from('theater_posts').delete().eq('id', id);
    } catch (e) {}

    if (selectedDetailPost && selectedDetailPost.id === id) {
      setSelectedDetailPost(null);
    }
  };

  const handleSavePostEdit = async (id: string) => {
    const updated = posts.map(p => 
      p.id === id ? { ...p, caption: editCaptionText } : p
    );
    savePosts(updated);
    setEditingPostId(null);
    setEditCaptionText('');

    try {
      await supabase.from('theater_posts').update({ caption: editCaptionText }).eq('id', id);
    } catch (e) {}

    if (selectedDetailPost && selectedDetailPost.id === id) {
      setSelectedDetailPost((prev: any) => ({ ...prev, caption: editCaptionText }));
    }
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
    const filtered = updated.filter(p => p.status !== 'rejected');
    savePosts(filtered);

    try {
      await supabase.from('theater_posts').update({ status }).eq('id', id);
    } catch (e) {}
  };

  const handleToggleLike = (postId: string) => {
    let updatedLikes = [...likedPosts];
    if (likedPosts.includes(postId)) {
      updatedLikes = updatedLikes.filter(id => id !== postId);
    } else {
      updatedLikes.push(postId);
    }
    setLikedPosts(updatedLikes);
    localStorage.setItem('theatergram_likes', JSON.stringify(updatedLikes));

    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const isLiked = likedPosts.includes(postId);
        return {
          ...p,
          likes: isLiked ? Math.max(0, (p.likes || 0) - 1) : (p.likes || 0) + 1
        };
      }
      return p;
    });
    savePosts(updatedPosts);

    try {
      const newLikesCount = updatedPosts.find(p => p.id === postId)?.likes || 0;
      supabase.from('theater_posts').update({ likes: newLikesCount }).eq('id', postId);
    } catch (e) {}
  };

  const getPostLikesCount = (post: any) => {
    return post.likes || 0;
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      username: userProfile.username,
      artist_name: userProfile.name,
      text: newCommentText.trim(),
      timestamp: Date.now()
    };

    const updatedMap = {
      ...commentsMap,
      [postId]: [...(commentsMap[postId] || []), newComment]
    };
    setCommentsMap(updatedMap);
    localStorage.setItem('theatergram_comments', JSON.stringify(updatedMap));
    setNewCommentText('');
  };

  const approvedPosts = posts.filter(p => p.status === 'approved');
  const pendingPosts = posts.filter(p => p.status === 'pending');
  const myApprovedPosts = posts.filter(p => p.username === userProfile.username && p.status === 'approved');
  const myAllPosts = posts.filter(p => p.username === userProfile.username);
  const isAdmin = userProfile.username === 'mehdisoheilinia';
  const viewUser = targetProfileUser || userProfile;

  return {
    isAuthenticated,
    authMode, setAuthMode,
    authUsername, setAuthUsername,
    authPassword, setAuthPassword,
    authName, setAuthName,
    authError, setAuthError,
    handleAuth,
    handleLogout,
    activeTab, setActiveTab,
    isDarkMode, setIsDarkMode,
    currentLang, setCurrentLang,
    isMenuOpen, setIsMenuOpen,
    isEditingProfile, setIsEditingProfile,
    posts,
    caption, setCaption,
    selectedFile,
    mediaName,
    postCategory, setPostCategory,
    loading,
    uploadStatus,
    uploadError,
    handleFileChange,
    handlePublish,
    handleDeletePost,
    handleSavePostEdit,
    editingPostId, setEditingPostId,
    editCaptionText, setEditCaptionText,
    searchQuery, setSearchQuery,
    selectedCategoryFilter, setSelectedCategoryFilter,
    selectedDetailPost, setSelectedDetailPost,
    userProfile,
    editForm, setEditForm,
    followedUsers,
    targetProfileUser, setTargetProfileUser,
    handleAvatarChange,
    handleSaveProfile,
    toggleFollowUser,
    isAdmin,
    handleUpdateStatus,
    approvedPosts,
    pendingPosts,
    myApprovedPosts,
    myAllPosts,
    viewUser,
    commentsMap,
    likedPosts,
    newCommentText, setNewCommentText,
    handleToggleLike,
    getPostLikesCount,
    handleAddComment
  };
}

// ====== ۳. کامپوننت اصلی و خروجی صفحه (TheaterGramCore) ======
export default function TheaterGramCore() {
  const core = useTheaterCore('fa');
  const lang = core.currentLang;
  const isRtl = lang === 'fa';

  const theme = {
    bg: core.isDarkMode ? '#0a0a0a' : '#f5f5f7',
    text: core.isDarkMode ? '#f5f5f7' : '#1a1a1a',
    cardBg: core.isDarkMode ? '#1c1c1e' : '#ffffff',
    cardBgHover: core.isDarkMode ? '#2c2c2e' : '#f0f0f2',
    border: core.isDarkMode ? '#2c2c2e' : '#e5e5e7',
    inputBg: core.isDarkMode ? '#2c2c2e' : '#f2f2f7',
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    accentLight: core.isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
    danger: '#ef4444',
    success: '#22c55e',
    shadow: core.isDarkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06)',
    radius: '16px',
  };

  // ====== Auth Screen ======
  if (!core.isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.bg,
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            background: theme.cardBg,
            borderRadius: theme.radius,
            padding: '40px 32px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            direction: isRtl ? 'rtl' : 'ltr',
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎭</div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: theme.text,
                letterSpacing: '-0.5px',
                margin: 0,
              }}
            >
              تئاترگرام
            </h1>
            <p
              style={{
                color: theme.text,
                opacity: 0.5,
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              {core.authMode === 'login' ? 'به جمع هنرمندان بپیوندید' : 'عضویت در تئاترگرام'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={core.handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {core.authMode === 'register' && (
              <input
                type="text"
                placeholder="نام و نام خانوادگی"
                value={core.authName}
                onChange={(e) => core.setAuthName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: theme.inputBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  color: theme.text,
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              />
            )}
            <input
              type="text"
              placeholder="نام کاربری"
              value={core.authUsername}
              onChange={(e) => core.setAuthUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: theme.inputBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                color: theme.text,
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            />
            <input
              type="password"
              placeholder="رمز عبور"
              value={core.authPassword}
              onChange={(e) => core.setAuthPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: theme.inputBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                color: theme.text,
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            />

            {core.authError && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '10px',
                  color: theme.danger,
                  fontSize: '13px',
                  textAlign: 'center',
                }}
              >
                {core.authError}
              </div>
            )}

            <button
              type="submit"
              disabled={core.loading}
              style={{
                width: '100%',
                padding: '14px',
                background: core.loading ? theme.accent + '80' : theme.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: core.loading ? 'default' : 'pointer',
                transition: 'all 0.2s',
                marginTop: '4px',
              }}
            >
              {core.loading ? '...' : core.authMode === 'login' ? 'ورود' : 'ثبت‌نام'}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => {
                core.setAuthMode(core.authMode === 'login' ? 'register' : 'login');
                core.setAuthError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.accent,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              {core.authMode === 'login' ? 'ایجاد حساب کاربری' : 'ورود به حساب'}
            </button>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: '20px',
              fontSize: '12px',
              color: theme.text,
              opacity: 0.3,
            }}
          >
            ورود به معنای پذیرش قوانین است
          </div>
        </div>
      </div>
    );
  }

  // ====== Main App ======
  return (
    <div
      style={{
        background: theme.bg,
        color: theme.text,
        minHeight: '100vh',
        paddingBottom: '80px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          background: theme.bg,
          borderBottom: `1px solid ${theme.border}`,
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          backdropFilter: 'blur(12px)',
        }}
      >
        <button
          onClick={() => core.setIsMenuOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: theme.text,
            fontSize: '22px',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          ☰
        </button>
        <h1
          style={{
            fontSize: '18px',
            fontWeight: '700',
            margin: 0,
            letterSpacing: '-0.5px',
            background: `linear-gradient(135deg, ${theme.accent}, #a78bfa)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {lang === 'fa' ? 'تئاترگرام' : 'TheaterGram'}
        </h1>
        <div style={{ width: '36px' }} />
      </header>

      {/* Menu Overlay */}
      {core.isMenuOpen && (
        <div
          onClick={() => core.setIsMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 105,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Side Menu */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          width: '280px',
          background: theme.cardBg,
          padding: '24px 20px',
          zIndex: 110,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          right: isRtl ? 0 : 'auto',
          left: !isRtl ? 0 : 'auto',
          transform: isRtl
            ? core.isMenuOpen
              ? 'translateX(0)'
              : 'translateX(100%)'
            : core.isMenuOpen
            ? 'translateX(0)'
            : 'translateX(-100%)',
          borderLeft: isRtl ? `1px solid ${theme.border}` : 'none',
          borderRight: !isRtl ? `1px solid ${theme.border}` : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: '600', opacity: 0.4, letterSpacing: '1px' }}>
            {lang === 'fa' ? 'منو' : 'MENU'}
          </span>
          <button
            onClick={() => core.setIsMenuOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: theme.text,
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => {
              core.setIsDarkMode(!core.isDarkMode);
              core.setIsMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: theme.inputBg,
              border: 'none',
              borderRadius: '12px',
              color: theme.text,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <span>{core.isDarkMode ? '☀️' : '🌙'}</span>
            {core.isDarkMode
              ? lang === 'fa'
                ? 'حالت روشن'
                : 'Light Mode'
              : lang === 'fa'
              ? 'حالت شب'
              : 'Dark Mode'}
          </button>

          <button
            onClick={() => {
              core.setCurrentLang(lang === 'fa' ? 'en' : 'fa');
              core.setIsMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: theme.inputBg,
              border: 'none',
              borderRadius: '12px',
              color: theme.text,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <span>🌐</span>
            {lang === 'fa' ? 'English' : 'فارسی'}
          </button>

          <div
            style={{
              marginTop: '8px',
              padding: '16px',
              background: theme.inputBg,
              borderRadius: '12px',
              fontSize: '13px',
              lineHeight: '1.6',
              opacity: 0.8,
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '4px', color: theme.accent }}>
              {lang === 'fa' ? 'ℹ️ درباره برنامه' : 'ℹ️ About'}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              {lang === 'fa'
                ? 'پلتفرم تخصصی اشتراک‌گذاری اتودها و تمرین‌های تئاتر'
                : 'Theater etudes & rehearsal sharing platform'}
            </div>
          </div>

          <button
            onClick={core.handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              background: theme.danger,
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '12px',
            }}
          >
            {lang === 'fa' ? 'خروج' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px' }}>
        {/* Explore Tab */}
        {core.activeTab === 'explore' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Search */}
            <input
              type="text"
              placeholder={lang === 'fa' ? '🔍 جستجوی نام کاربری...' : '🔍 Search username...'}
              value={core.searchQuery}
              onChange={(e) => core.setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: theme.inputBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                color: theme.text,
                fontSize: '14px',
                outline: 'none',
              }}
            />

            {/* Categories Filter */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
              }}
            >
              <button
                onClick={() => core.setSelectedCategoryFilter('all')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  background: core.selectedCategoryFilter === 'all' ? theme.accent : theme.inputBg,
                  color: core.selectedCategoryFilter === 'all' ? '#fff' : theme.text,
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                {lang === 'fa' ? 'همه' : 'All'}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => core.setSelectedCategoryFilter(cat.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    background: core.selectedCategoryFilter === cat.id ? theme.accent : theme.inputBg,
                    color: core.selectedCategoryFilter === cat.id ? '#fff' : theme.text,
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {lang === 'fa' ? cat.fa : cat.en}
                </button>
              ))}
            </div>

            {/* Posts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
              {core.approvedPosts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: theme.cardBg,
                    borderRadius: theme.radius,
                    border: `1px solid ${theme.border}`,
                    overflow: 'hidden',
                    boxShadow: theme.shadow,
                  }}
                >
                  {/* Post Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      gap: '12px',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      core.setTargetProfileUser({
                        id: post.username,
                        name: post.artist_name,
                        username: post.username,
                        bio: post.username === core.userProfile.username ? core.userProfile.bio : (lang === 'fa' ? 'هنرمند جامعه تئاتر' : 'Theater Member'),
                        avatar: post.username === core.userProfile.username ? core.userProfile.avatar : post.avatar || '',
                        followers: 0,
                        following: 0,
                      });
                      core.setActiveTab('profile');
                    }}
                  >
                    {post.avatar ? (
                      <img
                        src={post.avatar}
                        alt=""
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `2px solid ${theme.border}`,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: theme.inputBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                        }}
                      >
                        🎭
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{post.artist_name}</span>
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>@{post.username}</div>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        background: theme.inputBg,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        opacity: 0.7,
                      }}
                    >
                      {lang === 'fa'
                        ? categories.find((c) => c.id === post.category)?.fa
                        : categories.find((c) => c.id === post.category)?.en}
                    </span>
                  </div>

                  {/* Media */}
                  {post.video_url && (
                    <div style={{ width: '100%', background: '#000' }}>
                      {post.video_url.includes('image') ||
                      post.video_url.startsWith('data:image/') ||
                      (post.video_url.includes('blob:') && !post.video_url.includes('video')) ? (
                        <img
                          src={post.video_url}
                          alt=""
                          style={{
                            width: '100%',
                            maxHeight: '400px',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <video
                          src={post.video_url}
                          controls
                          autoPlay
                          muted
                          loop
                          playsInline
                          style={{
                            width: '100%',
                            maxHeight: '400px',
                            display: 'block',
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '10px 16px',
                      borderTop: `1px solid ${theme.border}`,
                    }}
                  >
                    <button
                      onClick={() => core.handleToggleLike(post.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.text,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: '8px',
                      }}
                    >
                      <span>{core.likedPosts?.includes(post.id) ? '❤️' : '🤍'}</span>
                      <span style={{ fontSize: '13px' }}>{core.getPostLikesCount(post)}</span>
                    </button>
                    <button
                      onClick={() => core.setSelectedDetailPost(post)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.text,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: '8px',
                      }}
                    >
                      💬
                      <span style={{ fontSize: '13px' }}>{core.commentsMap?.[post.id]?.length || 0}</span>
                    </button>
                  </div>

                  {/* Caption */}
                  <div style={{ padding: '0 16px 12px 16px' }}>
                    <p style={{ fontSize: '14px', margin: 0 }}>
                      <span style={{ fontWeight: '600' }}>{post.artist_name}:</span> {post.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {core.activeTab === 'profile' && (
          <div>
            {core.targetProfileUser && (
              <button
                onClick={() => core.setTargetProfileUser(null)}
                style={{
                  background: theme.inputBg,
                  border: 'none',
                  color: theme.text,
                  padding: '8px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                {lang === 'fa' ? '← بازگشت به پروفایل من' : '← Back to my profile'}
              </button>
            )}

            {!core.isEditingProfile ? (
              <div>
                {/* Profile Header */}
                <div
                  style={{
                    background: theme.cardBg,
                    borderRadius: theme.radius,
                    padding: '24px',
                    border: `1px solid ${theme.border}`,
                    marginBottom: '20px',
                    boxShadow: theme.shadow,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {core.viewUser.avatar ? (
                      <img
                        src={core.viewUser.avatar}
                        alt=""
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `3px solid ${theme.accent}`,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '50%',
                          background: theme.inputBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px',
                          border: `3px solid ${theme.accent}`,
                        }}
                      >
                        👤
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '18px', fontWeight: '700' }}>{core.viewUser.name}</div>
                      <div style={{ fontSize: '13px', opacity: 0.5 }}>@{core.viewUser.username}</div>
                      <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.8 }}>{core.viewUser.bio}</div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '20px',
                          marginTop: '10px',
                          fontSize: '13px',
                          borderTop: `1px solid ${theme.border}`,
                          paddingTop: '10px',
                        }}
                      >
                        <div>
                          <strong style={{ color: theme.accent }}>{core.viewUser.followers || 0}</strong> {lang === 'fa' ? 'دنبال‌کننده' : 'Followers'}
                        </div>
                        <div>
                          <strong>{core.viewUser.following || 0}</strong> {lang === 'fa' ? 'دنبال‌شده' : 'Following'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {core.targetProfileUser && core.targetProfileUser.username !== core.userProfile.username && (
                    <button
                      onClick={() => core.toggleFollowUser(core.targetProfileUser.username)}
                      style={{
                        width: '100%',
                        marginTop: '16px',
                        padding: '10px',
                        background: core.followedUsers.includes(core.targetProfileUser.username) ? theme.inputBg : theme.accent,
                        color: core.followedUsers.includes(core.targetProfileUser.username) ? theme.text : '#fff',
                        border: `1px solid ${core.followedUsers.includes(core.targetProfileUser.username) ? theme.border : theme.accent}`,
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      {core.followedUsers.includes(core.targetProfileUser.username) ? (lang === 'fa' ? '✓ دنبال شده' : 'Following') : (lang === 'fa' ? '+ دنبال کردن' : '+ Follow')}
                    </button>
                  )}

                  {!core.targetProfileUser && (
                    <button
                      onClick={() => core.setIsEditingProfile(true)}
                      style={{
                        width: '100%',
                        marginTop: '16px',
                        padding: '10px',
                        background: 'none',
                        border: `1px solid ${theme.border}`,
                        color: theme.text,
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'fa' ? '✏️ ویرایش پروفایل' : '✏️ Edit Profile'}
                    </button>
                  )}
                </div>

                {/* New Post Form */}
                {!core.targetProfileUser && (
                  <div
                    style={{
                      background: theme.cardBg,
                      borderRadius: theme.radius,
                      padding: '20px',
                      border: `1px solid ${theme.border}`,
                      marginBottom: '20px',
                      boxShadow: theme.shadow,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        marginBottom: '12px',
                        overflowX: 'auto',
                        paddingBottom: '4px',
                      }}
                    >
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => core.setPostCategory(cat.id)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer',
                            background: core.postCategory === cat.id ? theme.accent : theme.inputBg,
                            color: core.postCategory === cat.id ? '#fff' : theme.text,
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {lang === 'fa' ? cat.fa : cat.en}
                        </button>
                      ))}
                    </div>

                    <label
                      style={{
                        display: 'block',
                        padding: '14px',
                        background: theme.inputBg,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '14px',
                        marginBottom: '12px',
                        border: `2px dashed ${theme.border}`,
                      }}
                    >
                      <span style={{ fontWeight: '500' }}>
                        {core.mediaName ? `✓ ${core.mediaName}` : (lang === 'fa' ? '🎬 انتخاب فیلم (تا ۱ دقیقه) یا عکس' : '🎬 Select File (Max 1 min)')}
                      </span>
                      <input type="file" accept="image/*,video/*" onChange={core.handleFileChange} style={{ display: 'none' }} />
                    </label>

                    {core.uploadError && (
                      <div style={{ fontSize: '13px', color: theme.danger, marginBottom: '10px', textAlign: 'center' }}>
                        {core.uploadError}
                      </div>
                    )}

                    <textarea
                      placeholder={lang === 'fa' ? 'توضیحات صحنه...' : 'Scene description...'}
                      value={core.caption}
                      onChange={(e) => core.setCaption(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        height: '60px',
                        background: theme.inputBg,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '10px',
                        color: theme.text,
                        resize: 'none',
                        marginBottom: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />

                    {core.uploadStatus && (
                      <div style={{ fontSize: '13px', color: theme.success, marginBottom: '10px', textAlign: 'center' }}>
                        {core.uploadStatus}
                      </div>
                    )}

                    <button
                      onClick={core.handlePublish}
                      disabled={core.loading || !!core.uploadError}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: core.loading || core.uploadError ? theme.inputBg : theme.accent,
                        color: core.loading || core.uploadError ? theme.text : '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: core.loading || core.uploadError ? 'default' : 'pointer',
                      }}
                    >
                      {core.loading ? '...' : (lang === 'fa' ? 'ارسال جهت بررسی' : 'Submit for review')}
                    </button>
                  </div>
                )}

                {/* My Posts Grid */}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', opacity: 0.6 }}>
                    {lang === 'fa' ? '📁 اتودهای من' : '📁 My Etudes'}
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '6px',
                      background: theme.border,
                      padding: '6px',
                      borderRadius: theme.radius,
                    }}
                  >
                    {core.myApprovedPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => core.setSelectedDetailPost(post)}
                        style={{
                          aspectRatio: '1/1',
                          background: theme.cardBg,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {post.video_url ? (
                          post.video_url.includes('image') || post.video_url.startsWith('data:image/') ? (
                            <img src={post.video_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🎬</div>
                          )
                        ) : (
                          <div style={{ fontSize: '32px', opacity: 0.3 }}>🎭</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manage Posts */}
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', opacity: 0.6 }}>
                    {lang === 'fa' ? '🛠️ مدیریت اتودها' : '🛠️ Manage Etudes'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {core.myAllPosts.map((post) => (
                      <div
                        key={post.id}
                        style={{
                          background: theme.cardBg,
                          borderRadius: theme.radius,
                          padding: '16px',
                          border: `1px solid ${theme.border}`,
                          boxShadow: theme.shadow,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', opacity: 0.6 }}>
                            {lang === 'fa' ? categories.find((c) => c.id === post.category)?.fa : categories.find((c) => c.id === post.category)?.en}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              background: post.status === 'approved' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(250, 204, 21, 0.15)',
                              color: post.status === 'approved' ? theme.success : '#facc15',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontWeight: '500',
                            }}
                          >
                            {post.status === 'approved' ? (lang === 'fa' ? 'منتشر شده' : 'Published') : (lang === 'fa' ? 'در انتظار تایید' : 'Pending')}
                          </span>
                        </div>

                        {core.editingPostId === post.id ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              value={core.editCaptionText}
                              onChange={(e) => core.setEditCaptionText(e.target.value)}
                              style={{
                                flex: 1,
                                padding: '10px',
                                background: theme.inputBg,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '8px',
                                color: theme.text,
                                fontSize: '14px',
                                outline: 'none',
                              }}
                            />
                            <button
                              onClick={() => core.handleSavePostEdit(post.id)}
                              style={{
                                padding: '10px 20px',
                                background: theme.success,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              {lang === 'fa' ? 'ذخیره' : 'Save'}
                            </button>
                          </div>
                        ) : (
                          <p style={{ fontSize: '14px', margin: '4px 0' }}>{post.caption}</p>
                        )}

                        <div style={{ display: 'flex', gap: '12px', borderTop: `1px solid ${theme.border}`, paddingTop: '10px', marginTop: '10px' }}>
                          <button onClick={() => core.handleToggleLike(post.id)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {core.likedPosts?.includes(post.id) ? '❤️' : '🤍'} {core.getPostLikesCount(post)}
                          </button>
                          <button onClick={() => core.setSelectedDetailPost(post)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            💬 {core.commentsMap?.[post.id]?.length || 0}
                          </button>
                        </div>

                        {(!core.targetProfileUser || core.isAdmin) && (
                          <div style={{ display: 'flex', gap: '8px', borderTop: `1px solid ${theme.border}`, paddingTop: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                core.setEditingPostId(post.id);
                                core.setEditCaptionText(post.caption);
                              }}
                              style={{ background: 'rgba(139, 92, 246, 0.15)', color: theme.accent, border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                            >
                              ✏️ {lang === 'fa' ? 'ویرایش' : 'Edit'}
                            </button>
                            <button
                              onClick={() => core.handleDeletePost(post.id)}
                              style={{ background: 'rgba(239, 68, 68, 0.15)', color: theme.danger, border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                            >
                              🗑️ {lang === 'fa' ? 'حذف' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Profile Mode */
              <div style={{ background: theme.cardBg, borderRadius: theme.radius, padding: '24px', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                <label style={{ display: 'block', padding: '16px', background: theme.inputBg, borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontSize: '14px', marginBottom: '16px', border: `2px dashed ${theme.border}` }}>
                  {core.editForm.avatar ? (lang === 'fa' ? '✓ عکس انتخاب شد' : '✓ Avatar Selected') : (lang === 'fa' ? '🖼️ انتخاب عکس پروفایل' : '🖼️ Choose Profile Picture')}
                  <input type="file" accept="image/*" onChange={core.handleAvatarChange} style={{ display: 'none' }} />
                </label>

                <input
                  type="text"
                  value={core.editForm.name}
                  onChange={(e) => core.setEditForm({ ...core.editForm, name: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '10px', color: theme.text, fontSize: '14px', marginBottom: '12px', outline: 'none' }}
                  placeholder={lang === 'fa' ? 'نام' : 'Name'}
                />

                <input
                  type="text"
                  value={core.editForm.bio}
                  onChange={(e) => core.setEditForm({ ...core.editForm, bio: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '10px', color: theme.text, fontSize: '14px', marginBottom: '16px', outline: 'none' }}
                  placeholder={lang === 'fa' ? 'بیوگرافی' : 'Bio'}
                />

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={core.handleSaveProfile} style={{ flex: 1, padding: '12px', background: theme.accent, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                    {lang === 'fa' ? '💾 ذخیره' : '💾 Save'}
                  </button>
                  <button onClick={() => core.setIsEditingProfile(false)} style={{ padding: '12px 24px', background: 'none', border: `1px solid ${theme.border}`, color: theme.text, borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                    {lang === 'fa' ? 'انصراف' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Tab */}
        {core.isAdmin && core.activeTab === 'admin' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              {lang === 'fa' ? `📥 صف بررسی (${core.pendingPosts.length})` : `📥 Pending Queue (${core.pendingPosts.length})`}
            </h3>

            {core.pendingPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', opacity: 0.4, fontSize: '14px' }}>
                {lang === 'fa' ? 'صف بررسی خالی است.' : 'No pending posts.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {core.pendingPosts.map((post) => (
                  <div key={post.id} style={{ background: theme.cardBg, borderRadius: theme.radius, padding: '20px', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                      {post.artist_name} (@{post.username})
                    </div>
                    <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '10px' }}>{post.caption}</div>

                    {post.video_url && (
                      <div style={{ width: '100%', background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                        {post.video_url.includes('image') || post.video_url.startsWith('data:image/') ? (
                          <img src={post.video_url} alt="" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                        ) : (
                          <video src={post.video_url} controls style={{ width: '100%', maxHeight: '200px' }} />
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => core.handleUpdateStatus(post.id, 'approved')} style={{ flex: 1, padding: '10px', background: theme.success, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                        {lang === 'fa' ? '✅ تایید' : '✅ Approve'}
                      </button>
                      <button onClick={() => core.handleUpdateStatus(post.id, 'rejected')} style={{ flex: 1, padding: '10px', background: theme.danger, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                        {lang === 'fa' ? '❌ رد' : '❌ Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: theme.bg,
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0',
          zIndex: 100,
          backdropFilter: 'blur(12px)',
        }}
      >
        <button onClick={() => core.setActiveTab('explore')} style={{ background: 'none', border: 'none', color: core.activeTab === 'explore' ? theme.accent : theme.text, fontSize: '13px', fontWeight: core.activeTab === 'explore' ? '600' : '400', opacity: core.activeTab === 'explore' ? 1 : 0.4, cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' }}>
          {lang === 'fa' ? '🧭 اکسپلور' : '🧭 Explore'}
        </button>
        <button onClick={() => { core.setTargetProfileUser(null); core.setActiveTab('profile'); }} style={{ background: 'none', border: 'none', color: core.activeTab === 'profile' ? theme.accent : theme.text, fontSize: '13px', fontWeight: core.activeTab === 'profile' ? '600' : '400', opacity: core.activeTab === 'profile' ? 1 : 0.4, cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' }}>
          {lang === 'fa' ? '👤 صفحه من' : '👤 Profile'}
        </button>
        {core.isAdmin && (
          <button onClick={() => core.setActiveTab('admin')} style={{ background: 'none', border: 'none', color: core.activeTab === 'admin' ? theme.accent : theme.text, fontSize: '13px', fontWeight: core.activeTab === 'admin' ? '600' : '400', opacity: core.activeTab === 'admin' ? 1 : 0.4, cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' }}>
            {lang === 'fa' ? '⚙️ مدیریت' : '⚙️ Admin'}
          </button>
        )}
      </nav>

      {/* Post Detail Modal */}
      {core.selectedDetailPost && (
        <div
          style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}
          onClick={() => core.setSelectedDetailPost(null)}
        >
          <div style={{ background: theme.cardBg, borderRadius: theme.radius, width: '100%', maxWidth: '420px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>@{core.selectedDetailPost.username}</span>
              <button onClick={() => core.setSelectedDetailPost(null)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '24px', cursor: 'pointer', padding: '4px' }}>×</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {core.selectedDetailPost.video_url && (
                <div style={{ width: '100%', background: '#000' }}>
                  {core.selectedDetailPost.video_url.includes('image') || core.selectedDetailPost.video_url.startsWith('data:image/') ? (
                    <img src={core.selectedDetailPost.video_url} alt="" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block' }} />
                  ) : (
                    <video src={core.selectedDetailPost.video_url} controls autoPlay style={{ width: '100%', maxHeight: '300px', display: 'block' }} />
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>
                <button onClick={() => core.handleToggleLike(core.selectedDetailPost.id)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {core.likedPosts.includes(core.selectedDetailPost.id) ? '❤️' : '🤍'} {core.getPostLikesCount(core.selectedDetailPost)}
                </button>
                <span style={{ fontSize: '13px', opacity: 0.5 }}>💬 {core.commentsMap[core.selectedDetailPost.id]?.length || 0}</span>
              </div>

              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  <span style={{ fontWeight: '600' }}>{core.selectedDetailPost.artist_name}:</span> {core.selectedDetailPost.caption}
                </p>

                {core.selectedDetailPost.username === core.userProfile.username && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={() => {
                        core.setEditingPostId(core.selectedDetailPost.id);
                        core.setEditCaptionText(core.selectedDetailPost.caption);
                      }}
                      style={{ background: 'rgba(139, 92, 246, 0.15)', color: theme.accent, border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                    >
                      ✏️ {lang === 'fa' ? 'ویرایش' : 'Edit'}
                    </button>
                    <button
                      onClick={() => core.handleDeletePost(core.selectedDetailPost.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: theme.danger, border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                    >
                      🗑️ {lang === 'fa' ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>

              {/* Comments List */}
              <div style={{ padding: '16px' }}>
                {core.commentsMap[core.selectedDetailPost.id]?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', opacity: 0.4, fontSize: '13px' }}>
                    {lang === 'fa' ? 'نظری ثبت نشده است.' : 'No comments yet.'}
                  </div>
                ) : (
                  core.commentsMap[core.selectedDetailPost.id]?.map((comment) => (
                    <div key={comment.id} style={{ background: theme.inputBg, padding: '10px 14px', borderRadius: '10px', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: theme.accent }}>
                        {comment.artist_name}
                        <span style={{ fontWeight: '400', fontSize: '11px', opacity: 0.5, marginLeft: '6px' }}>@{comment.username}</span>
                      </div>
                      <div style={{ fontSize: '13px', marginTop: '2px' }}>{comment.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comment Input */}
            <div style={{ display: 'flex', gap: '10px', padding: '12px 16px', borderTop: `1px solid ${theme.border}`, background: theme.cardBg }}>
              <input
                type="text"
                placeholder={lang === 'fa' ? 'نوشتن نظر...' : 'Write comment...'}
                value={core.newCommentText}
                onChange={(e) => core.setNewCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') core.handleAddComment(core.selectedDetailPost.id); }}
                style={{ flex: 1, padding: '10px 14px', background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '20px', color: theme.text, fontSize: '14px', outline: 'none' }}
              />
              <button onClick={() => core.handleAddComment(core.selectedDetailPost.id)} style={{ background: theme.accent, color: '#fff', border: 'none', borderRadius: '20px', padding: '10px 20px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                {lang === 'fa' ? 'ارسال' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
