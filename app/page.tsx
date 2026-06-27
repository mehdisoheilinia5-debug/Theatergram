'use client';

import React, { useState, useEffect } from 'react';

// ==========================================
// ۱. سیستم مدیریت دیتابیس محلی (LocalStorage)
// ==========================================
const initDatabase = () => {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('tg_users')) {
      const defaultUsers = {
        'mehdisoheilinia': { username: 'mehdisoheilinia', name: 'مهدی سهیلی‌نیا', role: 'admin', bio: 'کارگردان و بازیگر تئاتر', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', followers: [], following: [] },
        'user1': { username: 'user1', name: 'هنرمند نمونه', role: 'user', bio: 'عضو جامعه تئاتر', avatar: '', followers: [], following: [] },
        'user2': { username: 'user2', name: 'بازیگر تئاتر', role: 'user', bio: 'علاقه‌مند به اتود و بداهه', avatar: '', followers: [], following: [] }
      };
      localStorage.setItem('tg_users', JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem('tg_posts')) {
      localStorage.setItem('tg_posts', JSON.stringify([]));
    }
  }
};

// ==========================================
// ۲. کامپوننت اصلی و یکپارچه فایل page.tsx
// ==========================================
export default function Page() {
  // تنظیمات اصلی ساختاری
  const [showSplash, setShowSplash] = useState(true);
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // سیستم احراز هویت و کاربران
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // بخش‌های مختلف برنامه
  const [activeTab, setActiveTab] = useState('explore');
  const [targetUser, setTargetUser] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [dbUsers, setDbUsers] = useState<any>({});

  // فیلدهای فرم ارسال پست جدید
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('improvisation');

  // فیلدهای ویرایش پروفایل شخصی
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // جابه‌جایی توابع به بالاترین بخش کامپوننت برای حل ارور اسکوپ در TypeScript
  const toggleLang = () => setLang((prev) => (prev === 'fa' ? 'en' : 'fa'));
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    initDatabase();
    loadData();

    // کاهش انیمیشن ورودی به ۱ ثانیه
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // بارگذاری داده‌ها پس از ورود کاربر
  useEffect(() => {
    if (currentUser && dbUsers[currentUser]) {
      setEditName(dbUsers[currentUser].name || '');
      setEditBio(dbUsers[currentUser].bio || '');
      setEditAvatar(dbUsers[currentUser].avatar || '');
    }
  }, [currentUser, dbUsers]);

  const loadData = () => {
    if (typeof window !== 'undefined') {
      setPosts(JSON.parse(localStorage.getItem('tg_posts') || '[]'));
      setDbUsers(JSON.parse(localStorage.getItem('tg_users') || '{}'));
    }
  };

  const isAdmin = currentUser === 'mehdisoheilinia';

  // سیستم ورود کاربران
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    
    const allUsers = JSON.parse(localStorage.getItem('tg_users') || '{}');
    
    if (!allUsers[usernameInput.toLowerCase()]) {
      allUsers[usernameInput.toLowerCase()] = {
        username: usernameInput.toLowerCase(),
        name: usernameInput,
        role: usernameInput.toLowerCase() === 'mehdisoheilinia' ? 'admin' : 'user',
        bio: 'هنرمند تئاترگرام',
        avatar: '',
        followers: [],
        following: []
      };
      localStorage.setItem('tg_users', JSON.stringify(allUsers));
    }
    
    setCurrentUser(usernameInput.toLowerCase());
    loadData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsMenuOpen(false);
    setActiveTab('explore');
    setTargetUser(null);
  };

  // ذخیره اطلاعات پروفایل ادیت شده در دیتابیس محلی
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const allUsers = JSON.parse(localStorage.getItem('tg_users') || '{}');
    if (allUsers[currentUser]) {
      allUsers[currentUser].name = editName;
      allUsers[currentUser].bio = editBio;
      allUsers[currentUser].avatar = editAvatar;
      localStorage.setItem('tg_users', JSON.stringify(allUsers));
      loadData();
      alert(lang === 'fa' ? 'پروفایل با موفقیت ذخیره شد!' : 'Profile saved successfully!');
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !currentUser) return;

    const allPosts = JSON.parse(localStorage.getItem('tg_posts') || '[]');
    const newPost = {
      id: Date.now().toString(),
      username: currentUser,
      artist_name: dbUsers[currentUser]?.name || currentUser,
      title: postTitle,
      category: postCategory,
      status: currentUser === 'mehdisoheilinia' ? 'approved' : 'pending',
      likes: [],
      createdAt: new Date().toISOString()
    };

    allPosts.unshift(newPost);
    localStorage.setItem('tg_posts', JSON.stringify(allPosts));
    setPostTitle('');
    loadData();
    alert(currentUser === 'mehdisoheilinia' 
      ? (lang === 'fa' ? 'پست شما منتشر شد!' : 'Post published!') 
      : (lang === 'fa' ? 'پست به صف بررسی ادمین ارسال شد.' : 'Sent to admin moderation queue.')
    );
  };

  const handleToggleLike = (postId: string) => {
    if (!currentUser) return;
    const allPosts = JSON.parse(localStorage.getItem('tg_posts') || '[]');
    const updated = allPosts.map((post: any) => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes(currentUser);
        if (hasLiked) {
          post.likes = post.likes.filter((u: string) => u !== currentUser);
        } else {
          post.likes.push(currentUser);
        }
      }
      return post;
    });
    localStorage.setItem('tg_posts', JSON.stringify(updated));
    loadData();
  };

  const handleApprovePost = (postId: string) => {
    const allPosts = JSON.parse(localStorage.getItem('tg_posts') || '[]');
    const updated = allPosts.map((post: any) => {
      if (post.id === postId) {
        post.status = 'approved';
      }
      return post;
    });
    localStorage.setItem('tg_posts', JSON.stringify(updated));
    loadData();
  };

  const handleToggleFollow = (targetUsername: string) => {
    if (!currentUser) return;
    const allUsers = JSON.parse(localStorage.getItem('tg_users') || '{}');
    if (!allUsers[currentUser] || !allUsers[targetUsername]) return;

    const isFollowing = allUsers[currentUser].following.includes(targetUsername);

    if (isFollowing) {
      allUsers[currentUser].following = allUsers[currentUser].following.filter((u: string) => u !== targetUsername);
      allUsers[targetUsername].followers = allUsers[targetUsername].followers.filter((u: string) => u !== currentUser);
    } else {
      allUsers[currentUser].following.push(targetUsername);
      allUsers[targetUsername].followers.push(currentUser);
    }

    localStorage.setItem('tg_users', JSON.stringify(allUsers));
    loadData();
  };

  const approvedPosts = posts.filter(p => p.status === 'approved');
  const pendingPosts = posts.filter(p => p.status === 'pending');

  const isDark = theme === 'dark';
  const isFa = lang === 'fa';

  // لایه‌های رنگی سیستم روز و شب همراه با تایپ صریح جهت پاس کردن بیلد ری‌اکت و تایپ‌اسکریپت
  const currentStyles: React.CSSProperties = {
    ...styles.appContainer,
    backgroundColor: isDark ? '#000000' : '#f5f7fb',
    color: isDark ? '#ffffff' : '#1c1c1e',
    direction: isFa ? 'rtl' : 'ltr'
  };

  // رندر انیمیشن اسپلش اسکرین اول برنامه (۱ ثانیه)
  if (showSplash) {
    return (
      <div style={{ ...styles.splashContainer, backgroundColor: isDark ? '#000' : '#fff' }}>
        <h1 style={{ ...styles.splashText, color: isDark ? '#fff' : '#000' }}>theatergram</h1>
      </div>
    );
  }

  // نمای ورود به پلتفرم
  if (!currentUser) {
    return (
      <div style={{ ...styles.loginWrapper, backgroundColor: isDark ? '#000' : '#f5f7fb', color: isDark ? '#fff' : '#000', direction: isFa ? 'rtl' : 'ltr' }}>
        <form onSubmit={handleLogin} style={{ ...styles.loginCard, background: isDark ? '#121212' : '#fff', borderColor: isDark ? '#1c1c1e' : '#e5e5ea' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>theatergram</h1>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px', textAlign: 'center' }}>
            {isFa ? 'شبکه اجتماعی تخصصی هنرهای نمایشی' : 'The Social Network for Theater Professionals'}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input 
              type="text" 
              placeholder={isFa ? 'نام کاربری (مثلا: mehdisoheilinia)' : 'Username'} 
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              style={{ ...styles.input, background: isDark ? '#1c1c1e' : '#f2f2f7', color: isDark ? '#fff' : '#000' }}
              required
            />
            <input 
              type="password" 
              placeholder={isFa ? 'رمز عبور' : 'Password'} 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={{ ...styles.input, background: isDark ? '#1c1c1e' : '#f2f2f7', color: isDark ? '#fff' : '#000' }}
            />
            <button type="submit" style={{ ...styles.submitBtn, background: isDark ? '#fff' : '#007aff', color: isDark ? '#000' : '#fff' }}>
              {isFa ? 'ورود به حساب کاربری' : 'Login'}
            </button>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button type="button" onClick={toggleLang} style={styles.inlineActionBtn}>🌐 {isFa ? 'English' : 'فارسی'}</button>
            <button type="button" onClick={toggleTheme} style={styles.inlineActionBtn}>{isDark ? '☀️ روز' : '🌙 شب'}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={currentStyles}>
      {/* هدر بالایی برنامه */}
      <header style={{ ...styles.header, borderBottomColor: isDark ? '#1c1c1e' : '#e5e5ea', backgroundColor: isDark ? '#000' : '#fff' }}>
        {/* دکمه همبرگری که با تغییر زبان جابجا می‌شود */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          style={{ ...styles.menuToggleBtn, color: isDark ? '#fff' : '#000', order: isFa ? 0 : 2 }}
        >
          ☰
        </button>
        
        <h1 style={{ ...styles.logo, order: 1 }} onClick={() => { setTargetUser(null); setActiveTab('explore'); }}>theatergram</h1>
        
        <div style={{ width: '32px', order: isFa ? 2 : 0 }} />
      </header>

      {/* منوی همبرگری کشویی متصل به ساید مخالف بر اساس زبان */}
      {isMenuOpen && (
        <div style={{ 
          ...styles.drawerMenu, 
          background: isDark ? '#121212' : '#ffffff',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)',
          borderLeft: isFa && isDark ? '1px solid #1c1c1e' : isFa ? '1px solid #e5e5ea' : 'none',
          borderRight: !isFa && isDark ? '1px solid #1c1c1e' : !isFa ? '1px solid #e5e5ea' : 'none',
          right: isFa ? 0 : 'auto',
          left: !isFa ? 0 : 'auto'
        }}>
          <div style={{ padding: '20px', borderBottom: `1px solid ${isDark ? '#1c1c1e' : '#e5e5ea'}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ ...styles.avatarCircle, backgroundImage: `url(${dbUsers[currentUser]?.avatar || 'https://via.placeholder.com/150'})` }} />
            <div>
              <div style={{ fontWeight: 'bold' }}>{dbUsers[currentUser]?.name}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>@{currentUser}</div>
            </div>
          </div>
          
          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button onClick={toggleTheme} style={{ ...styles.menuLinkBtn, color: isDark ? '#fff' : '#000' }}>
              {isDark ? '☀️ تم روز (Light Mode)' : '🌙 تم شب (Dark Mode)'}
            </button>
            <button onClick={toggleLang} style={{ ...styles.menuLinkBtn, color: isDark ? '#fff' : '#000' }}>
              🌐 {isFa ? 'تغییر به English' : 'Switch to فارسی'}
            </button>
            <button onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }} style={{ ...styles.menuLinkBtn, color: isDark ? '#fff' : '#000' }}>
              👤 {isFa ? 'ویرایش پروفایل' : 'Edit Profile'}
            </button>
            <hr style={{ border: 'none', borderTop: `1px solid ${isDark ? '#1c1c1e' : '#e5e5ea'}`, margin: '10px 0' }} />
            <button onClick={handleLogout} style={{ ...styles.menuLinkBtn, color: '#ff3b30', fontWeight: 'bold' }}>
              🚪 {isFa ? 'خروج از حساب' : 'Logout'}
            </button>
          </div>
        </div>
      )}

      {/* بستن منو با کلیک روی فضای خالی خارج منو */}
      {isMenuOpen && <div style={styles.menuOverlay} onClick={() => setIsMenuOpen(false)} />}

      {/* محتوای اصلی برنامه */}
      <main style={styles.mainContent}>
        {targetUser ? (
          <ProfileSection 
            user={dbUsers[targetUser]} 
            currentUser={currentUser} 
            posts={posts.filter(p => p.username === targetUser && p.status === 'approved')}
            onFollowToggle={handleToggleFollow}
            onBack={() => setTargetUser(null)}
            isDark={isDark}
            isFa={isFa}
          />
        ) : (
          <>
            {activeTab === 'explore' && (
              <div style={styles.feedContainer}>
                <h2 style={styles.sectionTitle}>{isFa ? '🧭 اکسپلور اتودها و بداهه‌پردازی‌ها' : '🧭 Explore Etudes & Improvisations'}</h2>
                {approvedPosts.length === 0 ? (
                  <p style={styles.emptyText}>{isFa ? 'هیچ اتودی هنوز منتشر نشده است.' : 'No etudes published yet.'}</p>
                ) : (
                  approvedPosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      currentUser={currentUser} 
                      onLike={handleToggleLike} 
                      onUserClick={(uname) => setTargetUser(uname)}
                      isDark={isDark}
                      isFa={isFa}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <ProfileSection 
                  user={dbUsers[currentUser]} 
                  currentUser={currentUser} 
                  posts={posts.filter(p => p.username === currentUser)}
                  onFollowToggle={handleToggleFollow}
                  isOwn={true}
                  isDark={isDark}
                  isFa={isFa}
                />
                
                {/* فرم ویرایش اطلاعات پروفایل زنده */}
                <form onSubmit={handleSaveProfile} style={{ ...styles.postForm, background: isDark ? '#121212' : '#fff', borderColor: isDark ? '#1c1c1e' : '#e5e5ea' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>⚙️ {isFa ? 'تنظیمات و اطلاعات کاربری' : 'Profile Settings'}</h3>
                  <input 
                    type="text" 
                    placeholder={isFa ? 'نام هنری نمایش' : 'Display Name'}
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    style={{ ...styles.input, background: isDark ? '#1c1c1e' : '#f2f2f7', color: isDark ? '#fff' : '#000' }}
                  />
                  <input 
                    type="text" 
                    placeholder={isFa ? 'بیوگرافی (کارگردان، نویسنده، بازیگر...)' : 'Biography'}
                    value={editBio} 
                    onChange={(e) => setEditBio(e.target.value)} 
                    style={{ ...styles.input, background: isDark ? '#1c1c1e' : '#f2f2f7', color: isDark ? '#fff' : '#000' }}
                  />
                  <input 
                    type="text" 
                    placeholder={isFa ? 'آدرس URL عکس پروفایل' : 'Avatar URL'}
                    value={editAvatar} 
                    onChange={(e) => setEditAvatar(e.target.value)} 
                    style={{ ...styles.input, background: isDark ? '#1c1c1e' : '#f2f2f7', color: isDark ? '#fff' : '#000' }}
                  />
                  <button type="submit" style={{ ...styles.submitBtn, background: '#007aff', color: '#fff' }}>
                    💾 {isFa ? 'ذخیره تغییرات پروفایل' : 'Save Profile Data'}
                  </button>
                </form>

                {/* فرم ارسال اتود جدید */}
                <form onSubmit={handleCreatePost} style={{ ...styles.postForm, background: isDark ? '#121212' : '#fff', borderColor: isDark ? '#1c1c1e' : '#e5e5ea', marginTop: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>🎬 {isFa ? 'ثبت اتود یا تمرین جدید' : 'New Stage Etude'}</h3>
                  <input 
                    type="text" 
                    placeholder={isFa ? 'عنوان اتود یا صحنه...' : 'Etude Title...'} 
                    value={postTitle} 
                    onChange={(e) => setPostTitle(e.target.value)} 
                    style={{ ...styles.input, background: isDark ? '#1c1c1e' : '#f2f2f7', color: isDark ? '#fff' : '#000' }}
                    required
                  />
                  <select 
                    value={postCategory} 
                    onChange={(e) => setPostCategory(e.target.value)} 
                    style={{ ...styles.input, background: isDark ? '#1c1c1e' : '#f2f2f7', color: isDark ? '#fff' : '#000' }}
                  >
                    <option value="improvisation">{isFa ? 'بداهه‌پردازی' : 'Improvisation'}</option>
                    <option value="rehearsal">{isFa ? 'تمرین صحنه' : 'Scene Rehearsal'}</option>
                    <option value="educational">{isFa ? 'آموزشی' : 'Educational'}</option>
                    <option value="etude">{isFa ? 'اتود کلاسی' : 'Class Etude'}</option>
                  </select>
                  <button type="submit" style={{ ...styles.submitBtn, background: isDark ? '#fff' : '#000', color: isDark ? '#000' : '#fff' }}>
                    🚀 {isFa ? 'ارسال به پلتفرم تئاترگرام' : 'Publish to Platform'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'adminPanel' && isAdmin && (
              <div style={styles.feedContainer}>
                <h2 style={styles.sectionTitle}>📥 صندوق بررسی و تایید ادمین ({pendingPosts.length})</h2>
                {pendingPosts.length === 0 ? (
                  <p style={styles.emptyText}>{isFa ? 'هیچ پستی در صف تایید وجود ندارد.' : 'No posts pending approval.'}</p>
                ) : (
                  pendingPosts.map(post => (
                    <div key={post.id} style={{ ...styles.adminCard, background: isDark ? '#1c1c1e' : '#fff', borderColor: isDark ? '#2c2c2e' : '#e5e5ea' }}>
                      <div>
                        <span style={{ color: '#00ffcc', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setTargetUser(post.username)}>@{post.username}</span>
                        <h4 style={{ margin: '4px 0', color: isDark ? '#fff' : '#000' }}>{post.title}</h4>
                        <span style={styles.categoryBadge}>
                          {post.category === 'improvisation' ? (isFa ? 'بداهه‌پردازی' : 'Improvisation') : post.category}
                        </span>
                      </div>
                      <button onClick={() => handleApprovePost(post.id)} style={styles.approveBtn}>
                        {isFa ? 'تایید و انتشار' : 'Approve'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* نوار ناوبری پایینی و فیکس شده */}
      <nav style={{ ...styles.bottomNav, backgroundColor: isDark ? '#0a0a0a' : '#fff', borderTopColor: isDark ? '#1c1c1e' : '#e5e5ea' }}>
        <button 
          onClick={() => { setTargetUser(null); setActiveTab('explore'); }} 
          style={{ ...styles.navBtn, color: activeTab === 'explore' && !targetUser ? (isDark ? '#fff' : '#007aff') : '#666' }}
        >
          🧭 {isFa ? 'اکسپلور' : 'Explore'}
        </button>
        <button 
          onClick={() => { setTargetUser(null); setActiveTab('profile'); }} 
          style={{ ...styles.navBtn, color: activeTab === 'profile' && !targetUser ? (isDark ? '#fff' : '#007aff') : '#666' }}
        >
          👤 {isFa ? 'پروفایل' : 'Profile'}
        </button>
        
        {isAdmin && (
          <button 
            onClick={() => { setTargetUser(null); setActiveTab('adminPanel'); }} 
            style={{ ...styles.navBtn, color: activeTab === 'adminPanel' && !targetUser ? '#00ffcc' : '#666' }}
          >
            ⚙️ {isFa ? 'مدیریت' : 'Admin'}
          </button>
        )}
      </nav>
    </div>
  );
}

// ==========================================
// ۳. کامپوننت فرعی کارت پست (PostCard)
// ==========================================
function PostCard({ post, currentUser, onLike, onUserClick, isDark, isFa }: any) {
  const isLikedByMe = post.likes.includes(currentUser);

  return (
    <div style={{ ...styles.postCard, background: isDark ? '#121212' : '#fff', borderColor: isDark ? '#1c1c1e' : '#e5e5ea' }}>
      <div style={styles.cardHeader}>
        <span onClick={() => onUserClick(post.username)} style={styles.cardUsername}>
          @{post.username}
        </span>
        <span style={styles.cardBadge}>
          {post.category === 'improvisation' ? (isFa ? 'بداهه‌پردازی' : 'Improvisation') : post.category}
        </span>
      </div>
      <div style={{ ...styles.mediaPlaceholder, backgroundColor: isDark ? '#000' : '#f2f2f7', borderColor: isDark ? '#1c1c1e' : '#e5e5ea' }}>
        <span style={{ color: '#888', fontSize: '13px' }}>🎬 ویدیو اتود تئاتر</span>
      </div>
      <p style={{ ...styles.cardTitle, color: isDark ? '#fff' : '#000', textAlign: isFa ? 'right' : 'left' }}>{post.title}</p>
      <div style={styles.cardActions}>
        <button 
          onClick={() => onLike(post.id)} 
          style={{ ...styles.likeBtn, background: isLikedByMe ? '#ff3b30' : (isDark ? '#262626' : '#e5e5ea'), color: isLikedByMe ? '#fff' : (isDark ? '#fff' : '#000') }}
        >
          {isLikedByMe ? '❤️' : '🤍'} {isFa ? 'لایک' : 'Like'}
        </button>
        <span style={styles.likeCount}>{post.likes.length} {isFa ? 'نفر' : 'likes'}</span>
      </div>
    </div>
  );
}

// ==========================================
// ۴. کامپوننت فرعی پروفایل کاربری (ProfileSection)
// ==========================================
function ProfileSection({ user, currentUser, posts, onFollowToggle, onBack, isOwn = false, isDark, isFa }: any) {
  if (!user) return null;
  const isFollowing = user.followers.includes(currentUser);

  return (
    <div style={{ ...styles.profileCard, background: isDark ? '#121212' : '#fff', borderColor: isDark ? '#1c1c1e' : '#e5e5ea' }}>
      {onBack && <button onClick={onBack} style={styles.backBtn}>← {isFa ? 'بازگشت به اکسپلور' : 'Back to Explore'}</button>}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{ ...styles.avatarContainer, backgroundImage: `url(${user.avatar || 'https://via.placeholder.com/150'})` }} />
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{user.name}</h2>
          <p style={{ color: '#888', fontSize: '13px', margin: '2px 0 0 0' }}>@{user.username}</p>
        </div>
      </div>

      <p style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.9, textAlign: isFa ? 'right' : 'left' }}>{user.bio}</p>

      {/* بخش آمار و دکمه تعاملی فالو */}
      <div style={{ ...styles.statsContainer, background: isDark ? '#1c1c1e' : '#f2f2f7' }}>
        <div style={styles.statBox}>
          <span style={{ ...styles.statNum, color: isDark ? '#fff' : '#000' }}>{user.followers.length}</span>
          <span style={styles.statLabel}>{isFa ? 'دنبال‌کننده' : 'Followers'}</span>
        </div>
        <div style={styles.statBox}>
          <span style={{ ...styles.statNum, color: isDark ? '#fff' : '#000' }}>{user.following.length}</span>
          <span style={styles.statLabel}>{isFa ? 'دنبال‌شونده ' : 'Following'}</span>
        </div>
        <div style={styles.statBox}>
          <span style={{ ...styles.statNum, color: isDark ? '#fff' : '#000' }}>{posts.length}</span>
          <span style={styles.statLabel}>{isFa ? 'اتودها' : 'Etudes'}</span>
        </div>

        {!isOwn && (
          <button 
            onClick={() => onFollowToggle(user.username)} 
            style={{ ...styles.followBtn, background: isFollowing ? '#3a3a3c' : '#007aff', color: '#fff' }}
          >
            {isFollowing ? (isFa ? '✓ پایدار' : '✓ Following') : (isFa ? 'دنبال کردن' : 'Follow')}
          </button>
        )}
      </div>

      <div style={{ marginTop: '25px', borderTop: `1px solid ${isDark ? '#222' : '#e5e5ea'}`, paddingTop: '15px' }}>
        <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '15px', textAlign: isFa ? 'right' : 'left' }}>🎬 {isFa ? 'آرشیو ویدیوها و اتودها' : 'Archive Video Etudes'}</h3>
        <div style={styles.grid}>
          {posts.map((p: any) => (
            <div key={p.id} style={{ ...styles.gridItem, background: isDark ? '#1c1c1e' : '#f2f2f7', borderColor: isDark ? '#2c2c2e' : '#e5e5ea' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{p.title}</span>
              <div style={{ fontSize: '9px', color: '#888', marginTop: '4px' }}>
                {p.category === 'improvisation' ? (isFa ? 'بداهه‌پردازی' : 'Improv') : 'اتود'}
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p style={{ gridColumn: '1/-1', color: '#888', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
              {isFa ? 'هیچ پست عمومی وجود ندارد.' : 'No public posts found.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ۵. معماری جامع استایل‌ها (CSS in JS)
// ==========================================
const styles: Record<string, React.CSSProperties> = {
  splashContainer: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', direction: 'ltr'
  },
  splashText: {
    fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '4px'
  },
  loginWrapper: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '16px'
  },
  loginCard: {
    width: '100%', maxWidth: '380px', padding: '32px 24px', borderRadius: '16px', border: '1px solid', display: 'flex', flexDirection: 'column'
  },
  inlineActionBtn: {
    background: 'none', border: 'none', color: '#007aff', fontSize: '12px', cursor: 'pointer'
  },
  appContainer: {
    minHeight: '100vh', paddingBottom: '80px', fontFamily: 'system-ui, sans-serif', transition: 'background-color 0.2s, color 0.2s'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid', position: 'sticky', top: 0, zIndex: 90
  },
  logo: { fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px', cursor: 'pointer' },
  menuToggleBtn: { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', padding: '4px', outline: 'none' },
  drawerMenu: {
    position: 'fixed', top: '55px', bottom: 0, width: '260px', zIndex: 110, display: 'flex', flexDirection: 'column', transition: 'all 0.3s'
  },
  menuOverlay: { position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 105 },
  menuLinkBtn: { background: 'none', border: 'none', padding: '12px 16px', textAlign: 'inherit', width: '100%', fontSize: '13px', cursor: 'pointer' },
  avatarCircle: { width: '40px', height: '40px', borderRadius: '50%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#333' },
  mainContent: { maxWidth: '480px', margin: '0 auto', padding: '16px' },
  feedContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sectionTitle: { fontSize: '15px', fontWeight: 'bold' },
  emptyText: { color: '#888', textAlign: 'center', padding: '40px 0', fontSize: '13px' },
  postCard: { borderRadius: '12px', border: '1px solid', padding: '14px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  cardUsername: { fontWeight: 'bold', fontSize: '13px', color: '#00ffcc', cursor: 'pointer' },
  cardBadge: { background: '#1c1c1e', padding: '3px 6px', borderRadius: '4px', fontSize: '10px', color: '#888' },
  mediaPlaceholder: { height: '200px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid' },
  cardTitle: { fontSize: '13px', margin: '10px 0', lineHeight: '1.5' },
  cardActions: { display: 'flex', alignItems: 'center', gap: '10px' },
  likeBtn: { border: 'none', padding: '4px 10px', borderRadius: '14px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' },
  likeCount: { fontSize: '11px', color: '#888' },
  profileCard: { borderRadius: '12px', padding: '16px', border: '1px solid' },
  avatarContainer: { width: '60px', height: '60px', borderRadius: '50%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#333' },
  backBtn: { background: 'none', border: 'none', color: '#007aff', fontSize: '12px', cursor: 'pointer', marginBottom: '12px', display: 'block' },
  statsContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', gap: '6px' },
  statBox: { textAlign: 'center', flex: 1 },
  statNum: { display: 'block', fontSize: '14px', fontWeight: 'bold' },
  statLabel: { fontSize: '10px', color: '#888' },
  followBtn: { border: 'none', padding: '6px 12px', borderRadius: '14px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' },
  postForm: { borderRadius: '12px', padding: '14px', border: '1px solid', display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { border: 'none', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', outline: 'none' },
  submitBtn: { border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  bottomNav: {
    position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', borderTop: '1px solid', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100
  },
  navBtn: { background: 'none', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', outline: 'none' },
  adminCard: { padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid' },
  categoryBadge: { fontSize: '10px', background: '#2c2c2e', padding: '2px 4px', borderRadius: '3px', color: '#aaa' },
  approveBtn: { background: '#34c759', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' },
  gridItem: { aspectRatio: '1', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4px', border: '1px solid' }
};
