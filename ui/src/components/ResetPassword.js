// src/components/ResetPassword.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ResetPassword.css';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (email !== confirmEmail) {
      setError('Emails do not match');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/reset-password/', {
      //const response = await fetch('http://52.6.97.91:8000/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      console.log('Server response:', data);
      if (response.ok) {
        console.log('Password reset link sent:', data);
        alert('Password reset link sent to your email.');
        navigate('/Login');
      } else {
        setError(data.message || 'Failed to send password reset link');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleResetPassword}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Confirm Email:</label>
          <input 
            type="email" 
            value={confirmEmail} 
            onChange={(e) => setConfirmEmail(e.target.value)} 
            required 
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
