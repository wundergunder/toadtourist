import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'territory_manager' | 'tour_guide' | 'tourist';
  territory_id: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'tourist') => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
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

  signUp: async (email, password, fullName, role) => {
    try {
      set({ isLoading: true, error: null });
      
      // Sign up with user metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
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
              role,
              territory_id: null,
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
  }
}));