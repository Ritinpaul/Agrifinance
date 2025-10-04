import React, { useEffect, useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { MobileWalletUtils } from '../utils/mobileWalletUtils';
import toast from 'react-hot-toast';
import ProfileCompletion from '../components/ProfileCompletion';

const Profile = () => {
  const { user, userProfile, updateProfile, fetchUserProfile } = useSupabase();
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', role: '' });
  const [saving, setSaving] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);

  useEffect(() => {
    if (userProfile) {
      const fallbackPhone = userProfile.phone || user?.phone || '';
      setForm({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: fallbackPhone,
        role: userProfile.role || 'user',
      });
      
      // Check if profile is incomplete and show modal
      const isProfileIncomplete = !userProfile.profile_completed || 
        !userProfile.first_name || 
        !userProfile.last_name || 
        !userProfile.role;
      
      if (isProfileIncomplete) {
        setShowProfileCompletion(true);
      }
    }
  }, [userProfile, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number with auto-formatting
    if (name === 'phone') {
      MobileWalletUtils.handlePhoneInputChange(e, setForm);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!form.first_name.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!form.last_name.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!form.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (!form.role) {
      toast.error('Please select a role');
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    // Add timeout to prevent stuck saving state
    const timeoutId = setTimeout(() => {
      setSaving(false);
      toast.error('Profile update timed out. Please try again.');
    }, 10000); // 10 second timeout
    
    try {
      console.log('Profile page: Starting profile update...');
      
      const { error } = await updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        role: form.role,
        updated_at: new Date().toISOString()
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        toast.error(error.message || 'Failed to update profile');
        console.error('Profile update error:', error);
      } else {
        toast.success('Profile updated successfully');
        console.log('Profile updated successfully');
        
        // Refresh user profile data to ensure UI is updated
        if (user?.id) {
          setTimeout(() => {
            fetchUserProfile(user.id);
          }, 1000);
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      toast.error('An unexpected error occurred');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Profile</h2>
        <p className="text-gray-600 dark:text-gray-300">Please sign in to view your profile.</p>
      </div>
    );
  }

  const missingPhone = !form.phone || form.phone.trim() === '';
  const isProfileIncomplete = !userProfile?.profile_completed || 
    !userProfile?.first_name || 
    !userProfile?.last_name || 
    !userProfile?.role;

  return (
    <>
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Profile</h2>
          {isProfileIncomplete && (
            <button
              onClick={() => setShowProfileCompletion(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Complete Profile
            </button>
          )}
        </div>

      {missingPhone && (
        <div className="mb-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800">
          For better account recovery and notifications, please add your phone number.
        </div>
      )}
      <form className="space-y-4" onSubmit={handleSave}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">First Name</label>
            <input name="first_name" value={form.first_name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Last Name</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="+91XXXXXXXXXX" />
        </div>
        <div>
          <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Role</label>
          <select 
            name="role" 
            value={form.role} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="user">User</option>
            <option value="farmer">Farmer</option>
            <option value="lender">Lender</option>
            <option value="buyer">Buyer</option>
          </select>
        </div>
        <button type="submit" disabled={saving} className="agri-button disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
    
    {/* Profile Completion Modal */}
    {showProfileCompletion && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <ProfileCompletion onComplete={() => setShowProfileCompletion(false)} />
        </div>
      </div>
    )}
  </>
  );
};

export default Profile;


