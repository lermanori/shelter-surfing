import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationBadge from './NotificationBadge';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount, connectionRequestsCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setShowProfileMenu(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    setIsOpen(false);
  };

  const closeMenus = () => {
    setIsOpen(false);
    setShowProfileMenu(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMenus}>
              <span className="text-2xl sm:text-3xl mr-2">🏠</span>
              <span className="text-lg sm:text-xl font-bold text-gray-900">Shelter Surfing</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/dashboard') ? 'bg-gray-100' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/matches"
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/matches') ? 'bg-gray-100' : ''
                  }`}
                >
                  Matches
                </Link>
                <Link
                  to="/messages"
                  className={`relative text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/messages') ? 'bg-gray-100' : ''
                  }`}
                >
                  Messages
                  <NotificationBadge count={unreadCount} />
                </Link>
                <Link
                  to="/connections/requests"
                  className={`relative text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/connections/requests') ? 'bg-gray-100' : ''
                  }`}
                >
                  Connections
                  <NotificationBadge count={connectionRequestsCount} />
                </Link>
                {user?.role === 'HOST' ? (
                  <Link
                    to="/shelter/new"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Offer Shelter
                  </Link>
                ) : (
                  <Link
                    to="/request/new"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Request Shelter
                  </Link>
                )}

                {/* Profile Menu (Desktop) */}
                <div className="relative">
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.role}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 ${
                    isActive('/dashboard') ? 'bg-gray-100' : ''
                  }`}
                  onClick={closeMenus}
                >
                  Dashboard
                </Link>
                <Link
                  to="/matches"
                  className={`block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 ${
                    isActive('/matches') ? 'bg-gray-100' : ''
                  }`}
                  onClick={closeMenus}
                >
                  Matches
                </Link>
                <Link
                  to="/messages"
                  className={`block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 ${
                    isActive('/messages') ? 'bg-gray-100' : ''
                  }`}
                  onClick={closeMenus}
                >
                  <div className="flex justify-between items-center">
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
                <Link
                  to="/connections/requests"
                  className={`block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 ${
                    isActive('/connections/requests') ? 'bg-gray-100' : ''
                  }`}
                  onClick={closeMenus}
                >
                  <div className="flex justify-between items-center">
                    <span>Connection Requests</span>
                    {connectionRequestsCount > 0 && (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                        {connectionRequestsCount}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Action Button */}
                {user?.role === 'HOST' ? (
                  <Link
                    to="/shelter/new"
                    className="block px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    onClick={closeMenus}
                  >
                    Offer Shelter
                  </Link>
                ) : (
                  <Link
                    to="/request/new"
                    className="block px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    onClick={closeMenus}
                  >
                    Request Shelter
                  </Link>
                )}

                {/* Profile & Logout */}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={closeMenus}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Non-authenticated user menu */}
                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                  <p className="text-sm font-medium text-gray-900">Welcome to Shelter Surfing</p>
                  <p className="text-xs text-gray-500">Connect with hosts and seekers</p>
                </div>
                
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={closeMenus}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  onClick={closeMenus}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 