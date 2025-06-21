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
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group" onClick={closeMenus}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 group-hover:shadow-lg transition-all duration-300 border border-blue-600/20">
                <span className="text-white text-xl">🏠</span>
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-all duration-300">
                Shelter Surfing
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive('/dashboard') 
                      ? 'bg-blue-100/80 text-blue-700 shadow-md backdrop-blur-sm border border-blue-200/50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50 backdrop-blur-sm'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/matches"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive('/matches') 
                      ? 'bg-blue-100/80 text-blue-700 shadow-md backdrop-blur-sm border border-blue-200/50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50 backdrop-blur-sm'
                  }`}
                >
                  Matches
                </Link>
                <Link
                  to="/messages"
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive('/messages') 
                      ? 'bg-blue-100/80 text-blue-700 shadow-md backdrop-blur-sm border border-blue-200/50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50 backdrop-blur-sm'
                  }`}
                >
                  Messages
                  <NotificationBadge count={unreadCount} />
                </Link>
                <Link
                  to="/connections/requests"
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive('/connections/requests') 
                      ? 'bg-blue-100/80 text-blue-700 shadow-md backdrop-blur-sm border border-blue-200/50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50 backdrop-blur-sm'
                  }`}
                >
                  Connections
                  <NotificationBadge count={connectionRequestsCount} />
                </Link>
                {user?.role === 'HOST' ? (
                  <Link
                    to="/shelter/new"
                    className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-medium px-4 py-2 rounded-xl transition-all duration-300 shadow-md border border-green-500/20 ml-3 text-sm"
                  >
                    Offer Shelter
                  </Link>
                ) : (
                  <Link
                    to="/request/new"
                    className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-medium px-4 py-2 rounded-xl transition-all duration-300 shadow-md border border-green-500/20 ml-3 text-sm"
                  >
                    Request Shelter
                  </Link>
                )}

                {/* Profile Menu (Desktop) */}
                <div className="relative ml-3">
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-white/50 transition-all duration-300 focus:outline-none backdrop-blur-sm"
                  >
                    {user?.profileImage1 ? (
                      <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md border border-blue-600/20">
                        <img
                          src={user.profileImage1}
                          alt={`${user.name} - Profile`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md border border-blue-600/20 hover:shadow-lg transition-all duration-300">
                        <span className="text-white font-semibold text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-lg py-2 border border-white/20">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.role}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/50 hover:text-blue-600 transition-all duration-300 backdrop-blur-sm"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50/50 hover:text-red-600 transition-all duration-300 backdrop-blur-sm"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-all duration-300 shadow-md border border-blue-600/20 ml-3 text-sm"
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
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-white/50 focus:outline-none transition-all duration-300 backdrop-blur-sm"
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
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="px-3 py-3 border-b border-white/10 mb-2">
                  <div className="flex items-center space-x-3">
                    {user?.profileImage1 ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md border border-blue-600/20">
                        <img
                          src={user.profileImage1}
                          alt={`${user.name} - Profile`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md border border-blue-600/20">
                        <span className="text-white font-semibold text-lg">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActive('/dashboard') 
                      ? 'bg-blue-100/80 text-blue-700 border border-blue-200/50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                  onClick={closeMenus}
                >
                  Dashboard
                </Link>
                <Link
                  to="/matches"
                  className={`block px-3 py-2 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActive('/matches') 
                      ? 'bg-blue-100/80 text-blue-700 border border-blue-200/50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                  onClick={closeMenus}
                >
                  Matches
                </Link>
                <Link
                  to="/messages"
                  className={`block px-3 py-2 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActive('/messages') 
                      ? 'bg-blue-100/80 text-blue-700 border border-blue-200/50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                  onClick={closeMenus}
                >
                  <div className="flex justify-between items-center">
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-200/80 text-red-600 px-2 py-1 rounded-full text-xs font-medium border border-red-300/50">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
                <Link
                  to="/connections/requests"
                  className={`block px-3 py-2 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActive('/connections/requests') 
                      ? 'bg-blue-100/80 text-blue-700 border border-blue-200/50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                  onClick={closeMenus}
                >
                  <div className="flex justify-between items-center">
                    <span>Connection Requests</span>
                    {connectionRequestsCount > 0 && (
                      <span className="bg-red-200/80 text-red-600 px-2 py-1 rounded-full text-xs font-medium border border-red-300/50">
                        {connectionRequestsCount}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Action Button */}
                {user?.role === 'HOST' ? (
                  <Link
                    to="/shelter/new"
                    className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl transition-all duration-300 shadow-md border border-green-500/20"
                    onClick={closeMenus}
                  >
                    Offer Shelter
                  </Link>
                ) : (
                  <Link
                    to="/request/new"
                    className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl transition-all duration-300 shadow-md border border-green-500/20"
                    onClick={closeMenus}
                  >
                    Request Shelter
                  </Link>
                )}

                {/* Profile & Logout */}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-xl text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-white/50"
                    onClick={closeMenus}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-xl text-base font-medium text-red-500 hover:bg-red-100/50 hover:text-red-600"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Non-authenticated user menu */}
                <div className="px-3 py-3 border-b border-white/10 mb-2">
                  <p className="text-sm font-medium text-gray-900">Welcome to Shelter Surfing</p>
                  <p className="text-xs text-gray-500">Connect with hosts and seekers</p>
                </div>
                
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-xl text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-white/50"
                  onClick={closeMenus}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl transition-all duration-300 shadow-md border border-blue-600/20"
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