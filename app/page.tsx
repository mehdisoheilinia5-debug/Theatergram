'use client';

import React, { useState, useEffect } from 'react';
import { useTheaterCore } from './useTheaterCore';
import { CATEGORIES, TRANSLATIONS, EtudePost } from './constants';

export default function Page() {
  const [currentUser, setCurrentUser] = useState<string | null>('mehdisoheilinia');
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'profile' | 'explore' | 'admin'>('profile');
  const [selectedCategory, setSelectedCategory] = useState<string>('تمرین');
  const [targetUser, setTargetUser] = useState<string | null>(null);

  // وضعیت باز و بسته شدن صفحه ویرایش پروفایل
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // وضعیت‌های مربوط به ثبت پست جدید
  const [postDesc, setPostDesc] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // وضعیت‌های مربوط به ویرایش پروفایل
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // متصل شدن به کدهای اصلی دیتابیس شما
  const core = useTheaterCore(currentUser || '');

  const isDark = theme === 'dark';
  const isFa = lang === 'fa';

  const colors = {
    bg: '#000000',
    card: '#121214',
    text: '#ffffff',
    border: '#222226',
    input: '#1a1a1e',
    meta: '#8e8e93',
  };

  // مقداردهی اولیه فرم ویرایش پروفایل از روی دیتابیس
  useEffect(() => {
    if (currentUser && core.profiles[currentUser]) {
      const p = core.profiles[currentUser];
      setEditName(p.name || '');
      setEditBio(p.bio || '');
      setAvatarPreview(p.avatar_url || '');
    }
  }, [currentUser, core.profiles]);

  // ۱. تابع ارسال پست (رفع باگ دیتابیس و آپلود فیلم/عکس)
  const handlePostCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) {
      alert('لطفاً ابتدا یک فایل ویدیو یا عکس انتخاب کنید.');
      return;
    }

    setUploading(true);
    try {
      // آپلود در باکت MEDIA سوپابیس
      const url = await core.uploadMediaAsset(mediaFile, 'media');
      if (url) {
        // ثبت در جدول دیتابیس
        const success = await core.createPost('اثر جدید', postDesc, selectedCategory, url);
        if (success) {
          setPostDesc('');
          setMediaFile(null);
          alert('اثر با موفقیت بارگذاری شد و به میز ارزیابی منتقل گردید.');
        } else {
          alert('خطا در ثبت پست در پایگاه داده. تنظیمات RLS جدول posts را بررسی کنید.');
        }
      } else {
        alert('خطا در آپلود فایل به سرور. تنظیمات باکت MEDIA در استوریج را بررسی کنید.');
      }
    } catch (err) {
      console.error(err);
      alert('یک خطای غیرمنتظره رخ داد.');
    } finally {
      setUploading(false);
    }
  };

  // ۲. تابع ویرایش اطلاعات پروفایل و آپلود آواتار جدید
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      let finalAvatarUrl = core.profiles[currentUser || '']?.avatar_url || '';

      // اگر کاربر عکس جدید انتخاب کرده بود، اول آپلود بشه
      if (avatarFile) {
        const uploadedUrl = await core.uploadMediaAsset(avatarFile, 'avatars');
        if (uploadedUrl) finalAvatarUrl = uploadedUrl;
      }

      // بروزرسانی مشخصات در دیتابیس
      const success = await core.syncProfileState(editName, editBio, finalAvatarUrl);
      if (success) {
        setIsEditProfileOpen(false);
        setAvatarFile(null);
        alert('پروفایل با موفقیت به‌روزرسانی شد.');
      } else {
        alert('خطا در ذخیره اطلاعات پروفایل در دیتابیس.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const activeProfileUsername = targetUser || currentUser;
  const activeProfileData = core.profiles[activeProfileUsername || ''];

  return (
    <div style={{ background: colors.bg, color: colors.text, minHeight: '100vh', direction: 'rtl', paddingBottom: '90px', boxSizing: 'border-box' }}>
      
      {/* هدر */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: colors.card, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', height: '54px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: colors.input, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: activeProfileData?.avatar_url ? `url(${activeProfileData.avatar_url})` : 'none' }} />
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>@{activeProfileUsername}</span>
        </div>
        <span style={{ fontSize: '16px', fontTriangle: 'bold', fontWeight: 'bold' }}>تئاترگرام</span>
        <button style={{ background: 'none', border: 'none', color: colors.text, fontSize: '18px' }}>☰</button>
      </header>

      <main style={{ maxWidth: '460px', margin: '0 auto', padding: '12px', boxSizing: 'border-box' }}>
        
        {/* کارت پروفایل */}
        {activeTab === 'profile' && (
          <div>
            {activeProfileData && (
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '16px', borderRadius: '16px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{activeProfileData.name || activeProfileUsername}</h2>
                    <p style={{ fontSize: '13px', color: colors.meta, marginTop: '2px' }}>کارگردان و بازیگر تئاتر</p>
                  </div>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: `2px solid ${colors.border}`, background: colors.input, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: activeProfileData.avatar_url ? `url(${activeProfileData.avatar_url})` : 'none' }} />
                </div>
                {activeProfileData.bio && <p style={{ fontSize: '13px', color: colors.meta, marginBottom: '12px' }}>{activeProfileData.bio}</p>}
                
                {/* دکمه ویرایش اطلاعات که صفحه جدید رو باز می‌کنه */}
                <button 
                  onClick={() => setIsEditProfileOpen(true)} 
                  style={{ width: '100%', padding: '12px', background: '#1c1c24', border: `1px solid ${colors.border}`, color: '#fff', borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                >
                  ویرایش پروفایل
                </button>
              </div>
            )}

            {/* دسته‌بندی‌ها */}
            <div style={{ display: 'flex', gap: '4px', background: colors.card, padding: '4px', borderRadius: '10px', border: `1px solid ${colors.border}`, marginBottom: '15px' }}>
              {['آموزشی', 'تمرین', 'بداهه‌پردازی', 'اتود'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setSelectedCategory(tab)} 
                  style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', background: selectedCategory === tab ? '#fff' : 'transparent', color: selectedCategory === tab ? '#000' : colors.meta, fontWeight: selectedCategory === tab ? 'bold' : 'normal' }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* فرم ثبت پست */}
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '16px', borderRadius: '16px' }}>
              <form onSubmit={handlePostCreation} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ border: `2px dashed ${colors.border}`, padding: '30px 12px', borderRadius: '12px', textAlign: 'center', background: '#16161c', position: 'relative' }}>
                  <input type="file" accept="video/*,image/*" onChange={e => setMediaFile(e.target.files?.[0] || null)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  <span style={{ fontSize: '13px', color: colors.meta }}>{mediaFile ? `📄 ${mediaFile.name}` : '🎬 انتخاب فیلم یا عکس اثـر'}</span>
                </div>
                <textarea placeholder="توضیحات صحنه . . ." value={postDesc} onChange={e => setPostDesc(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#16161c', color: '#fff', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '13px', minHeight: '90px', resize: 'none', boxSizing: 'border-box' }} />
                <button type="submit" disabled={uploading} style={{ width: '100%', padding: '14px', background: '#fff', color: '#000', fontWeight: 'bold', borderRadius: '12px', border: 'none', fontSize: '13px', cursor: 'pointer' }}>
                  {uploading ? 'در حال ارسال به سرور...' : 'ارسال جهت بررسی'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* منوی ناوبری پایینی */}
      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '460px', background: colors.bg, borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-around', padding: '14px 0', zIndex: 90 }}>
        <button onClick={() => setActiveTab('explore')} style={{ background: 'none', border: 'none', color: activeTab === 'explore' ? '#fff' : colors.meta, fontSize: '13px', cursor: 'pointer' }}>🧭 اکسپلور</button>
        <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#fff' : colors.meta, fontSize: '13px', cursor: 'pointer' }}>👤 صفحه من</button>
      </nav>

      {/* ========================================== */}
      {/* صفحه اختصاصی ویرایش اطلاعات و آپلود عکس پروفایل */}
      {/* ========================================== */}
      {isEditProfileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropBlur: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '16px', boxSizing: 'border-box' }}>
          <form onSubmit={handleUpdateProfile} style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '24px', borderRadius: '20px', maxWidth: '380px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>ویرایش اطلاعات هنرمند</h3>
              <button type="button" onClick={() => setIsEditProfileOpen(false)} style={{ background: 'none', border: 'none', color: colors.meta, cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            
            {/* بخش کلیک روی آواتار و آپلود عکس جدید */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px 0' }}>
              <div style={{ width: '84px', height: '84px', borderRadius: '50%', border: `2px solid ${colors.border}`, background: '#16161c', position: 'relative', overflow: 'hidden', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none' }}>
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                  }
                }} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }} />
                <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px', textAlign: 'center', padding: '4px 0' }}>تغییر عکس</div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.meta, marginBottom: '6px' }}>نام و نام خانوادگی</label>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#16161c', color: '#fff', border: `1px solid ${colors.border}`, fontSize: '13px', boxSizing: 'border-box', outline: 'none' }} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.meta, marginBottom: '6px' }}>بیوگرافی / درباره هنرمند</label>
              <input type="text" value={editBio} onChange={e => setEditBio(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#16161c', color: '#fff', border: `1px solid ${colors.border}`, fontSize: '13px', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button type="submit" disabled={updatingProfile} style={{ flex: 1, padding: '14px', background: '#fff', color: '#000', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                {updatingProfile ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
              <button type="button" onClick={() => setIsEditProfileOpen(false)} style={{ flex: 1, padding: '14px', background: '#1c1c24', color: colors.meta, border: `1px solid ${colors.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>انصراف</button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
