import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseHelpers } from '../lib/supabase';

const SupabaseContext = createContext();

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { session } = await supabaseHelpers.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      // Try to get admin profile first
      const { data: admin, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!adminError && admin) {
        setUserProfile({ ...admin, role: 'admin' });
        return;
      }

      // If no admin profile found, create a basic user profile
      setUserProfile({ 
        id: userId, 
        role: 'admin',
        email: user?.email,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile({ 
        id: userId, 
        role: 'admin',
        email: user?.email,
        created_at: new Date().toISOString()
      });
    }
  };

  const signUp = async (email, password, userData = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseHelpers.signUp(email, password, userData);
      return { data, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseHelpers.signIn(email, password);
      return { data, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabaseHelpers.signOut();
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabaseHelpers.resetPassword(email);
    return { data, error };
  };

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabaseHelpers.updatePassword(newPassword);
    return { data, error };
  };

  const createProfile = async (profileData, role) => {
    try {
      const tableName = role === 'admin' ? 'admin_users' : 'users';

      const { data, error } = await supabase
        .from(tableName)
        .insert([{
          user_id: user.id,
          email: user.email,
          ...profileData
        }])
        .select()
        .single();

      if (!error && data) {
        setUserProfile({ ...data, role });
      }

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateProfile = async (profileData) => {
    if (!userProfile) return { data: null, error: new Error('No profile found') };

    try {
      const tableName = userProfile.role === 'admin' ? 'admin_users' : 'users';

      const { data, error } = await supabase
        .from(tableName)
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (!error && data) {
        setUserProfile({ ...data, role: userProfile.role });
      }

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    createProfile,
    updateProfile,
    supabase
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};
