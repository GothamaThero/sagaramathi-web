import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../libs/api";
import { getSocket } from "../../libs/socket";

interface ConversationItem {
  conversationId: string;
  lastMessage: string;
  lastSenderName: string;
  lastSenderRole: string;
  updatedAt: string;
  unreadCount: number;
}

interface MessageItem {
  id: number;
  conversationId: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export const AdminChatScreen: React.FC = () => {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [replyText, setReplyText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isPeerTyping, setIsPeerTyping] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const selectedConvRef = useRef<ConversationItem | null>(null);

  useEffect(() => {
    selectedConvRef.current = selectedConversation;
  }, [selectedConversation]);

  // Connect to Socket.io WebSockets as Admin
  useEffect(() => {
    fetchConversations();

    const socket = getSocket();
    socket.emit("join_admin");

    const handleConversationUpdated = (data: { conversationId: string; lastMessage: string; lastSenderName: string; lastSenderRole: string; updatedAt: string; newMessage?: MessageItem }) => {
      fetchConversations();
      if (selectedConvRef.current && selectedConvRef.current.conversationId === data.conversationId && data.newMessage) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.newMessage!.id)) return prev;
          return [...prev, data.newMessage!];
        });
      }
    };

    const handleNewMessage = (newMsg: MessageItem) => {
      if (selectedConvRef.current && selectedConvRef.current.conversationId === newMsg.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setIsPeerTyping(false);
      }
    };

    const handleTypingStatus = (data: { conversationId: string; isTyping: boolean }) => {
      if (selectedConvRef.current && selectedConvRef.current.conversationId === data.conversationId) {
        setIsPeerTyping(data.isTyping);
      }
    };

    socket.on("conversation_updated", handleConversationUpdated);
    socket.on("new_message", handleNewMessage);
    socket.on("typing_status", handleTypingStatus);

    return () => {
      socket.off("conversation_updated", handleConversationUpdated);
      socket.off("new_message", handleNewMessage);
      socket.off("typing_status", handleTypingStatus);
    };
  }, [token]);

  // Join selected conversation room on change
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversationId);
      const socket = getSocket();
      socket.emit("join_conversation", selectedConversation.conversationId);
    }
  }, [selectedConversation, token]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPeerTyping]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setConversations(json.data || []);
      }
    } catch (e) {
      console.error("Error fetching conversations:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data || []);
      }

      // Mark as read
      await fetch(`${API_BASE_URL}/chat/read/${conversationId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConversations();
    } catch (e) {
      console.error("Error fetching messages:", e);
    }
  };

  const handleSelectConversation = (conv: ConversationItem) => {
    setSelectedConversation(conv);
    setIsPeerTyping(false);
    fetchMessages(conv.conversationId);
  };

  const handleReplyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value);

    if (!selectedConversation) return;
    const socket = getSocket();
    socket.emit("typing", {
      conversationId: selectedConversation.conversationId,
      isTyping: true,
      senderName: user?.name || "Admin"
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        conversationId: selectedConversation.conversationId,
        isTyping: false,
        senderName: user?.name || "Admin"
      });
    }, 1500);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation) return;

    const messageText = replyText.trim();
    setReplyText("");

    const socket = getSocket();
    socket.emit("typing", {
      conversationId: selectedConversation.conversationId,
      isTyping: false,
      senderName: user?.name || "Admin"
    });

    // Send via socket for instant broadcast
    socket.emit("send_message", {
      conversationId: selectedConversation.conversationId,
      guestName: user?.name || "Admin",
      message: messageText,
      senderId: user?.id,
      senderRole: user?.role || "ADMIN",
      senderName: user?.name || "Admin"
    });

    // Fallback REST call for DB persistence guarantee
    try {
      await fetch(`${API_BASE_URL}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: selectedConversation.conversationId,
          guestName: user?.name || "Admin",
          message: messageText,
        }),
      });
      fetchConversations();
    } catch (e) {
      console.error("Error sending reply via HTTP fallback:", e);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.lastSenderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.conversationId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            Live Chat Management
          </h1>
          <p className="text-xs text-subtle mt-1">
            Manage and reply to messages sent by guests and registered users.
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-surface rounded-3xl border border-brand-1/10 shadow-xl overflow-hidden flex flex-col md:flex-row h-[650px]">
        {/* Left Pane: Conversation List */}
        <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-brand-1/10 flex flex-col bg-surface-2/30">
          <div className="p-4 border-b border-brand-1/10">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full px-3.5 py-2 rounded-xl text-xs border border-brand-1/15 bg-surface text-ink focus:outline-none focus:border-brand-1"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-brand-1/5">
            {loading ? (
              <div className="p-8 text-center text-xs text-subtle">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-subtle">No conversations found.</div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.conversationId === conv.conversationId;
                const isGuest = conv.conversationId.startsWith("guest_");

                return (
                  <div
                    key={conv.conversationId}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-brand-1/10 border-l-4 border-brand-1"
                        : "hover:bg-surface-2/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-brand-1/15 flex items-center justify-center font-bold text-brand-1 text-xs shrink-0 uppercase">
                        {conv.lastSenderName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-ink text-xs truncate">{conv.lastSenderName}</h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              isGuest ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {isGuest ? "GUEST" : "USER"}
                          </span>
                        </div>
                        <p className="text-[11px] text-subtle truncate mt-0.5">{conv.lastMessage}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[9px] text-subtle">
                        {new Date(conv.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="mt-1 px-2 py-0.5 rounded-full bg-brand-1 text-white font-black text-[10px] shadow">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Messages & Admin Reply */}
        <div className="flex-1 flex flex-col bg-surface">
          {selectedConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-brand-1/10 bg-surface-2/40 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-ink text-sm flex items-center gap-2">
                    <span>{selectedConversation.lastSenderName}</span>
                    <span className="text-xs text-subtle font-mono">({selectedConversation.conversationId})</span>
                  </h3>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-3 bg-surface-2/20">
                {messages.map((msg) => {
                  const isAdmin = msg.senderRole === "ADMIN" || msg.senderRole === "SUPER_ADMIN";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs shadow-sm ${
                          isAdmin
                            ? "bg-brand-1 text-white rounded-tr-none"
                            : "bg-surface border border-brand-1/15 text-ink rounded-tl-none"
                        }`}
                      >
                        <p className="font-bold text-[10px] opacity-80 mb-0.5">
                          {isAdmin ? `Admin (${msg.senderName})` : msg.senderName}
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
                })}
                {isPeerTyping && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium italic px-2 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                    <span>User/Guest is typing a message...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-brand-1/10 bg-surface flex gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={handleReplyInputChange}
                  placeholder="Type your reply and press Enter..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs border border-brand-1/20 bg-surface-2 focus:outline-none focus:border-brand-1 text-ink"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-5 py-2.5 bg-brand-1 hover:bg-brand-2 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-40"
                >
                  Send Reply
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-subtle">
              <h3 className="font-bold text-ink text-base mb-1">Select a Conversation</h3>
              <p className="text-xs max-w-sm">
                Choose a user or guest from the left list to view and manage their messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
