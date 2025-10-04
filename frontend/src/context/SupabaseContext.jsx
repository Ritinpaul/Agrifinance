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

  // Load user from localStorage on initialization
  useEffect(() => {
    const savedUser = localStorage.getItem('agrifinance_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Loading user from localStorage:', parsedUser.email);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('agrifinance_user');
      }
    }
  }, []);

  // Safety timeout to ensure loading doesn't get stuck
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Session refresh mechanism
  useEffect(() => {
    if (!user || !session) return;

    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Session refresh error:', error);
          // If refresh fails, sign out the user
          await signOut();
        } else if (refreshedSession) {
          console.log('Session refreshed successfully');
          setSession(refreshedSession);
          setUser(refreshedSession.user);
          localStorage.setItem('agrifinance_user', JSON.stringify(refreshedSession.user));
        }
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [user, session]);

  useEffect(() => {
    // Handle email confirmation callback
    const handleEmailConfirmation = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const type = urlParams.get('type');

      if (type === 'signup' && accessToken && refreshToken) {
        console.log('Email confirmation detected, setting session...');
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session from email confirmation:', error);
          } else {
            console.log('Session set successfully from email confirmation:', data);
            console.log('User after email confirmation:', data?.user?.email, data?.user?.id);
            
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Redirect to homepage after successful email confirmation
            if (window.location.pathname === '/signin') {
              setTimeout(() => {
                window.location.href = '/';
              }, 1000);
            }
          }
        } catch (error) {
          console.error('Error handling email confirmation:', error);
        }
      }
    };

    // Handle email confirmation first
    handleEmailConfirmation();

    // Get initial session and restore authentication state
    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Initial session check:', { session: session?.user?.email, error: sessionError });
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('User found in session:', session.user.email);
          setSession(session);
          setUser(session.user);
          
          // Save user to localStorage for persistence
          localStorage.setItem('agrifinance_user', JSON.stringify(session.user));
          
          // Fetch user profile
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No user in session');
          setSession(null);
          setUser(null);
          setUserProfile(null);
          
          // Clear localStorage
          localStorage.removeItem('agrifinance_user');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('User authenticated, fetching profile...');
        
        // Save user to localStorage for persistence
        localStorage.setItem('agrifinance_user', JSON.stringify(session.user));
        
        await fetchUserProfile(session.user.id);
      } else {
        console.log('User signed out, clearing profile...');
        setUserProfile(null);
        
        // Clear localStorage
        localStorage.removeItem('agrifinance_user');
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      // Get user profile from users table only
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (!userError && userProfile) {
        console.log('User profile found:', userProfile);
        setUserProfile(userProfile);
        return userProfile;
      }

      // If no profile found, try to create a basic one
      const { data: authUser } = await supabase.auth.getUser();
      const meta = authUser?.user?.user_metadata || {};
      
      const newProfile = {
        auth_user_id: userId,
        email: authUser?.user?.email ?? null,
        role: 'farmer', // Default to farmer
        first_name: meta.first_name || meta.firstName || null,
        last_name: meta.last_name || meta.lastName || null,
        phone: authUser?.user?.phone || null,
        profile_completed: false,
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: created, error: createError } = await supabase
        .from('users')
        .insert([newProfile])
        .select()
        .single();

      if (!createError && created) {
        console.log('User profile created:', created);
        setUserProfile(created);
        return created;
      } else if (createError?.code === '23505') {
        // Profile already exists, try to fetch it again
        const { data: existingProfile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', userId)
          .single();
        
        if (existingProfile) {
          console.log('Existing profile found:', existingProfile);
          setUserProfile(existingProfile);
          return existingProfile;
        }
      }

      // Fallback profile
      const fallbackProfile = { 
        id: userId, 
        auth_user_id: userId,
        role: 'farmer',
        email: authUser?.user?.email,
        profile_completed: false,
        verified: false,
        created_at: new Date().toISOString()
      };
      
      console.log('Using fallback profile:', fallbackProfile);
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const fallbackProfile = { 
        id: userId, 
        auth_user_id: userId,
        role: 'farmer',
        email: null,
        profile_completed: false,
        verified: false,
        created_at: new Date().toISOString()
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  const signUp = async (email, password, userData = {}) => {
    console.log('SupabaseContext signUp called with:', { email, password: '***', userData });
    setLoading(true);
    
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Signup attempt ${retryCount + 1}/${maxRetries}`);
        const { data, error } = await supabaseHelpers.signUp(email, password, userData);
        console.log('supabaseHelpers.signUp response:', { data, error });
        
        if (error) {
          // Check if it's a server error that we should retry
          if (error.message && (
            error.message.includes('Server closed') ||
            error.message.includes('connection') ||
            error.message.includes('timeout') ||
            error.message.includes('network') ||
            error.message.includes('prepared statement') ||
            error.message.includes('Database error')
          )) {
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`Server error detected, retrying in ${retryCount * 2} seconds...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
              continue;
            }
          }
          
          // Non-retryable error or max retries reached
          console.error('SignUp error:', error);
          return { data: null, error };
        }
        
        // Success - but check if user profile was created
        console.log('Signup successful:', data);
        
        // If auth user was created but profile creation failed, try to create it manually
        if (data?.user && !data.session) {
          console.log('Auth user created but no session - trying to create profile manually');
          try {
            await createUserProfileManually(data.user.id, email);
          } catch (profileError) {
            console.error('Failed to create profile manually:', profileError);
            // Don't fail the signup - user can complete profile later
          }
        }
        
        return { data, error: null };
        
      } catch (error) {
        retryCount++;
        console.error(`SignUp attempt ${retryCount} failed:`, error);
        
        if (retryCount < maxRetries) {
          console.log(`Retrying in ${retryCount * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
        } else {
          console.error('SignUp failed after all retries:', error);
          return { data: null, error };
        }
      }
    }
    
    setLoading(false);
    return { data: null, error: new Error('Signup failed after multiple attempts') };
  };

  // Helper function to create user profile manually if trigger fails
  const createUserProfileManually = async (authUserId, email) => {
    try {
      console.log('Creating user profile manually for:', email);
      
      const { data, error } = await supabase
        .from('users')
        .insert([{
          auth_user_id: authUserId,
          email: email,
          role: 'farmer',
          profile_completed: false,
          verified: false
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Manual profile creation error:', error);
        throw error;
      }
      
      console.log('Manual profile creation successful:', data);
      return data;
    } catch (error) {
      console.error('Failed to create profile manually:', error);
      throw error;
    }
  };

  // Helper function to create role-specific profile using the database function
  const createRoleProfile = async (profileData) => {
    try {
      console.log('Creating role-specific profile:', profileData);
      
      const { data, error } = await supabase.rpc('create_role_profile', {
        p_user_id: user.id,
        p_role: profileData.role,
        p_profile_data: profileData
      });
      
      if (error) {
        console.error('Role profile creation error:', error);
        throw error;
      }
      
      console.log('Role profile creation successful:', data);
      return data;
    } catch (error) {
      console.error('Failed to create role profile:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    console.log('SupabaseContext signIn called with:', { email, password: '***' });
    setLoading(true);
    try {
      console.log('Calling supabaseHelpers.signIn...');
      const { data, error } = await supabaseHelpers.signIn(email, password);
      console.log('supabaseHelpers.signIn response:', { data, error });
      
      if (error) {
        console.error('Sign in error:', error);
        return { data: null, error };
      }
      
      console.log('Returning from signIn:', { data, error });
      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      console.log('Setting loading to false in signIn');
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('Signing out user...');
    setLoading(true);
    
    try {
      // Immediately clear local state for instant UI feedback
      setSession(null);
      setUser(null);
      setUserProfile(null);
      
      // Clear localStorage immediately
      localStorage.removeItem('agrifinance_user');
      
      // Clear Supabase session
      const { error } = await supabaseHelpers.signOut();
      
      // Also clear persisted Supabase session keys in localStorage (defensive)
      try {
        const url = import.meta.env.VITE_SUPABASE_URL || '';
        const refMatch = url.match(/^https?:\/\/([^\.]+)\./);
        const ref = refMatch ? refMatch[1] : '';
        const prefix = ref ? `sb-${ref}` : 'sb-';
        Object.keys(localStorage)
          .filter((k) => k.startsWith(prefix))
          .forEach((k) => localStorage.removeItem(k));
      } catch (_) {}
      
      console.log('Sign out completed');
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear local state
      setSession(null);
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('agrifinance_user');
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

  // Phone OTP: send and verify
  const sendSmsOtp = async (phoneNumber) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseHelpers.sendSmsOtp(phoneNumber);
      return { data, error };
    } finally {
      setLoading(false);
    }
  };

  const verifySmsOtp = async (phoneNumber, token) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseHelpers.verifySmsOtp(phoneNumber, token);
      return { data, error };
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData, role) => {
    try {
      // Ensure we have the latest authenticated user (important right after OTP flows)
      let authUser = user;
      if (!authUser) {
        try {
          const { data: userResp } = await supabase.auth.getUser();
          authUser = userResp?.user ?? null;
        } catch (e) {
          // ignore; will error below if still missing
        }
      }

      if (!authUser) {
        return { data: null, error: new Error('No authenticated user available for profile creation') };
      }

      // Use unified users table with role field
      const userRecord = {
        user_id: authUser.id,
        email: authUser.email,
        role: role || 'user',
        profile_completed: true,
        verified: true,
        ...profileData
      };

      // Insert or update user profile in unified users table
      const { data, error } = await supabase
        .from('users')
        .upsert([userRecord], { onConflict: 'user_id' })
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
    console.log('updateProfile called with:', profileData);
    
    if (!user) {
      console.error('No authenticated user for profile update');
      return { data: null, error: new Error('No authenticated user') };
    }

    try {
      console.log('Updating profile for user:', user.id);
      
      // Update the users table with all profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          role: profileData.role,
          profile_completed: profileData.profile_completed || true,
          updated_at: new Date().toISOString(),
          // Add role-specific fields directly to users table
          farm_size: profileData.farm_size,
          farm_location: profileData.farm_location,
          crops_grown: profileData.crops_grown,
          experience_years: profileData.experience_years,
          soil_type: profileData.soil_type,
          irrigation_method: profileData.irrigation_method,
          organic_certification: profileData.organic_certification,
          organization_name: profileData.organization_name,
          license_number: profileData.license_number,
          max_loan_amount: profileData.max_loan_amount,
          interest_rate_range: profileData.interest_rate_range,
          lending_experience: profileData.lending_experience,
          risk_assessment_method: profileData.risk_assessment_method,
          collateral_requirements: profileData.collateral_requirements,
          company_name: profileData.company_name,
          business_type: profileData.business_type,
          purchase_capacity: profileData.purchase_capacity,
          preferred_crops: profileData.preferred_crops,
          quality_standards: profileData.quality_standards,
          payment_terms: profileData.payment_terms,
          delivery_requirements: profileData.delivery_requirements
        })
        .eq('auth_user_id', user.id)
        .select()
        .single();

      console.log('User update result:', { userData, userError });

      if (userError) {
        console.error('User update error:', userError);
        return { data: null, error: userError };
      }

      // Update the user profile state
      setUserProfile(userData);

      console.log('Profile updated successfully:', userData);
      return { data: userData, error: null };
    } catch (error) {
      console.error('Profile update exception:', error);
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
    sendSmsOtp,
    verifySmsOtp,
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
