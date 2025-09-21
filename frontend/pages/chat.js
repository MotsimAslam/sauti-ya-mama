// frontend/chat.js
import { useState } from "react";

const API_BASE = "https://sauti-ya-mama.onrender.com"; 
// 👆 Replace with your actual Render backend URL

export default function Chat() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          patient_id: "demo_user",
          message: input,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      setSessionId(data.session_id);

      const botMessage = {
        role: "assistant",
        content: data.reply || "⚠️ No reply from server",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error: Failed to fetch reply." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container p-4 max-w-xl mx-auto">
      <div className="chat-box border rounded-lg p-4 h-96 overflow-y-auto bg-white shadow">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-2 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block px-3 py-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-gray-500 italic">Typing...</p>}
      </div>

      <div className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-grow border px-3 py-2 rounded-l-lg focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-pink-600 text-white rounded-r-lg hover:bg-pink-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
