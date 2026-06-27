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
  { id: 'scene_idea', fa: 'ایده صحنه و دکور', en: 'Scene Idea' },
  { id: 'performance', fa: 'عکس و فیلم اجرا', en: 'Performance' },
  { id: 'reading', fa: 'نمایشنامه‌خوانی', en: 'Play Reading' }
];

export const TRANSLATIONS = {
  fa: {
    explore: 'صحنه اکسپلور',
    profile: 'پروفایل هنرمند',
    admin: 'میز ارزیابی ادمین',
    about: 'درباره تئاترگرام',
    noPosts: 'هنوز اثری در این بخش ثبت نشده است.',
    followers: 'دنبال‌کننده',
    following: 'دنبال‌شونده',
    etudesCount: 'آثار صحنه‌ای',
    saveProfile: 'ویرایش مشخصات هنری',
    displayName: 'نام هنری',
    bio: 'بیوگرافی تئاتری / سوابق',
    uploadTitle: 'ثبت اثر هنری جدید',
    titlePlaceholder: 'عنوان اثر یا ایده...',
    descPlaceholder: 'توضیحات اجرا، رویکرد کارگردانی یا متن...',
    uploadMedia: 'بارگذاری فیلم اجرا یا تصویر صحنه از گالری',
    submitPost: 'ارسال جهت ارزیابی و تایید ادمین',
    pendingQueue: 'صف ارزیابی آثار تئاتری دریافتی',
    approve: 'تایید و انتشار عمومی',
    reject: 'عدم تایید و حذف',
    comments: 'گفتگوهای تئاتری',
    addComment: 'نوشتن دیدگاه هنری...',
    aboutText: 'تئاترگرام یک پلتفرم تخصصی و مدرن، منحصراً برای جامعه تئاتر، بازیگران، کارگردانان و طراحان صحنه است تا بتوانند ایده‌ها، اجراها و بداهه‌پردازی‌های خود را در فضایی حرفه‌ای به اشتراک بگذارند.',
    close: 'بستن',
    follow: 'دنبال کردن هنرمند',
    unfollow: 'لغو دنبال کردن',
    searchPlaceholder: 'جستجوی نام کاربری هنرمند...',
    enterBtn: 'ورود به دنیای تئاتر',
    username: 'نام کاربری (حروف انگلیسی)',
    password: 'رمز عبور امنیت حساب'
  },
  en: {
    explore: 'Explore Stage',
    profile: 'Artist Profile',
    admin: 'Admin Desk',
    about: 'About TheaterGram',
    noPosts: 'No theatrical works published yet.',
    followers: 'Followers',
    following: 'Following',
    etudesCount: 'Works',
    saveProfile: 'Edit Artistic Profile',
    displayName: 'Artistic Name',
    bio: 'Theatrical Bio / Background',
    uploadTitle: 'Submit New Theatrical Work',
    titlePlaceholder: 'Work or idea title...',
    descPlaceholder: 'Performance description, directorial approach...',
    uploadMedia: 'Upload performance video or scene image from gallery',
    submitPost: 'Send for Admin Review',
    pendingQueue: 'Theatrical Review Queue',
    approve: 'Approve & Publish',
    reject: 'Reject & Delete',
    comments: 'Discussions',
    addComment: 'Add an artistic comment...',
    aboutText: 'TheaterGram is a specialized, premium platform exclusively designed for the theater community, actors, directors, and stage designers to share their ideas, performances, and improvisations.',
    close: 'Close',
    follow: 'Follow Artist',
    unfollow: 'Unfollow',
    searchPlaceholder: 'Search artist username...',
    enterBtn: 'Enter Theater World',
    username: 'Username (English lower-case)',
    password: 'Account Password'
  }
};
