export interface EtudePost {
  id: string;
  created_at: string;
  username: string;
  artist_name: string;
  title: string;
  description: string;
  category: string;
  media_url: string;
  status: 'pending' | 'approved';
  likes: string[]; // Array of usernames
  comments: Array<{
    id: string;
    username: string;
    text: string;
    created_at: string;
  }>;
}

export interface ProfileData {
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  followers: string[];
  following: string[];
}

export const CATEGORIES = [
  { id: 'improvisation', en: 'Improvisation', fa: 'بداهه‌پردازی' },
  { id: 'monologue', en: 'Monologue', fa: 'مونولوگ' },
  { id: 'scene_rehearsal', en: 'Scene Rehearsal', fa: 'تمرین صحنه' },
  { id: 'class_etude', en: 'Class Etude', fa: 'اتود کلاسی' },
];

export const TRANSLATIONS = {
  fa: {
    explore: '🧭 اکسپلور اتودها',
    profile: '👤 پروفایل هنرمند',
    admin: '⚙️ پنل داوری',
    uploadTitle: '🎬 ثبت اتود یا بداهه‌پردازی جدید',
    titlePlaceholder: 'عنوان اتود یا صحنه...',
    descPlaceholder: 'توضیحات و اتمسفر صحنه...',
    submitPost: 'ارسال جهت بررسی و تایید',
    pendingQueue: 'صندوق بررسی و تایید استاد (ادمین)',
    noPosts: 'هیچ اثری در این بخش یافت نشد.',
    like: 'لایک',
    approve: 'تایید و انتشار عمومی',
    reject: 'حذف اتود',
    followers: 'دنبال‌کننده',
    following: 'دنبال‌شونده',
    etudesCount: 'اتودها',
    saveProfile: 'ذخیره تغییرات مشخصات کاربری',
    displayName: 'نام هنری',
    bio: 'بیوگرافی کوتاه حرفه‌ای',
    uploadMedia: 'بارگذاری فایل ویدیو (حداکثر ۱ دقیقه)',
    comments: 'دیدگاه‌های هنرمندان',
    addComment: 'ثبت نظر تخصصی...',
  },
  en: {
    explore: '🧭 Explore Etudes',
    profile: '👤 Artist Profile',
    admin: '⚙️ Jury Panel',
    uploadTitle: '🎬 Upload New Etude / Improvisation',
    titlePlaceholder: 'Etude title or scene name...',
    descPlaceholder: 'Scene description and atmosphere...',
    submitPost: 'Submit for Moderation',
    pendingQueue: 'Jury Review Queue (Admin)',
    noPosts: 'No artwork found in this section.',
    like: 'Like',
    approve: 'Approve & Publish',
    reject: 'Reject Etude',
    followers: 'Followers',
    following: 'Following',
    etudesCount: 'Etudes',
    saveProfile: 'Save Profile Changes',
    displayName: 'Stage Name',
    bio: 'Short Professional Bio',
    uploadMedia: 'Upload Video File (Max 1 Min)',
    comments: 'Artists Feedback',
    addComment: 'Write a professional comment...',
  }
};
