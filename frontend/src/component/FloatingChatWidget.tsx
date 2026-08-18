import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../libs/api";
import { getSocket } from "../libs/socket";

interface MessageItem {
  id: number;
  conversationId: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export const FloatingChatWidget: React.FC = () => {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [guestName, setGuestName] = useState<string>("");
  const [isGuestNameSet, setIsGuestNameSet] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [isPeerTyping, setIsPeerTyping] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Initialize Conversation ID & Guest Name
  useEffect(() => {
    if (user) {
      setConversationId(`user_${user.id}`);
      setGuestName(user.name);
      setIsGuestNameSet(true);
    } else {
      let savedSessionId = localStorage.getItem("sagaramathi_chat_guestId");
      if (!savedSessionId) {
        savedSessionId = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        localStorage.setItem("sagaramathi_chat_guestId", savedSessionId);
      }
      setConversationId(savedSessionId);

      const savedGuestName = localStorage.getItem("sagaramathi_chat_guestName");
      if (savedGuestName) {
        setGuestName(savedGuestName);
        setIsGuestNameSet(true);
      }
    }
  }, [user]);

  // Connect to Socket.io WebSockets when chat is active
  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    const socket = getSocket();
    socket.emit("join_conversation", conversationId);

    const handleNewMessage = (newMsg: MessageItem) => {
      if (newMsg.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setIsPeerTyping(false);
      }
    };

    const handleTypingStatus = (data: { conversationId: string; isTyping: boolean }) => {
      if (data.conversationId === conversationId) {
        setIsPeerTyping(data.isTyping);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing_status", handleTypingStatus);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing_status", handleTypingStatus);
    };
  }, [isOpen, conversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isPeerTyping]);

  const fetchMessages = async () => {
    if (!conversationId) return;
    try {
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/chat/messages/${conversationId}`, { headers });
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data || []);
      }
    } catch (e) {
      console.error("Error fetching chat messages:", e);
    }
  };

  const handleStartGuestChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    localStorage.setItem("sagaramathi_chat_guestName", guestName.trim());
    setIsGuestNameSet(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Emit typing status to socket
    const socket = getSocket();
    socket.emit("typing", {
      conversationId,
      isTyping: true,
      senderName: user?.name || guestName || "Guest"
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        conversationId,
        isTyping: false,
        senderName: user?.name || guestName || "Guest"
      });
    }, 1500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId) return;

    const messageText = inputText.trim();
    setInputText("");

    const socket = getSocket();
    socket.emit("typing", {
      conversationId,
      isTyping: false,
      senderName: user?.name || guestName || "Guest"
    });

    // Send via socket for instant broadcast
    socket.emit("send_message", {
      conversationId,
      guestName: guestName || "Guest",
      message: messageText,
      senderId: user?.id,
      senderRole: user?.role || "GUEST",
      senderName: user?.name || guestName || "Guest"
    });

    // Fallback REST call for DB persistence guarantee
    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${API_BASE_URL}/chat/send`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          conversationId,
          guestName: guestName || "Guest",
          message: messageText,
        }),
      });
    } catch (e) {
      console.error("Error sending message via HTTP fallback:", e);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end print:hidden">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-surface rounded-3xl shadow-2xl border border-brand-1/15 overflow-hidden flex flex-col h-[480px] animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-brand-1 text-white flex items-center justify-between shadow-sm">
            <div>
              <h4 className="font-bold text-sm leading-tight">Sagaramati Chat</h4>
              <p className="text-[11px] text-white/80">Connect directly with temple administration</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>

          {/* Guest Name Prompt Form */}
          {!isGuestNameSet && !user ? (
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
              <h5 className="font-bold text-ink text-base mb-1">Welcome!</h5>
              <p className="text-xs text-subtle mb-5">
                Enter your name to communicate with the temple.
              </p>
              <form onSubmit={handleStartGuestChat} className="w-full space-y-3">
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your Name (e.g. Mr. Perera)"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-1/20 text-xs text-ink focus:outline-none focus:border-brand-1 bg-surface-2"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-1 hover:bg-brand-2 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Start Chat
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Message Thread */}
              <div
                ref={chatContainerRef}
                className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar bg-surface-2/30"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-subtle">
                    <p className="text-xs font-semibold text-ink mb-1">Send a message</p>
                    <p className="text-[11px]">The temple administration will reply to you shortly.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderRole === "ADMIN" || msg.senderRole === "SUPER_ADMIN";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
                      >
                        <div
                          className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs shadow-sm ${
                            isAdmin
                              ? "bg-brand-1 text-white rounded-tl-none"
                              : "bg-surface border border-brand-1/10 text-ink rounded-tr-none"
                          }`}
                        >
                          <p className="font-bold text-[10px] opacity-80 mb-0.5">
                            {isAdmin ? "Sagaramati Admin" : msg.senderName}
                          </p>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          <span className="block text-[9px] opacity-60 text-right mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                {isPeerTyping && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium italic px-2 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                    <span>Admin is typing a reply...</span>
                  </div>
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-brand-1/10 bg-surface flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs border border-brand-1/15 bg-surface-2 focus:outline-none focus:border-brand-1 text-ink"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2 bg-brand-1 hover:bg-brand-2 text-white font-bold text-xs rounded-xl shadow transition-all disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3 bg-brand-1 hover:bg-brand-2 text-white rounded-full shadow-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white"
        title="Chat with Admin"
      >
        {isOpen ? "Close" : "Chat"}
      </button>
    </div>
  );
};
