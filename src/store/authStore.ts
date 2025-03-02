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
  addRole: (role: UserRole, userId?: string) => Promise<void>;
  removeRole: (role: UserRole, userId?: string) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  canManageUser: (userId: string) => boolean;
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
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }
          
          if (!profileData) {
            // If no profile found, create a default one
            console.log("No profile found, creating default profile");
            const defaultProfile: Profile = {
              id: data.user.id,
              email: data.user.email || '',
              full_name: data.user.user_metadata.full_name || 'User',
              roles: ['tourist'],
              territory_id: null,
              avatar_url: null,
              bio: null
            };
            
            // Try to create the profile
            try {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: defaultProfile.id,
                  email: defaultProfile.email,
                  full_name: defaultProfile.full_name,
                  roles: defaultProfile.roles
                });
                
              if (insertError) {
                console.warn("Could not create profile:", insertError);
              }
            } catch (insertErr) {
              console.warn("Error creating profile:", insertErr);
            }
            
            set({ 
              user: data.user, 
              profile: defaultProfile,
              isLoading: false 
            });
            return;
          }
          
          set({ 
            user: data.user, 
            profile: profileData as Profile,
            isLoading: false 
          });
        } catch (profileError) {
          console.error("Error fetching profile:", profileError);
          // Create a default profile if we can't fetch one
          const defaultProfile: Profile = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata.full_name || 'User',
            roles: ['tourist'],
            territory_id: null,
            avatar_url: null,
            bio: null
          };
          
          set({ 
            user: data.user, 
            profile: defaultProfile,
            isLoading: false 
          });
        }
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
        try {
          // Wait a moment for the trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Fetch the created profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }
          
          if (!profileData) {
            console.warn('Profile not found immediately after signup, creating a temporary one');
            // Create a temporary profile object for the UI
            const defaultProfile: Profile = {
              id: data.user.id,
              email,
              full_name: fullName,
              roles,
              territory_id: null,
              avatar_url: null,
              bio: null
            };
            
            // Try to create the profile
            try {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: defaultProfile.id,
                  email: defaultProfile.email,
                  full_name: defaultProfile.full_name,
                  roles: defaultProfile.roles
                });
                
              if (insertError) {
                console.warn("Could not create profile:", insertError);
              }
            } catch (insertErr) {
              console.warn("Error creating profile:", insertErr);
            }
            
            set({ 
              user: data.user,
              profile: defaultProfile,
              isLoading: false 
            });
            return;
          }
          
          set({ 
            user: data.user,
            profile: profileData as Profile,
            isLoading: false 
          });
        } catch (profileError) {
          console.error("Error fetching profile after signup:", profileError);
          // Create a default profile
          const defaultProfile: Profile = {
            id: data.user.id,
            email,
            full_name: fullName,
            roles,
            territory_id: null,
            avatar_url: null,
            bio: null
          };
          
          set({ 
            user: data.user,
            profile: defaultProfile,
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
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }
          
          if (!profileData) {
            console.log("No profile found during loadUser, creating default profile");
            // Create a default profile
            const defaultProfile: Profile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata.full_name || 'User',
              roles: ['tourist'],
              territory_id: null,
              avatar_url: null,
              bio: null
            };
            
            // Try to create the profile
            try {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: defaultProfile.id,
                  email: defaultProfile.email,
                  full_name: defaultProfile.full_name,
                  roles: defaultProfile.roles
                });
                
              if (insertError) {
                console.warn("Could not create profile:", insertError);
              }
            } catch (insertErr) {
              console.warn("Error creating profile:", insertErr);
            }
            
            set({ 
              user: session.user, 
              profile: defaultProfile,
              isLoading: false 
            });
            return;
          }
          
          set({ 
            user: session.user, 
            profile: profileData as Profile,
            isLoading: false 
          });
        } catch (error) {
          console.error("Error loading profile:", error);
          // Create a default profile
          const defaultProfile: Profile = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata.full_name || 'User',
            roles: ['tourist'],
            territory_id: null,
            avatar_url: null,
            bio: null
          };
          
          set({ 
            user: session.user, 
            profile: defaultProfile,
            isLoading: false 
          });
        }
      } else {
        set({ user: null, profile: null, isLoading: false });
      }
    } catch (error) {
      console.error("Error in loadUser:", error);
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

      // Don't allow changing roles through this method
      const { roles, ...safeUpdates } = updates;

      const { error } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      set({ 
        profile: { ...profile, ...safeUpdates },
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

  // Check if the current user can manage another user
  canManageUser: (userId) => {
    const { profile } = get();
    if (!profile) return false;

    // Admins can manage all users
    if (profile.roles.includes('admin')) return true;

    // Territory managers can only manage users in their territory
    if (profile.roles.includes('territory_manager') && profile.territory_id) {
      // Need to check if the target user is in the same territory
      // This would require a separate query, so we'll handle this in the component
      return true;
    }

    // Users can't manage other users
    return false;
  },

  addRole: async (role, userId) => {
    try {
      const { user, profile } = get();
      if (!user || !profile) throw new Error('You must be logged in to update roles');

      // Determine the target user ID
      const targetUserId = userId || user.id;
      
      // Check permissions
      if (targetUserId !== user.id) {
        // Trying to modify someone else's roles
        if (!get().canManageUser(targetUserId)) {
          throw new Error('You do not have permission to modify this user\'s roles');
        }
      } else {
        // Trying to modify own roles
        if (role === 'admin' || role === 'territory_manager') {
          throw new Error('You cannot assign yourself the admin or territory manager role');
        }
      }

      set({ isLoading: true, error: null });

      // Fetch the target user's current roles
      const { data: targetProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', targetUserId)
        .single();

      if (fetchError) throw fetchError;

      // Check if role already exists
      if (targetProfile.roles.includes(role)) {
        set({ isLoading: false });
        return;
      }

      // Add the new role
      const updatedRoles = [...targetProfile.roles, role];

      const { error } = await supabase
        .from('profiles')
        .update({ roles: updatedRoles })
        .eq('id', targetUserId);

      if (error) throw error;

      // Update local state if it's the current user
      if (targetUserId === user.id) {
        set({ 
          profile: { ...profile, roles: updatedRoles },
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred adding role', 
        isLoading: false 
      });
    }
  },

  removeRole: async (role, userId) => {
    try {
      const { user, profile } = get();
      if (!user || !profile) throw new Error('You must be logged in to update roles');

      // Determine the target user ID
      const targetUserId = userId || user.id;
      
      // Check permissions
      if (targetUserId !== user.id) {
        // Trying to modify someone else's roles
        if (!get().canManageUser(targetUserId)) {
          throw new Error('You do not have permission to modify this user\'s roles');
        }
      } else {
        // Trying to modify own roles
        throw new Error('You cannot remove your own roles');
      }

      set({ isLoading: true, error: null });

      // Don't allow removing the tourist role
      if (role === 'tourist') {
        set({ 
          error: 'Cannot remove the tourist role as it is required',
          isLoading: false 
        });
        return;
      }

      // Fetch the target user's current roles
      const { data: targetProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', targetUserId)
        .single();

      if (fetchError) throw fetchError;

      // Check if role exists
      if (!targetProfile.roles.includes(role)) {
        set({ isLoading: false });
        return;
      }

      // Remove the role
      const updatedRoles = targetProfile.roles.filter(r => r !== role);

      const { error } = await supabase
        .from('profiles')
        .update({ roles: updatedRoles })
        .eq('id', targetUserId);

      if (error) throw error;

      // Update local state if it's the current user
      if (targetUserId === user.id) {
        set({ 
          profile: { ...profile, roles: updatedRoles },
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
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