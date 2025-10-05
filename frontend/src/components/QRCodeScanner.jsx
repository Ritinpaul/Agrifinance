import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const QRCodeScanner = ({ onScanSuccess, onScanError, className = "" }) => {
  const { isDark } = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  // Camera configuration
  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    showTorchButtonIfSupported: true,
    showZoomSliderIfSupported: true,
    defaultZoomValueIfSupported: 2,
    useBarCodeDetectorIfSupported: true,
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true
    }
  };

  // Start scanning
  const startScanning = () => {
    if (isScanning) return;

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    // Clear previous scanner
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear();
    }

    // Create new scanner
    html5QrcodeScannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );

    html5QrcodeScannerRef.current.render(
      (decodedText, decodedResult) => {
        handleScanSuccess(decodedText, decodedResult);
      },
      (errorMessage) => {
        // Handle scan errors silently (too frequent)
        if (errorMessage.includes("NotFoundException")) {
          return; // Ignore "No QR code found" errors
        }
      }
    );
  };

  // Stop scanning
  const stopScanning = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear();
      html5QrcodeScannerRef.current = null;
    }
    setIsScanning(false);
    setError(null);
  };

  // Handle successful scan
  const handleScanSuccess = (decodedText, decodedResult) => {
    setScanResult(decodedText);
    
    // Stop scanning after successful detection
    stopScanning();
    
    // Call parent callback
    if (onScanSuccess) {
      onScanSuccess(decodedText, decodedResult);
    }
    
    toast.success("QR Code scanned successfully!");
  };

  // Handle scan errors
  const handleScanError = (error) => {
    console.error("QR Code scan error:", error);
    setError(error);
    
    if (onScanError) {
      onScanError(error);
    }
    
    toast.error("Failed to scan QR code");
  };

  // Manual input submission
  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      toast.error("Please enter a product ID");
      return;
    }
    
    setScanResult(manualInput);
    
    if (onScanSuccess) {
      onScanSuccess(manualInput, null);
    }
    
    toast.success("Product ID submitted successfully!");
    setManualInput('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div className={`qr-scanner-container ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Product Verification
          </h3>
          <div className="flex space-x-2">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Start Scan</span>
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Stop Scan</span>
              </button>
            )}
          </div>
        </div>

        {/* Scanner Area */}
        <div className="mb-6">
          <div 
            id="qr-reader" 
            className={`w-full ${isScanning ? 'min-h-[300px]' : 'min-h-[200px]'} bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center`}
          >
            {!isScanning && (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p className="text-lg font-medium">QR Code Scanner</p>
                <p className="text-sm">Click "Start Scan" to begin scanning</p>
              </div>
            )}
          </div>
        </div>

        {/* Manual Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Or enter Product ID manually:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter product ID..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <button
              onClick={handleManualSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-green-800 dark:text-green-200">Scan Result:</span>
            </div>
            <p className="text-green-700 dark:text-green-300 font-mono text-sm break-all">
              {scanResult}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-red-800 dark:text-red-200">Scan Error:</span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How to use:</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Click "Start Scan" to activate camera</li>
            <li>• Point camera at QR code on product packaging</li>
            <li>• Wait for automatic detection</li>
            <li>• Or enter Product ID manually in the input field</li>
            <li>• Click "Verify" to check product authenticity</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
