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
  { id: 'educational', fa: 'آموزشی', en: 'Educational' },
  { id: 'rehearsal', fa: 'تمرین', en: 'Rehearsal' },
  { id: 'improvisation', fa: 'بداهه‌پردازی', en: 'Improvisation' },
  { id: 'etude', fa: 'اتود', en: 'Etude' }
];

export const TRANSLATIONS = {
  fa: {
    explore: 'اکسپلور',
    profile: 'صفحه من',
    admin: 'مدیریت',
    about: 'درباره برنامه',
    noPosts: 'هنوز اثری در این بخش منتشر نشده است.',
    followers: 'دنبال‌کننده',
    following: 'دنبال‌شده',
    etudesCount: 'آثار ثبت شده',
    saveProfile: 'ویرایش پروفایل',
    displayName: 'نام نمایش داده شده',
    bio: 'توضیحات صحنه / بیوگرافی',
    uploadTitle: 'ثبت اثر جدید',
    titlePlaceholder: 'عنوان اثر...',
    descPlaceholder: 'توضیحات صحنه . . .',
    uploadMedia: '🎬 انتخاب فیلم (تا ۱ دقیقه) یا عکس',
    submitPost: 'ارسال جهت بررسی',
    pendingQueue: 'صف بررسی آثار دریافتی',
    approve: 'تایید و انتشار عمومی',
    reject: 'حذف اثر',
    comments: 'نظرات',
    addComment: 'نوشتن نظر...',
    aboutText: 'تئاترگرام یک پلتفرم تخصصی و مدرن، منحصراً برای جامعه تئاتر، بازیگران و طراحان صحنه است تا بتوانند ایده‌ها، اجراها و بداهه‌پردازی‌های خود را به اشتراک بگذارند.',
    close: 'بستن',
    follow: 'دنبال کردن',
    unfollow: 'لغو دنبال کردن',
    searchPlaceholder: 'جستجوی هنرمندان...',
    enterBtn: 'ورود به پلتفرم',
    username: 'نام کاربری (حروف انگلیسی)',
    password: 'رمز عبور حساب کاربری',
    hamburgerMenu: 'منوی کاربری',
    changeLang: 'تغییر زبان (English)',
    changeTheme: 'تغییر پوسته (روز/شب)',
    gridTitle: '🎬 نمای شبکه‌ای اتودها'
  },
  en: {
    explore: 'Explore',
    profile: 'My Profile',
    admin: 'Admin',
    about: 'About App',
    noPosts: 'No works published yet.',
    followers: 'Followers',
    following: 'Following',
    etudesCount: 'Works',
    saveProfile: 'Edit Profile',
    displayName: 'Display Name',
    bio: 'Scene details / Bio',
    uploadTitle: 'Submit New Work',
    titlePlaceholder: 'Title...',
    descPlaceholder: 'Scene details . . .',
    uploadMedia: '🎬 Choose Video (up to 1 min) or Photo',
    submitPost: 'Send for Review',
    pendingQueue: 'Review Queue',
    approve: 'Approve & Publish',
    reject: 'Delete',
    comments: 'Comments',
    addComment: 'Add a comment...',
    aboutText: 'TheaterGram is a premium, specialized platform exclusively designed for the theater community to share rehearsals, ideas, and improvisations.',
    close: 'Close',
    follow: 'Follow',
    unfollow: 'Unfollow',
    searchPlaceholder: 'Search artists...',
    enterBtn: 'Enter Platform',
    username: 'Username',
    password: 'Password',
    hamburgerMenu: 'Menu',
    changeLang: 'Change Language (فارسی)',
    changeTheme: 'Toggle Theme',
    gridTitle: '🎬 Etudes Grid View'
  }
};
