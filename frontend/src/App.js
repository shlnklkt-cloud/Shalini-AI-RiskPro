import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProposalDetail from './pages/ProposalDetail';
import './App.css';

// Lazy load property detail page
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/proposal/:id" 
          element={isAuthenticated ? <ProposalDetail user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/property/:id" 
          element={
            isAuthenticated ? (
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50">Loading...</div>}>
                <PropertyDetail user={user} onLogout={handleLogout} />
              </Suspense>
            ) : (
              <Navigate to="/" />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;