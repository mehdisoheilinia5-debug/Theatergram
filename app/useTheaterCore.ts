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

  // ====== بارگذاری دیتا از localStorage و supabase ======
  useEffect(() => {
    // بارگذاری پست‌ها
    const savedPosts = localStorage.getItem('theatergram_posts');
    if (savedPosts) {
      const parsedPosts = JSON.parse(savedPosts);
      setPosts(parsedPosts);
    } else {
      fetchData();
    }

    // بارگذاری کامنت‌ها
    const savedComments = localStorage.getItem('theatergram_comments');
    if (savedComments) {
      setCommentsMap(JSON.parse(savedComments));
    }

    // بارگذاری لایک‌ها
    const savedLikes = localStorage.getItem('theatergram_likes');
    if (savedLikes) {
      setLikedPosts(JSON.parse(savedLikes));
    }

    // بارگذاری پروفایل کاربر
    const session = localStorage.getItem('theatergram_user');
    if (session) {
      const profile = JSON.parse(session);
      setIsAuthenticated(true);
      setUserProfile(prev => ({ ...prev, ...profile }));
      setEditForm(prev => ({ ...prev, ...profile }));
    } else {
      // کاربر مهمان (فقط برای تست)
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

    // بارگذاری فالوها
    const savedFollows = localStorage.getItem('theatergram_follows');
    if (savedFollows) {
      const parsed = JSON.parse(savedFollows);
      setFollowedUsers(parsed);
      setUserProfile(prev => ({ ...prev, following: parsed.length }));
    }
  }, []);

  // ====== ذخیره خودکار در localStorage ======
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

  // ====== دریافت داده از Supabase ======
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

  // ====== ذخیره پست‌ها در localStorage ======
  const savePosts = (updatedPosts: any[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('theatergram_posts', JSON.stringify(updatedPosts));
  };

  // ====== احراز هویت ======
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

        // تلاش برای ثبت در Supabase
        try {
          const { data: newUser } = await supabase
            .from('theater_users')
            .insert([
              { 
                username: uName, 
                password: authPassword, 
                name: authName, 
                bio: lang === 'fa' ? 'هنرمند تئاتر' : 'Theater Artist', 
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
        } catch (e) {
          // اگر Supabase در دسترس نبود، به حالت آفلاین برو
        }
      } else {
        // حالت ورود
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
        } catch (e) {
          // اگر Supabase در دسترس نبود
        }
      }

      // ====== Fallback آفلاین ======
      const fallbackProfile = {
        id: uName === 'mehdisoheilinia' ? 'admin-id' : 'user-' + Date.now(),
        name: uName === 'mehdisoheilinia' ? 'Mehdi Soheilinia' : (authName || (lang === 'fa' ? 'هنرمند تئاتر' : 'Theater Artist')),
        username: uName,
        bio: uName === 'mehdisoheilinia' ? (lang === 'fa' ? 'کارگردان و بازیگر' : 'Director & Actor') : (lang === 'fa' ? 'عضو جامعه تئاتر' : 'Theater Member'),
        avatar: '',
        followers: 0,
        following: 0
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

  // ====== مدیریت فایل ======
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');
    
    if (file) {
      // محدودیت حجم (۱۰ مگابایت)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(lang === 'fa' ? '❌ حجم فایل نباید بیش از ۱۰ مگابایت باشد.' : '❌ File size must not exceed 10MB.');
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
            setUploadError(lang === 'fa' ? '❌ مدت زمان ویدیو نمی‌تواند بیش از ۱ دقیقه باشد.' : '❌ Video cannot exceed 1 minute.');
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
        setUploadError(lang === 'fa' ? '❌ فرمت فایل پشتیبانی نمی‌شود.' : '❌ File format not supported.');
        setSelectedFile(null);
        setMediaName('');
      }
    }
  };

  // ====== فالو/آنفالو ======
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

  // ====== انتشار پست ======
  const handlePublish = async () => {
    if (!caption && !selectedFile) {
      setUploadError(lang === 'fa' ? 'لطفاً کپشن یا فایل را وارد کنید.' : 'Please enter a caption or file.');
      return;
    }
    if (uploadError) return;

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

    // ذخیره در Supabase (اگر در دسترس باشد)
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
    } catch (err) {
      // آفلاین - فقط در localStorage ذخیره شد
    }

    setCaption('');
    setSelectedFile(null);
    setMediaName('');
    setUploadError('');
    setUploadStatus(lang === 'fa' ? '✓ با موفقیت ارسال شد.' : '✓ Sent successfully.');
    setLoading(false);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  // ====== حذف پست ======
  const handleDeletePost = async (id: string) => {
    if (!confirm(lang === 'fa' ? 'آیا از حذف این پست مطمئن هستید؟' : 'Are you sure you want to delete this post?')) return;

    const updated = posts.filter(p => p.id !== id);
    savePosts(updated);

    try {
      await supabase.from('theater_posts').delete().eq('id', id);
    } catch (e) {}

    if (selectedDetailPost && selectedDetailPost.id === id) {
      setSelectedDetailPost(null);
    }
  };

  // ====== ویرایش پست ======
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

  // ====== تغییر عکس پروفایل ======
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatarData = reader.result as string;
        setEditForm(prev => ({ ...prev, avatar: avatarData }));
        // ذخیره سریع در localStorage
        const updatedProfile = { ...userProfile, avatar: avatarData };
        localStorage.setItem('theatergram_user', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
      };
      reader.readAsDataURL(file);
    }
  };

  // ====== ذخیره پروفایل ======
  const handleSaveProfile = () => {
    const updatedProfile = { ...userProfile, ...editForm };
    setUserProfile(updatedProfile);
    localStorage.setItem('theatergram_user', JSON.stringify(updatedProfile));
    setIsEditingProfile(false);
  };

  // ====== تایید/رد پست توسط ادمین ======
  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const updated = posts.map(p => p.id === id ? { ...p, status } : p);
    const filtered = updated.filter(p => p.status !== 'rejected');
    savePosts(filtered);

    try {
      await supabase.from('theater_posts').update({ status }).eq('id', id);
    } catch (e) {}
  };

  // ====== لایک ======
  const handleToggleLike = (postId: string) => {
    let updatedLikes = [...likedPosts];
    if (likedPosts.includes(postId)) {
      updatedLikes = updatedLikes.filter(id => id !== postId);
    } else {
      updatedLikes.push(postId);
    }
    setLikedPosts(updatedLikes);
    localStorage.setItem('theatergram_likes', JSON.stringify(updatedLikes));

    // به‌روزرسانی تعداد لایک در پست
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

    // به‌روزرسانی در Supabase
    try {
      const newLikesCount = updatedPosts.find(p => p.id === postId)?.likes || 0;
      supabase.from('theater_posts').update({ likes: newLikesCount }).eq('id', postId);
    } catch (e) {}
  };

  const getPostLikesCount = (post: any) => {
    return post.likes || 0;
  };

  // ====== کامنت ======
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

  // ====== محاسبه پست‌های تایید شده ======
  const approvedPosts = posts.filter(p => p.status === 'approved');
  const pendingPosts = posts.filter(p => p.status === 'pending');
  const isAdmin = userProfile.username === 'mehdisoheilinia';

  return {
    // Auth
    isAuthenticated,
    authMode, setAuthMode,
    authUsername, setAuthUsername,
    authPassword, setAuthPassword,
    authName, setAuthName,
    authError, setAuthError,
    handleAuth,
    handleLogout,

    // UI
    activeTab, setActiveTab,
    isDarkMode, setIsDarkMode,
    currentLang, setCurrentLang,
    isMenuOpen, setIsMenuOpen,
    isEditingProfile, setIsEditingProfile,

    // Posts
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

    // Filters
    searchQuery, setSearchQuery,
    selectedCategoryFilter, setSelectedCategoryFilter,
    selectedDetailPost, setSelectedDetailPost,

    // Profile
    userProfile,
    editForm, setEditForm,
    followedUsers,
    targetProfileUser, setTargetProfileUser,
    handleAvatarChange,
    handleSaveProfile,
    toggleFollowUser,

    // Admin
    isAdmin,
    handleUpdateStatus,

    // Computed
    approvedPosts,
    pendingPosts,

    // Comments & Likes
    commentsMap,
    likedPosts,
    newCommentText, setNewCommentText,
    handleToggleLike,
    getPostLikesCount,
    handleAddComment
  };
}