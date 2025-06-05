import React from 'react';
import '../styles/PrivacyNotice.css'; 

const PrivacyNotice = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="close-button" onClick={onClose}>×</button>

        <h1>Privacy Notice</h1>
        <p>Effective Date: 03/12/2025</p>

        <p>Blue Marble Media Metrics values your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.</p>

        <h1>1. Information We Collect</h1>
        <p className="text-gray-700 leading-relaxed">
          When you use our app, we collect the following information:
        </p>
        <ul className="custom-list">
          <li><strong>Email Address:</strong> Used to create and manage your account.</li>
          <li><strong>Time and Date of Access:</strong> Collected for security and performance monitoring.</li>
          <li><strong>Search Queries:</strong> Used internally to improve the app experience.</li>
        </ul>

        <h1>2. How We Use Your Information</h1>
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <p className="text-gray-700 leading-relaxed">
            We use your information solely for:
          </p>
          <ul className="custom-list">
            <li>Creating and managing your account.</li>
            <li>Improving the performance and functionality of the app.</li>
            <li>Monitoring and securing the app.</li>
          </ul>
        </div>

        <h1>3. How We Share Your Information</h1>
        <p>We do not share, sell, or trade your information with any third parties.</p>

        <h1>4. Your Rights</h1>
        <p>You have the right to:</p>
        <ul className="custom-list">
          <li><strong>Delete Your Account:</strong> You may request to delete your account and associated data at any time by contacting us.</li>
        </ul>

        <h1>5. Changes to This Privacy Policy</h1>
        <p>We may update this policy from time to time. Continued use of the app after any changes means you accept the updated terms.</p>

        <h1>6. Contact Us</h1>
        <p>If you have questions or need to delete your account, contact us at: <strong>Dash.hound@blue-marble.com</strong></p>
      </div>
    </div>
  );
};

export default PrivacyNotice;
