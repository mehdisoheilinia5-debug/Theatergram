'use client';

import React, { useState, useEffect } from 'react';
import { useTheaterCore, supabase } from './useTheaterCore';
import { CATEGORIES, TRANSLATIONS, EtudePost } from './constants';

export default function Page() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'explore' | 'profile' | 'about' | 'admin'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [targetUser, setTargetUser] = useState<string | null>(null);

  // پاپ‌آپ‌های ظریف شیشه‌ای (Glassmorphism Modal)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedGridPost, setSelectedGridPost] = useState<EtudePost | null>(null);

  // فرم‌های تئاتری
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postCat, setPostCat] = useState('improvisation');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const core = useTheaterCore(currentUser || '');

  const isDark = theme === 'dark';
  const isFa = lang === 'fa';
  const t = TRANSLATIONS[lang];

  const colors = {
    bg: isDark ? '#0a0a0c' : '#ffffff',
    card: isDark ? '#141418' : '#f4f5f7',
    text: isDark ? '#f5f5f7' : '#1c1c1e',
    border: isDark ? '#222228' : '#e2e4e9',
    input: isDark ? '#1b1b22' : '#ebedf2',
    accent: isDark ? '#ffffff' : '#000000',
    meta: '#8a8a93',
    gold: '#d4af37',
    red: '#ff453a'
  };

  useEffect(() => {
    if (currentUser && core.profiles[currentUser]) {
      const p = core.profiles[currentUser];
      setEditName(p.name || '');
      setEditBio(p.bio || '');
    }
  }, [currentUser, core.profiles]);

  // سیستم احراز هویت واقعی تئاترگرام متصل به سوپابیس
  const handleSecureAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanUsername = usernameInput.toLowerCase().trim();

    if (!cleanUsername || passwordInput.length < 4) {
      setAuthError(isFa ? 'نام کاربری نامعتبر یا رمز عبور بسیار کوتاه است.' : 'Invalid credentials.');
      return;
    }

    // امنیت شدید روی اکانت مدیریت ارزیابی مهدی سهیلی‌نیا
    if (cleanUsername === 'mehdisoheilinia' && passwordInput !== 'Macbeth2026') {
      setAuthError(isFa ? 'دسترسی امنیتی به اکانت ادمین کل پلتفرم رد شد.' : 'Admin gate unauthorized.');
      return;
    }

    const { data: existingUser, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', cleanUsername)
      .single();

    if (isSignUp) {
      if (existingUser) {
        setAuthError(isFa ? 'این نام کاربری هنری قبلاً رزرو شده است.' : 'Username already registered.');
      } else {
        await supabase.from('profiles').insert([{ username: cleanUsername, name: cleanUsername, bio: '', followers: [], following: [] }]);
        setCurrentUser(cleanUsername);
      }
    } else {
      if (!existingUser) {
        setAuthError(isFa ? 'حساب کاربری هنرمند یافت نشد. ابتدا ثبت‌نام کنید.' : 'Artist identity not found.');
      } else {
        setCurrentUser(cleanUsername);
      }
    }
  };

  const handlePostCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile || !postTitle.trim()) return;

    setUploading(true);
    const url = await core.uploadMediaAsset(mediaFile, 'media');
    if (url) {
      const success = await core.createPost(postTitle, postDesc, postCat, url);
      if (success) {
        setPostTitle('');
        setPostDesc('');
        setMediaFile(null);
        setIsUploadModalOpen(false);
      }
    }
    setUploading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    let finalAvatarUrl = core.profiles[currentUser || '']?.avatar_url || '';

    if (avatarFile) {
      const uploadedUrl = await core.uploadMediaAsset(avatarFile, 'avatars');
      if (uploadedUrl) finalAvatarUrl = uploadedUrl;
    }

    const success = await core.syncProfileState(editName, editBio, finalAvatarUrl);
    if (success) {
      setIsEditProfileOpen(false);
      setAvatarFile(null);
    }
    setUpdatingProfile(false);
  };

  const approvedPosts = core.posts.filter(p => {
    if (p.status !== 'approved') return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim() && !p.username.includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pendingPosts = core.posts.filter(p => p.status === 'pending');
  const activeProfileUsername = targetUser || currentUser;
  const activeProfileData = core.profiles[activeProfileUsername || ''];
  const profilePosts = core.posts.filter(p => p.username === activeProfileUsername && (p.status === 'approved' || activeProfileUsername === currentUser));

  if (!currentUser) {
    return (
      <div style={{ background: '#050507', color: '#f5f5f7', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '25px' }}>
        <form onSubmit={handleSecureAuth} style={{ width: '100%', maxWidth: '340px', background: '#111115', border: '1px solid #22222b', padding: '35px 25px', borderRadius: '16px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', fontFamily: 'serif', letterSpacing: '1px', marginBottom: '5px', color: '#fff' }}>TheaterGram</h1>
          <p style={{ color: '#8a8a93', fontSize: '11px', marginBottom: '25px', textTransform: 'uppercase' }}>Exclusive Theater Network</p>
          
          <input type="text" placeholder={t.username} value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #22222b', background: '#181820', color: '#fff', marginBottom: '12px', outline: 'none', fontSize: '13px' }} required />
          <input type="password" placeholder={t.password} value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #22222b', background: '#181820', color: '#fff', marginBottom: '16px', outline: 'none', fontSize: '13px' }} required />
          
          {authError && <p style={{ color: colors.red, fontSize: '12px', marginBottom: '12px', textAlign: 'start' }}>⚠️ {authError}</p>}
          
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#fff', color: '#000', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', marginBottom: '15px' }}>{t.enterBtn}</button>
          
          <div onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} style={{ fontSize: '12px', color: '#8a8a93', cursor: 'pointer', textDecoration: 'underline' }}>
            {isSignUp ? (isFa ? 'قبلاً ثبت‌نام کرده‌ام؟ ورود هنرمند' : 'Already registered? Login') : (isFa ? 'عضویت جدید در جامعه تئاتر' : 'Create an Artist Account')}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: colors.bg, color: colors.text, minHeight: '100vh', direction: isFa ? 'rtl' : 'ltr', paddingBottom: '90px' }}>
      
      {/* هدر مینیمال تئاترگرام */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(25px)', background: isDark ? 'rgba(10,10,12,0.8)' : 'rgba(255,255,255,0.8)', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '18px', fontFamily: 'serif', cursor: 'pointer' }} onClick={() => { setTargetUser(null); setActiveTab('explore'); }}>TheaterGram</span>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => setLang(l => l === 'fa' ? 'en' : 'fa')} style={{ background: 'none', border: 'none', color: colors.text, cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>🌐 {isFa ? 'English' : 'فارسی'}</button>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: 'none', color: colors.text, cursor: 'pointer', fontSize: '14px' }}>{isDark ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <main style={{ maxWidth: '500px', margin: '0 auto', padding: '15px' }}>
        
        {/* ۱. کادر صفحه اکسپلور (تمامی پست‌ها بعد از تایید ادمین) */}
        {activeTab === 'explore' && !targetUser && (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '8px 14px', borderRadius: '8px', border: 'none', background: colors.input, color: colors.text, outline: 'none', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '15px' }}>
              <button onClick={() => setSelectedCategory('all')} style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', border: 'none', background: selectedCategory === 'all' ? colors.accent : colors.input, color: selectedCategory === 'all' ? (isDark ? '#000' : '#fff') : colors.text, cursor: 'pointer', whiteSpace: 'nowrap' }}>{isFa ? 'همه آثار' : 'All'}</button>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', border: 'none', background: selectedCategory === c.id ? colors.accent : colors.input, color: selectedCategory === c.id ? (isDark ? '#000' : '#fff') : colors.text, cursor: 'pointer', whiteSpace: 'nowrap' }}>{isFa ? c.fa : c.en}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {approvedPosts.length === 0 ? (
                <p style={{ color: colors.meta, textAlign: 'center', marginTop: '40px', fontSize: '12px' }}>{t.noPosts}</p>
              ) : (
                approvedPosts.map(post => (
                  <PostCard key={post.id} post={post} colors={colors} t={t} isFa={isFa} isDark={isDark} currentUser={currentUser} onLike={() => core.toggleLike(post.id, post.likes)} onComment={(txt) => core.appendComment(post.id, post.comments, txt)} onUserClick={(uname) => setTargetUser(uname)} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ۲. کادر صفحه کاربری مستقل اینستاگرامی */}
        {(activeTab === 'profile' || targetUser) && (
          <div>
            {targetUser && (
              <button onClick={() => setTargetUser(null)} style={{ background: 'none', border: 'none', color: colors.accent, cursor: 'pointer', marginBottom: '15px', fontSize: '12px', fontWeight: 'bold' }}>{isFa ? '← بازگشت به اکسپلور' : '← Back'}</button>
            )}

            {activeProfileData ? (
              <div style={{ marginBottom: '25px', padding: '0 5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '15px' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: `1px solid ${colors.border}`, backgroundColor: colors.input, backgroundImage: activeProfileData.avatar_url ? `url(${activeProfileData.avatar_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    <div><div style={{ fontWeight: 'bold', fontSize: '15px' }}>{profilePosts.length}</div><div style={{ fontSize: '11px', color: colors.meta }}>{t.etudesCount}</div></div>
                    <div><div style={{ fontWeight: 'bold', fontSize: '15px' }}>{activeProfileData.followers?.length || 0}</div><div style={{ fontSize: '11px', color: colors.meta }}>{t.followers}</div></div>
                    <div><div style={{ fontWeight: 'bold', fontSize: '15px' }}>{activeProfileData.following?.length || 0}</div><div style={{ fontSize: '11px', color: colors.meta }}>{t.following}</div></div>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: 'bold' }}>{activeProfileData.name || activeProfileData.username}</h2>
                  <p style={{ fontSize: '12px', color: colors.meta, marginBottom: '6px' }}>@{activeProfileData.username}</p>
                  <p style={{ fontSize: '12.5px', whiteSpace: 'pre-line', lineHeight: '1.4' }}>{activeProfileData.bio || 'هنوز بیوگرافی تئاتری ثبت نشده است...'}</p>
                </div>

                {currentUser === activeProfileUsername ? (
                  <button onClick={() => setIsEditProfileOpen(true)} style={{ width: '100%', padding: '6px', background: colors.input, color: colors.text, border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveProfile}</button>
                ) : (
                  <button onClick={() => core.toggleFollow(activeProfileUsername!)} style={{ width: '100%', padding: '6px', background: activeProfileData.followers?.includes(currentUser) ? colors.input : colors.accent, color: activeProfileData.followers?.includes(currentUser) ? colors.text : (isDark ? '#000' : '#fff'), border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {activeProfileData.followers?.includes(currentUser) ? t.unfollow : t.follow}
                  </button>
                )}
              </div>
            ) : (
              <p style={{ color: colors.meta, fontSize: '12px' }}>Loading artist context...</p>
            )}

            {/* آرشیو آثار تئاتر هنرمند (جدول ۳ستونه) */}
            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }}>
                {profilePosts.map(post => (
                  <div key={post.id} onClick={() => setSelectedGridPost(post)} style={{ aspectRatio: '1/1', background: '#000', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}>
                    <video src={post.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: post.status === 'pending' ? 0.3 : 1 }} />
                    {post.status === 'pending' && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.5)', fontSize: '9px', color: colors.gold, fontWeight: 'bold' }}>{isFa ? 'در انتظار ارزیابی' : 'Pending'}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px', lineHeight: '1.6' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '15px' }}>{t.about}</h3>
            <p style={{ fontSize: '13px', color: colors.text }}>{t.aboutText}</p>
          </div>
        )}

        {/* میز ارزیابی و تایید ادمین - فقط و فقط برای mehdisoheilinia نمایش داده می‌شود */}
        {activeTab === 'admin' && currentUser === 'mehdisoheilinia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: colors.gold }}>{t.pendingQueue} ({pendingPosts.length})</h2>
            {pendingPosts.length === 0 ? (
              <p style={{ color: colors.meta, fontSize: '12px' }}>{t.noPosts}</p>
            ) : (
              pendingPosts.map(post => (
                <div key={post.id} style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '15px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <b style={{ fontSize: '13px' }}>{post.title}</b>
                    <span style={{ fontSize: '11px', color: colors.meta }}>@{post.username}</span>
                  </div>
                  <video src={post.media_url} controls style={{ width: '100%', borderRadius: '6px', maxHeight: '240px', background: '#000', marginBottom: '10px' }} />
                  <p style={{ fontSize: '12px', color: colors.meta, marginBottom: '10px' }}>{post.description}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => core.approvePost(post.id)} style={{ flex: 1, padding: '8px', background: '#24b33b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{t.approve}</button>
                    <button onClick={() => core.rejectPost(post.id)} style={{ padding: '8px 16px', background: colors.red, color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{t.reject}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* دکمه شناور پاپ‌آپ ایجاد اثر هنری */}
      <button onClick={() => setIsUploadModalOpen(true)} style={{ position: 'fixed', bottom: '75px', [isFa ? 'left' : 'right']: '20px', width: '48px', height: '48px', borderRadius: '50%', background: colors.accent, color: isDark ? '#000' : '#fff', border: 'none', fontSize: '22px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', zIndex: 90 }}>+</button>

      {/* منوی پایینی */}
      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '500px', zIndex: 100, backdropFilter: 'blur(20px)', background: isDark ? 'rgba(10,10,12,0.9)' : 'rgba(255,255,255,0.9)', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
        <button onClick={() => { setTargetUser(null); setActiveTab('explore'); }} style={{ background: 'none', border: 'none', color: activeTab === 'explore' && !targetUser ? colors.accent : colors.meta, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{t.explore}</button>
        <button onClick={() => { setTargetUser(null); setActiveTab('profile'); }} style={{ background: 'none', border: 'none', color: activeTab === 'profile' && !targetUser ? colors.accent : colors.meta, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{t.profile}</button>
        <button onClick={() => { setTargetUser(null); setActiveTab('about'); }} style={{ background: 'none', border: 'none', color: activeTab === 'about' ? colors.accent : colors.meta, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{t.about}</button>
        {currentUser === 'mehdisoheilinia' && (
          <button onClick={() => { setTargetUser(null); setActiveTab('admin'); }} style={{ background: 'none', border: 'none', color: activeTab === 'admin' ? colors.accent : colors.gold, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{t.admin}</button>
        )}
      </nav>

      {/* ================= پاپ‌آپ‌های ظریف و شیشه‌ای (Modals) ================= */}

      {/* ۱. فرم آپلود شیشه‌ای تئاترگرام */}
      {isUploadModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '20px' }}>
          <form onSubmit={handlePostCreation} style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '25px', borderRadius: '16px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{t.uploadTitle}</h3>
              <button type="button" onClick={() => setIsUploadModalOpen(false)} style={{ background: 'none', border: 'none', color: '#8a8a93', cursor: 'pointer', fontSize: '15px' }}>✕</button>
            </div>
            <input type="text" placeholder={t.titlePlaceholder} value={postTitle} onChange={e => setPostTitle(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, outline: 'none', fontSize: '13px' }} required />
            <textarea placeholder={t.descPlaceholder} value={postDesc} onChange={e => setPostDesc(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, outline: 'none', fontSize: '13px', minHeight: '70px', resize: 'none' }} />
            <select value={postCat} onChange={e => setPostCat(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, outline: 'none', fontSize: '13px' }}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{isFa ? c.fa : c.en}</option>)}
            </select>
            <div style={{ border: `1px dashed ${colors.border}`, padding: '20px', borderRadius: '8px', textAlign: 'center', background: colors.bg, cursor: 'pointer' }}>
              <input type="file" accept="video/*,image/*" onChange={e => setMediaFile(e.target.files?.[0] || null)} style={{ fontSize: '12px', width: '100%', color: colors.meta }} required />
              <p style={{ fontSize: '10.5px', color: colors.meta, marginTop: '8px' }}>{t.uploadMedia}</p>
            </div>
            <button type="submit" disabled={uploading} style={{ padding: '11px', background: colors.accent, color: isDark ? '#000' : '#fff', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', marginTop: '5px', opacity: uploading ? 0.5 : 1 }}>
              {uploading ? 'Processing Stage Asset...' : t.submitPost}
            </button>
          </form>
        </div>
      )}

      {/* ۲. فرم شیشه‌ای ویرایش مشخصات هنری */}
      {isEditProfileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '20px' }}>
          <form onSubmit={handleUpdateProfile} style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '25px', borderRadius: '16px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>{t.saveProfile}</h3>
              <button type="button" onClick={() => setIsEditProfileOpen(false)} style={{ background: 'none', border: 'none', color: colors.meta, cursor: 'pointer', fontSize: '15px' }}>✕</button>
            </div>
            <input type="text" placeholder={t.displayName} value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, outline: 'none', fontSize: '13px' }} />
            <input type="text" placeholder={t.bio} value={editBio} onChange={e => setEditBio(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, outline: 'none', fontSize: '13px' }} />
            <div style={{ border: `1px dashed ${colors.border}`, padding: '15px', borderRadius: '8px', background: colors.bg, textAlign: 'center' }}>
              <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} style={{ fontSize: '12px', width: '100%', color: colors.meta }} />
              <p style={{ fontSize: '10.5px', color: colors.meta, marginTop: '6px' }}>{isFa ? 'بارگذاری مستقیم تصویر پروفایل از گالری' : 'Upload profile picture from gallery'}</p>
            </div>
            <button type="submit" disabled={updatingProfile} style={{ padding: '11px', background: colors.accent, color: isDark ? '#000' : '#fff', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: updatingProfile ? 0.5 : 1 }}>
              {updatingProfile ? 'Saving Ledger...' : t.saveProfile}
            </button>
          </form>
        </div>
      )}

      {/* ۳. پاپ‌آی باز کردن پست از روی جدول کاربری */}
      {selectedGridPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '10px' }}>
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', width: '100%', maxWidth: '440px', overflow: 'hidden', position: 'relative', padding: '12px' }}>
            <button onClick={() => setSelectedGridPost(null)} style={{ position: 'absolute', top: '15px', [isFa ? 'left' : 'right']: '15px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>✕</button>
            <PostCard post={selectedGridPost} colors={colors} t={t} isFa={isFa} isDark={isDark} currentUser={currentUser} onLike={() => core.toggleLike(selectedGridPost.id, selectedGridPost.likes)} onComment={(txt) => core.appendComment(selectedGridPost.id, selectedGridPost.comments, txt)} onUserClick={(uname) => { setSelectedGridPost(null); setTargetUser(uname); }} />
          </div>
        </div>
      )}

    </div>
  );
}

function PostCard({ post, colors, t, isFa, isDark, currentUser, onLike, onComment, onUserClick }: { post: EtudePost; colors: any; t: any; isFa: boolean; isDark: boolean; currentUser: string; onLike: () => void; onComment: (text: string) => void; onUserClick: (uname: string) => void }) {
  const [comInput, setComInput] = useState('');
  const hasLiked = post.likes?.includes(currentUser);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comInput.trim()) {
      onComment(comInput.trim());
      setComInput('');
    }
  };

  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => onUserClick(post.username)}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: colors.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>🎭</div>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{post.artist_name || post.username}</span>
        </div>
        <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '10px', background: colors.input, color: colors.meta }}>
          {isFa ? (CATEGORIES.find(c => c.id === post.category)?.fa || post.category) : (CATEGORIES.find(c => c.id === post.category)?.en || post.category)}
        </span>
      </div>

      <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', background: '#000', border: `1px solid ${colors.border}` }}>
        <video src={post.media_url} controls loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '2px 0' }}>
        <button onClick={onLike} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px', color: colors.text }}>
          {hasLiked ? '❤️' : '🤍'} <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{post.likes?.length || 0}</span>
        </button>
        <span style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}>💬 <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{post.comments?.length || 0}</span></span>
      </div>

      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' }}>{post.title}</h4>
        <p style={{ fontSize: '12px', color: colors.meta, lineHeight: '1.4' }}>{post.description}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ maxHeight: '80px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {post.comments?.map((c: any) => (
            <div key={c.id} style={{ fontSize: '11.5px', lineHeight: '1.3' }}>
              <b style={{ cursor: 'pointer', color: '#007aff' }} onClick={() => onUserClick(c.username)}>@{c.username} </b>
              <span style={{ color: colors.text }}>{c.text}</span>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmitComment} style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
          <input type="text" placeholder={t.addComment} value={comInput} onChange={e => setComInput(e.target.value)} style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: 'none', background: colors.input, color: colors.text, outline: 'none', fontSize: '12px' }} />
          <button type="submit" style={{ padding: '0 8px', borderRadius: '6px', background: 'none', color: '#007aff', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>➔</button>
        </form>
      </div>

    </div>
  );
}
