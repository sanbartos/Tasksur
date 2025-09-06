// lib/uploadFile.ts
import { supabase } from '@/lib/supabaseClient';

export const uploadFile = async (file: File, userId: string) => {
  const filePath = `${userId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from('user-uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      metadata: { owner: userId },
    });

  if (error) throw error;
  return data;
};




