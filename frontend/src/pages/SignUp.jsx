import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import { useTheme } from '../context/ThemeContext';
import { MobileWalletUtils } from '../utils/mobileWalletUtils';
import toast from 'react-hot-toast';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    phone: '',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showManualRedirect, setShowManualRedirect] = useState(false);
  const { signUp, createProfile, sendSmsOtp, verifySmsOtp, supabase } = useSupabase();
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  const [usePhoneOtp, setUsePhoneOtp] = useState(false);
  const [useEmailMagic, setUseEmailMagic] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const devOtpCode = import.meta.env.VITE_DEV_OTP_CODE || '';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for phone number with auto-formatting
    if (name === 'phone') {
      MobileWalletUtils.handlePhoneInputChange(e, setFormData);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!usePhoneOtp && !useEmailMagic && !validateForm()) return;
    
    setIsLoading(true);
    setShowManualRedirect(false);

    try {
      if (useEmailMagic) {
        const email = formData.email.trim();
        if (!email) {
          toast.error('Enter your email');
          setIsLoading(false);
          return;
        }
        if (!formData.agreeToTerms) {
          toast.error('Please agree to the terms and conditions');
          setIsLoading(false);
          return;
        }
        if (devOtpCode && devOtpCode === formData.otp.trim()) {
          toast.success('Dev override accepted');
          // Create profile after dev override
          const profileData = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            role: formData.role,
            created_at: new Date().toISOString()
          };
          const { error: profileError } = await createProfile(profileData, formData.role);
          if (profileError) {
            console.error('Profile creation error:', profileError);
            toast.error('Signed up but profile setup failed. You can complete it later.');
          } else {
            toast.success('Account created successfully!');
          }
          navigate('/');
          return;
        }
        const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) {
          toast.error(error.message || 'Failed to send magic link');
          setIsLoading(false);
          return;
        }
        toast.success('Magic link sent. Check your email.');
        setIsLoading(false);
        return;
      }

      if (usePhoneOtp) {
        // Phone OTP sign-up/verify flow
        if (!otpSent) {
          const phone = formData.phone.trim();
          if (!phone) {
            toast.error('Enter phone number');
            setIsLoading(false);
            return;
          }
          if (!formData.agreeToTerms) {
            toast.error('Please agree to the terms and conditions');
            setIsLoading(false);
            return;
          }
          // Auto-prefix +91 for India
          const normalizedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
          const { error } = await sendSmsOtp(normalizedPhone);
          if (error) {
            toast.error(error.message || 'Failed to send OTP');
            setIsLoading(false);
            return;
          }
          setOtpSent(true);
          toast.success('OTP sent to your phone');
          setIsLoading(false);
          return;
        } else {
          const phone = formData.phone.trim().startsWith('+') ? formData.phone.trim() : `+91${formData.phone.trim()}`;
          const token = formData.otp.trim();
          if (devOtpCode && devOtpCode === token) {
            const profileData = {
              email: formData.email || null,
              phone: phone,
              role: 'user', // Default role
              profile_completed: false, // Profile needs completion
              verified: true
            };
            const { error: profileError } = await createProfile(profileData, 'user');
            if (profileError) {
              console.error('Profile creation error:', profileError);
              toast.error('Signed up but profile setup failed. You can complete it later.');
            } else {
              toast.success('Account created! Please complete your profile in the dashboard.');
            }
            navigate('/');
            return;
          }
          if (!token) {
            toast.error('Enter OTP');
            setIsLoading(false);
            return;
          }
          const { data, error } = await verifySmsOtp(phone, token);
          if (error) {
            toast.error(error.message || 'OTP verification failed');
            setIsLoading(false);
            return;
          }
          // after verify, get current user to ensure session is populated
          const { data: current } = await supabase.auth.getUser();
          const authedUser = current?.user || data?.user;
          if (authedUser) {
            // Create profile for phone users
            const profileData = {
              email: formData.email || null,
              phone: phone,
              role: 'user', // Default role
              profile_completed: false, // Profile needs completion
              verified: true
            };
            const { error: profileError } = await createProfile(profileData, 'user');
            if (profileError) {
              console.error('Profile creation error:', profileError);
              toast.error('Signed up but profile setup failed. You can complete it later.');
            } else {
              toast.success('Account created! Please complete your profile in the dashboard.');
            }
            navigate('/');
          }
          setIsLoading(false);
          return;
        }
      }

      // Email/password sign-up flow
      console.log('Starting email/password signup...');
      
      const { data, error } = await signUp(formData.email, formData.password);
      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to create account';
        if (error.message.includes('Server closed') || error.message.includes('connection')) {
          errorMessage = 'Server is temporarily unavailable. Please try again in a few moments.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      // Check if user was created
      if (data?.user) {
        console.log('User created successfully:', data.user);
        
        // COMPLETE BYPASS: Create profile immediately without waiting for trigger
        try {
          console.log('Creating user profile immediately...');
          
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              auth_user_id: data.user.id,
              email: data.user.email,
              role: 'farmer',
              profile_completed: false,
              verified: false
            }]);
          
          if (profileError) {
            console.log('Profile creation failed, but auth user exists:', profileError);
            // Don't fail - user can complete profile later
          } else {
            console.log('Profile created successfully!');
          }
        } catch (profileError) {
          console.log('Profile creation error (non-critical):', profileError);
        }
        
        // Success - redirect user
        toast.success('Account created successfully! Please check your email to confirm your account.');
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
        
        setIsLoading(false);
        return;
      } else {
        console.log('No user data received:', data);
        toast.error('Account creation failed - no user data received');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Join AgriFinance
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-4">
            Create your account to start your agricultural finance journey
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 sm:p-6 lg:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex items-center justify-center">
              <div className="inline-flex flex-col sm:flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1 space-y-1 sm:space-y-0 sm:space-x-1">
                <button type="button" onClick={() => { setUsePhoneOtp(false); setUseEmailMagic(false); }} className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${(!usePhoneOtp && !useEmailMagic) ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>
                  Email & Password
                </button>
                <button type="button" onClick={() => { setUsePhoneOtp(true); setUseEmailMagic(false); }} className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${usePhoneOtp ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>
                  Phone OTP
                </button>
                <button type="button" onClick={() => { setUsePhoneOtp(false); setUseEmailMagic(true); }} className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${useEmailMagic ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>
                  Email Magic Link
                </button>
              </div>
            </div>
            
            {!usePhoneOtp && !useEmailMagic && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm sm:text-base"
                  placeholder="john.doe@example.com"
                />
              </div>
            )}

            {useEmailMagic && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm sm:text-base"
                    placeholder="john.doe@example.com"
                  />
                </div>
                {devOtpCode && (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dev OTP Override
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm sm:text-base"
                      placeholder="Enter dev code if provided"
                    />
                  </div>
                )}
              </>
            )}

            {usePhoneOtp && (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm sm:text-base"
                    placeholder="e.g. +919876543210"
                  />
                </div>
                {otpSent || devOtpCode ? (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enter OTP
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required={!devOtpCode}
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm sm:text-base"
                      placeholder="6-digit code"
                    />
                  </div>
                ) : null}
              </>
            )}

            {!usePhoneOtp && !useEmailMagic && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm sm:text-base"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {!usePhoneOtp && !useEmailMagic && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm sm:text-base"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                required
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <Link to="/terms" className="text-green-600 hover:text-green-500 dark:text-green-400">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-green-600 hover:text-green-500 dark:text-green-400">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Manual redirect button for fallback */}
          {showManualRedirect && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-3">
                Signup is taking longer than expected. Your account may have been created successfully.
              </p>
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Go to Sign In Page
              </button>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
                <span className="ml-2">Twitter</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
