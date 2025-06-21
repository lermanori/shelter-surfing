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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the landing page if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background decoration - more subtle */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-accent-200/15 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-blue-600/20">
                <span className="text-3xl">🏠</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                Shelter Surfing
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Connecting communities through safe shelter and mutual support
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12 animate-slide-up">
            <div className="glass-strong rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-blue-600/20">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Safe Connections</h3>
              <p className="text-gray-600 text-sm">
                Connect with verified community members in a secure environment
              </p>
            </div>
            
            <div className="glass-strong rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-blue-600/20">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Support</h3>
              <p className="text-gray-600 text-sm">
                Find help in your area when you need it most
              </p>
            </div>
            
            <div className="glass-strong rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-blue-600/20">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Chat</h3>
              <p className="text-gray-600 text-sm">
                Communicate directly with hosts and seekers instantly
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center animate-slide-up">
            <div className="glass-strong rounded-2xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to get started?
              </h2>
              <p className="text-gray-600 mb-6">
                Join our community and start connecting with people in your area
              </p>
              
              <div className="space-y-3">
                <Link 
                  to="/register"
                  className="btn-primary w-full py-3 text-lg font-semibold"
                >
                  Get Started
                </Link>
                <Link 
                  to="/login"
                  className="btn-outline w-full py-3 text-lg font-semibold"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 animate-fade-in">
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <span>Safe</span>
              <span>•</span>
              <span>Secure</span>
              <span>•</span>
              <span>Community-driven</span>
            </div>
          </div>
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
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar />
            <NotificationToast />
            <main className="animate-fade-in">
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
              </Routes>
            </main>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
