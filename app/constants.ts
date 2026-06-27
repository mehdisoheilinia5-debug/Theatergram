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

export interface UserProfile {
  username: string;
  name?: string;
  bio?: string;
  avatar_url?: string;
  followers?: string[];
  following?: string[];
  updated_at?: string;
}

export const CATEGORIES = [
  { id: 'improvisation', fa: 'بداهه‌پردازی', en: 'Improvisation' },
  { id: 'monologue', fa: 'مونولوگ', en: 'Monologue' },
  { id: 'dialogue', fa: 'دیالوگ', en: 'Dialogue' },
  { id: 'physical', fa: 'تئاتر فیزیکال', en: 'Physical Theatre' },
  { id: 'reading', fa: 'نمایشنامه‌خوانی', en: 'Play Reading' }
];

export const TRANSLATIONS = {
  fa: {
    explore: 'اکسپلور',
    profile: 'پروفایل',
    admin: 'مدیریت',
    about: 'درباره برنامه',
    noPosts: 'هنوز هیچ اتودی منتشر نشده است.',
    followers: 'دنبال‌کننده',
    following: 'دنبال‌شونده',
    etudesCount: 'پست‌ها',
    saveProfile: 'ویرایش پروفایل',
    displayName: 'نام نمایش داده شده',
    bio: 'بیوگرافی',
    uploadTitle: 'ایجاد پست جدید',
    titlePlaceholder: 'عنوان اتود...',
    descPlaceholder: 'توضیحات اتود...',
    uploadMedia: 'انتخاب فیلم یا عکس از گالری',
    submitPost: 'ارسال برای ادمین',
    pendingQueue: 'صف بررسی ادمین',
    approve: 'تایید و انتشار',
    reject: 'حذف',
    comments: 'نظرات',
    addComment: 'نوشتن نظر...',
    aboutText: 'تئاترگرام یک پلتفرم تخصصی و مدرن برای هنرمندان تئاتر و سینما است تا بتوانند اتودها، تمرین‌ها و اجراهای خود را به اشتراک بگذارند و با جامعه هنری در ارتباط باشند.',
    close: 'بستن',
    follow: 'دنبال کردن',
    unfollow: 'لغو دنبال کردن',
    searchPlaceholder: 'جستجوی نام کاربری...',
    enterBtn: 'ورود به پلتفرم'
  },
  en: {
    explore: 'Explore',
    profile: 'Profile',
    admin: 'Admin',
    about: 'About',
    noPosts: 'No posts published yet.',
    followers: 'Followers',
    following: 'Following',
    etudesCount: 'Posts',
    saveProfile: 'Edit Profile',
    displayName: 'Display Name',
    bio: 'Biography',
    uploadTitle: 'Create New Post',
    titlePlaceholder: 'Etude title...',
    descPlaceholder: 'Etude description...',
    uploadMedia: 'Choose video or photo from gallery',
    submitPost: 'Send to Admin',
    pendingQueue: 'Admin Review Queue',
    approve: 'Approve & Publish',
    reject: 'Reject',
    comments: 'Comments',
    addComment: 'Add a comment...',
    aboutText: 'TheaterGram is a premium, specialized platform for theater and cinema professionals to share their etudes, rehearsals, and performances with the artistic community.',
    close: 'Close',
    follow: 'Follow',
    unfollow: 'Unfollow',
    searchPlaceholder: 'Search username...',
    enterBtn: 'Enter Platform'
  }
};
