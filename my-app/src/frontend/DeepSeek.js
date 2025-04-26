import React, { useState, useEffect, useRef } from "react";

const DeepSeek = ({ 
  initialGreeting = "Xin chào! Tôi có thể giúp gì cho bạn? 😊",
  systemPrompt = "Bạn là một trợ lý ảo hữu ích. Hãy trả lời cực kỳ ngắn gọn và tập trung những ý chính, hãy phản hồi theo cách thân thiện,vui tươi và tạo một số icon để trông thích mắt hơn.",
  onSendMessage // Callback khi gửi tin nhắn
}) => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState([
    {
      role: "assistant",
      content: initialGreeting,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Cập nhật lời chào khi initialGreeting thay đổi
  useEffect(() => {
    if (conversation.length === 1 && conversation[0].role === "assistant") {
      setConversation([{ role: "assistant", content: initialGreeting }]);
    }
  }, [initialGreeting]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = { role: "user", content: userInput };
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);
    setUserInput("");
    setIsLoading(true);

    try {
      // Sử dụng callback nếu được cung cấp
      if (onSendMessage) {
        const botResponse = await onSendMessage({
          userInput,
          conversation: newConversation,
          systemPrompt
        });
        
        setConversation(prev => [
          ...prev,
          { role: "assistant", content: botResponse }
        ]);
      } else {
        // Fallback nếu không có callback
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: "Bearer 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",
            "HTTP-Referer": "https://www.sitename.com",
            "X-Title": "SiteName",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-r1:free",
            messages: [
              { role: "system", content: systemPrompt },
              ...conversation.slice(-4).map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              { role: "user", content: userInput },
            ],
          }),
        });

        if (!res.ok) throw new Error(`Lỗi ${res.status}: ${res.statusText}`);

        const data = await res.json();
        const botResponse = data.choices?.[0]?.message?.content ||
          "Xin lỗi, tôi không hiểu câu hỏi của bạn.";

        setConversation(prev => [
          ...prev,
          { role: "assistant", content: botResponse },
        ]);
      }
    } catch (error) {
      setConversation(prev => [
        ...prev,
        { role: "assistant", content: `Lỗi: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="chatbot-toggle-btn"
        onClick={toggleChatbot}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#ffc107",
          color: "white",
          border: "none",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          transition: "all 0.3s ease",
          zIndex: 999,
        }}
      >
        {showChatbot ? "✖" : "💬"}
      </button>

      {/* Chatbot Modal */}
      <div
        className="chatbot-container"
        style={{
          position: "fixed",
          bottom: "30px",
          right: showChatbot ? "30px" : "-450px",
          width: "400px",
          height: "600px",
          borderRadius: "16px",
          backgroundColor: "#fff3cd",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          overflow: "hidden",
          zIndex: 1000,
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: "16px 20px",
            backgroundColor: "#ffc107",
            color: "#212529",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
              }}
            >
              🤖
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                Trợ Lý AI
              </h3>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>
                {isLoading ? "Đang trả lời..." : "Hoạt động"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleChatbot}
            style={{
              background: "none",
              border: "none",
              color: "#212529",
              fontSize: "20px",
              cursor: "pointer",
              opacity: 0.7,
              transition: "opacity 0.2s",
            }}
          >
            ✖
          </button>
        </div>

        {/* Messages Container */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            backgroundColor: "#fff3cd",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.role === "user" ? "user" : "bot"
              }`}
              style={{
                padding: "12px 16px",
                borderRadius: "18px",
                maxWidth: "80%",
                wordWrap: "break-word",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: message.role === "user" ? "#ffeeba" : "#fff",
                border:
                  message.role === "bot"
                    ? "1px solid #ffc107"
                    : "1px solid #ffeeba",
              }}
            >
              {message.content}
              {message.isLoading && (
                <span style={{ marginLeft: "8px" }}>...</span>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#fff3cd",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: "24px",
              backgroundColor: "#ffeeba",
              padding: "8px 16px",
            }}
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Nhập tin nhắn của bạn..."
              disabled={isLoading}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                padding: "8px 0",
                fontSize: "14px",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!userInput.trim() || isLoading}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor:
                  !userInput.trim() || isLoading ? "#d1d5db" : "#ffc107",
                color: "white",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  !userInput.trim() || isLoading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
            >
              {isLoading ? (
                <div
                  className="spinner"
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderRadius: "50%",
                    borderTopColor: "white",
                    animation: "spin 1s ease-in-out infinite",
                  }}
                ></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Thêm CSS cho animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default DeepSeek;
