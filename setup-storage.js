const { createClient } = require('@supabase/supabase-client');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const supabaseAnonKey = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('Error: API keys not found.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setup() {
  // ۱. اضافه کردن ستون ویدیو به جدول پست‌ها
  await supabase.rpc('alter_table', { sql: 'ALTER TABLE theater_posts ADD COLUMN IF NOT EXISTS video_url TEXT;' }).catch(() => {});
  
  // ۲. ساخت باکت ذخیره‌سازی فیلم‌ها
  const { error } = await supabase.storage.createBucket('theater_media', { public: true });
  if (error && error.message !== 'Bucket already exists') {
    console.log('خطا در ساخت مخزن فایل:', error.message);
  } else {
    console.log('مخزن ویدیوها (Storage Bucket) با موفقیت متصل و عمومی شد! ✓');
  }
}
setup();
