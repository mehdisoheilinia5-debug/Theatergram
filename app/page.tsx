'use client';
import { categories } from './constants.tsx';
import { useTheaterCore } from './useTheaterCore';

export default function TheaterGramCore() {
  const core = useTheaterCore('fa');
  const lang = core.currentLang;

  const navigateToUser = (post: any) => {
    core.setTargetProfileUser({
      name: post.artist_name,
      username: post.username,
      bio: post.username === core.userProfile.username ? core.userProfile.bio : (lang === 'fa' ? 'هنرمند جامعه تئاتر' : 'Theater Member'),
      avatar: post.username === core.userProfile.username ? core.userProfile.avatar : post.avatar
    });
    core.setActiveTab('profile');
  };

  const approvedPosts = core.posts.filter(post => {
    if (post.status !== 'approved') return false;
    const matchesCategory = core.selectedCategoryFilter === 'all' || post.category === core.selectedCategoryFilter;
    const matchesSearch = core.searchQuery.trim() === '' || 
      post.username.toLowerCase().includes(core.searchQuery.toLowerCase()) || 
      post.artist_name.toLowerCase().includes(core.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pendingPosts = core.posts.filter(post => post.status === 'pending');
  const viewUser = core.targetProfileUser || core.userProfile;
  const myApprovedPosts = core.posts.filter(post => post.username === viewUser.username && post.status === 'approved');
  const myAllPosts = core.posts.filter(post => post.username === viewUser.username);
  const isAdmin = core.userProfile.username === 'mehdisoheilinia';

  const theme = {
    bg: core.isDarkMode ? '#000000' : '#ffffff',
    text: core.isDarkMode ? '#ffffff' : '#000000',
    cardBg: core.isDarkMode ? '#121212' : '#f9f9f9',
    border: core.isDarkMode ? '#1c1c1e' : '#e5e5e7',
    inputBg: core.isDarkMode ? '#1c1c1e' : '#f2f2f7',
    accent: '#ff3b30'
  };

  const isRtl = lang === 'fa';
  const menuStyle: React.CSSProperties = {
    position: 'fixed', top: 0, bottom: 0, width: '260px', background: theme.cardBg, padding: '20px', zIndex: 110,
    transition: 'transform 0.3s', direction: isRtl ? 'rtl' : 'ltr', right: isRtl ? 0 : 'auto', left: !isRtl ? 0 : 'auto',
    transform: isRtl ? (core.isMenuOpen ? 'translateX(0)' : 'translateX(100%)') : (core.isMenuOpen ? 'translateX(0)' : 'translateX(-100%)'),
    borderLeft: isRtl ? `1px solid ${theme.border}` : 'none', borderRight: !isRtl ? `1px solid ${theme.border}` : 'none',
  };

  const modernBtnStyle = (type: 'edit' | 'delete'): React.CSSProperties => ({
    background: type === 'edit' ? 'rgba(10, 132, 255, 0.15)' : 'rgba(255, 59, 48, 0.15)',
    color: type === 'edit' ? '#0a84ff' : '#ff3b30',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background 0.2s, transform 0.1s'
  });

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh', paddingBottom: '90px', fontFamily: 'sans-serif', direction: isRtl ? 'rtl' : 'ltr' }}>
      {!core.isAuthenticated ? (
        <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '360px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', letterSpacing: '-0.5px' }}>{lang === 'fa' ? 'تئاترگرام' : 'TheaterGram'}</h2>
            <form onSubmit={core.handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {core.authMode === 'register' && (
                <input type="text" placeholder={lang === 'fa' ? 'نام و نام خانوادگی' : 'Full Name'} value={core.authName} onChange={(e) => core.setAuthName(e.target.value)} style={{ padding: '12px', background: theme.inputBg, border: 'none', borderRadius: '8px', color: theme.text, fontSize: '14px', outline: 'none' }} />
              )}
              <input type="text" placeholder={lang === 'fa' ? 'نام کاربری (لاتین)' : 'Username'} value={core.authUsername} onChange={(e) => core.setAuthUsername(e.target.value)} style={{ padding: '12px', background: theme.inputBg, border: 'none', borderRadius: '8px', color: theme.text, fontSize: '14px', outline: 'none' }} />
              <input type="password" placeholder={lang === 'fa' ? 'رمز ورود' : 'Password'} value={core.authPassword} onChange={(e) => core.setAuthPassword(e.target.value)} style={{ padding: '12px', background: theme.inputBg, border: 'none', borderRadius: '8px', color: theme.text, fontSize: '14px', outline: 'none' }} />
              {core.authError && <div style={{ color: theme.accent, fontSize: '12px', fontWeight: 'bold' }}>{core.authError}</div>}
              <button type="submit" disabled={core.loading} style={{ padding: '12px', background: theme.text, color: theme.bg, border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                {core.loading ? '...' : (core.authMode === 'login' ? (lang === 'fa' ? 'ورود' : 'Login') : (lang === 'fa' ? 'ثبت‌نام' : 'Register'))}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '13px' }}>
              <button onClick={() => { core.setAuthMode(core.authMode === 'login' ? 'register' : 'login'); }} style={{ background: 'none', border: 'none', color: theme.accent, fontWeight: 'bold', cursor: 'pointer' }}>
                {core.authMode === 'login' ? (lang === 'fa' ? 'ایجاد حساب کاربری' : 'Create Account') : (lang === 'fa' ? 'ورود به حساب' : 'Sign In')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <header style={{ position: 'sticky', top: 0, background: theme.bg, borderBottom: `1px solid ${theme.border}`, padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, flexDirection: isRtl ? 'row' : 'row-reverse' }}>
            <button onClick={() => core.setIsMenuOpen(true)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '22px', cursor: 'pointer' }}>☰</button>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, letterSpacing: '-0.5px' }}>{lang === 'fa' ? 'تئاترگرام' : 'TheaterGram'}</h1>
          </header>

          {core.isMenuOpen && <div onClick={() => core.setIsMenuOpen(false)} style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', zIndex: 105 }} />}

          <div style={menuStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.4 }}>{lang === 'fa' ? 'منو برنامه' : 'MENU'}</span>
              <button onClick={() => core.setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '22px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => core.setIsDarkMode(!core.isDarkMode)} style={{ background: theme.inputBg, border: 'none', color: theme.text, padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: isRtl ? 'right' : 'left', fontSize: '13px', fontWeight: 'bold' }}>
                {core.isDarkMode ? (lang === 'fa' ? '☀️ روز' : '☀️ Light') : (lang === 'fa' ? '🌙 شب' : '🌙 Dark')}
              </button>
              <button onClick={() => core.setCurrentLang(lang === 'fa' ? 'en' : 'fa')} style={{ background: theme.inputBg, border: 'none', color: theme.text, padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: isRtl ? 'right' : 'left', fontSize: '13px', fontWeight: 'bold' }}>
                {lang === 'fa' ? '🌐 English' : '🌐 فارسی'}
              </button>
              
              <div style={{ background: theme.inputBg, padding: '12px', borderRadius: '8px', marginTop: '10px', fontSize: '12px', lineHeight: '1.6', opacity: 0.85, textAlign: isRtl ? 'right' : 'left' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', color: theme.accent }}>{lang === 'fa' ? 'ℹ️ درباره برنامه:' : 'ℹ️ About App:'}</div>
                <div>{lang === 'fa' ? 'تئاترگرام پلتفرم تخصصی اشتراک‌گذاری اتودها، تمرین‌ها و بداهه‌پردازی‌های جامعه تئاتر است.' : 'TheaterGram is a specialized platform for sharing etudes, rehearsals, and improvisations within the theater community.'}</div>
              </div>

              <button onClick={core.handleLogout} style={{ width: '100%', padding: '12px', background: theme.accent, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}>
                {lang === 'fa' ? 'خروج' : 'Logout'}
              </button>
            </div>
          </div>

          <div style={{ maxWidth: '470px', margin: '0 auto', padding: '10px' }}>
            {core.activeTab === 'explore' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <input type="text" placeholder={lang === 'fa' ? '🔍 جستجوی نام کاربری...' : '🔍 Search username...'} value={core.searchQuery} onChange={(e) => core.setSearchQuery(e.target.value)} style={{ width: '100%', maxWidth: '360px', padding: '10px 14px', background: theme.inputBg, border: 'none', borderRadius: '8px', color: theme.text, fontSize: '13px', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none' }}>
                  <button onClick={() => core.setSelectedCategoryFilter('all')} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: 'none', cursor: 'pointer', background: core.selectedCategoryFilter === 'all' ? theme.text : theme.inputBg, color: core.selectedCategoryFilter === 'all' ? theme.bg : theme.text, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {lang === 'fa' ? 'همه' : 'All'}
                  </button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => core.setSelectedCategoryFilter(cat.id)} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: 'none', cursor: 'pointer', background: core.selectedCategoryFilter === cat.id ? theme.text : theme.inputBg, color: core.selectedCategoryFilter === cat.id ? theme.bg : theme.text, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      {lang === 'fa' ? cat.fa : cat.en}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '10px' }}>
                  {approvedPosts.map((post) => (
                    <div key={post.id} style={{ background: theme.bg, borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 5px', gap: '12px', flexDirection: isRtl ? 'row' : 'row-reverse', textAlign: isRtl ? 'right' : 'left', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                          {post.avatar || core.userProfile.username === post.username && core.userProfile.avatar ? (
                            <img src={post.username === core.userProfile.username ? core.userProfile.avatar : post.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => navigateToUser(post)} />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => navigateToUser(post)}>🎭</div>
                          )}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                              <span style={{ fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigateToUser(post)}>{post.artist_name}</span>
                              {post.username !== core.userProfile.username && (
                                <button onClick={() => core.toggleFollowUser(post.username)} style={{ background: 'none', border: 'none', color: theme.accent, fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', backgroundColor: theme.inputBg }}>
                                  {core.followedUsers.includes(post.username) ? (lang === 'fa' ? '✓ دنبال شده' : 'Following') : (lang === 'fa' ? '+ فالو' : '+ Follow')}
                                </button>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#8e8e93', cursor: 'pointer' }} onClick={() => navigateToUser(post)}>@{post.username}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', background: theme.inputBg, padding: '4px 8px', borderRadius: '4px', opacity: 0.7 }}>
                            {lang === 'fa' ? categories.find(c => c.id === post.category)?.fa : categories.find(c => c.id === post.category)?.en}
                          </span>
                        </div>
                      </div>
                      {post.video_url && (
                        <div style={{ width: '100%', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                          {(post.video_url.includes('image') || post.video_url.startsWith('data:image/') || (post.video_url.includes('blob:') && !post.video_url.includes('video'))) ? (
                            <img src={post.video_url} alt="" style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }} />
                          ) : (
                            <video src={post.video_url} controls autoPlay muted loop playsInline style={{ width: '100%', maxHeight: '420px' }} />
                          )}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '16px', padding: '10px 5px 4px 5px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                        <button onClick={(e) => core.handleToggleLike(post.id, e)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: core.likedPosts?.includes(post.id) ? theme.accent : theme.text }}>
                            {core.likedPosts?.includes(post.id) ? '❤️' : '🤍'}
                          </span>
                          <span style={{ fontSize: '12px' }}>{core.getPostLikesCount(post)}</span>
                        </button>
                        <button onClick={() => core.setSelectedDetailPost(post)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          💬 <span style={{ fontSize: '12px' }}>{(core.commentsMap?.[post.id]?.length || 0) > 0 ? `${core.commentsMap[post.id].length} ${lang === 'fa' ? 'نظر' : 'Comments'}` : (lang === 'fa' ? 'نظردهی' : 'Comment')}</span>
                        </button>
                      </div>

                      <div style={{ padding: '4px 5px 0 5px', textAlign: isRtl ? 'right' : 'left' }}>
                        <p style={{ fontSize: '13px', margin: 0 }}><span style={{ fontWeight: 'bold', marginLeft: '6px', marginRight: '6px' }}>{post.artist_name}: </span>{post.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {core.activeTab === 'profile' && (
              <div>
                {core.targetProfileUser && (
                  <button onClick={() => core.setTargetProfileUser(null)} style={{ background: theme.inputBg, border: 'none', color: theme.text, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                    {lang === 'fa' ? '← بازگشت به پروفایل من' : '← Back to my profile'}
                  </button>
                )}
                {!core.isEditingProfile ? (
                  <div>
                    <div style={{ background: theme.cardBg, borderRadius: '8px', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexDirection: isRtl ? 'row' : 'row-reverse', textAlign: isRtl ? 'right' : 'left' }}>
                        {viewUser.avatar ? (
                          <img src={viewUser.avatar} alt="" style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>👤</div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{viewUser.name}</div>
                          <div style={{ fontSize: '12px', color: '#8e8e93' }}>@{viewUser.username}</div>
                          <div style={{ fontSize: '13px', marginTop: '6px', opacity: 0.8 }}>{viewUser.bio}</div>
                          <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '12px', opacity: 0.9, borderTop: `1px solid ${theme.border}`, paddingTop: '8px' }}>
                            <div><strong style={{ color: theme.accent }}>{viewUser.followers || 0}</strong> {lang === 'fa' ? 'دنبال‌کننده' : 'Followers'}</div>
                            <div><strong style={{ color: theme.text }}>{viewUser.following || 0}</strong> {lang === 'fa' ? 'دنبال‌شده' : 'Following'}</div>
                          </div>
                        </div>
                      </div>
                      {!core.targetProfileUser && (
                        <button onClick={() => core.setIsEditingProfile(true)} style={{ width: '100%', marginTop: '15px', padding: '8px', background: 'none', border: `1px solid ${theme.border}`, color: theme.text, borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                          {lang === 'fa' ? 'ویرایش پروفایل' : 'Edit Profile'}
                        </button>
                      )}
                    </div>

                    {!core.targetProfileUser && (
                      <div style={{ background: theme.cardBg, borderRadius: '8px', padding: '15px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                          {categories.map(cat => (
                            <button key={cat.id} onClick={() => core.setPostCategory(cat.id as any)} style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: 'none', fontSize: '11px', cursor: 'pointer', background: core.postCategory === cat.id ? theme.text : theme.inputBg, color: core.postCategory === cat.id ? theme.bg : theme.text, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                              {lang === 'fa' ? cat.fa : cat.en}
                            </button>
                          ))}
                        </div>
                        <label style={{ display: 'block', padding: '12px', background: theme.inputBg, borderRadius: '6px', cursor: 'pointer', textAlign: 'center', fontSize: '13px', marginBottom: '10px', border: '1px dashed #8e8e93' }}>
                          <span style={{ fontWeight: 'bold' }}>{core.mediaName ? `✓ ${core.mediaName}` : (lang === 'fa' ? '🎬 انتخاب فیلم (تا ۱ دقیقه) یا عکس' : '🎬 Select File (Max 1 min)')}</span>
                          <input type="file" accept="image/*,video/*" onChange={core.handleFileChange} style={{ display: 'none' }} />
                        </label>
                        {core.uploadError && <div style={{ fontSize: '12px', color: theme.accent, marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>{core.uploadError}</div>}
                        <textarea placeholder={lang === 'fa' ? 'توضیحات صحنه...' : 'Scene text...'} value={core.caption} onChange={(e) => core.setCaption(e.target.value)} style={{ width: '100%', padding: '10px', height: '60px', background: theme.inputBg, border: 'none', borderRadius: '6px', color: theme.text, resize: 'none', marginBottom: '10px', fontSize: '13px', outline: 'none' }} />
                        {core.uploadStatus && <div style={{ fontSize: '12px', color: '#34c759', marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>{core.uploadStatus}</div>}
                        <button onClick={core.handlePublish} disabled={core.loading || !!core.uploadError} style={{ width: '100%', padding: '10px', background: theme.text, color: theme.bg, border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                          {core.loading ? '...' : (lang === 'fa' ? 'ارسال جهت بررسی' : 'Submit for review')}
                        </button>
                      </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.6, marginBottom: '10px', textAlign: isRtl ? 'right' : 'left' }}>
                        {lang === 'fa' ? '🎛️ نمای شبکه‌ای اتودها' : '🎛️ Etudes Grid'}
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', background: theme.border, padding: '4px', borderRadius: '6px' }}>
                        {myApprovedPosts.map(post => (
                          <div key={post.id} onClick={() => core.setSelectedDetailPost(post)} style={{ background: theme.cardBg, aspectRatio: '1/1', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                            {post.video_url && (
                              (post.video_url.includes('image') || post.video_url.startsWith('data:image/') || (post.video_url.includes('blob:') && !post.video_url.includes('video')))
                                ? <img src={post.video_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
                                    <video src={post.video_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '12px' }}>🎬</div>
                                  </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.6, textAlign: isRtl ? 'right' : 'left' }}>
                        {lang === 'fa' ? '🛠️ مدیریت و آرشیو اتودهای شما' : 'Your Posts & Etudes'}
                      </h3>
                      {myAllPosts.map((post) => (
                        <div key={post.id} style={{ background: theme.cardBg, borderRadius: '8px', padding: '12px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                            <span style={{ fontSize: '11px', opacity: 0.6 }}>
                              {lang === 'fa' ? categories.find(c => c.id === post.category)?.fa : categories.find(c => c.id === post.category)?.en}
                            </span>
                            <span style={{ fontSize: '11px', background: post.status === 'approved' ? '#34c75922' : '#ff950022', color: post.status === 'approved' ? '#34c759' : '#ff9500', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                              {post.status === 'approved' ? (lang === 'fa' ? 'منتشر شده' : 'Published') : (lang === 'fa' ? 'در انتظار تایید ادمین' : 'Pending Approval')}
                            </span>
                          </div>
                          
                          {core.editingPostId === post.id ? (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
                              <input type="text" value={core.editCaptionText} onChange={(e) => core.setEditCaptionText(e.target.value)} style={{ flex: 1, padding: '8px', background: theme.inputBg, border: 'none', color: theme.text, borderRadius: '6px', fontSize: '13px' }} />
                              <button onClick={() => core.handleSavePostEdit(post.id)} style={{ padding: '6px 12px', background: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>{lang === 'fa' ? 'ذخیره' : 'Save'}</button>
                            </div>
                          ) : (
                            <p style={{ fontSize: '13px', margin: '4px 0', textAlign: isRtl ? 'right' : 'left' }}>{post.caption}</p>
                          )}

                          <div style={{ display: 'flex', gap: '14px', borderTop: `1px solid ${theme.border}`, paddingTop: '8px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                            <button onClick={(e) => core.handleToggleLike(post.id, e)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: core.likedPosts?.includes(post.id) ? theme.accent : theme.text }}>
                                {core.likedPosts?.includes(post.id) ? '❤️' : '🤍'}
                              </span>
                              <span>{core.getPostLikesCount(post)}</span>
                            </button>
                            <button onClick={() => core.setSelectedDetailPost(post)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '13px', cursor: 'pointer' }}>
                              💬 {(core.commentsMap?.[post.id]?.length || 0)}
                            </button>
                          </div>

                          {(!core.targetProfileUser || isAdmin) && (
                            <div style={{ display: 'flex', gap: '8px', borderTop: `1px solid ${theme.border}`, paddingTop: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={() => { core.setEditingPostId(post.id); core.setEditCaptionText(post.caption); }} style={modernBtnStyle('edit')}>
                                ✏️ {lang === 'fa' ? 'ویرایش کپشن' : 'Edit'}
                              </button>
                              <button onClick={() => core.handleDeletePost(post.id)} style={modernBtnStyle('delete')}>
                                🗑️ {lang === 'fa' ? 'حذف اتود' : 'Delete'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: theme.cardBg, borderRadius: '8px', padding: '20px', border: `1px solid ${theme.border}` }}>
                    <label style={{ display: 'block', padding: '10px', background: theme.inputBg, borderRadius: '6px', cursor: 'pointer', textAlign: 'center', fontSize: '12px', marginBottom: '15px', border: '1px dashed #8e8e93' }}>
                      <span>{core.editForm.avatar ? (lang === 'fa' ? '✓ عکس انتخاب شد' : '✓ Avatar Selected') : (lang === 'fa' ? '🖼️ انتخاب عکس پروفایل' : '🖼️ Choose Profile Picture')}</span>
                      <input type="file" accept="image/*" onChange={core.handleAvatarChange} style={{ display: 'none' }} />
                    </label>
                    <input type="text" value={core.editForm.name} onChange={(e) => core.setEditForm({...core.editForm, name: e.target.value})} style={{ width: '100%', padding: '10px', background: theme.inputBg, border: 'none', color: theme.text, borderRadius: '6px', marginBottom: '10px' }} />
                    <input type="text" value={core.editForm.bio} onChange={(e) => core.setEditForm({...core.editForm, bio: e.target.value})} style={{ width: '100%', padding: '10px', background: theme.inputBg, border: 'none', color: theme.text, borderRadius: '6px', marginBottom: '20px' }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={core.handleSaveProfile} style={{ flex: 1, padding: '10px', background: theme.text, color: theme.bg, border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{lang === 'fa' ? 'ذخیره' : 'Save'}</button>
                      <button onClick={() => core.setIsEditingProfile(false)} style={{ padding: '10px', background: 'none', border: `1px solid ${theme.border}`, color: theme.text, borderRadius: '6px', cursor: 'pointer' }}>{lang === 'fa' ? 'انصراف' : 'Cancel'}</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {core.activeTab === 'admin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', textAlign: isRtl ? 'right' : 'left' }}>
                  {lang === 'fa' ? `📥 صف بررسی پست‌های جدید ادمین (${pendingPosts.length})` : `📥 Admin Pending Queue (${pendingPosts.length})`}
                </h3>
                {isAdmin ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {pendingPosts.map(post => (
                      <div key={post.id} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '12px', textAlign: isRtl ? 'right' : 'left' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>{post.artist_name} (@{post.username})</div>
                        <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>{post.caption}</div>
                        {post.video_url && (
                          <div style={{ width: '100%', background: '#000', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' }}>
                            {(post.video_url.includes('image') || post.video_url.startsWith('data:image/') || (post.video_url.includes('blob:') && !post.video_url.includes('video'))) ? (
                              <img src={post.video_url} alt="" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                            ) : (
                              <video src={post.video_url} controls style={{ width: '100%', maxHeight: '200px' }} />
                            )}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => core.handleUpdateStatus(post.id, 'approved')} style={{ flex: 1, padding: '8px', background: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>{lang === 'fa' ? 'تایید و انتشار عمومی' : 'Approve'}</button>
                          <button onClick={() => core.handleUpdateStatus(post.id, 'rejected')} style={{ padding: '8px 14px', background: theme.accent, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>{lang === 'fa' ? 'رد اتود' : 'Reject'}</button>
                        </div>
                      </div>
                    ))}
                    {pendingPosts.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px', opacity: 0.4, fontSize: '13px' }}>
                        {lang === 'fa' ? 'صف بررسی خالی است.' : 'No pending posts.'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', opacity: 0.4, fontSize: '13px' }}>
                    {lang === 'fa' ? 'تنها ادمین اصلی به این بخش دسترسی دارد.' : 'Access restricted to Admin.'}
                  </div>
                )}
              </div>
            )}
          </div>

          <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: theme.bg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', padding: '14px 0', zIndex: 100, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
            <button onClick={() => core.setActiveTab('explore')} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '13px', fontWeight: core.activeTab === 'explore' ? 'bold' : 'normal', opacity: core.activeTab === 'explore' ? 1 : 0.4, cursor: 'pointer' }}>
              {lang === 'fa' ? '🧭 اکسپلور' : '🧭 Explore'}
            </button>
            <button onClick={() => { core.setTargetProfileUser(null); core.setActiveTab('profile'); }} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '13px', fontWeight: core.activeTab === 'profile' ? 'bold' : 'normal', opacity: core.activeTab === 'profile' ? 1 : 0.4, cursor: 'pointer' }}>
              {lang === 'fa' ? '👤 صفحه من' : '👤 Profile'}
            </button>
            <button onClick={() => core.setActiveTab('admin')} style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: '13px', fontWeight: core.activeTab === 'admin' ? 'bold' : 'normal', opacity: core.activeTab === 'admin' ? 1 : 0.4, cursor: 'pointer' }}>
              {lang === 'fa' ? '⚙️ مدیریت' : '⚙️ Admin'}
            </button>
          </nav>

          {core.selectedDetailPost && (
            <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }} onClick={() => core.setSelectedDetailPost(null)}>
              <div style={{ background: theme.cardBg, borderRadius: '12px', width: '100%', maxWidth: '420px', overflow: 'hidden', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: '12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>@{core.selectedDetailPost.username}</span>
                  <button onClick={() => core.setSelectedDetailPost(null)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '20px', cursor: 'pointer' }}>×</button>
                </div>
                
                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ background: '#000', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(core.selectedDetailPost.video_url.includes('image') || core.selectedDetailPost.video_url.startsWith('data:image/') || (core.selectedDetailPost.video_url.includes('blob:') && !core.selectedDetailPost.video_url.includes('video'))) ? (
                      <img src={core.selectedDetailPost.video_url} alt="" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                    ) : (
                      <video src={core.selectedDetailPost.video_url} controls autoPlay style={{ width: '100%', maxHeight: '300px' }} />
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '16px', padding: '12px 15px 4px 15px', flexDirection: isRtl ? 'row' : 'row-reverse', borderBottom: `1px solid ${theme.border}` }}>
                    <button onClick={() => core.handleToggleLike(core.selectedDetailPost.id)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: core.likedPosts.includes(core.selectedDetailPost.id) ? theme.accent : theme.text }}>
                        {core.likedPosts.includes(core.selectedDetailPost.id) ? '❤️' : '🤍'}
                      </span>
                      <strong style={{ fontSize: '13px' }}>{core.getPostLikesCount(core.selectedDetailPost)}</strong>
                    </button>
                    <span style={{ fontSize: '12px', opacity: 0.5, alignSelf: 'center' }}>
                      {(core.commentsMap[core.selectedDetailPost.id]?.length || 0)} {lang === 'fa' ? 'نظر' : 'Comments'}
                    </span>
                  </div>

                  <div style={{ padding: '12px 15px', textAlign: isRtl ? 'right' : 'left', background: theme.inputBg + '44' }}>
                    {core.editingPostId === core.selectedDetailPost.id ? (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
                        <input type="text" value={core.editCaptionText} onChange={(e) => core.setEditCaptionText(e.target.value)} style={{ flex: 1, padding: '6px', background: theme.inputBg, border: 'none', color: theme.text, borderRadius: '4px', fontSize: '13px' }} />
                        <button onClick={() => core.handleSavePostEdit(core.selectedDetailPost.id)} style={{ padding: '6px 12px', background: '#34c759', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>{lang === 'fa' ? 'ذخیره' : 'Save'}</button>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: '13px', margin: 0 }}><span style={{ fontWeight: 'bold' }}>{core.selectedDetailPost.artist_name}: </span>{core.selectedDetailPost.caption}</p>
                        {core.selectedDetailPost.username === core.userProfile.username && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <button onClick={() => { core.setEditingPostId(core.selectedDetailPost.id); core.setEditCaptionText(core.selectedDetailPost.caption); }} style={modernBtnStyle('edit')}>✏️ {lang === 'fa' ? 'ویرایش' : 'Edit'}</button>
                            <button onClick={() => core.handleDeletePost(core.selectedDetailPost.id)} style={modernBtnStyle('delete')}>🗑️ {lang === 'fa' ? 'حذف' : 'Delete'}</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(!core.commentsMap[core.selectedDetailPost.id] || core.commentsMap[core.selectedDetailPost.id].length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '20px', opacity: 0.4, fontSize: '12px' }}>{lang === 'fa' ? 'نظری ثبت نشده است.' : 'No comments yet.'}</div>
                    ) : (
                      core.commentsMap[core.selectedDetailPost.id].map((comment: any) => (
                        <div key={comment.id} style={{ background: theme.inputBg, padding: '10px', borderRadius: '8px', fontSize: '12px', textAlign: isRtl ? 'right' : 'left' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '3px', color: theme.accent }}>{comment.artist_name} <span style={{ fontWeight: 'normal', color: '#8e8e93', fontSize: '10px' }}>@{comment.username}</span></div>
                          <div style={{ color: theme.text }}>{comment.text}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', borderTop: `1px solid ${theme.border}`, background: theme.cardBg, display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="text" placeholder={lang === 'fa' ? 'نوشتن نظر...' : 'Add comment...'} value={core.newCommentText} onChange={(e) => core.setNewCommentText(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') core.handleAddComment(core.selectedDetailPost.id); }} style={{ flex: 1, padding: '10px 12px', background: theme.inputBg, border: 'none', borderRadius: '20px', color: theme.text, fontSize: '13px', outline: 'none' }} />
                  <button onClick={() => core.handleAddComment(core.selectedDetailPost.id)} style={{ background: 'none', border: 'none', color: theme.accent, fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', padding: '0 8px' }}>{lang === 'fa' ? 'ارسال' : 'Post'}</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}