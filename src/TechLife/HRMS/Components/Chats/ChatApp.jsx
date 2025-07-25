import { useEffect, useState } from 'react';
import ChatApplication from './ChatApplication';

function ChatApp() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [chatData, setChatData] = useState({ groups: [], privateChatsWith: [] });

  useEffect(() => {
    fetch('/chatData.json') 
      .then((res) => res.json())
      .then((data) => {
        setChatData(data);
      });

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
      <ChatApplication
        users={chatData.privateChatsWith}
        groups={chatData.groups}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        messages={messages}
        setMessages={setMessages}
      />
      {/* <ChatWindow
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        messages={messages}
        setMessages={setMessages}
        users={chatData.privateChatsWith}
        groups={chatData.groups}
        setGroups={(groups) => setChatData((prev) => ({ ...prev, groups }))}
        onSendMessage={handleSendMessage}
        onReceiveMessage={handleReceiveMessage}
      /> */}
    </div>
  );
}

export default ChatApp;
