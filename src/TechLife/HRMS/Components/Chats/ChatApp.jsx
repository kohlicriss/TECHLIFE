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
    </div>
  );
}

export default ChatApp;
