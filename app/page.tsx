'use client';

import React, { useState, useEffect } from 'react';
import { useTheaterCore, supabase } from './useTheaterCore';
import { CATEGORIES, TRANSLATIONS, EtudePost } from './constants';

export default function Page() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'profile' | 'explore' | 'admin'>('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('rehearsal');
  const [targetUser, setTargetUser] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [selectedGridPost, setSelectedGridPost] = useState<EtudePost | null>(null);

  // وضعیت آپلود پست
  const [postTitle, setPostTitle] = useState('اثر جدید');
  const [postDesc, setPostDesc] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // وضعیت ویرایش پروفایل
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // تغییر رمز عبور
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const core = useTheaterCore(currentUser || '');

  const isDark = theme === 'dark';
  const isFa = lang === 'fa';
  const t = TRANSLATIONS[lang];

  const colors = {
    bg: isDark ? '#000000' : '#ffffff',
    card: isDark ? '#121214' : '#f8f9fa',
    text: isDark ? '#ffffff' : '#000000',
    border: isDark ? '#222226' : '#dbdbdb',
    input: isDark ? '#1a1a1e' : '#f0f2f5',
    accent: isDark ? '#ffffff' : '#000000',
    meta: '#8e8e93',
    blue: '#0095f6',
    red: '#ff3b30'
  };

  // اسپلش اسکرین ۱ ثانیه‌ای کاملاً شیک در مرکز صفحه
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentUser && core.profiles[currentUser]) {
      const p = core.profiles[currentUser];
      setEditName(p.name || '');
      setEditBio(p.bio || '');
      setEditUsername(p.username || currentUser);
      setAvatarPreview(p.avatar_url || '');
    }
  }, [currentUser, core.profiles]);

  const handleSecureAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanUsername = usernameInput.toLowerCase().trim();

    if (!cleanUsername || !passwordInput) {
      setAuthError(isFa ? 'لطفاً تمامی فیلدها را کامل کنید.' : 'Fields cannot be empty.');
      return;
    }

    if (cleanUsername === 'mehdisoheilinia') {
      if (passwordInput !== '10119107') {
        setAuthError(isFa ? 'گذرواژه ارزیابی ادمین تئاترگرام اشتباه است.' : 'Invalid Passcode.');
        return;
      }
      setCurrentUser(cleanUsername);
      return;
    }

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', cleanUsername)
      .single();

    if (isSignUp) {
      if (existingUser) {
        setAuthError(isFa ? 'این نام کاربری قبلاً توسط هنرمند دیگری رزرو شده.' : 'Username taken.');
      } else {
        await supabase.from('profiles').insert([{ username: cleanUsername, name: cleanUsername, bio: '', followers: [], following: [] }]);
        setCurrentUser(cleanUsername);
      }
    } else {
      if (!existingUser) {
        setAuthError(isFa ? 'حساب کاربری یافت نشد. ابتدا عضو شوید.' : 'User not found.');
      } else {
        setCurrentUser(cleanUsername);
      }
    }
  };

  const handlePostCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) {
      alert(isFa ? 'لطفاً ابتدا یک فایل ویدیو یا عکس انتخاب کنید.' : 'Please select media first.');
      return;
    }

    setUploading(true);
    const url = await core.uploadMediaAsset(mediaFile, 'MEDIA');
    if (url) {
      const success = await core.createPost(postTitle, postDesc, selectedCategory, url);
      if (success) {
        setPostDesc('');
        setMediaFile(null);
        alert(isFa ? 'اثر بارگذاری شد و به میز ارزیابی مدیریت منتقل گردید.' : 'Sent to Admin Review Desk.');
      } else {
        alert(isFa ? 'خطا در ثبت پست در پایگاه داده.' : 'Database Insertion Fail.');
      }
    } else {
      alert(isFa ? 'خطا در آپلود فایل به سرور. مطمئن شوید باکت‌های MEDIA و AVATARS در Storage ایجاد شده و Public هستند.' : 'Storage Upload Fail. Check Buckets.');
    }
    setUploading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    let finalAvatarUrl = core.profiles[currentUser || '']?.avatar_url || '';

    if (avatarFile) {
      const uploadedUrl = await core.uploadMediaAsset(avatarFile, 'AVATARS');
      if (uploadedUrl) finalAvatarUrl = uploadedUrl;
    }

    const success = await core.syncProfileState(editName, editBio, finalAvatarUrl);
    if (success) {
      setIsEditProfileOpen(false);
      setAvatarFile(null);
      alert(t.successAlert);
    }
    setUpdatingProfile(false);
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setChangingPassword(true);
    const { error } = await supabase
      .from('profiles')
      .update({ password_hash: newPassword })
      .eq('username', currentUser);

    if (!error) {
      alert(isFa ? 'رمز عبور جدید با موفقیت ثبت و ذخیره شد.' : 'Password updated.');
      setIsChangePasswordOpen(false);
      setNewPassword('');
    } else {
      alert(isFa ? 'خطا در ذخیره رمز عبور.' : 'Password change failed.');
    }
    setChangingPassword(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsMenuOpen(false);
    setActiveTab('profile');
    setTargetUser(null);
  };

  const approvedPosts = core.posts.filter(p => {
    if (p.status !== 'approved') return false;
    if (searchQuery.trim() && !p.username.includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pendingPosts = core.posts.filter(p => p.status === 'pending');
  const activeProfileUsername = targetUser || currentUser;
  const activeProfileData = core.profiles[activeProfileUsername || ''];
  const headerDisplayUser = targetUser ? core.profiles[targetUser] : core.profiles[currentUser || ''];
  const profilePosts = core.posts.filter(p => p.username === activeProfileUsername && (p.status === 'approved' || (p.status === 'pending' && activeProfileUsername === currentUser)));

  const mobileWrapperStyle: React.CSSProperties = {
    maxWidth: '100%',
    boxSizing: 'border-box'
  };

  if (showSplash) {
    return (
      <div style={{ background: '#000000', color: '#ffffff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', letterSpacing: '2px', fontFamily: 'serif' }}>TheaterGram</h1>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ background: '#000000', color: '#ffffff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', boxSizing: 'border-box' }}>
        <form onSubmit={handleSecureAuth} style={{ width: '100%', maxWidth: '325px', background: '#121212', border: '1px solid #262626', padding: '30px 20px', borderRadius: '12px', textAlign: 'center', boxSizing: 'border-box' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', fontFamily: 'serif', marginBottom: '25px', letterSpacing: '0.5px' }}>TheaterGram</h1>
          <input type="text" placeholder={t.username} value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #262626', background: '#1c1c1e', color: '#fff', marginBottom: '12px', outline: 'none', fontSize: '13px', textAlign: 'center', boxSizing: 'border-box' }} required />
          <input type="password" placeholder={t.password} value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #262626', background: '#1c1c1e', color: '#fff', marginBottom: '15px', outline: 'none', fontSize: '13px', textAlign: 'center', boxSizing: 'border-box' }} required />
          {authError && <p style={{ color: colors.red, fontSize: '12px', marginBottom: '12px' }}>⚠️ {authError}</p>}
          <button type="submit" style={{ width: '100%', padding: '11px', background: '#ffffff', color: '#000000', fontWeight: 'bold', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', marginBottom: '15px', boxSizing: 'border-box' }}>{t.enterBtn}</button>
          <div onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} style={{ fontSize: '12px', color: colors.meta, cursor: 'pointer', textDecoration: 'underline' }}>
            {isSignUp ? 'ورود به حساب هنرمند' : 'ایجاد حساب کاربری جدید تخصصی'}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: colors.bg, color: colors.text, minHeight: '100vh', direction: isFa ? 'rtl' : 'ltr', paddingBottom: '80px', boxSizing: 'border-box' }}>
      
      {/* هدر بالایی با کادر فوق‌العاده مینیمال هویت‌سنجی در سمت راست */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: colors.card, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', boxSizing: 'border-box', height: '54px' }}>
        
        {/* کادر کوچک هویتی و هویت‌سنجی در سمت راست هدر */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '45%', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', padding: '4px 8px', borderRadius: '20px', border: `1px solid ${colors.border}` }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', border: `1px solid ${colors.border}`, background: colors.input, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: headerDisplayUser?.avatar_url ? `url(${headerDisplayUser.avatar_url})` : 'none', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.2' }}>{headerDisplayUser?.name || activeProfileUsername}</span>
            <span style={{ fontSize: '9px', color: colors.meta, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1' }}>@{activeProfileUsername}</span>
          </div>
          
          {/* دکمه کوچک دنبال کردن در کنار نام کاربری داخل کادر هویت */}
          {targetUser && targetUser !== currentUser && (
            <button onClick={() => core.toggleFollow(targetUser)} style={{ padding: '2px 6px', background: core.profiles[targetUser]?.followers?.includes(currentUser) ? 'none' : '#ffffff', color: core.profiles[targetUser]?.followers?.includes(currentUser) ? colors.text : '#000000', border: `1px solid ${colors.border}`, borderRadius: '12px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer', marginRight: '4px', marginLeft: '4px', flexShrink: 0 }}>
              {core.profiles[targetUser]?.followers?.includes(currentUser) ? '✓' : '+'}
            </button>
          )}
        </div>

        {/* نام ثابت برنامه در مرکز به صورت انگلیسی */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'serif', letterSpacing: '0.5px' }}>TheaterGram</span>
        </div>

        {/* منو در سمت چپ هدر */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', color: colors.text, fontSize: '18px', cursor: 'pointer', padding: '4px' }}>☰</button>
        </div>
      </header>

      {/* منوی همبرگری کشویی */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', top: '55px', [isFa ? 'left' : 'right']: '10px', width: '210px', background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '8px', zIndex: 110, padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 8px 25px rgba(0,0,0,0.6)' }}>
          <button onClick={() => { setLang(l => l === 'fa' ? 'en' : 'fa'); setIsMenuOpen(false); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: colors.text, textAlign: isFa ? 'right' : 'left', cursor: 'pointer', fontSize: '12.5px' }}>🌐 {t.changeLang}</button>
          <button onClick={() => { setTheme(t => t === 'dark' ? 'light' : 'dark'); setIsMenuOpen(false); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: colors.text, textAlign: isFa ? 'right' : 'left', cursor: 'pointer', fontSize: '12.5px' }}>🌗 {t.changeTheme}</button>
          <button onClick={() => { setIsAboutOpen(true); setIsMenuOpen(false); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: colors.text, textAlign: isFa ? 'right' : 'left', cursor: 'pointer', fontSize: '12.5px' }}>ℹ️ {t.about}</button>
          <button onClick={() => { setIsChangePasswordOpen(true); setIsMenuOpen(false); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: colors.text, textAlign: isFa ? 'right' : 'left', cursor: 'pointer', fontSize: '12.5px' }}>🔑 {t.changePassword}</button>
          <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}`, margin: '4px 0' }} />
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: colors.red, textAlign: isFa ? 'right' : 'left', cursor: 'pointer', fontSize: '12.5px', fontWeight: 'bold' }}>🚪 {t.logout}</button>
        </div>
      )}

      <main style={{ maxWidth: '460px', margin: '0 auto', padding: '12px', boxSizing: 'border-box' }}>
        
        {/* ۱. صفحه کاربری و پروفایل */}
        {(activeTab === 'profile' || targetUser) && (
          <div style={mobileWrapperStyle}>
            {targetUser && (
              <button onClick={() => setTargetUser(null)} style={{ background: 'none', border: 'none', color: colors.text, cursor: 'pointer', marginBottom: '12px', fontSize: '12.5px', fontWeight: 'bold', display: 'block' }}>{isFa ? '← بازگشت به اکسپلور' : '← Back to Explore'}</button>
            )}

            {activeProfileData && (
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '14px', borderRadius: '12px', marginBottom: '15px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', gap: '15px', fontSize: '12px', marginBottom: '10px', color: colors.meta }}>
                  <span><strong style={{ color: colors.text }}>{activeProfileData.followers?.length || 0}</strong> {t.followers}</span>
                  <span><strong style={{ color: colors.text }}>{activeProfileData.following?.length || 0}</strong> {t.following}</span>
                </div>
                {activeProfileData.bio && (
                  <p style={{ fontSize: '12px', color: colors.text, opacity: 0.9, marginBottom: '10px', whiteSpace: 'pre-line' }}>{activeProfileData.bio}</p>
                )}
                {currentUser === activeProfileUsername && (
                  <button onClick={() => setIsEditProfileOpen(true)} style={{ width: '100%', padding: '6px', background: 'none', border: `1px solid ${colors.border}`, color: colors.text, borderRadius: '6px', fontSize: '11.5px', cursor: 'pointer' }}>ویرایش جزئیات بیوگرافی و عکس</button>
                )}
              </div>
            )}

            {/* فرم ارسال پست - مستقیماً به صف بررسی ادمین متصل است */}
            {currentUser === activeProfileUsername && (
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '14px', borderRadius: '12px', marginBottom: '15px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '12px', paddingBottom: '4px' }}>
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '12px', border: 'none', background: selectedCategory === c.id ? colors.accent : colors.input, color: selectedCategory === c.id ? colors.bg : colors.text, cursor: 'pointer', whiteSpace: 'nowrap' }}>{isFa ? c.fa : c.en}</button>
                  ))}
                </div>

                <form onSubmit={handlePostCreation} style={{ display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box' }}>
                  <div style={{ border: `1px dashed ${colors.border}`, padding: '16px', borderRadius: '8px', textAlign: 'center', background: colors.bg, position: 'relative', boxSizing: 'border-box' }}>
                    <input type="file" accept="video/*,image/*" onChange={e => setMediaFile(e.target.files?.[0] || null)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                    <span style={{ fontSize: '12.5px', color: colors.text, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mediaFile ? `📄 ${mediaFile.name}` : t.uploadMedia}</span>
                  </div>
                  <textarea placeholder={t.descPlaceholder} value={postDesc} onChange={e => setPostDesc(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: colors.input, color: colors.text, border: 'none', outline: 'none', fontSize: '13px', minHeight: '55px', resize: 'none', boxSizing: 'border-box' }} />
                  <button type="submit" disabled={uploading} style={{ width: '100%', padding: '10px', background: colors.accent, color: colors.bg, fontWeight: 'bold', borderRadius: '8px', border: 'none', fontSize: '12.5px', cursor: 'pointer', boxSizing: 'border-box' }}>
                    {uploading ? 'در حال ارسال به ادمین...' : t.submitPost}
                  </button>
                </form>
              </div>
            )}

            {/* نمای اینستاگرامی شبکه آثار */}
            <h3 style={{ fontSize: '12px', color: colors.meta, marginBottom: '8px' }}>{t.gridTitle}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', boxSizing: 'border-box' }}>
              {profilePosts.map(post => (
                <div key={post.id} onClick={() => setSelectedGridPost(post)} style={{ aspectRatio: '1/1', background: '#08080a', position: 'relative', cursor: 'pointer', borderRadius: '4px', overflow: 'hidden' }}>
                  <MediaRenderer url={post.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: post.status === 'pending' ? 0.4 : 1 }} />
                  {post.status === 'pending' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.6)', fontSize: '9px', color: '#ffb300', fontWeight: 'bold', textAlign: 'center', padding: '2px' }}>در انتظار بررسی مدیر</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ۲. فلو اکسپلور عمومی */}
        {activeTab === 'explore' && !targetUser && (
          <div style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '12px', boxSizing: 'border-box' }}>
              <input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', background: colors.input, color: colors.text, outline: 'none', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
              {approvedPosts.length === 0 ? (
                <p style={{ color: colors.meta, textAlign: 'center', fontSize: '12.5px', marginTop: '40px' }}>{t.noPosts}</p>
              ) : (
                approvedPosts.map(post => (
                  <PostCard key={post.id} post={post} colors={colors} t={t} isFa={isFa} currentUser={currentUser} onLike={() => core.toggleLike(post.id, post.likes)} onComment={(txt) => core.appendComment(post.id, post.comments, txt)} onUserClick={(uname) => setTargetUser(uname)} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ۳. صفحه مدیریت متصل به تمام کاربران */}
        {activeTab === 'admin' && currentUser === 'mehdisoheilinia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '100%' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffb300' }}>{t.pendingQueue} ({pendingPosts.length})</h2>
            {pendingPosts.length === 0 ? (
              <p style={{ color: colors.meta, fontSize: '12.5px' }}>هیچ پست جدیدی از سمت کاربران ارسال نشده است.</p>
            ) : (
              pendingPosts.map(post => (
                <div key={post.id} style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '14px', borderRadius: '12px', boxSizing: 'border-box' }}>
                  <p style={{ fontSize: '12.5px', marginBottom: '8px', color: colors.meta }}>ارسال از هنرمند: <strong style={{ color: colors.text }}>@{post.username}</strong></p>
                  <div style={{ width: '100%', maxHeight: '240px', overflow: 'hidden', borderRadius: '6px', marginBottom: '10px', background: '#000' }}>
                    <MediaRenderer url={post.media_url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <p style={{ fontSize: '13px', color: colors.text, marginBottom: '12px' }}>{post.description}</p>
                  <div style={{ display: 'flex', gap: '8px', boxSizing: 'border-box' }}>
                    <button onClick={() => core.approvePost(post.id)} style={{ flex: 1, padding: '9px', background: '#24b33b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 'bold' }}>{t.approve}</button>
                    <button onClick={() => core.rejectPost(post.id)} style={{ padding: '9px 14px', background: colors.red, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12.5px' }}>{t.reject}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* ناوبری پایینی پلتفرم */}
      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '460px', zIndex: 100, background: colors.bg, borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-around', padding: '12px 0', boxSizing: 'border-box' }}>
        <button onClick={() => { setTargetUser(null); setActiveTab('explore'); }} style={{ background: 'none', border: 'none', color: activeTab === 'explore' ? colors.text : colors.meta, fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer' }}>🧭 {t.explore}</button>
        <button onClick={() => { setTargetUser(null); setActiveTab('profile'); }} style={{ background: 'none', border: 'none', color: activeTab === 'profile' && !targetUser ? colors.text : colors.meta, fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer' }}>👤 {t.profile}</button>
        {currentUser === 'mehdisoheilinia' && (
          <button onClick={() => { setTargetUser(null); setActiveTab('admin'); }} style={{ background: 'none', border: 'none', color: activeTab === 'admin' ? '#ffb300' : colors.meta, fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer' }}>⚙️ {t.admin}</button>
        )}
      </nav>

      {/* پاپ‌آپ درباره برنامه */}
      {isAboutOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '16px', boxSizing: 'border-box' }}>
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px', maxWidth: '340px', width: '100%', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>{t.about}</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '15px', color: colors.meta }}>{t.aboutText}</p>
            <button onClick={() => setIsAboutOpen(false)} style={{ width: '100%', padding: '9px', background: colors.text, color: colors.bg, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.close}</button>
          </div>
        </div>
      )}

      {/* پاپ‌آپ ویرایش پروفایل (حل باگ وب‌کیت و تار شدن پس‌زمینه) */}
      {isEditProfileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '16px', boxSizing: 'border-box' }}>
          <form onSubmit={handleUpdateProfile} style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px', maxWidth: '340px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>{t.saveProfile}</h3>
            <input type="text" placeholder={t.displayName} value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontSize: '13px', boxSizing: 'border-box', width: '100%' }} />
            <input type="text" placeholder={t.bio} value={editBio} onChange={e => setEditBio(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontSize: '13px', boxSizing: 'border-box', width: '100%' }} />
            <div style={{ border: `1px dashed ${colors.border}`, padding: '12px', borderRadius: '6px', background: colors.bg, textAlign: 'center', position: 'relative', boxSizing: 'border-box' }}>
              <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
              <span style={{ fontSize: '12px', color: colors.meta }}>{avatarFile ? `📸 ${avatarFile.name}` : 'انتخاب تصویر پروفایل از گالری'}</span>
            </div>
            <button type="submit" disabled={updatingProfile} style={{ width: '100%', padding: '10px', background: colors.text, color: colors.bg, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxSizing: 'border-box' }}>
              {updatingProfile ? 'در حال ذخیره‌سازی...' : t.saveProfile}
            </button>
            <button type="button" onClick={() => setIsEditProfileOpen(false)} style={{ background: 'none', border: 'none', color: colors.meta, cursor: 'pointer', fontSize: '12px' }}>{t.close}</button>
          </form>
        </div>
      )}

      {/* پاپ‌آپ تغییر رمز عبور */}
      {isChangePasswordOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '16px', boxSizing: 'border-box' }}>
          <form onSubmit={handlePasswordChangeSubmit} style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px', maxWidth: '340px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>{t.changePassword}</h3>
            <input type="password" placeholder={t.newPasswordPlaceholder} value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontSize: '13px', boxSizing: 'border-box', width: '100%', outline: 'none' }} required />
            <button type="submit" disabled={changingPassword} style={{ width: '100%', padding: '10px', background: colors.text, color: colors.bg, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxSizing: 'border-box' }}>
              {changingPassword ? 'در حال ذخیره‌سازی...' : t.changePassword}
            </button>
            <button type="button" onClick={() => setIsChangePasswordOpen(false)} style={{ background: 'none', border: 'none', color: colors.meta, cursor: 'pointer', fontSize: '12px' }}>{t.close}</button>
          </form>
        </div>
      )}

      {/* پاپ‌آپ مشاهده پست شبکه */}
      {selectedGridPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '12px', boxSizing: 'border-box' }}>
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', width: '100%', maxWidth: '400px', overflow: 'hidden', position: 'relative', padding: '10px', boxSizing: 'border-box' }}>
            <button onClick={() => setSelectedGridPost(null)} style={{ position: 'absolute', top: '15px', [isFa ? 'left' : 'right']: '15px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>✕</button>
            <PostCard post={selectedGridPost} colors={colors} t={t} isFa={isFa} currentUser={currentUser} onLike={() => core.toggleLike(selectedGridPost.id, selectedGridPost.likes)} onComment={(txt) => core.appendComment(selectedGridPost.id, selectedGridPost.comments, txt)} onUserClick={(uname) => { setSelectedGridPost(null); setTargetUser(uname); }} />
          </div>
        </div>
      )}

    </div>
  );
}

function MediaRenderer({ url, style, controls, ...props }: { url: string; style?: React.CSSProperties; controls?: boolean; [key: string]: any }) {
  const isVideo = url?.match(/\.(mp4|webm|ogg|mov|quicktime)/i) || url?.includes('video');
  if (isVideo) {
    return <video src={url} controls={controls} loop muted playsInline style={style} {...props} />;
  }
  return <img src={url} alt="Theater Asset" style={style} {...props} />;
}

function PostCard({ post, colors, t, isFa, currentUser, onLike, onComment, onUserClick }: { post: EtudePost; colors: any; t: any; isFa: boolean; currentUser: string; onLike: () => void; onComment: (text: string) => void; onUserClick?: (uname: string) => void }) {
  const [comInput, setComInput] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comInput.trim()) {
      onComment(comInput.trim());
      setComInput('');
    }
  };

  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b style={{ fontSize: '13px', cursor: 'pointer' }} onClick={() => onUserClick && onUserClick(post.username)}>@{post.username}</b>
        <span style={{ fontSize: '11px', color: colors.meta }}>
          {CATEGORIES.find(c => c.id === post.category)?.fa || post.category}
        </span>
      </div>
      <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', background: '#000', border: `1px solid ${colors.border}` }}>
        <MediaRenderer url={post.media_url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '2px 0' }}>
        <button onClick={onLike} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: colors.text }}>
          {post.likes?.includes(currentUser) ? '❤️' : '🤍'} {post.likes?.length || 0}
        </button>
        <span style={{ fontSize: '13px' }}>💬 {post.comments?.length || 0}</span>
      </div>
      {post.description && (
        <p style={{ fontSize: '12.5px', color: colors.text, opacity: 0.8, lineHeight: '1.4', margin: '2px 0' }}>{post.description}</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
        <div style={{ maxHeight: '60px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {post.comments?.map((c: any) => (
            <div key={c.id} style={{ fontSize: '11.5px' }}>
              <span style={{ color: colors.meta, cursor: 'pointer' }} onClick={() => onUserClick && onUserClick(c.username)}>@{c.username}: </span>
              <span>{c.text}</span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmitComment} style={{ display: 'flex', gap: '6px', marginTop: '4px', boxSizing: 'border-box' }}>
          <input type="text" placeholder={t.addComment} value={comInput} onChange={e => setComInput(e.target.value)} style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: 'none', background: colors.input, color: colors.text, outline: 'none', fontSize: '12px', boxSizing: 'border-box' }} />
          <button type="submit" style={{ background: 'none', color: '#0095f6', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>➔</button>
        </form>
      </div>
    </div>
  );
}
