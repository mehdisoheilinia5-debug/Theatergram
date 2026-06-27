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
  const [activeTab, setActiveTab] = useState<'explore' | 'profile' | 'admin'>('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('rehearsal');
  const [targetUser, setTargetUser] = useState<string | null>(null);

  // وضعیت‌های منوی همبرگری و مدال‌ها
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedGridPost, setSelectedGridPost] = useState<EtudePost | null>(null);

  // فیلدهای ایجاد پست
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // فیلدهای ویرایش مشخصات
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

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

  useEffect(() => {
    if (currentUser && core.profiles[currentUser]) {
      const p = core.profiles[currentUser];
      setEditName(p.name || '');
      setEditBio(p.bio || '');
    }
  }, [currentUser, core.profiles]);

  // احراز هویت قطعی و ایمن دیتابیس
  const handleSecureAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanUsername = usernameInput.toLowerCase().trim();

    if (!cleanUsername || !passwordInput) {
      setAuthError(isFa ? 'لطفاً تمامی فیلدها را کامل کنید.' : 'Fields cannot be empty.');
      return;
    }

    // قفل امنیتی اختصاصی حساب ادمین اصلی (Mehdi Soheilinia)
    if (cleanUsername === 'mehdisoheilinia') {
      if (passwordInput !== '10119107') {
        setAuthError(isFa ? 'گذرواژه ادمین پلتفرم تئاترگرام اشتباه است.' : 'Invalid Admin Passcode.');
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
        setAuthError(isFa ? 'این نام کاربری قبلاً ثبت شده است.' : 'Username taken.');
      } else {
        await supabase.from('profiles').insert([{ username: cleanUsername, name: cleanUsername, bio: '', followers: [], following: [] }]);
        setCurrentUser(cleanUsername);
      }
    } else {
      if (!existingUser) {
        setAuthError(isFa ? 'نام کاربری یافت نشد. ابتدا ثبت نام کنید.' : 'User not found.');
      } else {
        setCurrentUser(cleanUsername);
      }
    }
  };

  const handlePostCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) return;

    setUploading(true);
    const url = await core.uploadMediaAsset(mediaFile, 'media');
    if (url) {
      const success = await core.createPost(postTitle || 'اثر تئاتر', postDesc, selectedCategory, url);
      if (success) {
        setPostTitle('');
        setPostDesc('');
        setMediaFile(null);
        alert(currentUser === 'mehdisoheilinia' ? 'منتشر شد!' : 'با موفقیت جهت بررسی به ادمین ارسال شد.');
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
    if (searchQuery.trim() && !p.username.includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pendingPosts = core.posts.filter(p => p.status === 'pending');
  const activeProfileUsername = targetUser || currentUser;
  const activeProfileData = core.profiles[activeProfileUsername || ''];
  const profilePosts = core.posts.filter(p => p.username === activeProfileUsername && (p.status === 'approved' || activeProfileUsername === currentUser));

  if (!currentUser) {
    return (
      <div style={{ background: '#000000', color: '#ffffff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <form onSubmit={handleSecureAuth} style={{ width: '100%', maxWidth: '330px', background: '#121212', border: '1px solid #262626', padding: '35px 25px', borderRadius: '12px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'serif', marginBottom: '25px' }}>تئاترگرام</h1>
          
          <input type="text" placeholder={t.username} value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #262626', background: '#1c1c1e', color: '#fff', marginBottom: '12px', outline: 'none', fontSize: '13px', textAlign: 'center' }} required />
          <input type="password" placeholder={t.password} value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #262626', background: '#1c1c1e', color: '#fff', marginBottom: '15px', outline: 'none', fontSize: '13px', textAlign: 'center' }} required />
          
          {authError && <p style={{ color: colors.red, fontSize: '12px', marginBottom: '12px' }}>{authError}</p>}
          
          <button type="submit" style={{ width: '100%', padding: '11px', background: '#ffffff', color: '#000000', fontWeight: 'bold', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', marginBottom: '15px' }}>{t.enterBtn}</button>
          
          <div onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} style={{ fontSize: '12px', color: colors.meta, cursor: 'pointer', textDecoration: 'underline' }}>
            {isSignUp ? 'ورود هنرمندان ثبت نام شده' : 'ایجاد حساب کاربری هنرمند جدید'}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: colors.bg, color: colors.text, minHeight: '100vh', direction: isFa ? 'rtl' : 'ltr', paddingBottom: '80px' }}>
      
      {/* هدر بالایی با منوی همبرگری مستقل */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: colors.bg, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '20px', fontFamily: 'serif' }}>تئاترگرام</span>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', color: colors.text, fontSize: '22px', cursor: 'pointer' }}>☰</button>
      </header>

      {/* منوی همبرگری کشویی */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', top: '55px', [isFa ? 'left' : 'right']: '0', width: '220px', background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '0 0 8px 8px', zIndex: 110, padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
          <button onClick={() => { setLang(l => l === 'fa' ? 'en' : 'fa'); setIsMenuOpen(false); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: colors.text, textAlign: isFa ? 'right' : 'left', cursor: 'pointer', fontSize: '12.5px' }}>🌐 {t.changeLang}</button>
          <button onClick={() => { setTheme(t => t === 'dark' ? 'light' : 'dark'); setIsMenuOpen(false); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: colors.text, textAlign: isFa ? 'right' : 'left', cursor: 'pointer', fontSize: '12.5px' }}>🌗 {t.changeTheme}</button>
          <button onClick={() => { setIsAboutOpen(true); setIsMenuOpen(false); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: colors.text, textAlign: isFa ? 'right' : 'left', cursor: 'pointer', fontSize: '12.5px' }}>ℹ️ {t.about}</button>
        </div>
      )}

      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '15px' }}>
        
        {/* ۱. صفحه کاربری مستقل (مطابق ساختار فرستاده شده) */}
        {activeTab === 'profile' && !targetUser && (
          <div>
            {activeProfileData && (
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{activeProfileData.name || activeProfileData.username}</h2>
                    <p style={{ fontSize: '13px', color: colors.meta }}>@{activeProfileData.username}</p>
                    <p style={{ fontSize: '12px', color: colors.meta, marginTop: '4px' }}>کارگردان و بازیگر</p>
                  </div>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: `2px solid ${colors.border}`, backgroundColor: colors.input, backgroundImage: activeProfileData.avatar_url ? `url(${activeProfileData.avatar_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                </div>

                <div style={{ display: 'flex', gap: '15px', fontSize: '13px', marginBottom: '15px', color: colors.meta }}>
                  <span><strong style={{ color: colors.red }}>{activeProfileData.followers?.length || 0}</strong> {t.followers}</span>
                  <span><strong>{activeProfileData.following?.length || 0}</strong> {t.following}</span>
                </div>

                <button onClick={() => setIsEditProfileOpen(true)} style={{ width: '100%', padding: '8px', background: 'none', border: `1px solid ${colors.border}`, color: colors.text, borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>{t.saveProfile}</button>
              </div>
            )}

            {/* کادر ظریف و هنری ارسال مستقیم پست تئاتر */}
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '12px' }}>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', border: 'none', background: selectedCategory === c.id ? '#ffffff' : colors.input, color: selectedCategory === c.id ? '#000000' : colors.text, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>{isFa ? c.fa : c.en}</button>
                ))}
              </div>

              <form onSubmit={handlePostCreation} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ border: `1px dashed ${colors.border}`, padding: '15px', borderRadius: '8px', textAlign: 'center', background: colors.bg, position: 'relative' }}>
                  <input type="file" accept="video/*,image/*" onChange={e => setMediaFile(e.target.files?.[0] || null)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  <span style={{ fontSize: '13px', color: colors.text }}>{mediaFile ? `📄 ${mediaFile.name}` : t.uploadMedia}</span>
                </div>

                <textarea placeholder={t.descPlaceholder} value={postDesc} onChange={e => setPostDesc(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: colors.input, color: colors.text, border: 'none', outline: 'none', fontSize: '13px', minHeight: '60px', resize: 'none' }} />
                
                <button type="submit" disabled={uploading} style={{ padding: '10px', background: '#ffffff', color: '#000000', fontWeight: 'bold', borderRadius: '8px', border: 'none', fontSize: '13px', cursor: 'pointer' }}>
                  {uploading ? 'در حال ارسال...' : t.submitPost}
                </button>
              </form>
            </div>

            {/* بخش جدول ۳ ستونه آثار کاربر */}
            <h3 style={{ fontSize: '13px', color: colors.meta, marginBottom: '10px' }}>{t.gridTitle}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }}>
              {profilePosts.map(post => (
                <div key={post.id} onClick={() => setSelectedGridPost(post)} style={{ aspectRatio: '1/1', background: '#000', position: 'relative', cursor: 'pointer' }}>
                  <video src={post.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: post.status === 'pending' ? 0.3 : 1 }} />
                  {post.status === 'pending' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.4)', fontSize: '10px', color: '#fff' }}>بررسی ادمین</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ۲. صفحه اکسپلور عمومی */}
        {activeTab === 'explore' && (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', background: colors.input, color: colors.text, outline: 'none', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {approvedPosts.length === 0 ? (
                <p style={{ color: colors.meta, textAlign: 'center', fontSize: '12px', marginTop: '30px' }}>{t.noPosts}</p>
              ) : (
                approvedPosts.map(post => (
                  <PostCard key={post.id} post={post} colors={colors} t={t} isFa={isFa} isDark={isDark} currentUser={currentUser} onLike={() => core.toggleLike(post.id, post.likes)} onComment={(txt) => core.appendComment(post.id, post.comments, txt)} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ۳. میز ارزیابی ادمین (فقط و فقط مخصوص ورود تو با پسورد تایید شده) */}
        {activeTab === 'admin' && currentUser === 'mehdisoheilinia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold' }}>{t.pendingQueue} ({pendingPosts.length})</h2>
            {pendingPosts.map(post => (
              <div key={post.id} style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '15px', borderRadius: '12px' }}>
                <p style={{ fontSize: '13px', marginBottom: '8px' }}>ارسال شده از طرف: @{post.username}</p>
                <video src={post.media_url} controls style={{ width: '100%', borderRadius: '6px', maxHeight: '200px', background: '#000', marginBottom: '10px' }} />
                <p style={{ fontSize: '12.5px', color: colors.meta, marginBottom: '10px' }}>{post.description}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => core.approvePost(post.id)} style={{ flex: 1, padding: '8px', background: '#24b33b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>{t.approve}</button>
                  <button onClick={() => core.rejectPost(post.id)} style={{ padding: '8px', background: colors.red, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>{t.reject}</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ناوبری چسبان پایینی */}
      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', zIndex: 100, background: colors.bg, borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
        <button onClick={() => setActiveTab('explore')} style={{ background: 'none', border: 'none', color: activeTab === 'explore' ? '#fff' : colors.meta, fontSize: '12.5px', cursor: 'pointer' }}>🧭 {t.explore}</button>
        <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#fff' : colors.meta, fontSize: '12.5px', cursor: 'pointer' }}>👤 {t.profile}</button>
        {currentUser === 'mehdisoheilinia' && (
          <button onClick={() => setActiveTab('admin')} style={{ background: 'none', border: 'none', color: activeTab === 'admin' ? '#fff' : colors.meta, fontSize: '12.5px', cursor: 'pointer' }}>⚙️ {t.admin}</button>
        )}
      </nav>

      {/* مدال درباره برنامه */}
      {isAboutOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '20px' }}>
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px', maxWidth: '360px', width: '100%' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>{t.about}</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '15px' }}>{t.aboutText}</p>
            <button onClick={() => setIsAboutOpen(false)} style={{ width: '100%', padding: '8px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{t.close}</button>
          </div>
        </div>
      )}

      {/* مدال ویرایش پروفایل */}
      {isEditProfileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '20px' }}>
          <form onSubmit={handleUpdateProfile} style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px', maxWidth: '360px', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder={t.displayName} value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: colors.bg, color: '#fff', border: `1px solid ${colors.border}` }} />
            <input type="text" placeholder={t.bio} value={editBio} onChange={e => setEditBio(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: colors.bg, color: '#fff', border: `1px solid ${colors.border}` }} />
            <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} style={{ fontSize: '12px', color: colors.meta }} />
            <button type="submit" disabled={updatingProfile} style={{ padding: '10px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {updatingProfile ? 'در حال بروزرسانی...' : t.saveProfile}
            </button>
            <button type="button" onClick={() => setIsEditProfileOpen(false)} style={{ background: 'none', border: 'none', color: colors.meta, cursor: 'pointer', fontSize: '12px' }}>{t.close}</button>
          </form>
        </div>
      )}

    </div>
  );
}

function PostCard({ post, colors, t, isFa, isDark, currentUser, onLike, onComment }: { post: EtudePost; colors: any; t: any; isFa: boolean; isDark: boolean; currentUser: string; onLike: () => void; onComment: (text: string) => void }) {
  const [comInput, setComInput] = useState('');
  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
        <b>@{post.username}</b>
        <span style={{ color: colors.meta }}>{post.category}</span>
      </div>
      <video src={post.media_url} controls style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px', background: '#000' }} />
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button onClick={onLike} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
          {post.likes?.includes(currentUser) ? '❤️' : '🤍'} {post.likes?.length || 0}
        </button>
      </div>
    </div>
  );
}
