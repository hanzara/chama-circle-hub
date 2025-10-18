import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProfilePhoto {
  id: string;
  user_id: string;
  photo_url: string;
  created_at: string;
}

export const useProfilePhoto = () => {
  const [profilePhoto, setProfilePhoto] = useState<ProfilePhoto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfilePhoto = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profile_photos')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile photo:', error);
        return;
      }

      setProfilePhoto(data);
    } catch (error: any) {
      console.error('Error fetching profile photo:', error);
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload a photo",
        variant: "destructive",
      });
      return false;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a valid image file (JPG, PNG, or WebP)",
        variant: "destructive",
      });
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Upload to Supabase storage
      const fileName = `${user.id}_${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const photoUrl = urlData.publicUrl;

      // Save to database
      const { data, error } = await supabase
        .from('user_profile_photos')
        .upsert({
          user_id: user.id,
          photo_url: photoUrl
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      setProfilePhoto(data);
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeProfilePhoto = async () => {
    if (!user || !profilePhoto) return false;

    setIsLoading(true);
    try {
      // Delete from database
      const { error } = await supabase
        .from('user_profile_photos')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Delete from storage
      const fileName = profilePhoto.photo_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('profile-photos')
          .remove([fileName]);
      }

      setProfilePhoto(null);
      toast({
        title: "Success",
        description: "Profile photo removed successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error removing photo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove photo",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfilePhoto();
    }
  }, [user]);

  return {
    profilePhoto,
    isLoading,
    uploadProfilePhoto,
    removeProfilePhoto,
    refetchPhoto: fetchProfilePhoto
  };
};