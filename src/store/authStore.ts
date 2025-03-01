import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { UserRole } from '../types/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  roles: UserRole[];
  territory_id: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, roles: UserRole[]) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  addRole: (role: UserRole) => Promise<void>;
  removeRole: (role: UserRole) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Provide a more user-friendly error message
        if (error.message === 'Invalid login credentials') {
          throw new Error('Incorrect email or password. Please try again.');
        }
        throw error;
      }

      // Fetch user profile
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          // If profile doesn't exist yet, create it
          if (profileError.code === 'PGRST116') {
            // Wait a moment for the trigger to create the profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try fetching again
            const { data: retryProfileData, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (retryError) throw retryError;
            
            set({ 
              user: data.user, 
              profile: retryProfileData as Profile,
              isLoading: false 
            });
            return;
          }
          
          throw profileError;
        }
        
        set({ 
          user: data.user, 
          profile: profileData as Profile,
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during sign in', 
        isLoading: false 
      });
    }
  },

  signUp: async (email, password, fullName, roles) => {
    try {
      set({ isLoading: true, error: null });
      
      // Ensure tourist role is always included
      if (!roles.includes('tourist')) {
        roles.push('tourist');
      }
      
      // Sign up with user metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            roles: roles
          }
        }
      });

      if (error) {
        // Provide more user-friendly error messages
        if (error.message.includes('already registered')) {
          throw new Error('This email is already registered. Please use a different email or try logging in.');
        }
        throw error;
      }

      if (data.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch the created profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.warn('Profile not found immediately after signup, this is expected');
          // Create a temporary profile object for the UI
          set({ 
            user: data.user,
            profile: {
              id: data.user.id,
              email,
              full_name: fullName,
              roles,
              territory_id: null,
              avatar_url: null,
              bio: null
            },
            isLoading: false 
          });
        } else {
          set({ 
            user: data.user,
            profile: profileData as Profile,
            isLoading: false 
          });
        }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during sign up', 
        isLoading: false 
      });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, profile: null, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during sign out', 
        isLoading: false 
      });
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          // If profile doesn't exist yet, create it
          if (profileError.code === 'PGRST116') {
            // Wait a moment and try again
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try fetching again
            const { data: retryProfileData, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (retryError) throw retryError;
            
            set({ 
              user: session.user, 
              profile: retryProfileData as Profile,
              isLoading: false 
            });
            return;
          }
          
          throw profileError;
        }
        
        set({ 
          user: session.user, 
          profile: profileData as Profile,
          isLoading: false 
        });
      } else {
        set({ user: null, profile: null, isLoading: false });
      }
    } catch (error) {
      set({ 
        user: null,
        profile: null,
        error: error instanceof Error ? error.message : 'An error occurred loading user', 
        isLoading: false 
      });
    }
  },

  updateProfile: async (updates) => {
    try {
      const { user, profile } = get();
      if (!user || !profile) throw new Error('You must be logged in to update your profile');

      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      set({ 
        profile: { ...profile, ...updates },
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred updating profile', 
        isLoading: false 
      });
    }
  },

  updateAvatar: async (avatarUrl) => {
    try {
      const { user, profile } = get();
      if (!user || !profile) throw new Error('You must be logged in to update your avatar');

      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      set({ 
        profile: { ...profile, avatar_url: avatarUrl },
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred updating avatar', 
        isLoading: false 
      });
    }
  },

  addRole: async (role) => {
    try {
      const { user, profile } = get();
      if (!user || !profile) throw new Error('You must be logged in to update roles');

      set({ isLoading: true, error: null });

      // Check if role already exists
      if (profile.roles.includes(role)) {
        set({ isLoading: false });
        return;
      }

      // Add the new role
      const updatedRoles = [...profile.roles, role];

      const { error } = await supabase
        .from('profiles')
        .update({ roles: updatedRoles })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      set({ 
        profile: { ...profile, roles: updatedRoles },
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred adding role', 
        isLoading: false 
      });
    }
  },

  removeRole: async (role) => {
    try {
      const { user, profile } = get();
      if (!user || !profile) throw new Error('You must be logged in to update roles');

      set({ isLoading: true, error: null });

      // Don't allow removing the tourist role
      if (role === 'tourist') {
        set({ 
          error: 'Cannot remove the tourist role as it is required',
          isLoading: false 
        });
        return;
      }

      // Check if role exists
      if (!profile.roles.includes(role)) {
        set({ isLoading: false });
        return;
      }

      // Remove the role
      const updatedRoles = profile.roles.filter(r => r !== role);

      const { error } = await supabase
        .from('profiles')
        .update({ roles: updatedRoles })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      set({ 
        profile: { ...profile, roles: updatedRoles },
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred removing role', 
        isLoading: false 
      });
    }
  },

  hasRole: (role) => {
    const { profile } = get();
    return profile ? profile.roles.includes(role) : false;
  }
}));