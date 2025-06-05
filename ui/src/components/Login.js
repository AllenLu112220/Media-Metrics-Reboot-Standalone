// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import '../styles/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  useEffect(() => {
    const fetchCsrfToken = async () => {
        //const response = await fetch('http://localhost:8000/api/csrf-token/', { method: 'GET', credentials: 'include' });
        const response = await fetch('http://52.6.97.91:8000/api/csrf-token/', { method: 'GET', credentials: 'include' });
        const data = await response.json();
        setCsrfToken(data.csrfToken); 
    };
    fetchCsrfToken();
}, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Attempting to log in...');
    // Handle login logic here (e.g., form submission)
    try{
      //const response = await fetch('http://localhost:8000/api/login/',{
      const response = await fetch('http://52.6.97.91:8000/api/login/',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({username, password}),
      })

      const data = await response.json()
      if (response.ok) {
        console.log('Login succesful:', data)
        const newCsrfToken = data.csrfToken; 
        setCsrfToken(newCsrfToken);
        login(data.user);

        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/home');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Login</button>
        <Link to ="/reset-password" className="forgot-password-link">Forgot Password?</Link>
        <p className = "register-link">
          Not yet registered? <Link to="/create-account">Create an account here</Link>
        </p>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Login;