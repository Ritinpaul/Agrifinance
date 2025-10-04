import React, { useState, useEffect } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { MobileWalletUtils } from '../utils/mobileWalletUtils';
import toast from 'react-hot-toast';

const ProfileCompletion = ({ onComplete }) => {
  const { userProfile, updateProfile, supabase } = useSupabase();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    role: 'farmer'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: userProfile.phone || '',
        role: userProfile.role || 'farmer'
      }));
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number with auto-formatting
    if (name === 'phone') {
      MobileWalletUtils.handlePhoneInputChange(e, setFormData);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Add timeout to prevent stuck saving state
    const timeoutId = setTimeout(() => {
      setLoading(false);
      toast.error('Profile completion timed out. Please try again.');
    }, 15000); // 15 second timeout for profile completion

    try {
      // Validate required fields
      if (!formData.first_name.trim()) {
        toast.error('First name is required');
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }
      if (!formData.last_name.trim()) {
        toast.error('Last name is required');
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }
      if (!formData.role) {
        toast.error('Please select a role');
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      console.log('ProfileCompletion: Starting profile update...');

      // Prepare update data with basic fields only
      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        profile_completed: true,
        updated_at: new Date().toISOString()
      };

      console.log('Updating profile with data:', updateData);

      // Update profile in users table
      const { data, error } = await updateProfile(updateData);
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Profile update failed:', error);
        toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
        
        // Log additional debugging info
        console.log('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        return;
      }

      console.log('Profile update successful:', data);

      // Update display name in Supabase Auth
      const displayName = `${formData.first_name} ${formData.last_name}`.trim();
      if (displayName) {
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            display_name: displayName,
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role
          }
        });
        
        if (authError) {
          console.error('Failed to update auth display name:', authError);
          // Don't show error to user as profile was updated successfully
        } else {
          console.log('Auth display name updated successfully');
        }
      }

      toast.success('Profile completed successfully!');
      console.log('Profile completed successfully');
      if (onComplete) onComplete();
    } catch (error) {
      clearTimeout(timeoutId);
      toast.error('An unexpected error occurred: ' + error.message);
      console.error('Profile completion error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tell us more about yourself to get the best experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              I am a *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="farmer">Farmer</option>
              <option value="lender">Lender</option>
              <option value="buyer">Buyer</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => onComplete && onComplete()}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletion;
