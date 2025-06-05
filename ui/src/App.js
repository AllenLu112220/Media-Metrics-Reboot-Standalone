import React, { useState } from 'react'; 
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/home';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import { UserProvider, useUser } from './contexts/UserContext';
import SetNewPassword from './components/SetNewPassword';
import './styles/navigation.css';
import './styles/common.css'; 
import GuideModal from './components/GuideModal';
import PrivacyNotice from './components/PrivacyNotice';
import handleExportToCSV from './components/Export';
import CreateAccount from './components/CreateAccount';
import SearchHistory from './components/SearchHistory';
import SearchForm from './components/SearchForm';
import FileUploadComponent from './components/Upload'; // Import FileUploadComponent

function App() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const openGuide = () => setIsGuideOpen(true);
  const closeGuide = () => setIsGuideOpen(false);

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const openPrivacy = () => setIsPrivacyOpen(true);
  const closePrivacy = () => setIsPrivacyOpen(false);

  const [news, setNews] = useState([]);

  return (
    <UserProvider>
      <Router>
        <div className="App">
          <NavBar 
            openGuide={openGuide} 
            openPrivacy={openPrivacy} 
            news={news}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/set-new-password" element={<SetNewPassword />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/home" element={<Home setNews={setNews} news={news} />} />
            <Route path="/searchHistory" element={<SearchHistory />} />
            <Route path="/searchForm" element={<SearchForm />} />
            {/* Route for CSV upload page */}
            <Route path="/upload" element={<FileUploadComponent />} />
          </Routes>
          <GuideModal isOpen={isGuideOpen} onClose={closeGuide} />
          <PrivacyNotice isOpen={isPrivacyOpen} onClose={closePrivacy} />
        </div>
      </Router>
    </UserProvider>
  );
}

// Updated NavBar component
function NavBar({ openGuide, openPrivacy, news }) {
  const { user, isLoggedIn, logout } = useUser();

  const getUsername = (email) => email.split('@')[0];

  return (
    <>
      <header className="header-bar">
        <h1 className="bar-text-top">
          DASH Hound<br />Media Metrics Collection Tool
        </h1>
      </header>
      <nav>
        <ul>
          <li><Link to="/home" style={{ marginLeft: '20px' }}>Home</Link></li>
          <li><span className="guide-link" onClick={openGuide}>Guide</span></li>
          <li><span className="privacy-link" onClick={openPrivacy}>Privacy Notice</span></li>
          <li><span className="export-button" onClick={() => handleExportToCSV(news || [])}>Export as CSV</span></li>
          <li className="file-upload-button">
            <Link to="/upload" className="upload-button">Upload CSV</Link>
          </li>
        </ul>

        <ul className="login-section">
          <li><Link to="/searchHistory">Search History</Link></li>
          {!isLoggedIn ? (
            <li className="login-item">
              <Link to="/login">Login</Link>
            </li>
          ) : (
            <li>
              <span onClick={logout} className="logout-link">
                Logout {user ? getUsername(user.AccountEmail) : ''}
              </span>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}

export default App;
