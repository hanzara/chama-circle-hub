import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import defaultAvatar from '@/assets/default-avatar.jpg';
import ThemeToggle from '@/components/ThemeToggle';
import PinSetupModal from '@/components/PinSetupModal';

const UserProfileSection = () => {
  const { user, signOut } = useAuth();
  const { profilePhoto } = useProfilePhoto();
  const [showPinSetup, setShowPinSetup] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage 
              src={profilePhoto?.photo_url || defaultAvatar} 
              alt="Profile" 
            />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full opacity-70 hover:opacity-100">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={profilePhoto?.photo_url || defaultAvatar} 
                alt="Profile" 
              />
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{displayName}</p>
              {user?.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowPinSetup(true)}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Setup PIN</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="icon">
        <Bell className="h-5 w-5" />
      </Button>
      
      <ThemeToggle />

      <PinSetupModal 
        isOpen={showPinSetup}
        onClose={() => setShowPinSetup(false)}
      />
    </div>
  );
};

export default UserProfileSection;