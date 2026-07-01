'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { EtudePost, UserProfile } from './constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useTheaterCore(currentUser: string) {
  const [posts, setPosts] = useState<EtudePost[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setPosts(data as EtudePost[]);
  }, []);

  const fetchProfiles = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) {
      const profileMap: Record<string, UserProfile> = {};
      data.forEach((p: any) => { profileMap[p.username] = p; });
      setProfiles(profileMap);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetchPosts();
    fetchProfiles();

    const postChannel = supabase
      .channel('theatergram-live-posts')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      .subscribe();

    const profileChannel = supabase
      .channel('theatergram-live-profiles')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'profiles' }, () => fetchProfiles())
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [currentUser, fetchPosts, fetchProfiles]);

  // تنظیم باکت‌ها بر اساس نام دقیق بزرگ در Supabase: MEDIA و AVATARS
  const uploadMediaAsset = async (file: File, bucket: 'MEDIA' | 'AVATARS' = 'MEDIA'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const cleanUsername = currentUser.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `${cleanUsername}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        console.error('Storage Engine Upload Error details:', uploadError);
        throw uploadError;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error('Storage Engine Fail:', err);
      return null;
    }
  };

  const createPost = async (title: string, description: string, category: string, mediaUrl: string): Promise<boolean> => {
    try {
      // ثبت پست با وضعیت اولیه در انتظار تایید (pending) به صورت پیش‌فرض و آنلاین
      const { error } = await supabase.from('posts').insert([
        {
          username: currentUser,
          title: title || 'اثر جدید',
          description: description || '',
          category: category,
          media_url: mediaUrl,
          status: 'pending', 
          likes: [],
          comments: [],
          created_at: new Date().toISOString()
        }
      ]);
      if (error) {
        console.error('Database Insertion Error details:', error);
        throw error;
      }
      await fetchPosts();
      return true;
    } catch (e) {
      console.error('Catch Error on CreatePost:', e);
      return false;
    }
  };

  const toggleLike = async (postId: string, currentLikes: string[]) => {
    let updatedLikes = [...(currentLikes || [])];
    if (updatedLikes.includes(currentUser)) {
      updatedLikes = updatedLikes.filter(u => u !== currentUser);
    } else {
      updatedLikes.push(currentUser);
    }
    await supabase.from('posts').update({ likes: updatedLikes }).eq('id', postId);
    await fetchPosts();
  };

  const appendComment = async (postId: string, currentComments: any[], commentText: string) => {
    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      username: currentUser,
      text: commentText,
      created_at: new Date().toISOString()
    };
    const updatedComments = [...(currentComments || []), newComment];
    await supabase.from('posts').update({ comments: updatedComments }).eq('id', postId);
    await fetchPosts();
  };

  const toggleFollow = async (targetUsername: string) => {
    const targetProfile = profiles[targetUsername];
    const myProfile = profiles[currentUser];
    if (!targetProfile || !myProfile) return;

    let targetFollowers = [...(targetProfile.followers || [])];
    let myFollowing = [...(myProfile.following || [])];

    if (targetFollowers.includes(currentUser)) {
      targetFollowers = targetFollowers.filter(u => u !== currentUser);
      myFollowing = myFollowing.filter(u => u !== targetUsername);
    } else {
      targetFollowers.push(currentUser);
      myFollowing.push(targetUsername);
    }

    await supabase.from('profiles').update({ followers: targetFollowers }).eq('username', targetUsername);
    await supabase.from('profiles').update({ following: myFollowing }).eq('username', currentUser);
    await fetchProfiles();
  };

  const syncProfileState = async (name: string, bio: string, avatarUrl: string): Promise<boolean> => {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        username: currentUser,
        name,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'username' });

    if (!error) {
      await fetchProfiles();
      return true;
    }
    return false;
  };

  const approvePost = async (postId: string) => {
    await supabase.from('posts').update({ status: 'approved' }).eq('id', postId);
    await fetchPosts();
  };

  const rejectPost = async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId);
    await fetchPosts();
  };

  return {
    posts,
    profiles,
    uploadMediaAsset,
    createPost,
    toggleLike,
    appendComment,
    toggleFollow,
    syncProfileState,
    approvePost,
    rejectPost
  };
}
