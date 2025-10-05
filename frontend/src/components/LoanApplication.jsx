import React, { useState } from 'react';

const LoanApplication = () => {
  const [formData, setFormData] = useState({
    amount: '',
    duration: '',
    purpose: '',
    cropType: '',
    expectedYield: '',
    landArea: ''
  });
  const [loading, setLoading] = useState(false);
  const [creditScore, setCreditScore] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateCreditScore = async () => {
    setLoading(true);
    try {
      // Mock AI credit score calculation
      const mockScore = Math.floor(Math.random() * 200) + 600; // 600-800
      setCreditScore(mockScore);
    } catch (error) {
      console.error('Error calculating credit score:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitLoanApplication = async () => {
    setLoading(true);
    try {
      // Mock loan application submission
      alert('Loan application submitted successfully!');
    } catch (error) {
      console.error('Error submitting loan application:', error);
      alert('Error submitting loan application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">
          Apply for Loan
        </h3>
        {creditScore && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm text-green-600 font-medium">Credit Score</div>
            <div className="text-2xl font-bold text-green-700">{creditScore}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="form-label">Loan Amount (USD)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter loan amount"
              min="100"
              max="10000"
            />
          </div>

          <div>
            <label className="form-label">Duration (Days)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter duration in days"
              min="30"
              max="365"
            />
          </div>

          <div>
            <label className="form-label">Purpose</label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select purpose</option>
              <option value="seeds">Seeds Purchase</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="equipment">Equipment</option>
              <option value="irrigation">Irrigation</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="form-label">Crop Type</label>
            <select
              name="cropType"
              value={formData.cropType}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select crop type</option>
              <option value="rice">Rice</option>
              <option value="wheat">Wheat</option>
              <option value="corn">Corn</option>
              <option value="sugarcane">Sugarcane</option>
              <option value="cotton">Cotton</option>
            </select>
          </div>

          <div>
            <label className="form-label">Expected Yield (kg)</label>
            <input
              type="number"
              name="expectedYield"
              value={formData.expectedYield}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Expected yield"
              min="0"
            />
          </div>

          <div>
            <label className="form-label">Land Area (acres)</label>
            <input
              type="number"
              name="landArea"
              value={formData.landArea}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Land area"
              min="0"
              step="0.1"
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={calculateCreditScore}
          disabled={loading || !formData.cropType || !formData.landArea}
          className="agri-button disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate Credit Score'}
        </button>

        <button
          onClick={submitLoanApplication}
          disabled={loading || !creditScore || Object.values(formData).some(val => !val)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>

      {creditScore && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Credit Score Analysis</h4>
          <div className="text-sm text-blue-700">
            <p>Your credit score of {creditScore} indicates:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {creditScore >= 750 && <li>Excellent creditworthiness - Low interest rates</li>}
              {creditScore >= 700 && creditScore < 750 && <li>Good creditworthiness - Standard interest rates</li>}
              {creditScore >= 650 && creditScore < 700 && <li>Fair creditworthiness - Higher interest rates</li>}
              {creditScore < 650 && <li>Poor creditworthiness - Consider improving your profile</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanApplication;
