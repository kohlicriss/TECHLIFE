import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import { FiSmile, FiPaperclip, FiMic } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { Users } from "lucide-react";
import ForwardModal from "./ForwardModel";
import { type } from "@testing-library/user-event/dist/type";
import ManageGropModal from "./ManageGropModal";
import GroupInfoModal from "./GroupInfoModal";

function ChatWindow({
  selectedUser,
  setSelectedUser,
  messages,
  setMessages,
  users,
  groups,
  setGroups,
}) {
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [forwardingMsg, setForwardingMsg] = useState(null);
  const [contextMsg, setContextMsg] = useState(null);
  const currentUserId = 1; // assuming id with 1 admin is logged in
  const currentUser = users.find((u) => u.id === currentUserId);

  const ws = useRef(null);
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    clearSelections();
  }, [messages, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    ws.current = new WebSocket("wss://ws.postman-echo.com/raw");

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
    };

    ws.current.onmessage = (event) => {
      if (!selectedUser) return;

      if (selectedUser?.isGroup) {
        const groupMembers = (selectedUser.members || [])
          .map((id) => (users || []).find((u) => String(u.id) === String(id)))
          .filter(Boolean)
          .filter((u) => u.name !== "me");

        const randomMember =
          groupMembers.length > 0
            ? groupMembers[Math.floor(Math.random() * groupMembers.length)]
            : null;

        const typingName = randomMember?.name || "Someone";

        setTypingUser(typingName);
        setIsTyping(true);

        setTimeout(() => {
          const msg = {
            id: Date.now() + Math.random(),
            text: event.data,
            sender: typingName,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "text",
            read: selectedUser?.id === selectedUser.id,
          };

          setMessages((prev) => {
            const prevMsgs = prev[selectedUser.id] || [];
            return {
              ...prev,
              [selectedUser.id]: [...prevMsgs, msg],
            };
          });

          setIsTyping(false);
          setTypingUser("");
        }, 1000);
      } else {
        setTypingUser(selectedUser.name);
        setIsTyping(true);

        setTimeout(() => {
          const msg = {
            id: Date.now() + Math.random(),
            text: event.data,
            sender: selectedUser.name,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "text",
            read: selectedUser?.id === selectedUser.id,
          };

          setMessages((prev) => {
            const prevMsgs = prev[selectedUser.id] || [];
            return {
              ...prev,
              [selectedUser.id]: [...prevMsgs, msg],
            };
          });

          setIsTyping(false);
          setTypingUser("");
        }, 1000);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      ws.current.close();
    };
  }, [selectedUser, users]);

  const sendMessage = () => {
    if (!input.trim() || !selectedUser) return;

    if (editingMsg) {
      setMessages((prev) => {
        const updated = prev[selectedUser.id].map((m) =>
          m === editingMsg ? { ...m, text: input, edited: true } : m
        );
        return { ...prev, [selectedUser.id]: updated };
      });
      setEditingMsg(null);
      setInput("");
      return;
    }

    if (forwardingMsg) {
      const msg = {
        ...forwardingMsg,
        sender: "me",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      addMessage(msg);
      setForwardingMsg(null);
      return;
    }

    const msg = {
      id: Date.now() + Math.random(),
      text: input,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "text",
      replyTo: replyTo
        ? { id: replyTo.id, text: replyTo.text, sender: replyTo.sender }
        : null,
      pinned: false,
    };

    ws.current.send(input);
    addMessage(msg);

    setInput("");
    setReplyTo(null);
  };

  const addSystemMessage = (text) => {
    const msg = {
      id: Date.now() + Math.random(),
      text,
      type: "group-event",
    };

    setMessages((prev) => {
      const prevMsgs = prev[selectedUser.id] || [];
      return {
        ...prev,
        [selectedUser.id]: [...prevMsgs, msg],
      };
    });
  };

  const addMessage = (msg) => {
    setMessages((prev) => {
      const prevMsgs = prev[selectedUser.id] || [];
      return {
        ...prev,
        [selectedUser.id]: [...prevMsgs, msg],
      };
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();
    const isImage = file.type.startsWith("image/");
    const isPDF = fileExtension === "pdf";
    const isWord = ["doc", "docx"].includes(fileExtension);
    const isExcel = ["xls", "xlsx"].includes(fileExtension);

    const msg = {
      id: Date.now() + Math.random(),
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: isImage ? "image" : "file",
      url: URL.createObjectURL(file),
      filename: file.name,
      filetype: isPDF ? "pdf" : isWord ? "word" : isExcel ? "excel" : "other",
      filesize: `${Math.round(file.size / 1024)} KB`,
      pinned: false,
    };

    addMessage(msg);
    ws.current.send(`[File Sent: ${file.name}]`);
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const startRecording = async () => {
    if (!selectedUser) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);

        stream.getTracks().forEach((track) => track.stop());

        const msg = {
          id: Date.now() + Math.random(),
          sender: "me",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "audio",
          url,
          pinned: false,
        };

        addMessage(msg);
        ws.current.send(`[Voice Message]`);
        setIsTyping(true);
      };

      recorder.start();
    } catch (error) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
    setContextMsg(null);
  };

  const handleForward = (msg) => {
    setForwardingMsg(msg);
    setShowForwardModal(true);
    setContextMsg(null);
  };

  const handleForwardTo = (target) => {
    const msg = {
      ...forwardingMsg,
      id: Date.now() + Math.random(),
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isForwarded: true,
    };

    setMessages((prev) => {
      const prevMsgs = prev[target.id] || [];
      return {
        ...prev,
        [target.id]: [...prevMsgs, msg],
      };
    });

    setShowForwardModal(false);
    setForwardingMsg(null);
  };

  const handlePinToggle = (msg) => {
    const updated = (messages[selectedUser.id] || []).map((m) =>
      m === msg ? { ...m, pinned: !m.pinned } : m
    );
    setMessages((prev) => ({ ...prev, [selectedUser.id]: updated }));
    setContextMsg(null);
  };

  const handleEdit = (msg) => {
    setEditingMsg(msg);
    setInput(msg.text);
    setContextMsg(null);
  };

  const handleDeleteForMe = (msg) => {
    const updated = (messages[selectedUser.id] || []).filter((m) => m !== msg);
    setMessages((prev) => ({ ...prev, [selectedUser.id]: updated }));
    setContextMsg(null);
  };

  const handleDeleteForEveryone = (msg) => {
    const updated = (messages[selectedUser.id] || []).map((m) =>
      m === msg
        ? {
            ...m,
            text: "This message was deleted",
            type: "text",
            deleted: true,
          }
        : m
    );
    setMessages((prev) => ({ ...prev, [selectedUser.id]: updated }));
    setContextMsg(null);
  };

  const clearSelections = () => {
    setReplyTo(null);
    setEditingMsg(null);
    setForwardingMsg(null);
    setContextMsg(null);
    setShowEmoji(false);
  };

  const currentMessages = selectedUser ? messages[selectedUser.id] || [] : [];

  const myMessages = currentMessages.filter((m) => m.sender === "me");
  const lastMyMessage =
    myMessages.length > 0 ? myMessages[myMessages.length - 1] : null;

  const hasReplyToLastMyMessage = currentMessages.some(
    (m) => m.replyTo?.id === lastMyMessage?.id && m.sender !== "me"
  );

  const pinnedMessages = currentMessages.filter((m) => m.pinned);
  const normalMessages = currentMessages
    .filter((m) => !m.pinned)
    .sort((a, b) => {
      const aTime = a.timestamp || a.time || a.id;
      const bTime = b.timestamp || b.time || b.id;
      return new Date(aTime) - new Date(bTime);
    });

  const groupMessagesByDate = (messages) => {
    const groups = {};
    let lastDateStr = null;
    let lastTimestamp = null;
    messages.forEach((msg, idx) => {
      let dateStr;
      if (msg.timestamp) {
        dateStr = new Date(msg.timestamp).toDateString();
        lastTimestamp = msg.timestamp;
      } else if (msg.type === "group-event" && lastTimestamp) {
        dateStr = new Date(lastTimestamp).toDateString();
      } else if (msg.time) {
        const d = new Date();
        dateStr = d.toDateString();
      } else {
        dateStr = lastDateStr || new Date().toDateString();
      }
      lastDateStr = dateStr;
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(msg);
    });
    return groups;
  };

  const groupedNormalMessages = groupMessagesByDate(normalMessages);

  const handleBackgroundClick = (e) => {
    if (e.target.id === "chatBody") {
      clearSelections();
    }
  };

  const handleAddUserToGroup = (userId, groupId) => {
    const group = groups.find((g) => g.id === groupId);
    const user = users.find((u) => u.id === userId);
    const admin = users.find((u) => group.adminIds?.includes(u.id));

    if (!group || !user || !admin) return;

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      if (selectedUser?.id === groupId) {
        setSelectedUser({ ...group });
        addSystemMessage(`${admin.name} added ${user.name}`);
      }
    }
  };

  const handleRemoveUserFromGroup = (userId, groupId) => {
    const group = groups.find((g) => g.id === groupId);
    const user = users.find((u) => u.id === userId);
    const admin = users.find((u) => group.adminIds?.includes(u.id));

    if (!group || !user || !admin) return;

    if (group.members.includes(userId)) {
      group.members = group.members.filter((id) => id !== userId);
      if (selectedUser?.id === groupId) {
        setSelectedUser({ ...group });
        addSystemMessage(`${admin.name} removed ${user.name}`);
      }
    }
  };

  const handleUpdateGroupName = (groupId, newName) => {
    setGroups((prevGroups) =>
      prevGroups.map((g) => (g.id === groupId ? { ...g, name: newName } : g))
    );

    if (selectedUser?.id === groupId) {
      setSelectedUser((prev) => ({ ...prev, name: newName }));
    }
  };

  const handleUpdateGroupImage = (groupId, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedImage = reader.result;

      const updatedGroups = groups.map((g) =>
        g.id === groupId ? { ...g, imageUrl: updatedImage } : g
      );
      setGroups(updatedGroups);

      if (selectedUser?.id === groupId) {
        setSelectedUser((prev) => ({ ...prev, imageUrl: updatedImage }));
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleGroupDescriptionUpdate = (groupId, newDescription) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, description: newDescription } : group
      )
    );

    if (selectedUser?.id === groupId) {
      setSelectedUser((prev) => ({ ...prev, description: newDescription }));
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col ${
        !selectedUser ? "hidden md:flex" : "flex"
      }`}
    >
      {!selectedUser ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-400">
            Select a user to start chatting
          </p>
        </div>
      ) : (
        <>
          <ChatHeader
            selectedUser={selectedUser}
            isGroup={selectedUser?.isGroup}
            onClearChat={() => {
              setMessages((prev) => ({
                ...prev,
                [selectedUser.id]: [],
              }));
              clearSelections();
            }}
            onBack={() => {
              setSelectedUser(null);
              clearSelections();
            }}
            onGroupInfo={() => setShowGroupInfoModal(true)}
          />

          <div
            id="chatBody"
            className="flex-1 bg-gray-50 p-4 overflow-y-auto"
            onClick={handleBackgroundClick}
          >
            {pinnedMessages.length > 0 && (
              <div className="sticky top-0 z-10 bg-gray-50 pb-2">
                <div className="flex flex-col items-center mb-4">
                  <p className="text-xs text-gray-500 mb-1">
                    📌 Pinned Messages
                  </p>
                  {pinnedMessages.map((msg, index) => (
                    <div className="flex" key={"pin-" + index}>
                      <MessageBubble
                        msg={msg}
                        onReply={() => handleReply(msg)}
                        onForward={() => handleForward(msg)}
                        onPinToggle={() => handlePinToggle(msg)}
                        onEdit={() => handleEdit(msg)}
                        onDeleteForMe={() => handleDeleteForMe(msg)}
                        onDeleteForEveryone={() => handleDeleteForEveryone(msg)}
                        isContextOpen={contextMsg === msg}
                        setContextMsg={setContextMsg}
                        isLastSentByMe={msg === lastMyMessage}
                        selectedUser={selectedUser}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.entries(groupedNormalMessages).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex justify-center my-2">
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full shadow">
                    {date}
                  </span>
                </div>
                {msgs.map((msg, index) => {
                  if (msg.type === "group-event") {
                    return (
                      <div
                        key={"event-" + index + date}
                        className="text-center text-xs text-gray-600 my-2"
                      >
                        {msg.text}
                      </div>
                    );
                  }
                  return (
                    <MessageBubble
                      key={"msg-" + index + date}
                      msg={msg}
                      onReply={() => handleReply(msg)}
                      onForward={() => handleForward(msg)}
                      onPinToggle={() => handlePinToggle(msg)}
                      onEdit={() => handleEdit(msg)}
                      onDeleteForMe={() => handleDeleteForMe(msg)}
                      onDeleteForEveryone={() => handleDeleteForEveryone(msg)}
                      isContextOpen={contextMsg === msg}
                      setContextMsg={setContextMsg}
                      isLastSentByMe={msg === lastMyMessage}
                      selectedUser={selectedUser}
                    />
                  );
                })}
              </div>
            ))}

            {isTyping && (
              <div
                className={`text-xs italic mb-2 ${
                  selectedUser ? "text-gray-500" : ""
                }`}
              >
                {selectedUser?.isGroup
                  ? `${typingUser} is typing...`
                  : "typing..."}
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          {(replyTo || forwardingMsg) && (
            <div className="flex items-center gap-2 px-4 py-1.5 border-l-4 border-blue-500 bg-blue-50">
              <div className="flex-1">
                <p className="text-xs text-gray-500">
                  {replyTo ? "Replying to" : "Forwarding"}
                </p>
                <p className="text-xs">
                  {replyTo?.text ||
                    forwardingMsg?.text ||
                    forwardingMsg?.filename}
                </p>
              </div>
              <button onClick={clearSelections} className="text-gray-500">
                ✕
              </button>
            </div>
          )}

          <div className="bg-white border-t border-gray-200 p-2 flex items-center gap-2 relative">
            <button onClick={() => setShowEmoji(!showEmoji)}>
              <FiSmile className="text-xl text-gray-500" />
            </button>

            <button onClick={() => fileInputRef.current.click()}>
              <FiPaperclip className="text-xl text-gray-500" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
            </button>

            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            {input.trim() ? (
              <button
                onClick={sendMessage}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
              >
                <IoSend className="text-lg" />
              </button>
            ) : (
              <button
                onClick={mediaRecorder ? stopRecording : startRecording}
                className={`text-xl ${
                  mediaRecorder ? "text-red-500" : "text-gray-500"
                }`}
              >
                <FiMic />
              </button>
            )}
          </div>

          {showEmoji && (
            <div className="absolute bottom-20 left-10 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          {showForwardModal && (
            <ForwardModal
              users={users}
              groups={groups}
              onForwardTo={handleForwardTo}
              onClose={() => {
                setShowForwardModal(false);
                setForwardingMsg(null);
              }}
            />
          )}

          {showManageModal && (
            <ManageGropModal
              group={selectedUser}
              users={users}
              onAdd={handleAddUserToGroup}
              onRemove={handleRemoveUserFromGroup}
              onClose={() => setShowManageModal(false)}
            />
          )}

          {showGroupInfoModal && selectedUser?.isGroup && (
            <GroupInfoModal
              group={selectedUser}
              users={users}
              onClose={() => setShowGroupInfoModal(false)}
              onUpdateGroupName={handleUpdateGroupName}
              onManageMembers={() => setShowManageModal(true)}
              currentUserId={currentUserId}
              onUpdateGroupImage={handleUpdateGroupImage}
              onUpdateGroupDescription={handleGroupDescriptionUpdate}
              messages={messages}
            />
          )}
        </>
      )}
    </div>
  );
}

export default ChatWindow;
