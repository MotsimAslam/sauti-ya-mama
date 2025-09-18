import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Plus } from 'lucide-react';
import axios from 'axios';

export default function ChatInterface({ patientId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeChatSession();
  }, [patientId]);

  const initializeChatSession = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/chat/initialize', {
        patient_id: patientId
      });
      setSessionId(response.data.session_id);
      setMessages([{
        role: 'assistant',
        content: 'Hello! Im your maternal health assistant. How can I help you today?',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat/message', {
        session_id: sessionId,
        patient_id: patientId,
        message: inputMessage
      });

      if (response.data.response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.response,
          timestamp: response.data.timestamp
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="p-4 border-b bg-pink-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800">Maternal Health Assistant</h3>
        <p className="text-sm text-gray-600">Ask me anything about pregnancy and maternal health</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.role === 'user' ? (
                  <User size={16} className="mr-2" />
                ) : (
                  <Bot size={16} className="mr-2" />
                )}
                <span className="text-sm font-medium">
                  {message.role === 'user' ? 'You' : 'Health Assistant'}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70 block mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <Bot size={16} className="mr-2" />
                <span>Thinking...</span>
              </div>
              <div className="flex space-x-1 mt-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
            className="bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Ask about symptoms, nutrition, exercise, or any pregnancy-related concerns
        </p>
      </div>
    </div>
  );
}