import React, { useState, useEffect } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import toast from 'react-hot-toast';

const ProfileCompletion = ({ onComplete }) => {
  const { userProfile, updateProfile, supabase } = useSupabase();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    role: 'farmer',
    // Farmer specific fields
    farm_size: '',
    farm_location: '',
    crops_grown: [],
    experience_years: '',
    soil_type: '',
    irrigation_method: '',
    organic_certification: false,
    // Lender specific fields
    organization_name: '',
    license_number: '',
    max_loan_amount: '',
    interest_rate_range: '',
    lending_experience: '',
    risk_assessment_method: '',
    collateral_requirements: '',
    // Buyer specific fields
    company_name: '',
    business_type: '',
    purchase_capacity: '',
    preferred_crops: [],
    quality_standards: '',
    payment_terms: '',
    delivery_requirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [showRoleFields, setShowRoleFields] = useState(false);

  useEffect(() => {
    if (userProfile) {
      const roleProfile = userProfile.roleProfile || {};
      setFormData(prev => ({
        ...prev,
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: userProfile.phone || '',
        role: userProfile.role || 'farmer',
        farm_size: roleProfile.farm_size || '',
        farm_location: roleProfile.farm_location || '',
        crops_grown: roleProfile.crops_grown || [],
        experience_years: roleProfile.experience_years || '',
        soil_type: roleProfile.soil_type || '',
        irrigation_method: roleProfile.irrigation_method || '',
        organic_certification: roleProfile.organic_certification || false,
        organization_name: roleProfile.organization_name || '',
        license_number: roleProfile.license_number || '',
        max_loan_amount: roleProfile.max_loan_amount || '',
        interest_rate_range: roleProfile.interest_rate_range || '',
        lending_experience: roleProfile.lending_experience || '',
        risk_assessment_method: roleProfile.risk_assessment_method || '',
        collateral_requirements: roleProfile.collateral_requirements || '',
        company_name: roleProfile.company_name || '',
        business_type: roleProfile.business_type || '',
        purchase_capacity: roleProfile.purchase_capacity || '',
        preferred_crops: roleProfile.preferred_crops || [],
        quality_standards: roleProfile.quality_standards || '',
        payment_terms: roleProfile.payment_terms || '',
        delivery_requirements: roleProfile.delivery_requirements || ''
      }));
      // Set showRoleFields based on initial userProfile role
      setShowRoleFields(userProfile.role !== 'farmer');
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Show role-specific fields when role changes
    if (name === 'role') {
      setShowRoleFields(value !== 'farmer');
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
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
      if (!formData.role || formData.role === 'farmer') {
        toast.error('Please select a valid role');
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      console.log('ProfileCompletion: Starting profile update...');

      // Prepare update data with proper formatting
      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        profile_completed: true,
        updated_at: new Date().toISOString()
      };

             // Add role-specific fields only if they have values
             if (formData.role === 'farmer') {
               updateData.farm_size = formData.farm_size ? parseFloat(formData.farm_size) : null;
               updateData.farm_location = formData.farm_location.trim() || null;
               updateData.crops_grown = formData.crops_grown.length > 0 ? formData.crops_grown : null;
               updateData.experience_years = formData.experience_years ? parseInt(formData.experience_years) : null;
               updateData.soil_type = formData.soil_type.trim() || null;
               updateData.irrigation_method = formData.irrigation_method.trim() || null;
               updateData.organic_certification = formData.organic_certification;
             } else if (formData.role === 'lender') {
               updateData.organization_name = formData.organization_name.trim() || null;
               updateData.license_number = formData.license_number.trim() || null;
               updateData.max_loan_amount = formData.max_loan_amount ? parseFloat(formData.max_loan_amount) : null;
               updateData.interest_rate_range = formData.interest_rate_range.trim() || null;
               updateData.lending_experience = formData.lending_experience ? parseInt(formData.lending_experience) : null;
               updateData.risk_assessment_method = formData.risk_assessment_method.trim() || null;
               updateData.collateral_requirements = formData.collateral_requirements.trim() || null;
             } else if (formData.role === 'buyer') {
               updateData.company_name = formData.company_name.trim() || null;
               updateData.business_type = formData.business_type.trim() || null;
               updateData.purchase_capacity = formData.purchase_capacity ? parseFloat(formData.purchase_capacity) : null;
               updateData.preferred_crops = formData.preferred_crops.length > 0 ? formData.preferred_crops : null;
               updateData.quality_standards = formData.quality_standards.trim() || null;
               updateData.payment_terms = formData.payment_terms.trim() || null;
               updateData.delivery_requirements = formData.delivery_requirements.trim() || null;
             }

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

  const renderRoleFields = () => {
    switch (formData.role) {
      case 'farmer':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Farm Size (acres)
                </label>
                <input
                  type="number"
                  name="farm_size"
                  value={formData.farm_size}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience (years)
                </label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Farm Location
              </label>
              <input
                type="text"
                name="farm_location"
                value={formData.farm_location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Punjab, India"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Crops Grown (comma-separated)
              </label>
              <input
                type="text"
                value={formData.crops_grown.join(', ')}
                onChange={(e) => handleArrayChange('crops_grown', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Wheat, Rice, Cotton"
              />
            </div>
          </>
        );
      
      case 'lender':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Agricultural Investment Fund"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="LIC-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Loan Amount
                </label>
                <input
                  type="number"
                  name="max_loan_amount"
                  value={formData.max_loan_amount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="1000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interest Rate Range
              </label>
              <input
                type="text"
                name="interest_rate_range"
                value={formData.interest_rate_range}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="8-12%"
              />
            </div>
          </>
        );
      
      case 'buyer':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Food Corporation of India"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Type
                </label>
                <input
                  type="text"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Government Corporation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purchase Capacity
                </label>
                <input
                  type="number"
                  name="purchase_capacity"
                  value={formData.purchase_capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="500000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Crops (comma-separated)
              </label>
              <input
                type="text"
                value={formData.preferred_crops.join(', ')}
                onChange={(e) => handleArrayChange('preferred_crops', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Wheat, Rice, Pulses"
              />
            </div>
          </>
        );
      
      default:
        return null;
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
              Phone Number
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

          {showRoleFields && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formData.role === 'farmer' && 'Farm Details'}
                {formData.role === 'lender' && 'Lending Details'}
                {formData.role === 'buyer' && 'Business Details'}
              </h3>
              {renderRoleFields()}
            </div>
          )}

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
