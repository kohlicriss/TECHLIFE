import React, { useEffect, useState, useRef } from 'react';
import { FaUsers, FaMicrophone, FaPaperclip, FaSmile, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

// This is the main component for the chat application.
// I've modified it to prevent the entire page from scrolling.
function ChatSidebar({ onSelectChat, currentUser }) {
  const [chatData, setChatData] = useState({ groups: [], privateChatsWith: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const ws = useRef(null);
  const selectedChatRef = useRef(null);

  // Effect to fetch initial chat data from a local JSON file.
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

  // Effect to keep a ref updated with the currently selected chat.
  // This is useful for accessing the current chat inside WebSocket event handlers.
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Effect to set up and manage the WebSocket connection.
  useEffect(() => {
    ws.current = new WebSocket("wss://ws.postman-echo.com/raw");

    ws.current.onmessage = (event) => {
      if (selectedChatRef.current) {
        const receivedMessage = { text: event.data, sender: 'other' };
        setMessages(prev => ({
          ...prev,
          [selectedChatRef.current.chatId]: [...(prev[selectedChatRef.current.chatId] || []), receivedMessage]
        }));
      }
    };

    ws.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
    };

    // Cleanup function to close the WebSocket connection when the component unmounts.
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Effect to automatically scroll to the bottom of the chat container when new messages arrive.
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, selectedChat]);

  // Combine and sort all chats (private and group).
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

  // Filter chats based on the search term.
  const filteredChats = allChats.filter(chat =>
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler for selecting a chat from the sidebar.
  const handleChatSelect = (chat, type) => {
    setSelectedChat(chat);
    setIsChatOpen(true); // On mobile, this will open the chat view.
    if (onSelectChat) {
      onSelectChat(chat, type);
    }
  };

  // Handler for sending a message.
  const handleSendMessage = () => {
    if (message.trim() && selectedChat && ws.current?.readyState === WebSocket.OPEN) {
      const newMessage = { text: message, sender: 'me' };
      ws.current.send(message);
      setMessages(prev => ({
        ...prev,
        [selectedChat.chatId]: [...(prev[selectedChat.chatId] || []), newMessage]
      }));
      setMessage('');
    }
  };

  // Handler to send message on 'Enter' key press.
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    // MAIN CHANGE 1: Added `overflow-hidden` to the top-level container.
    // This class is crucial. It constrains the entire component to the viewport height (h-screen)
    // and prevents the browser's scrollbar from appearing.
    <div className="w-full h-screen bg-gray-100 font-sans overflow-hidden">
      <div className="flex w-full h-full p-0 md:p-4 md:gap-4">
        {/* Sidebar */}
        <div className={`relative w-full md:w-[30%] h-full p-4 bg-white flex flex-col shadow-xl md:rounded-lg ${isChatOpen ? 'hidden md:flex' : 'flex'}`}>
          <div className="mb-4 flex-shrink-0">
            <input
              type="text"
              placeholder="Search chats or users..."
              className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {/* This div will grow and its content will scroll internally */}
          <div className="flex-grow space-y-2 pr-2 overflow-y-auto custom-scrollbar">
            {filteredChats.map(chat => (
              <div
                key={chat.chatId}
                onClick={() => handleChatSelect(chat, chat.type)}
                className={`p-3 flex items-center rounded-lg cursor-pointer transition-colors duration-200 ease-in-out group ${selectedChat && selectedChat.chatId === chat.chatId ? 'bg-blue-100 shadow-md' : 'hover:bg-blue-50'}`}
              >
                <div className="relative flex-shrink-0">
                  <img src={chat.profile} alt={chat.name} className="w-11 h-11 rounded-full object-cover border-2 border-transparent group-hover:border-blue-400" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/E2E8F0/4A5568?text=??' }}/>
                  {chat.isOnline === true && (<span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>)}
                </div>
                <div className="flex-1 min-w-0 mx-3">
                  <p className="font-semibold text-gray-800 truncate group-hover:text-blue-700">{chat.name}</p>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage || 'No messages yet'}</p>
                </div>
                {chat.unreadMessageCount > 0 && (<div className="flex-shrink-0"><span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{chat.unreadMessageCount}</span></div>)}
              </div>
            ))}
          </div>
          <button className="absolute bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-110">
            <FaUsers size={20} />
          </button>
        </div>

        {/* Chat Window */}
        <div className={`w-full md:w-[70%] h-full flex flex-col bg-white md:rounded-lg shadow-xl overflow-hidden ${isChatOpen ? 'flex' : 'hidden md:flex'}`}>
          {/* Chat Header */}
          {/* MAIN CHANGE 2: Removed fixed percentage heights (h-auto, md:h-[15%]).
              The header will now take up only the space its content needs. `flex-shrink-0` prevents it from shrinking. */}
          <div className="flex-shrink-0 rounded-t-lg flex items-center justify-start p-4 border-b border-gray-200">
            {selectedChat && (
              <div className="flex items-center w-full space-x-3">
                <button onClick={() => setIsChatOpen(false)} className="md:hidden p-2 rounded-full hover:bg-gray-100">
                    <FaArrowLeft/>
                </button>
                <img src={selectedChat.profile} alt={selectedChat.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-400" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/E2E8F0/4A5568?text=??' }}/>
                <div>
                  <p className="font-bold text-gray-800 text-lg">{selectedChat.name}</p>
                  {selectedChat.type === 'private' && (<p className="text-sm text-gray-500">{selectedChat.isOnline ? 'Online' : selectedChat.lastSeen ? `Last seen ${new Date(selectedChat.lastSeen).toLocaleString()}` : 'Offline'}</p>)}
                </div>
              </div>
            )}
          </div>
          {/* Chat Messages Area */}
          {/* This `flex-grow` div will take up all available vertical space, and `overflow-y-auto` makes it scrollable. */}
          <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto bg-gray-50">
            {selectedChat ? (
              <div className="space-y-4">
                {(messages[selectedChat.chatId] || []).map((msg, index) => (
                  <div key={index} className={`flex items-start ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'other' && (<img src={selectedChat.profile} alt={selectedChat.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mr-3" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/E2E8F0/4A5568?text=??' }}/>)}
                    <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${msg.sender === 'me' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      <p className="text-sm break-words">{msg.text}</p>
                    </div>
                    {msg.sender === 'me' && (<img src={currentUser?.profile || 'https://placehold.co/100x100/E2E8F0/4A5568?text=Me'} alt="current user" className="w-8 h-8 rounded-full object-cover flex-shrink-0 ml-3" />)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xl text-center text-gray-600 font-semibold">Select a user or group to start chatting</p>
              </div>
            )}
          </div>
          {/* Chat Input Footer */}
          {/* MAIN CHANGE 3: Removed fixed percentage heights (h-auto, md:h-[12%]).
              The footer will also take up only the space its content needs. */}
          <div className="flex-shrink-0 flex items-center justify-center p-4 border-t border-gray-200">
            {selectedChat && (
              <div className="flex items-center w-full space-x-2">
                <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="w-full p-3 pr-12 rounded-full border border-gray-300 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-110">
                      <FaPaperPlane size={14} />
                    </button>
                </div>
                <button className="p-3 text-gray-600 hover:text-blue-600 transition-colors duration-200 ease-in-out rounded-full hover:bg-gray-100"><FaSmile size={20} /></button>
                <button className="p-3 text-gray-600 hover:text-blue-600 transition-colors duration-200 ease-in-out rounded-full hover:bg-gray-100"><FaPaperclip size={20} /></button>
                <button className="p-3 text-gray-600 hover:text-blue-600 transition-colors duration-200 ease-in-out rounded-full hover:bg-gray-100"><FaMicrophone size={20} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatSidebar;