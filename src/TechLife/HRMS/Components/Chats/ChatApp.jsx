import { useEffect, useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

function ChatApp() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [chatData, setChatData] = useState({ groups: [], privateChatsWith: [] });

  useEffect(() => {
    // Fetch from new unified JSON endpoint
    fetch('/chatData.json') // This should be your API endpoint in real app
      .then((res) => res.json())
      .then((data) => {
        setChatData(data);
      });

    // Optional: Fetch message history (you might switch this to socket-based or real-time fetch later)
    fetch('/messages.json')
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, []);

  const handleSendMessage = (receiverId, messageObj) => {
    setMessages((prev) => ({
      ...prev,
      [receiverId]: [...(prev[receiverId] || []), messageObj],
    }));
  };

  const handleReceiveMessage = (senderId, messageObj) => {
    setMessages((prev) => ({
      ...prev,
      [senderId]: [...(prev[senderId] || []), messageObj],
    }));
  };

  return (
    <div style={{ height: '90vh' }} className="flex h-screen">
      <ChatSidebar
        users={chatData.privateChatsWith}
        groups={chatData.groups}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        messages={messages}
        setMessages={setMessages}
      />
      <ChatWindow
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        messages={messages}
        setMessages={setMessages}
        users={chatData.privateChatsWith}
        groups={chatData.groups}
        setGroups={(groups) => setChatData((prev) => ({ ...prev, groups }))}
        onSendMessage={handleSendMessage}
        onReceiveMessage={handleReceiveMessage}
      />
    </div>
  );
}

export default ChatApp;
