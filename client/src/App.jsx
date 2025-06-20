import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import ShelterFormPage from './pages/ShelterFormPage';
import ShelterEditPage from './pages/ShelterEditPage';
import ShelterDetailsPage from './pages/ShelterDetailsPage';
import RequestFormPage from './pages/RequestFormPage';
import RequestEditPage from './pages/RequestEditPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import ConnectionRequestsPage from './pages/ConnectionRequestsPage';

// Landing page component
const LandingPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the landing page if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Logo/Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏠</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shelter Surfing
          </h1>
          <p className="text-gray-600 text-sm">
            Connecting communities through temporary shelter
          </p>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed">
            A platform that connects people offering temporary shelter with those seeking a safe place to stay. 
            Join our community to help or find assistance when you need it most.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            to="/login"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link 
            to="/register"
            className="block w-full bg-white text-blue-600 py-3 px-4 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors font-medium"
          >
            Create Account
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Safe • Secure • Community-driven
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <NotificationToast />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/user/:userId" 
                element={
                  <PrivateRoute>
                    <UserProfilePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/shelter/new" 
                element={
                  <PrivateRoute>
                    <ShelterFormPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/shelter/:shelterId" 
                element={
                  <PrivateRoute>
                    <ShelterDetailsPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/shelter/:shelterId/edit" 
                element={
                  <PrivateRoute>
                    <ShelterEditPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/request/new" 
                element={
                  <PrivateRoute>
                    <RequestFormPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/request/:requestId/edit" 
                element={
                  <PrivateRoute>
                    <RequestEditPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/matches" 
                element={
                  <PrivateRoute>
                    <MatchesPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/messages" 
                element={
                  <PrivateRoute>
                    <MessagesPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/messages/:conversationId" 
                element={
                  <PrivateRoute>
                    <MessagesPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/connections/requests" 
                element={
                  <PrivateRoute>
                    <ConnectionRequestsPage />
                  </PrivateRoute>
                } 
              />
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
