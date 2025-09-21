import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! 👋 I'm your maternal health assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Build request body
      const body = {
        message: input,
        session_id: sessionId,  // null for first message
        patient_id: 'demo_user', // Add patient_id
        // latitude and longitude can be added here if available
      };

      console.log('Sending chat request:', body);
      console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000');

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const text = await response.text();
        console.error('API Error:', text);
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      // Update session ID
      if (!sessionId && data.session_id) setSessionId(data.session_id);

      // Add AI reply
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.reply || "⚠️ No response from AI." },
      ]);

      // Show nearby hospitals if available
      if (data.hospitals) {
        const hospitalText = data.hospitals.map((h) => h.name).join(", ");
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: `Nearby hospitals: ${hospitalText}` },
        ]);
      }
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `⚠️ Error: ${error.message}. Please check your connection and try again.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 text-white py-4 px-6 shadow">
        <h1 className="text-lg font-bold">AI Chat Assistant</h1>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl shadow ${
                msg.sender === "user"
                  ? "bg-purple-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 px-4 py-2 rounded-xl shadow animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="border-t p-4 bg-white flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="ml-3 bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </main>
  );
}
