import React, { useState, useEffect, useRef } from "react";

const DeepSeek = ({
  defaultGreeting = "Xin chào! Tôi có thể giúp gì cho bạn? 😊",
  defaultSystemPrompt = "Bạn là một trợ lý ảo hữu ích. Hãy trả lời cực kỳ ngắn gọn và tập trung những ý chính, hãy phản hồi theo cách thân thiện, vui tươi và tạo một số icon để trông thích mắt hơn.",
}) => {
  // Load saved settings from localStorage or use defaults
  const [showChatbot, setShowChatbot] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [greetingFile, setGreetingFile] = useState(null);
  const [promptFile, setPromptFile] = useState(null);

  // Load saved data from localStorage
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("chatbotSettings");
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          greeting: defaultGreeting,
          systemPrompt: defaultSystemPrompt,
          conversation: [{ role: "assistant", content: defaultGreeting }],
        };
  });

  const { greeting, systemPrompt, conversation } = settings;
  const messagesEndRef = useRef(null);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatbotSettings", JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem(
      "chatbotAdminConversation",
      JSON.stringify(conversation)
    );
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Thêm các hàm xử lý reset chat
  const resetChat = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    updateSettings({
      conversation: [{ role: "assistant", content: greeting }],
    });
    setShowResetConfirm(false);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const handleGreetingFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      updateSettings({ greeting: e.target.result });
    };
    reader.readAsText(file);
    setGreetingFile(file.name);
  };

  const handlePromptFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      updateSettings({ systemPrompt: e.target.result });
    };
    reader.readAsText(file);
    setPromptFile(file.name);
  };

  const resetGreeting = () => {
    updateSettings({ greeting: defaultGreeting });
    setGreetingFile(null);
  };

  const resetPrompt = () => {
    updateSettings({ systemPrompt: defaultSystemPrompt });
    setPromptFile(null);
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };

      // If greeting changed and it's the first message, update conversation
      if (
        newSettings.greeting &&
        prev.conversation.length === 1 &&
        prev.conversation[0].role === "assistant"
      ) {
        updated.conversation = [
          { role: "assistant", content: newSettings.greeting },
        ];
      }

      return updated;
    });
  };

  const saveSettings = () => {
    setShowSettings(false);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = { role: "user", content: userInput };
    updateSettings({
      conversation: [...conversation, userMessage],
    });
    setUserInput("");
    setIsLoading(true);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization:
            "Bearer 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",
          "HTTP-Referer": "https://www.sitename.com",
          "X-Title": "SiteName",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
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
      const botResponse =
        data.choices?.[0]?.message?.content ||
        "Xin lỗi, tôi không hiểu câu hỏi của bạn.";

      updateSettings({
        conversation: [
          ...conversation,
          userMessage,
          { role: "assistant", content: botResponse },
        ],
      });
    } catch (error) {
      updateSettings({
        conversation: [
          ...conversation,
          userMessage,
          { role: "assistant", content: `Lỗi: ${error.message}` },
        ],
      });
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
        {/* Chat Header - thêm nút làm mới */}
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

          <div>
            <button
              onClick={resetChat}
              style={{
                background: "none",
                border: "none",
                color: "#212529",
                fontSize: "20px",
                cursor: "pointer",
                opacity: 0.7,
                transition: "opacity 0.2s",
                marginRight: "10px",
              }}
              title="Làm mới chat"
            >
              🔄
            </button>
            <button
              onClick={toggleSettings}
              style={{
                background: "none",
                border: "none",
                color: "#212529",
                fontSize: "20px",
                cursor: "pointer",
                opacity: 0.7,
                transition: "opacity 0.2s",
                marginRight: "10px",
              }}
              title="Cài đặt"
            >
              ⚙️
            </button>
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
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#ffeeba",
              borderBottom: "1px solid #ffc107",
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: "15px" }}>
              Cài đặt Chatbot
            </h4>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Lời chào:
              </label>
              <textarea
                value={greeting}
                onChange={(e) => updateSettings({ greeting: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ffc107",
                  minHeight: "60px",
                  marginBottom: "5px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <input
                  type="file"
                  id="greetingFile"
                  accept=".txt"
                  onChange={handleGreetingFileChange}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="greetingFile"
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#ffc107",
                    color: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    marginRight: "10px",
                  }}
                >
                  Chọn file
                </label>
                {greetingFile && (
                  <span style={{ fontSize: "12px", marginRight: "10px" }}>
                    {greetingFile}
                  </span>
                )}
                <button
                  onClick={resetGreeting}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Mặc định
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Hướng dẫn hệ thống:
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) =>
                  updateSettings({ systemPrompt: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ffc107",
                  minHeight: "80px",
                  marginBottom: "5px",
                }}
              />
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="file"
                  id="promptFile"
                  accept=".txt"
                  onChange={handlePromptFileChange}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="promptFile"
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#ffc107",
                    color: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    marginRight: "10px",
                  }}
                >
                  Chọn file
                </label>
                {promptFile && (
                  <span style={{ fontSize: "12px", marginRight: "10px" }}>
                    {promptFile}
                  </span>
                )}
                <button
                  onClick={resetPrompt}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Mặc định
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={toggleSettings}
                style={{
                  padding: "5px 15px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                Hủy
              </button>
              <button
                onClick={saveSettings}
                style={{
                  padding: "5px 15px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        )}

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
            position: "relative",
          }}
        >
          <div ref={messagesEndRef} />

          {/* Popup xác nhận - sửa lại vị trí */}
          {showResetConfirm && (
            <div
              style={{
                position: "fixed", // Thay từ absolute thành fixed
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "12px",
                maxWidth: "80%",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                textAlign: "center",
                zIndex: 1001,
              }}
            >
              <h4 style={{ marginTop: 0, color: "#333" }}>Xác nhận làm mới</h4>
              <p style={{ marginBottom: "20px" }}>
                Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <button
                  onClick={confirmReset}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ffc107",
                    color: "#212529",
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Xác nhận
                </button>
                <button
                  onClick={cancelReset}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f0f0f0",
                    color: "#333",
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                  }}
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          )}

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
