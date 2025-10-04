import React, { useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

const DemoSeeder = ({ onComplete }) => {
  const { supabase, user } = useSupabase();
  const { account, isConnected } = useWeb3();
  const [isSeeding, setIsSeeding] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [isSeeded, setIsSeeded] = useState(localStorage.getItem('demo-data-seeded') === 'true');

  const demoData = {
    users: [
      {
        user_id: user?.id || 'demo-farmer-1',
        email: 'farmer1@demo.com',
        first_name: 'Rajesh',
        last_name: 'Kumar',
        phone: '+919876543210',
        role: 'farmer',
        farm_size: 50,
        farm_location: 'Punjab, India',
        crops_grown: ['Wheat', 'Rice'],
        experience_years: 15,
        profile_completed: true,
        verified: true
      },
      {
        user_id: 'demo-farmer-2',
        email: 'farmer2@demo.com',
        first_name: 'Priya',
        last_name: 'Singh',
        phone: '+919876543211',
        role: 'farmer',
        farm_size: 30,
        farm_location: 'Haryana, India',
        crops_grown: ['Cotton', 'Sugarcane'],
        experience_years: 8,
        profile_completed: true,
        verified: true
      },
      {
        user_id: 'demo-lender-1',
        email: 'lender1@demo.com',
        first_name: 'Agricultural',
        last_name: 'Investment Fund',
        phone: '+919876543220',
        role: 'lender',
        organization_name: 'Agricultural Investment Fund',
        license_number: 'LIC-001',
        max_loan_amount: 1000000,
        interest_rate_range: '8-12%',
        profile_completed: true,
        verified: true
      },
      {
        user_id: 'demo-buyer-1',
        email: 'buyer1@demo.com',
        first_name: 'Food',
        last_name: 'Corporation',
        phone: '+919876543230',
        role: 'buyer',
        company_name: 'Food Corporation of India',
        business_type: 'Government Corporation',
        purchase_capacity: 500000,
        preferred_crops: ['Wheat', 'Rice', 'Pulses'],
        profile_completed: true,
        verified: true
      },
      {
        user_id: 'demo-admin-1',
        email: 'admin@demo.com',
        first_name: 'System',
        last_name: 'Administrator',
        phone: '+919876543240',
        role: 'admin',
        admin_level: 'super',
        permissions: { can_approve: true, can_moderate: true },
        profile_completed: true,
        verified: true
      }
    ],
    batches: [
      {
        farmer_user_id: 1, // Reference to users table
        crop_type: 'Wheat',
        quantity: 1000,
        unit: 'kg',
        price_per_unit: 25,
        harvest_date: new Date().toISOString(),
        quality_grade: 'A',
        status: 'available',
        location: 'Punjab, India'
      },
      {
        farmer_user_id: 2, // Reference to users table
        crop_type: 'Cotton',
        quantity: 500,
        unit: 'kg',
        price_per_unit: 45,
        harvest_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        quality_grade: 'A',
        status: 'sold',
        location: 'Haryana, India'
      }
    ],
    loans: [
      {
        farmer_user_id: 1, // Reference to users table
        lender_user_id: 3, // Reference to users table
        amount: 15000,
        interest_rate: 10,
        term_months: 6,
        purpose: 'Seeds and Fertilizers',
        status: 'active',
        application_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        approval_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        disbursement_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        farmer_user_id: 2, // Reference to users table
        lender_user_id: 3, // Reference to users table
        amount: 20000,
        interest_rate: 12,
        term_months: 4,
        purpose: 'Irrigation Equipment',
        status: 'completed',
        application_date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        approval_date: new Date(Date.now() - 145 * 24 * 60 * 60 * 1000).toISOString(),
        disbursement_date: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  };

  const seedDemoData = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSeeding(true);
    
    try {
      // Seed users (unified table with roles)
      setCurrentStep('Creating user profiles...');
      for (const user of demoData.users) {
        await supabase.from('users').upsert([user], { onConflict: 'user_id' });
      }
      toast.success('✅ Users created');

      // Seed batches
      setCurrentStep('Creating product batches...');
      for (const batch of demoData.batches) {
        await supabase.from('batches').insert([batch]);
      }
      toast.success('✅ Product batches created');

      // Seed loans
      setCurrentStep('Creating loan records...');
      for (const loan of demoData.loans) {
        await supabase.from('loans').insert([loan]);
      }
      toast.success('✅ Loan records created');

      // Store demo flag
      localStorage.setItem('demo-data-seeded', 'true');
      localStorage.setItem('demo-seed-timestamp', new Date().toISOString());
      setIsSeeded(true);

      setCurrentStep('Demo setup complete!');
      toast.success('🎉 Demo data seeded successfully!');
      
      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      console.error('Demo seeding error:', error);
      toast.error('Failed to seed demo data: ' + error.message);
    } finally {
      setIsSeeding(false);
      setCurrentStep('');
    }
  };

  const clearDemoData = async () => {
    if (!confirm('This will clear all demo data. Continue?')) return;

    try {
      await supabase.from('loans').delete().like('id', 'loan-%');
      await supabase.from('batches').delete().like('id', 'batch-%');
      await supabase.from('buyers').delete().like('user_id', 'demo-%');
      await supabase.from('lenders').delete().like('user_id', 'demo-%');
      await supabase.from('farmers').delete().like('user_id', 'demo-%');
      
      localStorage.removeItem('demo-data-seeded');
      localStorage.removeItem('demo-seed-timestamp');
      setIsSeeded(false);
      
      toast.success('Demo data cleared');
    } catch (error) {
      toast.error('Failed to clear demo data');
    }
  };

  // const isDemoSeeded = localStorage.getItem('demo-data-seeded') === 'true';

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-green-200 dark:border-gray-600">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          🚀 Demo Setup
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {isSeeded 
            ? 'Demo data is already seeded. You can explore the platform or reset the data.'
            : 'One-click setup to populate the platform with sample farmers, lenders, buyers, batches, and loans.'
          }
        </p>
      </div>

      <div className="space-y-4">
        {isSeeding && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{currentStep}</p>
          </div>
        )}

        {!isSeeding && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!isSeeded ? (
              <button
                onClick={seedDemoData}
                disabled={!isConnected}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                🌱 Seed Demo Data
              </button>
            ) : (
              <>
                <button
                  onClick={seedDemoData}
                  disabled={!isConnected}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  🔄 Reseed Demo Data
                </button>
                <button
                  onClick={clearDemoData}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  🗑️ Clear Demo Data
                </button>
              </>
            )}
          </div>
        )}

        {!isConnected && (
          <p className="text-center text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ Connect your wallet to seed demo data
          </p>
        )}

        {isSeeded && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Demo data seeded on: {new Date(localStorage.getItem('demo-seed-timestamp')).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoSeeder;
