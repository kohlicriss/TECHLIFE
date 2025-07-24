import React, { useEffect, useState } from 'react';
import { FaUsers } from 'react-icons/fa'; 

function ChatSidebar({ onSelectChat, currentUser }) {
  const [chatData, setChatData] = useState({ groups: [], privateChatsWith: [] });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/chatData.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setChatData(data))
      .catch(error => console.error('Error loading chat data:', error));
  }, []);

  const allChats = [
    ...chatData.privateChatsWith
      .filter(user => user.chatId !== currentUser?.chatId) 
      .map(user => ({
        ...user,
        type: 'private',
        name: user.employeeName, 
      })),
    ...chatData.groups.map(group => ({
      ...group,
      type: 'group',
      name: group.groupName, 
    })),
  ]
  .sort((a, b) => {
    if (!a.lastSeen) return 1;
    if (!b.lastSeen) return -1;
    
    return new Date(b.lastSeen) - new Date(a.lastSeen);
  });
  const filteredChats = allChats.filter(chat =>
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full sm:w-80 h-full border-r border-gray-200 p-4 bg-white flex flex-col shadow-lg">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search chats or users..."
          className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-grow space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {filteredChats.length === 0 && (
          <p className="text-center text-gray-500 py-4">No chats found.</p>
        )}
        
        {filteredChats.map(chat => (
          <div
            key={chat.chatId} 
            onClick={() => onSelectChat(chat, chat.type)}
            className="p-3 flex items-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200 ease-in-out group"
          >
            <div className="relative flex-shrink-0">
              <img
                src={chat.profile}
                alt={chat.name}
                className="w-11 h-11 rounded-full object-cover"
              />
              {chat.isOnline && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>
              )}
            </div>

            <div className="flex-1 min-w-0 mx-3">
              <p className="font-semibold text-gray-800 truncate group-hover:text-blue-700">
                {chat.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {chat.lastMessage || 'No messages yet'}
              </p>
            </div>

            {chat.unreadMessageCount > 0 && (
              <div className="flex-shrink-0">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {chat.unreadMessageCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        className="absolute bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-110"
        title="View All Employees"
      >
        <FaUsers size={20} />
      </button>
    </div>
  );
}

export default ChatSidebar;