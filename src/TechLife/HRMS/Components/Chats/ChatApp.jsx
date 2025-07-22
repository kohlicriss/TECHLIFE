import { useEffect, useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

function ChatApp() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetch('/users.json')
      .then((res) => res.json())
      .then((data) => setUsers(data));

    fetch('/messages.json')
      .then((res) => res.json())
      .then((data) => setMessages(data));

    fetch('/groups.json')
      .then((res) => res.json())
      .then((data) => setGroups(data));
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
    <div style={{height:"90vh"}} className="flex h-screen ">
      <ChatSidebar
      
        users={users}
        groups={groups}
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
        users={users}
        groups={groups}
        setGroups={setGroups} 
        onSendMessage={handleSendMessage}        
        onReceiveMessage={handleReceiveMessage}   
      />
    </div>
  );
}

export default ChatApp ;
