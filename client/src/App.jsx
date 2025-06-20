import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
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
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          🏠 Shelter Surfing
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Connecting shelter hosts with seekers in need
        </p>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Welcome to Shelter Surfing
          </h2>
          <p className="text-gray-600 mb-4">
            This platform helps connect people offering temporary shelter with those seeking a place to stay.
          </p>
          <div className="flex gap-4">
            <a 
              href="/register"
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors text-center"
            >
              I Need Shelter
            </a>
            <a 
              href="/register"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center"
            >
              Offer Shelter
            </a>
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
