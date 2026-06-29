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
    saveProfile: 'ذخیره مشخصات پروفایل',
    displayName: 'نام هنری نمایش',
    bio: 'توضیحات صحنه / بیوگرافی',
    uploadTitle: 'ثبت اثر جدید',
    titlePlaceholder: 'عنوان اثر یا ایده...',
    descPlaceholder: 'توضیحات صحنه . . .',
    uploadMedia: '🎬 انتخاب فیلم (تا ۱ دقیقه) یا عکس از گالری',
    submitPost: 'ارسال جهت بررسی ادمین',
    pendingQueue: 'میز ارزیابی پست‌های دریافتی',
    approve: 'تایید انتشار عمومی',
    reject: 'حذف و رد اثر',
    comments: 'نظرات',
    addComment: 'نوشتن نظر...',
    aboutText: 'تئاترگرام یک پلتفرم تخصصی و مدرن، منحصراً برای جامعه تئاتر، بازیگران و طراحان صحنه است تا بتوانند ایده‌ها، اجراها و بداهه‌پردازی‌های خود را به اشتراک بگذارند.',
    close: 'بستن',
    follow: 'دنبال کردن',
    unfollow: 'لغو دنبال کردن',
    searchPlaceholder: 'جستجوی نام کاربری هنرمندان...',
    enterBtn: 'ورود به پلتفرم تئاتر',
    username: 'نام کاربری (حروف انگلیسی)',
    password: 'رمز عبور حساب کاربری',
    logout: 'خروج از حساب کاربری',
    changeLang: 'تغییر زبان (English)',
    changeTheme: 'تغییر پوسته (روز/شب)',
    gridTitle: '🎬 نمای شبکه‌ای اتودها و ایده‌ها',
    changePassword: 'تغییر رمز عبور حساب کاربری',
    newPasswordPlaceholder: 'رمز عبور جدید خود را وارد کنید...',
    successAlert: 'تغییرات با موفقیت در سیستم آنلاین ذخیره شد.'
  },
  en: {
    explore: 'Explore',
    profile: 'My Profile',
    admin: 'Admin Console',
    about: 'About App',
    noPosts: 'No works published yet.',
    followers: 'Followers',
    following: 'Following',
    etudesCount: 'Works',
    saveProfile: 'Save Profile Settings',
    displayName: 'Artistic Name',
    bio: 'Scene details / Bio',
    uploadTitle: 'Submit New Work',
    titlePlaceholder: 'Title...',
    descPlaceholder: 'Scene details . . .',
    uploadMedia: '🎬 Choose Video (up to 1 min) or Photo',
    submitPost: 'Send for Admin Review',
    pendingQueue: 'Admin Evaluation Queue',
    approve: 'Approve & Publish',
    reject: 'Delete/Reject',
    comments: 'Comments',
    addComment: 'Add a comment...',
    aboutText: 'TheaterGram is a premium, specialized platform exclusively designed for the theater community to share rehearsals, ideas, and improvisations.',
    close: 'Close',
    follow: 'Follow',
    unfollow: 'Unfollow',
    searchPlaceholder: 'Search artists...',
    enterBtn: 'Enter Theater World',
    username: 'Username',
    password: 'Password',
    logout: 'Logout From Account',
    changeLang: 'Change Language (فارسی)',
    changeTheme: 'Toggle Theme',
    gridTitle: '🎬 Etudes Grid View',
    changePassword: 'Change Account Password',
    newPasswordPlaceholder: 'Enter new password...',
    successAlert: 'Changes successfully saved online.'
  }
};
