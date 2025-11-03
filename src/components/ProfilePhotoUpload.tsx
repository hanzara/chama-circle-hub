import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Upload, X, User } from 'lucide-react';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import defaultAvatar from '@/assets/default-avatar.jpg';

const ProfilePhotoUpload = () => {
  const { profilePhoto, uploadProfilePhoto, removeProfilePhoto, isLoading } = useProfilePhoto();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadProfilePhoto(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async () => {
    const success = await removeProfilePhoto();
    if (success) {
      setPreviewUrl(null);
    }
  };

  const currentPhotoUrl = previewUrl || profilePhoto?.photo_url || defaultAvatar;

  return (
    <div className="space-y-2">
      <Label className="text-foreground">Profile Photo</Label>
      <Card className="border-2 border-dashed border-border">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={currentPhotoUrl} alt="Profile photo" />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    {currentPhotoUrl ? 'Change Photo' : 'Add Photo'}
                  </>
                )}
              </Button>

              {currentPhotoUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePhoto}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              JPG, PNG or WebP. Max size 5MB.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePhotoUpload;