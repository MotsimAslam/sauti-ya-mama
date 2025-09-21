// pages/chat.js
import { useState, useEffect } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [patientId] = useState("demo_user");
  const [location, setLocation] = useState({ lat: null, lng: null });

  // -------------------------------
  // ✅ Get user geolocation
  // -------------------------------
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("⚠️ Location access denied:", err);
        }
      );
    }
  }, []);

  // -------------------------------
  // ✅ Initialize chat session
  // -------------------------------
  useEffect(() => {
    const initChat = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
    };
    initChat();
  }, [patientId]);

  // -------------------------------
  // ✅ Send user message
  // -------------------------------
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat UI
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          patient_id: patientId,
          message: input,
          latitude: location.lat,
          longitude: location.lng,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error: Failed to fetch reply." },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-xl font-bold text-pink-600 mb-4">Sauti Ya Mama Chat</h1>

        {/* Messages */}
        <div className="h-96 overflow-y-auto border p-4 rounded-lg mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 ${
                msg.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block px-4 py-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-pink-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-pink-600"
          />
          <button
            onClick={sendMessage}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
