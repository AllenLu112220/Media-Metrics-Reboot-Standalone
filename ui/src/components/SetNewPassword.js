import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SetNewPassword.css';


function SetNewPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const uid = new URLSearchParams(window.location.search).get('uid');
    const token = new URLSearchParams(window.location.search).get('token');

    const setNewPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword){
            setError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            //const response = await fetch('http://localhost:8000/api/set-new-password/', {
            const response = await fetch('http://52.6.97.91:8000/api/set-new-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid, token, password }),
            });
            const data = await response.json();
            if (response.ok) {
                console.log('New password has been set.');
                alert('Login with your new password.');
                navigate('/login');
            } else {
                setError(data.message || 'Failed to set new password.');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="set-new-password-container">
          <h2>Set New Password</h2>
          <form onSubmit={setNewPassword}>
            <div>
              <label>Password:</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label>Confirm Password:</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Submit new password'}
            </button>
          </form>
        </div>
      );
}

export default SetNewPassword;
