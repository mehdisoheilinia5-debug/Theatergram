'use client';

import React, { useState, useEffect } from 'react';
import { useTheaterCore } from './useTheaterCore';
import { CATEGORIES, TRANSLATIONS, EtudePost } from './constants';

export default function Page() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'explore' | 'profile' | 'admin'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [targetUser, setTargetUser] = useState<string | null>(null);

  // Form Creation State Elements
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postCat, setPostCat] = useState('improvisation');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Profile Edit Form elements
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const core = useTheaterCore(currentUser || '');

  const isDark = theme === 'dark';
  const isFa = lang === 'fa';
  const t = TRANSLATIONS[lang];

  // Colors Matrix
  const colors = {
    bg: isDark ? '#050505' : '#ffffff',
    card: isDark ? '#121214' : '#f5f7fb',
    text: isDark ? '#f5f5f7' : '#111111',
    border: isDark ? '#1f1f23' : '#e5e5ea',
    input: isDark ? '#1a1a1e' : '#ffffff',
    accent: isDark ? '#ffffff' : '#000000',
    meta: '#8e8e93'
  };

  useEffect(() => {
    if (currentUser && core.profiles[currentUser]) {
      const p = core.profiles[currentUser];
      setEditName(p.name || '');
      setEditBio(p.bio || '');
      setEditAvatar(p.avatar_url || '');
    }
  }, [currentUser, core.profiles]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setCurrentUser(usernameInput.toLowerCase().trim());
    }
  };

  const handlePostCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile || !postTitle.trim()) return;

    setUploading(true);
    const url = await core.uploadMediaAsset(mediaFile);
    if (url) {
      const success = await core.createPost(postTitle, postDesc, postCat, url);
      if (success) {
        setPostTitle('');
        setPostDesc('');
        setMediaFile(null);
        alert(currentUser === 'mehdisoheilinia' ? 'Published!' : 'Submitted to Review Queue.');
      }
    }
    setUploading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await core.syncProfileState(editName, editBio, editAvatar);
    if (success) alert('Profile updated successfully.');
  };

  // Filter Pipeline Processing Matrix
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

  // Shared Premium Styled Elements 
  const glassHeaderStyle: React.CSSProperties = {
    position: 'sticky', top: 0, zIndex: 200,
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    background: isDark ? 'rgba(5, 5, 5, 0.75)' : 'rgba(255, 255, 255, 0.75)',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 20px', direction: isFa ? 'rtl' : 'ltr'
  };

  const glassNavStyle: React.CSSProperties = {
    position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
    width: '100%', maxWidth: '480px', zIndex: 200,
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    background: isDark ? 'rgba(18, 18, 20, 0.8)' : 'rgba(245, 247, 251, 0.8)',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex', justifyContent: 'space-around', padding: '12px 0'
  };

  if (!currentUser) {
    return (
      <div style={{ background: colors.bg, color: colors.text, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <form onSubmit={handleAuth} style={{ width: '100%', maxWidth: '360px', background: colors.card, border: `1px solid ${colors.border}`, padding: '32px', borderRadius: '16px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px' }}>TheaterGram</h1>
          <p style={{ color: colors.meta, fontSize: '13px', marginBottom: '28px' }}>Premium Network for Theatre Professionals</p>
          <input 
            type="text" 
            placeholder="Enter Username" 
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.text, marginBottom: '16px', outline: 'none' }}
            required
          />
          <button type="submit" style={{ width: '100%', padding: '12px', background: colors.accent, color: isDark ? '#000' : '#fff', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Enter Platform</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: colors.bg, color: colors.text, minHeight: '100vh', direction: isFa ? 'rtl' : 'ltr', paddingBottom: '90px' }}>
      
      {/* Header element */}
      <header style={glassHeaderStyle}>
        <span style={{ fontWeight: '900', fontSize: '20px', cursor: 'pointer' }} onClick={() => { setTargetUser(null); setActiveTab('explore'); }}>TheaterGram</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setLang(l => l === 'fa' ? 'en' : 'fa')} style={{ background: 'none', border: 'none', color: colors.text, cursor: 'pointer', fontSize: '13px' }}>🌐 {isFa ? 'English' : 'فارسی'}</button>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: 'none', color: colors.text, cursor: 'pointer', fontSize: '13px' }}>{isDark ? '☀️' : '🌙'}</button>
        </div>
      </header>

      {/* Primary Mobile Container Viewport Segment */}
      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>
        
        {activeTab === 'explore' && !targetUser && (
          <div>
            {/* Context Filters Engine controls */}
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text"
                placeholder={isFa ? '🔍 جستجوی هنرمند...' : '🔍 Search artist username...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.text, outline: 'none', fontSize: '13px' }}
              />
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button 
                  onClick={() => setSelectedCategory('all')}
                  style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: `1px solid ${colors.border}`, background: selectedCategory === 'all' ? colors.accent : colors.card, color: selectedCategory === 'all' ? (isDark ? '#000' : '#fff') : colors.text, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {isFa ? 'همه اتودها' : 'All'}
                </button>
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: `1px solid ${colors.border}`, background: selectedCategory === c.id ? colors.accent : colors.card, color: selectedCategory === c.id ? (isDark ? '#000' : '#fff') : colors.text, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {isFa ? c.fa : c.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Feed Container render stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {approvedPosts.length === 0 ? (
                <p style={{ color: colors.meta, textAlign: 'center', marginTop: '40px', fontSize: '13px' }}>{t.noPosts}</p>
              ) : (
                approvedPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    colors={colors} 
                    t={t} 
                    isFa={isFa} 
                    isDark={isDark}
                    currentUser={currentUser} 
                    onLike={() => core.toggleLike(post.id, post.likes)}
                    onComment={(txt) => core.appendComment(post.id, post.comments, txt)}
                    onUserClick={(uname) => setTargetUser(uname)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Profile and Media Management Form segment rendering view */}
        {(activeTab === 'profile' || targetUser) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {targetUser && (
              <button onClick={() => setTargetUser(null)} style={{ background: 'none', border: 'none', color: colors.meta, cursor: 'pointer', alignSelf: 'flex-start', fontSize: '13px' }}>
                {isFa ? '← بازگشت به اکسپلور' : '← Back to Explore'}
              </button>
            )}
            
            {activeProfileData ? (
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: colors.border, backgroundImage: `url(${activeProfileData.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{activeProfileData.name || activeProfileData.username}</h2>
                    <p style={{ color: colors.meta, fontSize: '13px' }}>@{activeProfileData.username}</p>
                  </div>
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: colors.text, marginBottom: '16px' }}>{activeProfileData.bio || '...'}</p>
                
                <div style={{ display: 'flex', gap: '20px', borderTop: `1px solid ${colors.border}`, paddingTop: '12px' }}>
                  <div style={{ fontSize: '12px' }}><b style={{ color: colors.text }}>{activeProfileData.followers?.length || 0}</b> <span style={{ color: colors.meta }}>{t.followers}</span></div>
                  <div style={{ fontSize: '12px' }}><b style={{ color: colors.text }}>{activeProfileData.following?.length || 0}</b> <span style={{ color: colors.meta }}>{t.following}</span></div>
                  <div style={{ fontSize: '12px' }}><b style={{ color: colors.text }}>{profilePosts.length}</b> <span style={{ color: colors.meta }}>{t.etudesCount}</span></div>
                </div>

                {currentUser !== activeProfileUsername && (
                  <button 
                    onClick={() => core.toggleFollow(activeProfileUsername!)}
                    style={{ marginTop: '14px', width: '100%', padding: '8px', background: activeProfileData.followers?.includes(currentUser) ? colors.input : colors.accent, color: activeProfileData.followers?.includes(currentUser) ? colors.text : (isDark ? '#000' : '#fff'), fontSize: '12px', fontWeight: 'bold', border: `1px solid ${colors.border}`, borderRadius: '6px', cursor: 'pointer' }}
                  >
                    {activeProfileData.followers?.includes(currentUser) ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ) : (
              <p style={{ color: colors.meta, textTransform: 'lowercase' }}>Initializing profile ledger metadata...</p>
            )}

            {/* Private User Creation Panels block */}
            {currentUser === activeProfileUsername && (
              <>
                {/* Profile Editor form panel layout */}
                <form onSubmit={handleUpdateProfile} style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>⚙️ {t.saveProfile}</h3>
                  <input type="text" placeholder={t.displayName} value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.text, outline: 'none', fontSize: '13px' }} />
                  <input type="text" placeholder={t.bio} value={editBio} onChange={e => setEditBio(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.text, outline: 'none', fontSize: '13px' }} />
                  <input type="text" placeholder="Avatar URL" value={editAvatar} onChange={e => setEditAvatar(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.text, outline: 'none', fontSize: '13px' }} />
                  <button type="submit" style={{ padding: '10px', background: colors.accent, color: isDark ? '#000' : '#fff', fontWeight: 'bold', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Update Profile</button>
                </form>

                {/* Upload Studio Segment */}
                <form onSubmit={handlePostCreation} style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>{t.uploadTitle}</h3>
                  <input type="text" placeholder={t.titlePlaceholder} value={postTitle} onChange={e => setPostTitle(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.text, outline: 'none', fontSize: '13px' }} required />
                  <textarea placeholder={t.descPlaceholder} value={postDesc} onChange={e => setPostDesc(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.text, outline: 'none', fontSize: '13px', minHeight: '60px', resize: 'vertical' }} />
                  <select value={postCat} onChange={e => setPostCat(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.text, outline: 'none', fontSize: '13px' }}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{isFa ? c.fa : c.en}</option>)}
                  </select>
                  <div style={{ border: `1px dashed ${colors.border}`, padding: '16px', borderRadius: '6px', textAlign: 'center', background: colors.input }}>
                    <input type="file" accept="video/*" onChange={e => setMediaFile(e.target.files?.[0] || null)} style={{ fontSize: '12px' }} required />
                    <p style={{ fontSize: '11px', color: colors.meta, marginTop: '6px' }}>{t.uploadMedia}</p>
                  </div>
                  <button type="submit" disabled={uploading} style={{ padding: '10px', background: colors.accent, color: isDark ? '#000' : '#fff', fontWeight: 'bold', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', opacity: uploading ? 0.5 : 1 }}>
                    {uploading ? 'Uploading Asset Pipeline...' : t.submitPost}
                  </button>
                </form>
              </>
            )}

            {/* Profile Portfolio Grid Archive display layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: `1px solid ${colors.border}`, paddingBottom: '8px' }}>🎭 Video Portfolio ({profilePosts.length})</h3>
              {profilePosts.map(post => (
                <PostCard key={post.id} post={post} colors={colors} t={t} isFa={isFa} isDark={isDark} currentUser={currentUser} onLike={() => core.toggleLike(post.id, post.likes)} onComment={(txt) => core.appendComment(post.id, post.comments, txt)} onUserClick={(uname) => setTargetUser(uname)} />
              ))}
            </div>
          </div>
        )}

        {/* Master Admin Evaluation Processing Desk View panel routing */}
        {activeTab === 'admin' && currentUser === 'mehdisoheilinia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>{t.pendingQueue} ({pendingPosts.length})</h2>
            {pendingPosts.length === 0 ? (
              <p style={{ color: colors.meta, fontSize: '13px' }}>{t.noPosts}</p>
            ) : (
              pendingPosts.map(post => (
                <div key={post.id} style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <b style={{ fontSize: '13px' }}>{post.title}</b>
                    <span style={{ fontSize: '11px', color: colors.meta }}>@{post.username}</span>
                  </div>
                  <video src={post.media_url} controls style={{ width: '100%', borderRadius: '6px', maxHeight: '200px', background: '#000', marginBottom: '12px' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => core.approvePost(post.id)} style={{ flex: 1, padding: '8px', background: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>{t.approve}</button>
                    <button onClick={() => core.rejectPost(post.id)} style={{ padding: '8px 16px', background: '#ff3b30', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>{t.reject}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* Persistent Base Glassmorphism Docking Navigation System wrapper layout */}
      <nav style={glassNavStyle}>
        <button onClick={() => { setTargetUser(null); setActiveTab('explore'); }} style={{ background: 'none', border: 'none', color: activeTab === 'explore' && !targetUser ? colors.accent : colors.meta, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{t.explore}</button>
        <button onClick={() => { setTargetUser(null); setActiveTab('profile'); }} style={{ background: 'none', border: 'none', color: activeTab === 'profile' && !targetUser ? colors.accent : colors.meta, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{t.profile}</button>
        {currentUser === 'mehdisoheilinia' && (
          <button onClick={() => { setTargetUser(null); setActiveTab('admin'); }} style={{ background: 'none', border: 'none', color: activeTab === 'admin' ? colors.accent : colors.meta, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{t.admin}</button>
        )}
      </nav>

    </div>
  );
}

// Sub-Component UI Card Controller Engine Block Interface
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
    <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* Upper Meta Row Header rendering line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => onUserClick(post.username)}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: colors.border }} />
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{post.artist_name || post.username}</span>
        </div>
        <span style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '4px', background: colors.input, color: colors.meta, textTransform: 'uppercase' }}>
          {isFa ? (CATEGORIES.find(c => c.id === post.category)?.fa || post.category) : (CATEGORIES.find(c => c.id === post.category)?.en || post.category)}
        </span>
      </div>

      {/* Premium Video Media Framing block view */}
      <div style={{ width: '100%', aspectRatio: '4/5', borderRadius: '12px', overflow: 'hidden', background: '#000', border: `1px solid ${colors.border}` }}>
        <video src={post.media_url} controls loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Structural Descriptions segment layout blocks */}
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{post.title}</h4>
        <p style={{ fontSize: '12px', color: colors.meta, lineHeight: '1.5' }}>{post.description}</p>
      </div>

      {/* Interactive metrics bar rendering triggers row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, padding: '8px 0' }}>
        <button onClick={onLike} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', color: hasLiked ? '#ff3b30' : colors.text }}>
          {hasLiked ? '❤️' : '🤍'} <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.like} ({post.likes?.length || 0})</span>
        </button>
      </div>

      {/* Comments Segment Section Container sheet details view */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: colors.meta, fontWeight: 'bold' }}>{t.comments}</span>
        <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
          {post.comments?.map((c: any) => (
            <div key={c.id} style={{ fontSize: '12px', lineHeight: '1.4', background: colors.input, padding: '6px 10px', borderRadius: '6px' }}>
              <b style={{ cursor: 'pointer', color: '#007aff' }} onClick={() => onUserClick(c.username)}>@{c.username}: </b>
              <span style={{ color: colors.text }}>{c.text}</span>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmitComment} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
          <input 
            type="text" 
            placeholder={t.addComment} 
            value={comInput}
            onChange={e => setComInput(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.text, outline: 'none', fontSize: '12px' }}
          />
          <button type="submit" style={{ padding: '0 12px', borderRadius: '6px', background: colors.accent, color: isDark ? '#000' : '#fff', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>➔</button>
        </form>
      </div>

    </div>
  );
}
