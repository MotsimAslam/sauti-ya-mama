// frontend/components/ChatInterface.js
import { useState, useRef, useEffect } from "react";
import { Send, User, Bot } from "lucide-react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ChatInterface({ patientId = "anonymous" }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorBanner, setErrorBanner] = useState("");
  const messagesEndRef = useRef(null);

  // Get user location once (ask for permission)
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        (err) => {
          // don't spam the console; save short message
          console.warn("Location error:", err?.message || err);
        },
        { enableHighAccuracy: true, maximumAge: 5 * 60 * 1000 }
      );
    }
  }, []);

  // Initialize chat session when component mounts or patientId changes
  useEffect(() => {
    initializeChatSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const initializeChatSession = async () => {
    try {
      // POST with query param patient_id (keeps FastAPI compatibility)
      const res = await axios.post(`${API_BASE}/api/chat/initialize`, null, {
        params: { patient_id: patientId },
      });

      // API expected to return { session_id: "..." } or similar
      const sid = res?.data?.session_id || res?.data?.sessionId || null;
      setSessionId(sid);

      setMessages([
        {
          role: "assistant",
          content: "👋 Hello! I'm your maternal health assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Error initializing chat:", err);
      setErrorBanner("Unable to start chat session. The assistant may be offline.");
      // still allow chat, backend will create session on message if needed
      setMessages([
        {
          role: "assistant",
          content: "👋 Hello! I'm your maternal health assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ]);
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

    setErrorBanner("");
    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const payload = {
        session_id: sessionId,
        patient_id: patientId,
        message: inputMessage,
        // send numeric lat/lng if available (backend expects latitude, longitude fields)
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
      };

      const res = await axios.post(`${API_BASE}/api/chat/message`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const data = res.data || {};

      // AI reply text (backend returns `response`)
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            timestamp: data.timestamp || new Date().toISOString(),
          },
        ]);
      } else if (data.reply) {
        // fallback if older backend returns `reply`
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            timestamp: data.timestamp || new Date().toISOString(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ No response from assistant.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }

      // Nearby hospitals (backend uses key `nearby_hospitals`)
      const hospitals = data.nearby_hospitals || data.hospitals || null;
      if (hospitals && Array.isArray(hospitals) && hospitals.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "hospitals",
            hospitals,
            timestamp: new Date().toISOString(),
          },
        ]);
      }

      // If backend returned a new session_id (sometimes created), keep it
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setErrorBanner("Failed to send message — please check your connection.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-pink-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Maternal Health Assistant</h3>
            <p className="text-sm text-gray-600">Ask about symptoms, nutrition, or nearby clinics 🏥</p>
          </div>
          <div className="text-sm text-gray-500">
            {sessionId ? <span>Session: {sessionId.slice(0, 8)}</span> : <span>Not connected</span>}
          </div>
        </div>
        {errorBanner && (
          <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded">{errorBanner}</div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message, index) => {
          // hospitals table message
          if (message.type === "hospitals" && Array.isArray(message.hospitals)) {
            return (
              <div key={index} className="bg-gray-50 border rounded-lg p-3 shadow-sm">
                <h4 className="text-md font-bold mb-2 text-gray-800">Nearby Hospitals & Clinics</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 border">Name</th>
                        <th className="px-3 py-2 border">Address</th>
                        <th className="px-3 py-2 border">Rating</th>
                        <th className="px-3 py-2 border">Reviews</th>
                        <th className="px-3 py-2 border">Distance (km)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {message.hospitals.map((h, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-2 border">{h.name}</td>
                          <td className="px-3 py-2 border">{h.address || h.vicinity || "-"}</td>
                          <td className="px-3 py-2 border">{h.rating ?? "N/A"}</td>
                          <td className="px-3 py-2 border">{h.user_ratings_total ?? 0}</td>
                          <td className="px-3 py-2 border">{h.distance_km ?? (h.distance?.toFixed ? h.distance.toFixed(2) : "-")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">Tap a clinic to get directions in your maps app (coming soon).</p>
              </div>
            );
          }

          // normal chat bubble
          return (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow whitespace-pre-line ${
                  message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === "user" ? <User size={16} className="mr-2" /> : <Bot size={16} className="mr-2" />}
                  <span className="text-sm font-medium">{message.role === "user" ? "You" : "Health Assistant"}</span>
                </div>
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 block mt-1">{new Date(message.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg inline-flex items-center">
              <Bot size={16} className="mr-2" /> Thinking...
              <div className="flex space-x-1 ml-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
        <p className="text-xs text-gray-500 mt-2">You can ask about symptoms, nutrition, or type "Find nearby hospitals".</p>
      </div>
    </div>
  );
}
