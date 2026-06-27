import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { EtudePost, ProfileData } from './constants';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function useTheaterCore(currentUser: string) {
  const [posts, setPosts] = useState<EtudePost[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();

    // Real-time synchronization stream channels
    const postChannel = supabase
      .channel('theatergram-posts-live')
      .on('postgres_changes', { event: '*', scheme: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    const profileChannel = supabase
      .channel('theatergram-profiles-live')
      .on('postgres_changes', { event: '*', scheme: 'public', table: 'profiles' }, () => {
        fetchProfiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(profileChannel);
    };
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchPosts(), fetchProfiles()]);
    setLoading(false);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPosts(data as EtudePost[]);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) {
      const profileMap: Record<string, ProfileData> = {};
      data.forEach((p: any) => {
        profileMap[p.username] = p;
      });
      setProfiles(profileMap);
    }
  };

  const syncProfileState = async (name: string, bio: string, avatarUrl: string) => {
    const { error } = await supabase
      .from('profiles')
      .upsert({ username: currentUser, name, bio, avatar_url: avatarUrl });
    return !error;
  };

  const uploadMediaAsset = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser}-${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('theatergram-media')
      .upload(fileName, file);

    if (error) return null;

    const { data } = supabase.storage
      .from('theatergram-media')
      .getPublicUrl(fileName);

    return data?.publicUrl || null;
  };

  const createPost = async (title: string, description: string, category: string, mediaUrl: string) => {
    const isMasterAdmin = currentUser === 'mehdisoheilinia';
    const currentArtist = profiles[currentUser];

    const { error } = await supabase.from('posts').insert({
      username: currentUser,
      artist_name: currentArtist?.name || currentUser,
      title,
      description,
      category,
      media_url: mediaUrl,
      status: isMasterAdmin ? 'approved' : 'pending',
      likes: [],
      comments: []
    });

    return !error;
  };

  const toggleLike = async (postId: string, currentLikes: string[]) => {
    const hasLiked = currentLikes.includes(currentUser);
    const updatedLikes = hasLiked 
      ? currentLikes.filter(u => u !== currentUser)
      : [...currentLikes, currentUser];

    await supabase
      .from('posts')
      .update({ likes: updatedLikes })
      .eq('id', postId);
  };

  const appendComment = async (postId: string, currentComments: any[], text: string) => {
    const newComment = {
      id: crypto.randomUUID(),
      username: currentUser,
      text,
      created_at: new Date().toISOString()
    };
    
    await supabase
      .from('posts')
      .update({ comments: [...currentComments, newComment] })
      .eq('id', postId);
  };

  const approvePost = async (postId: string) => {
    await supabase.from('posts').update({ status: 'approved' }).eq('id', postId);
  };

  const rejectPost = async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId);
  };

  const toggleFollow = async (targetUsername: string) => {
    const targetUser = profiles[targetUsername];
    const selfUser = profiles[currentUser];
    if (!targetUser || !selfUser) return;

    const isFollowing = selfUser.following.includes(targetUsername);

    const updatedFollowing = isFollowing
      ? selfUser.following.filter(u => u !== targetUsername)
      : [...selfUser.following, targetUsername];

    const updatedFollowers = isFollowing
      ? targetUser.followers.filter(u => u !== currentUser)
      : [...targetUser.followers, currentUser];

    await Promise.all([
      supabase.from('profiles').update({ following: updatedFollowing }).eq('username', currentUser),
      supabase.from('profiles').update({ followers: updatedFollowers }).eq('username', targetUsername)
    ]);
  };

  return {
    posts,
    profiles,
    loading,
    syncProfileState,
    uploadMediaAsset,
    createPost,
    toggleLike,
    appendComment,
    approvePost,
    rejectPost,
    toggleFollow
  };
}
