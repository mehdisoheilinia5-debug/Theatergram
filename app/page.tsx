'use client';
import { categories } from './constants';
import { useTheaterCore } from './useTheaterCore';

export default function TheaterGramCore() {
  const core = useTheaterCore('fa');
  const lang = core.currentLang;
  const isRtl = lang === 'fa';

  // Theme
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
            <div style={{ fontSize: '48px', marginBottom: '8px }}>🎭</div>
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
        <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: theme.accent }}>
          {lang === 'fa' ? 'تئاترگرام' : 'TheaterGram'}
        </h1>
        <div style={{ width: '36px' }} />
      </header>

      {/* Side Menu */}
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
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          width: '280px',
          background: theme.cardBg,
          padding: '24px 20px',
          zIndex: 110,
          right: isRtl ? 0 : 'auto',
          left: !isRtl ? 0 : 'auto',
          transform: core.isMenuOpen ? 'translateX(0)' : isRtl ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          borderLeft: isRtl ? `1px solid ${theme.border}` : 'none',
          borderRight: !isRtl ? `1px solid ${theme.border}` : 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <span>{lang === 'fa' ? 'منو' : 'MENU'}</span>
          <button onClick={() => core.setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '24px' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => { core.setIsDarkMode(!core.isDarkMode); core.setIsMenuOpen(false); }} style={{ width: '100%', padding: '12px', background: theme.inputBg, border: 'none', color: theme.text, borderRadius: '12px' }}>
            {core.isDarkMode ? '☀️ روشن' : '🌙 شب'}
          </button>
          <button onClick={() => { core.setCurrentLang(lang === 'fa' ? 'en' : 'fa'); core.setIsMenuOpen(false); }} style={{ width: '100%', padding: '12px', background: theme.inputBg, border: 'none', color: theme.text, borderRadius: '12px' }}>
            🌐 {lang === 'fa' ? 'English' : 'فارسی'}
          </button>
          <button onClick={core.handleLogout} style={{ width: '100%', padding: '12px', background: theme.danger, color: '#fff', border: 'none', borderRadius: '12px', marginTop: '12px' }}>
            {lang === 'fa' ? 'خروج' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px' }}>
        {core.activeTab === 'explore' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder={lang === 'fa' ? '🔍 جستجو...' : '🔍 Search...'}
              value={core.searchQuery}
              onChange={(e) => core.setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px', background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.text }}
            />

            {/* Filter */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
              <button onClick={() => core.setSelectedCategoryFilter('all')} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: core.selectedCategoryFilter === 'all' ? theme.accent : theme.inputBg, color: '#fff' }}>همه</button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => core.setSelectedCategoryFilter(cat.id)} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: core.selectedCategoryFilter === cat.id ? theme.accent : theme.inputBg, color: '#fff', whiteSpace: 'nowrap' }}>
                  {lang === 'fa' ? cat.fa : cat.en}
                </button>
              ))}
            </div>

            {/* Posts Stream */}
            {core.approvedPosts.map((post) => (
              <div key={post.id} style={{ background: theme.cardBg, borderRadius: theme.radius, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600' }}>{post.artist_name}</span>
                  <span style={{ fontSize: '12px', opacity: 0.6 }}>@{post.username}</span>
                </div>
                {post.video_url && (
                  <div style={{ background: '#000' }}>
                    {post.video_url.includes('image') || post.video_url.startsWith('data:image/') ? (
                      <img src={post.video_url} alt="" style={{ width: '100%', maxHeight: '350px', objectFit: 'contain' }} />
                    ) : (
                      <video src={post.video_url} controls style={{ width: '100%', maxHeight: '350px' }} />
                    )}
                  </div>
                )}
                <div style={{ padding: '12px', display: 'flex', gap: '12px' }}>
                  <button onClick={() => core.handleToggleLike(post.id)} style={{ background: 'none', border: 'none', color: theme.text }}>
                    {core.likedPosts?.includes(post.id) ? '❤️' : '🤍'} {core.getPostLikesCount(post)}
                  </button>
                  <button onClick={() => core.setSelectedDetailPost(post)} style={{ background: 'none', border: 'none', color: theme.text }}>💬 {core.commentsMap?.[post.id]?.length || 0}</button>
                </div>
                <div style={{ padding: '0 12px 12px' }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>{post.caption}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile Tab */}
        {core.activeTab === 'profile' && (
          <div>
            <div style={{ background: theme.cardBg, borderRadius: theme.radius, padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
              <h3>{core.userProfile.name}</h3>
              <p style={{ opacity: 0.6 }}>@{core.userProfile.username}</p>
              <p>{core.userProfile.bio}</p>
            </div>

            {/* Upload form */}
            <div style={{ background: theme.cardBg, borderRadius: theme.radius, padding: '20px', border: `1px solid ${theme.border}` }}>
              <input type="file" accept="image/*,video/*" onChange={core.handleFileChange} style={{ marginBottom: '12px' }} />
              <textarea placeholder="توضیحات اتود..." value={core.caption} onChange={(e) => core.setCaption(e.target.value)} style={{ width: '100%', padding: '12px', background: theme.inputBg, color: theme.text, borderRadius: '8px', border: 'none' }} />
              <button onClick={core.handlePublish} style={{ width: '100%', padding: '12px', background: theme.accent, color: '#fff', border: 'none', borderRadius: '8px', marginTop: '8px' }}>ارسال اتود</button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: theme.bg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', padding: '12px' }}>
        <button onClick={() => core.setActiveTab('explore')} style={{ background: 'none', border: 'none', color: core.activeTab === 'explore' ? theme.accent : theme.text }}>🧭 اکسپلور</button>
        <button onClick={() => core.setActiveTab('profile')} style={{ background: 'none', border: 'none', color: core.activeTab === 'profile' ? theme.accent : theme.text }}>👤 صفحه من</button>
      </nav>
    </div>
  );
}
