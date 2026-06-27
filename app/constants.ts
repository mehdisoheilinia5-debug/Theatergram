// تایپ مربوط به پست‌ها (اتودها)
export interface EtudePost {
  id: string;
  username: string;
  artist_name?: string;
  title: string;
  description: string;
  category: string;
  media_url: string;
  status: 'pending' | 'approved' | 'rejected';
  likes: string[];
  comments: any[];
  created_at: string;
}

// تایپ مربوط به پروفایل کاربران (که ارور داده بود)
export interface UserProfile {
  username: string;
  name?: string;
  bio?: string;
  avatar_url?: string;
  followers?: string[];
  following?: string[];
  updated_at?: string;
}

// دسته‌بندی‌های تئاتر و سینما
export const CATEGORIES = [
  { id: 'improvisation', fa: 'بداهه‌پردازی', en: 'Improvisation' },
  { id: 'monologue', fa: 'مونولوگ', en: 'Monologue' },
  { id: 'dialogue', fa: 'دیالوگ', en: 'Dialogue' },
  { id: 'physical', fa: 'تئاتر فیزیکال', en: 'Physical Theatre' },
  { id: 'reading', fa: 'نمایشنامه‌خوانی', en: 'Play Reading' }
];

// ترجمه‌های پلتفرم برای سیستم دو زبانه
export const TRANSLATIONS = {
  fa: {
    explore: 'اکسپلور',
    profile: 'پروفایل هنرمند',
    admin: 'میز مدیریت',
    noPosts: 'هنوز هیچ اتودی منتشر نشده است.',
    followers: 'دنبال‌کننده',
    following: 'دنبال‌شونده',
    etudesCount: 'اتودها',
    saveProfile: 'تنظیمات پروفایل کاربری',
    displayName: 'نام هنری',
    bio: 'بیوگرافی کوتاه',
    uploadTitle: 'ارسال اتود جدید به پلتفرم',
    titlePlaceholder: 'عنوان اتود یا تمرین...',
    descPlaceholder: 'توضیحات، رویکرد یا متن اجرا...',
    uploadMedia: 'فایل ویدیویی اتود خود را انتخاب کنید (فرمت MP4)',
    submitPost: 'ارسال جهت بررسی و تایید ادمین',
    pendingQueue: 'صف بررسی اتودهای دریافتی',
    approve: 'تایید و انتشار',
    reject: 'رد اتود',
    comments: 'نظرات هنرمندان',
    addComment: 'نوشتن دیدگاه...'
  },
  en: {
    explore: 'Explore Feed',
    profile: 'Artist Profile',
    admin: 'Admin Desk',
    noPosts: 'No etudes published yet.',
    followers: 'Followers',
    following: 'Following',
    etudesCount: 'Etudes',
    saveProfile: 'Profile Configurations',
    displayName: 'Artistic Name',
    bio: 'Short Biography',
    uploadTitle: 'Submit New Etude',
    titlePlaceholder: 'Etude title...',
    descPlaceholder: 'Description, approach, or text...',
    uploadMedia: 'Select your etude video asset (MP4 format)',
    submitPost: 'Submit for Admin Review',
    pendingQueue: 'Pending Review Queue',
    approve: 'Approve & Publish',
    reject: 'Reject Etude',
    comments: 'Artists Comments',
    addComment: 'Add a comment...'
  }
};
