'use client';

import React, { useState, useEffect } from 'react';

// ==========================================
// ۱. سیستم مدیریت دیتابیس محلی (LocalStorage)
// ==========================================
const initDatabase = () => {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('tg_users')) {
      const defaultUsers = {
        'mehdisoheilinia': { username: 'mehdisoheilinia', name: 'مهدی سهیلی‌نیا', role: 'admin', bio: 'کارگردان و بازیگر تئاتر', followers: [], following: [] },
        'user1': { username: 'user1', name: 'هنرمند نمونه', role: 'user', bio: 'عضو جامعه تئاتر', followers: [], following: [] },
        'user2': { username: 'user2', name: 'بازیگر تئاتر', role: 'user', bio: 'علاقه‌مند به اتود و بداهه', followers: [], following: [] }
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
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState('mehdisoheilinia'); // کاربر پیش‌فرض (قابل تغییر از هدر)
  const [activeTab, setActiveTab] = useState('explore');
  const [targetUser, setTargetUser] = useState<string | null>(null); // برای مشاهده پروفایل دیگران
  const [posts, setPosts] = useState<any[]>([]);
  const [dbUsers, setDbUsers] = useState<any>({});

  // فیلدهای فرم ارسال پست جدید
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('improvisation'); // پیش‌فرض: بداهه‌پردازی

  useEffect(() => {
    initDatabase();
    loadData();

    // ۵. انیمیشن ورودی تئاترگرام در حد ۲ ثانیه
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const loadData = () => {
    if (typeof window !== 'undefined') {
      setPosts(JSON.parse(localStorage.getItem('tg_posts') || '[]'));
      setDbUsers(JSON.parse(localStorage.getItem('tg_users') || '{}'));
    }
  };

  // ۱. کنترل بخش ادمین (فقط برای نام کاربری mehdisoheilinia)
  const isAdmin = currentUser === 'mehdisoheilinia';

  // ۳. ارسال پست جدید به صف انتظار
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    const allPosts = JSON.parse(localStorage.getItem('tg_posts') || '[]');
    const newPost = {
      id: Date.now().toString(),
      username: currentUser,
      artist_name: dbUsers[currentUser]?.name || currentUser,
      title: postTitle,
      category: postCategory, // متغیر تخصصی تئاتر
      status: currentUser === 'mehdisoheilinia' ? 'approved' : 'pending', // پست ادمین مستقیم منتشر میشه، بقیه می‌رن صف ادمین
      likes: [], // آرایه کاربران لایک‌کننده برای تفکیک لایک‌ها
      createdAt: new Date().toISOString()
    };

    allPosts.unshift(newPost);
    localStorage.setItem('tg_posts', JSON.stringify(allPosts));
    setPostTitle('');
    loadData();
    alert(currentUser === 'mehdisoheilinia' ? 'پست شما با موفقیت منتشر شد!' : 'پست شما با موفقیت به صف بررسی ادمین ارسال شد.');
  };

  // ۴. دکمه لایک مجزا و اختصاصی برای هر کاربر
  const handleToggleLike = (postId: string) => {
    const allPosts = JSON.parse(localStorage.getItem('tg_posts') || '[]');
    const updated = allPosts.map((post: any) => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes(currentUser);
        if (hasLiked) {
          post.likes = post.likes.filter((u: string) => u !== currentUser); // دیس‌لایک
        } else {
          post.likes.push(currentUser); // لایک جدید
        }
      }
      return post;
    });
    localStorage.setItem('tg_posts', JSON.stringify(updated));
    loadData();
  };

  // ۳. تایید پست در بخش ادمین و انتشار آن در اکسپلور عمومی
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
    alert('پست با موفقیت تایید و منتشر شد!');
  };

  // ۲. دکمه دنبال کردن (Follow) پایدار و تثبیت‌شده در آمار
  const handleToggleFollow = (targetUsername: string) => {
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

  // فیلتر کردن پست‌ها برای بخش اکسپلور (فقط تایید شده‌ها)
  const approvedPosts = posts.filter(p => p.status === 'approved');
  // فیلتر پست‌ها برای صف بررسی ادمین (فقط pending)
  const pendingPosts = posts.filter(p => p.status === 'pending');

  // رندر انیمیشن اسپلش اسکرین اول برنامه (۲ ثانیه)
  if (showSplash) {
    return (
      <div style={styles.splashContainer}>
        <h1 style={styles.splashText}>theatergram</h1>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      {/* هدر بالایی برنامه */}
      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => { setTargetUser(null); setActiveTab('explore'); }}>theatergram</h1>
        <div style={styles.userSwitcher}>
          <span style={{ fontSize: '12px', color: '#888' }}>تغییر کاربر برای تست:</span>
          <select 
            value={currentUser} 
            onChange={(e) => { setCurrentUser(e.target.value); setTargetUser(null); setActiveTab('explore'); }}
            style={styles.select}
          >
            <option value="mehdisoheilinia">mehdisoheilinia (ادمین)</option>
            <option value="user1">user1 (کاربر عادی)</option>
            <option value="user2">user2 (کاربر عادی)</option>
          </select>
        </div>
      </header>

      {/* محتوای اصلی برنامه بر اساس تب فعال */}
      <main style={styles.mainContent}>
        {targetUser ? (
          /* نمای پروفایل کاربری که رویش کلیک کرده‌ایم */
          <ProfileSection 
            user={dbUsers[targetUser]} 
            currentUser={currentUser} 
            posts={posts.filter(p => p.username === targetUser && p.status === 'approved')}
            onFollowToggle={handleToggleFollow}
            onBack={() => setTargetUser(null)}
          />
        ) : (
          <>
            {activeTab === 'explore' && (
              <div style={styles.feedContainer}>
                <h2 style={styles.sectionTitle}>🧭 اکسپلور اتودها و بداهه‌پردازی‌ها</h2>
                {approvedPosts.length === 0 ? (
                  <p style={styles.emptyText}>هیچ اتودی هنوز منتشر نشده است.</p>
                ) : (
                  approvedPosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      currentUser={currentUser} 
                      onLike={handleToggleLike} 
                      onUserClick={(uname) => setTargetUser(uname)}
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
                />
                
                {/* فرم ارسال اتود جدید در صفحه شخصی */}
                <form onSubmit={handleCreatePost} style={styles.postForm}>
                  <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>🎬 ثبت اتود یا تمرین جدید</h3>
                  <input 
                    type="text" 
                    placeholder="عنوان اتود یا صحنه..." 
                    value={postTitle} 
                    onChange={(e) => setPostTitle(e.target.value)} 
                    style={styles.input}
                  />
                  <select 
                    value={postCategory} 
                    onChange={(e) => setPostCategory(e.target.value)} 
                    style={styles.input}
                  >
                    <option value="educational">آموزشی</option>
                    <option value="rehearsal">تمرین صحنه</option>
                    <option value="improvisation">بداهه‌پردازی</option>
                    <option value="etude">اتود کلاسی</option>
                  </select>
                  <button type="submit" style={styles.submitBtn}>ارسال به پلتفرم</button>
                </form>
              </div>
            )}

            {activeTab === 'adminPanel' && isAdmin && (
              <div style={styles.feedContainer}>
                <h2 style={styles.sectionTitle}>📥 صندوق بررسی و تایید ادمین ({pendingPosts.length})</h2>
                {pendingPosts.length === 0 ? (
                  <p style={styles.emptyText}>هیچ پستی در صف تایید وجود ندارد.</p>
                ) : (
                  pendingPosts.map(post => (
                    <div key={post.id} style={styles.adminCard}>
                      <div>
                        <span style={{ color: '#ff3b30', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setTargetUser(post.username)}>@{post.username}</span>
                        <h4 style={{ margin: '5px 0', color: '#fff' }}>{post.title}</h4>
                        <span style={styles.categoryBadge}>
                          {post.category === 'improvisation' ? 'بداهه‌پردازی' : post.category === 'educational' ? 'آموزشی' : post.category === 'rehearsal' ? 'تمرین صحنه' : 'اتود کلاسی'}
                        </span>
                      </div>
                      <button onClick={() => handleApprovePost(post.id)} style={styles.approveBtn}>تایید و انتشار عمومی</button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* نوار ناوبری پایینی و فیکس شده */}
      <nav style={styles.bottomNav}>
        <button 
          onClick={() => { setTargetUser(null); setActiveTab('explore'); }} 
          style={{...styles.navBtn, color: activeTab === 'explore' && !targetUser ? '#fff' : '#666'}}
        >
          🧭 اکسپلور
        </button>
        <button 
          onClick={() => { setTargetUser(null); setActiveTab('profile'); }} 
          style={{...styles.navBtn, color: activeTab === 'profile' && !targetUser ? '#fff' : '#666'}}
        >
          👤 صفحه شخصی
        </button>
        
        {/* ادمین بودن در اینجا چک می‌شود؛ اگر ادمین نباشد اصلاً دکمه رندر نمی‌شود */}
        {isAdmin && (
          <button 
            onClick={() => { setTargetUser(null); setActiveTab('adminPanel'); }} 
            style={{...styles.navBtn, color: activeTab === 'adminPanel' && !targetUser ? '#00ffcc' : '#666'}}
          >
            ⚙️ پنل مدیریت
          </button>
        )}
      </nav>
    </div>
  );
}

// ==========================================
// ۳. کامپوننت فرعی کارت پست (PostCard)
// ==========================================
function PostCard({ post, currentUser, onLike, onUserClick }: { post: any, currentUser: string, onLike: Function, onUserClick: Function }) {
  const isLikedByMe = post.likes.includes(currentUser);

  return (
    <div style={styles.postCard}>
      <div style={styles.cardHeader}>
        <span onClick={() => onUserClick(post.username)} style={styles.cardUsername}>
          @{post.username}
        </span>
        <span style={styles.cardBadge}>
          {post.category === 'improvisation' ? 'بداهه‌پردازی' : post.category === 'educational' ? 'آموزشی' : post.category === 'rehearsal' ? 'تمرین صحنه' : 'اتود کلاسی'}
        </span>
      </div>
      <div style={styles.mediaPlaceholder}>
        <span style={{ color: '#555', fontSize: '13px' }}>🎬 ویدیو اتود تئاتر (پلیر بومی پروژه)</span>
      </div>
      <p style={styles.cardTitle}>{post.title}</p>
      <div style={styles.cardActions}>
        <button 
          onClick={() => onLike(post.id)} 
          style={{...styles.likeBtn, background: isLikedByMe ? '#ff3b30' : '#262626'}}
        >
          {isLikedByMe ? '❤️ لایک شده' : '🤍 لایک'}
        </button>
        <span style={styles.likeCount}>{post.likes.length} نفر لایک کرده‌اند</span>
      </div>
    </div>
  );
}

// ==========================================
// ۴. کامپوننت فرعی پروفایل کاربری (ProfileSection)
// ==========================================
function ProfileSection({ user, currentUser, posts, onFollowToggle, onBack, isOwn = false }: { user: any, currentUser: string, posts: any[], onFollowToggle: Function, onBack?: any, isOwn?: boolean }) {
  if (!user) return null;
  const isFollowing = user.followers.includes(currentUser);

  return (
    <div style={styles.profileCard}>
      {onBack && <button onClick={onBack} style={styles.backBtn}>← بازگشت به اکسپلور</button>}
      <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{user.name}</h2>
      <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 15px 0' }}>@{user.username}</p>
      <p style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.9 }}>{user.bio}</p>

      {/* آمار دنبال‌کنندگان و دکمه فالو تثبیت‌شده در کنار آن */}
      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <span style={styles.statNum}>{user.followers.length}</span>
          <span style={styles.statLabel}>دنبال‌کننده</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statNum}>{user.following.length}</span>
          <span style={styles.statLabel}>دنبال‌شونده</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statNum}>{posts.length}</span>
          <span style={styles.statLabel}>اتودها</span>
        </div>

        {/* دکمه دنبال کردن فیکس شده در کنار بخش آمار */}
        {!isOwn && (
          <button 
            onClick={() => onFollowToggle(user.username)} 
            style={{...styles.followBtn, background: isFollowing ? '#3a3a3c' : '#007aff'}}
          >
            {isFollowing ? '✓ دنبال می‌کنید' : 'دنبال کردن'}
          </button>
        )}
      </div>

      <div style={{ marginTop: '25px', borderTop: '1px solid #222', paddingTop: '15px' }}>
        <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '15px', textAlign: 'right' }}>🎬 آرشیو ویدیوها و اتودها</h3>
        <div style={styles.grid}>
          {posts.map(p => (
            <div key={p.id} style={styles.gridItem}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{p.title}</span>
              <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
                {p.category === 'improvisation' ? 'بداهه‌پردازی' : 'اتود'}
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p style={{ gridColumn: '1/-1', color: '#444', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>هیچ پست عمومی تایید شده‌ای وجود ندارد.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ۵. استایل‌های مدرن و شیک مچ با Dark Mode
// ==========================================
const styles: Record<string, React.CSSProperties> = {
  splashContainer: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', backgroundColor: '#000', direction: 'ltr'
  },
  splashText: {
    fontSize: '2.5rem', fontWeight: 'bold', color: '#fff',
    letterSpacing: '5px'
  },
  appContainer: {
    backgroundColor: '#000', color: '#fff', minHeight: '100vh',
    paddingBottom: '80px', fontFamily: 'system-ui, sans-serif', direction: 'rtl'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '15px 20px', borderBottom: '1px solid #1c1c1e', backgroundColor: '#000'
  },
  logo: { fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.5px', cursor: 'pointer' },
  userSwitcher: { display: 'flex', alignItems: 'center', gap: '8px' },
  select: { background: '#1c1c1e', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '12px', outline: 'none' },
  mainContent: { maxWidth: '480px', margin: '0 auto', padding: '15px' },
  bottomNav: {
    position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px',
    backgroundColor: '#0a0a0a', borderTop: '1px solid #1c1c1e',
    display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100
  },
  navBtn: { background: 'none', border: 'none', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', outline: 'none' },
  feedContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#fff' },
  emptyText: { color: '#444', textAlign: 'center', padding: '40px 0', fontSize: '14px' },
  postCard: { background: '#121212', borderRadius: '12px', border: '1px solid #1c1c1e', padding: '15px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  cardUsername: { fontWeight: 'bold', fontSize: '14px', color: '#00ffcc', cursor: 'pointer' },
  cardBadge: { background: '#1c1c1e', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#888' },
  mediaPlaceholder: { background: '#000', height: '240px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #1c1c1e' },
  cardTitle: { fontSize: '14px', margin: '12px 0', lineHeight: '1.5', textAlign: 'right' },
  cardActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  likeBtn: { border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  likeCount: { fontSize: '12px', color: '#666' },
  profileCard: { background: '#121212', borderRadius: '14px', padding: '20px', border: '1px solid #1c1c1e' },
  backBtn: { background: 'none', border: 'none', color: '#007aff', fontSize: '13px', cursor: 'pointer', marginBottom: '15px', display: 'block' },
  statsContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1c1c1e', padding: '12px', borderRadius: '10px', gap: '10px' },
  statBox: { textAlign: 'center', flex: 1 },
  statNum: { display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: '11px', color: '#666', marginTop: '2px' },
  followBtn: { border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' },
  postForm: { background: '#121212', borderRadius: '12px', padding: '15px', border: '1px solid #1c1c1e', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { background: '#1c1c1e', border: 'none', padding: '12px', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' },
  submitBtn: { background: '#fff', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  adminCard: { background: '#1c1c1e', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #2c2c2e' },
  categoryBadge: { fontSize: '11px', background: '#2c2c2e', padding: '2px 6px', borderRadius: '4px', color: '#aaa' },
  approveBtn: { background: '#34c759', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '10px' },
  gridItem: { background: '#1c1c1e', aspectRatio: '1', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '5px', border: '1px solid #2c2c2e', textAlign: 'center' }
};
