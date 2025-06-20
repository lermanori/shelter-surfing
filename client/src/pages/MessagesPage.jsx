import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import Button from '../components/Button';
import { useNotifications } from '../hooks/useNotifications';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MessagesPage = () => {
  const { user, token } = useAuth();
  const { 
    isConnected, 
    joinConversation, 
    leaveConversation, 
    sendTyping, 
    sendStopTyping,
    typingUsers 
  } = useSocket();
  const { refreshCounts } = useNotifications();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchConversations();
  }, [user, navigate]);

  useEffect(() => {
    if (conversationId) {
      // Join the conversation room for real-time updates
      joinConversation(conversationId);
      
      // Check if this is a new conversation from navigation state
      if (location.state?.recipientId && location.state?.recipientName) {
        setCurrentConversation({
          conversationId,
          otherUser: {
            id: location.state.recipientId,
            name: location.state.recipientName
          }
        });
        // Clear the navigation state
        navigate(`/messages/${conversationId}`, { replace: true });
      } else {
        fetchMessages(conversationId);
      }
    }

    // Cleanup: leave conversation when component unmounts or conversation changes
    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, location.state, navigate, joinConversation, leaveConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Refresh notification counts when messages are viewed
  useEffect(() => {
    if (messages.length > 0) {
      refreshCounts();
    }
  }, [messages, refreshCounts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch conversations');
      }

      setConversations(data.data.conversations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${convId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      setMessages(data.data.messages || []);
      
      // Find the current conversation
      const conversation = conversations.find(c => c.conversationId === convId);
      setCurrentConversation(conversation);
    } catch (err) {
      setError(err.message);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    setIsSending(true);
    setError('');

    // Stop typing indicator
    if (currentConversation?.otherUser?.id) {
      sendStopTyping(currentConversation.otherUser.id, conversationId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: currentConversation.otherUser.id,
          text: newMessage.trim(),
          conversationId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add the new message to the list (Socket.IO will handle real-time updates)
      setMessages(prev => [...prev, data.data.message]);
      setNewMessage('');
      
      // Update conversations list with new message
      fetchConversations();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (currentConversation?.otherUser?.id) {
      // Send typing indicator
      sendTyping(currentConversation.otherUser.id, conversationId);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        sendStopTyping(currentConversation.otherUser.id, conversationId);
      }, 1000);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const startNewConversation = (recipientId, recipientName) => {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    navigate(`/messages/${conversationId}`);
    setCurrentConversation({
      conversationId,
      otherUser: { id: recipientId, name: recipientName }
    });
  };

  // Check if someone is typing in current conversation
  const isSomeoneTyping = typingUsers[conversationId] && 
    typingUsers[conversationId] !== user.id;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="mt-2 text-gray-600">
                Communicate with hosts and seekers
                {!isConnected && (
                  <span className="ml-2 text-sm text-red-600">
                    (Connecting...)
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <div className="flex h-96">
              {/* Conversations Sidebar */}
              <div className="w-1/3 border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Conversations</h3>
                </div>
                
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-gray-600">No conversations yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Start a conversation from a shelter match or request
                    </p>
                  </div>
                ) : (
                  <div className="overflow-y-auto h-full">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.conversationId}
                        onClick={() => navigate(`/messages/${conversation.conversationId}`)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          conversationId === conversation.conversationId ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">
                                {conversation.otherUser.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {conversation.otherUser.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.lastMessage.text}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {formatDate(conversation.lastMessage.createdAt)}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 flex flex-col">
                {conversationId && currentConversation?.otherUser ? (
                  <>
                    {/* Conversation Header */}
                    <Link 
                      to={`/user/${currentConversation.otherUser.id}`} 
                      className="block p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-lg font-bold text-blue-600">
                            {currentConversation.otherUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {currentConversation.otherUser.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Click to view profile
                          </p>
                        </div>
                      </div>
                    </Link>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === user.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatDate(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Typing indicator */}
                      {isSomeoneTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                            <p className="text-sm italic text-gray-500">
                              {currentConversation?.otherUser.name} is typing...
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <form onSubmit={sendMessage} className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={handleTyping}
                          placeholder="Type your message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSending}
                        />
                        <Button
                          type="submit"
                          loading={isSending}
                          disabled={!newMessage.trim()}
                          variant="primary"
                        >
                          Send
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💬</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                      <p className="text-gray-600">
                        Choose a conversation from the sidebar to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 