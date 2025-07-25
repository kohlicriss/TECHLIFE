import React, { useEffect, useState, useRef } from 'react';
import {
    FaUsers, FaMicrophone, FaPaperclip, FaSmile, FaPaperPlane, FaArrowLeft, FaStop,
    FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileAlt, FaDownload, FaPlay, FaPause,
    FaVideo, FaPhone,
    FaReply, FaEdit, FaThumbtack, FaShare, FaTrash, FaTimes, FaCheck,
    // --- NEW ICONS FOR PINNED BAR & FORWARD ---
    FaChevronDown, FaImage, FaFileAudio
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';

// Helper component to get the right icon for a file or media type
const FileIcon = ({ fileName, type, className = "text-3xl" }) => {
    if (type === 'image') return <FaImage className={`text-purple-500 ${className}`} />;
    if (type === 'audio') return <FaFileAudio className={`text-pink-500 ${className}`} />;
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className={`text-red-500 ${className}`} />;
    if (['doc', 'docx'].includes(extension)) return <FaFileWord className={`text-blue-500 ${className}`} />;
    if (['xls', 'xlsx'].includes(extension)) return <FaFileExcel className={`text-green-500 ${className}`} />;
    if (['ppt', 'pptx'].includes(extension)) return <FaFilePowerpoint className={`text-orange-500 ${className}`} />;
    return <FaFileAlt className={`text-gray-500 ${className}`} />;
};

// AudioPlayer component for voice messages
const AudioPlayer = ({ src, isSender, isDownloaded, onDownload }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const setAudioData = () => { if (audio.duration !== Infinity) setDuration(audio.duration); }
        const setAudioTime = () => setProgress(audio.currentTime);
        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        return () => {
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
        }
    }, [isDownloaded]);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (isPlaying) audio.pause();
        else audio.play();
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time) => {
        if (!time || time === Infinity) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!isSender && !isDownloaded) {
        return (
            <div className="flex items-center gap-3 w-64">
                <button onClick={onDownload} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-400 bg-opacity-30 text-white hover:bg-opacity-40 transition-colors"><FaDownload size={16} /></button>
                <div className="flex-grow"><p className="text-sm text-gray-700">Voice Message</p><p className="text-xs text-gray-500">Click to download</p></div>
            </div>
        );
    }

    const progressPercentage = duration ? (progress / duration) * 100 : 0;
    return (
        <div className="flex items-center gap-3 w-64">
            <audio ref={audioRef} src={src} preload="metadata" onEnded={() => setIsPlaying(false)} />
            <button onClick={togglePlayPause} className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isSender ? 'bg-white text-blue-600' : 'bg-gray-400 bg-opacity-30 text-white'}`}>{isPlaying ? <FaPause size={16} /> : <FaPlay size={16} className="ml-1" />}</button>
            <div className="flex-grow flex flex-col justify-center">
                <div className="w-full h-1 bg-gray-400 bg-opacity-50 rounded-full"><div style={{ width: `${progressPercentage}%` }} className={`h-full rounded-full ${isSender ? 'bg-white' : 'bg-gray-300'}`}></div></div>
                <span className={`text-xs self-end mt-1 ${isSender ? 'text-blue-200' : 'text-gray-500'}`}>{formatTime(duration)}</span>
            </div>
        </div>
    );
};


function ChatApplication({ onSelectChat, currentUser }) {
  const [chatData, setChatData] = useState({ groups: [], privateChatsWith: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [downloadedMedia, setDownloadedMedia] = useState({});
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, message: null, index: null });
  const [editingInfo, setEditingInfo] = useState({ index: null, originalContent: '' });
  const [replyingTo, setReplyingTo] = useState(null);
  const [lastDeleted, setLastDeleted] = useState(null);
  
  // --- NEW STATES FOR PIN & FORWARD ---
  const [pinnedMessages, setPinnedMessages] = useState({});
  const [forwardingInfo, setForwardingInfo] = useState({ visible: false, message: null });
  const [forwardRecipients, setForwardRecipients] = useState([]);
  const [forwardSearchTerm, setForwardSearchTerm] = useState('');

  const chatContainerRef = useRef(null);
  const ws = useRef(null);
  const selectedChatRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const chatMenuRef = useRef(null);
  const chatMenuButtonRef = useRef(null);
  const contextMenuRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => { fetch('/chatData.json').then(res => res.json()).then(setChatData); }, []);
  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

  useEffect(() => {
    ws.current = new WebSocket("wss://ws.postman-echo.com/raw");
    ws.current.onmessage = (event) => {
      if (selectedChatRef.current) {
        let receivedMessage;
        try { receivedMessage = JSON.parse(event.data); } 
        catch(e) { receivedMessage = { type: 'text', content: event.data }; }
        const finalMessage = { ...receivedMessage, sender: 'other', timestamp: new Date().toISOString() };
        setMessages(prev => ({ ...prev, [selectedChatRef.current.chatId]: [...(prev[selectedChatRef.current.chatId] || []), finalMessage] }));
      }
    };
    return () => { if (ws.current) ws.current.close(); };
  }, []);

  useEffect(() => { if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, [messages, selectedChat]);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && !emojiButtonRef.current?.contains(event.target)) setShowEmojiPicker(false);
        if (showChatMenu && chatMenuRef.current && !chatMenuRef.current.contains(event.target) && !chatMenuButtonRef.current?.contains(event.target)) setShowChatMenu(false);
        if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(event.target)) setContextMenu({ visible: false });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showChatMenu, contextMenu]);

  const addAndSendMessage = (messageObject, targetChatId) => {
    const chatId = targetChatId || selectedChat.chatId;
    if (!chatId) return;
    const fullMessage = { ...messageObject, sender: 'me', timestamp: new Date().toISOString(), replyTo: replyingTo };
    setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), fullMessage] }));
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify(messageObject));
    setReplyingTo(null);
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedChat) {
      addAndSendMessage({ type: 'text', content: message });
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleKeyDown = (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (editingInfo.index !== null) handleSaveEdit(); else handleSendMessage(); } };
  const onEmojiClick = (emojiObject) => setMessage(prev => prev + emojiObject.emoji);
  const handleFileButtonClick = () => fileInputRef.current.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    const messageType = file.type.startsWith('image/') ? 'image' : 'file';
    addAndSendMessage({ type: messageType, content: fileUrl, fileName: file.name, fileSize: file.size });
    event.target.value = null;
  };

  const handleMicButtonClick = () => { if (isRecording) stopRecording(); else startRecording(); };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        addAndSendMessage({ type: 'audio', content: audioUrl });
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
    } catch (error) { console.error("Mic error:", error); alert("Could not access microphone."); }
  };

  const stopRecording = () => { if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); setIsRecording(false); } };
  const handleClearChat = () => { if (!selectedChat) return; setMessages(prev => ({ ...prev, [selectedChat.chatId]: [] })); setShowChatMenu(false); };
  
  const handleMediaDownload = (msgIndex, src, fileName) => {
    const link = document.createElement('a');
    link.href = src;
    link.setAttribute('download', fileName || 'download');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadedMedia(prev => ({ ...prev, [msgIndex]: true }));
  };

  const handleContextMenu = (event, message, index) => {
      event.preventDefault();
      event.stopPropagation();
      const menuWidth = 180; const menuHeight = 250;
      let x = event.pageX; let y = event.pageY;
      if (message.sender === 'me') x -= menuWidth;
      if (y + menuHeight > window.innerHeight) y -= menuHeight;
      setContextMenu({ visible: true, x, y, message, index });
  };

  const handleReply = () => { setReplyingTo(contextMenu.message); setContextMenu({ visible: false }); messageInputRef.current.focus(); };
  const handleEdit = () => { setEditingInfo({ index: contextMenu.index, originalContent: contextMenu.message.content }); setMessage(contextMenu.message.content); setContextMenu({ visible: false }); messageInputRef.current.focus(); };

  const handleSaveEdit = () => {
      if (message.trim() === '') return;
      const currentMessages = messages[selectedChat.chatId];
      const updatedMessages = [...currentMessages];
      updatedMessages[editingInfo.index].content = message;
      updatedMessages[editingInfo.index].isEdited = true;
      setMessages(prev => ({ ...prev, [selectedChat.chatId]: updatedMessages }));
      setEditingInfo({ index: null, originalContent: '' });
      setMessage('');
  };

  const cancelEdit = () => { setEditingInfo({ index: null, originalContent: '' }); setMessage(''); };
  
  const handleDelete = (forEveryone) => {
      const currentMessages = [...messages[selectedChat.chatId]];
      const messageToDelete = currentMessages[contextMenu.index];
      if (forEveryone) {
          currentMessages[contextMenu.index] = { ...messageToDelete, type: 'deleted', originalMessage: messageToDelete };
          setLastDeleted({ index: contextMenu.index, message: messageToDelete });
          setTimeout(() => setLastDeleted(null), 5000);
      } else {
          currentMessages.splice(contextMenu.index, 1);
      }
      setMessages(prev => ({ ...prev, [selectedChat.chatId]: currentMessages }));
      setContextMenu({ visible: false });
  };
  
  const handleUndoDelete = () => {
      if (!lastDeleted) return;
      const currentMessages = [...messages[selectedChat.chatId]];
      currentMessages[lastDeleted.index] = lastDeleted.message;
      setMessages(prev => ({...prev, [selectedChat.chatId]: currentMessages}));
      setLastDeleted(null);
  };

  const handlePin = () => {
      setPinnedMessages(prev => ({...prev, [selectedChat.chatId]: { message: contextMenu.message, index: contextMenu.index }}));
      setContextMenu({ visible: false });
  };

  const handleUnpin = () => {
      setPinnedMessages(prev => {
          const newPinned = {...prev};
          delete newPinned[selectedChat.chatId];
          return newPinned;
      });
  };

  const handleGoToMessage = () => {
      const pinnedInfo = pinnedMessages[selectedChat.chatId];
      if (pinnedInfo) {
          const messageElement = document.querySelector(`[data-message-index='${pinnedInfo.index}']`);
          if (messageElement) {
              messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              messageElement.classList.add('animate-pulse');
              setTimeout(() => messageElement.classList.remove('animate-pulse'), 2000);
          }
      }
  };

  const handleForward = () => {
      setForwardingInfo({ visible: true, message: contextMenu.message });
      setContextMenu({ visible: false });
  };
  
  const handleConfirmForward = () => {
      forwardRecipients.forEach(chatId => {
          const forwardedMessage = { ...forwardingInfo.message, isForwarded: true };
          // We add the message to other chats' message arrays
          setMessages(prev => ({...prev, [chatId]: [...(prev[chatId] || []), forwardedMessage]}));
      });
      setForwardingInfo({ visible: false, message: null });
      setForwardRecipients([]);
      setForwardSearchTerm('');
  };

  const allChats = [
    ...chatData.privateChatsWith.filter(user => user.chatId !== currentUser?.chatId).map(user => ({ ...user, type: 'private', name: user.employeeName })),
    ...chatData.groups.map(group => ({ ...group, type: 'group', name: group.groupName })),
  ].sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));

  const filteredChats = allChats.filter(chat => chat.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleChatSelect = (chat) => { setSelectedChat(chat); setIsChatOpen(true); };

  const formatTimestamp = (isoString) => new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDateHeader = (isoString) => {
    const date = new Date(isoString); const today = new Date(); const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const formatLastSeen = (isoString) => {
      if (!isoString) return 'Offline';
      const date = new Date(isoString); const today = new Date();
      if (date.toDateString() === today.toDateString()) return `last seen today at ${formatTimestamp(isoString)}`;
      return `last seen on ${date.toLocaleDateString()}`;
  };

  let lastMessageDate = null;
  const pinnedMessageInfo = pinnedMessages[selectedChat?.chatId];

  return (
    <div className="w-full h-full bg-gray-100 font-sans">
      <div className="flex w-full h-full p-0 md:p-4 md:gap-4">
        {/* Sidebar */}
        <div className={`relative w-full md:w-[30%] h-full p-4 bg-white flex flex-col shadow-xl md:rounded-lg ${isChatOpen ? 'hidden md:flex' : 'flex'}`}>
          <div className="mb-4 flex-shrink-0"><input type="text" placeholder="Search chats or users..." className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
          <div className="flex-grow space-y-2 pr-2 overflow-y-auto custom-scrollbar">
            {filteredChats.map(chat => (
              <div key={chat.chatId} onClick={() => handleChatSelect(chat)} className={`p-3 flex items-center rounded-lg cursor-pointer group ${selectedChat?.chatId === chat.chatId ? 'bg-blue-100' : 'hover:bg-blue-50'}`}>
                <div className="relative flex-shrink-0"><img src={chat.profile} alt={chat.name} className="w-11 h-11 rounded-full object-cover" onError={(e) => { e.target.src='https://placehold.co/100x100/E2E8F0/4A5568?text=??' }}/>{chat.isOnline && (<span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>)}</div>
                <div className="flex-1 min-w-0 mx-3"><p className="font-semibold text-gray-800 truncate">{chat.name}</p><p className="text-sm text-gray-500 truncate">{chat.lastMessage || 'No messages yet'}</p></div>
                {chat.unreadMessageCount > 0 && (<div className="flex-shrink-0"><span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{chat.unreadMessageCount}</span></div>)}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`w-full md:w-[70%] h-full flex flex-col bg-white md:rounded-lg shadow-xl ${isChatOpen ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
            {selectedChat ? (
              <><div className="flex items-center space-x-3 flex-grow"><button onClick={() => setIsChatOpen(false)} className="md:hidden p-2 rounded-full hover:bg-gray-100"><FaArrowLeft/></button><img src={selectedChat.profile} alt={selectedChat.name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { e.target.src='https://placehold.co/100x100/E2E8F0/4A5568?text=??' }}/><div><p className="font-bold text-lg">{selectedChat.name}</p>{selectedChat.type === 'private' && (<p className="text-sm text-gray-500">{selectedChat.isOnline ? 'Online' : formatLastSeen(selectedChat.lastSeen)}</p>)}</div></div>
              <div className="flex items-center space-x-2"><button className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><FaVideo size={20}/></button><button className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><FaPhone size={20}/></button><div className="relative"><button ref={chatMenuButtonRef} onClick={() => setShowChatMenu(!showChatMenu)} className="p-2 rounded-full hover:bg-gray-100"><BsThreeDotsVertical size={20}/></button>{showChatMenu && (<div ref={chatMenuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20"><button onClick={handleClearChat} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Clear chat</button></div>)}</div></div></>
            ) : <div/>}
          </div>
          {/* --- PINNED MESSAGE BAR --- */}
          {pinnedMessageInfo && (
              <div className="flex-shrink-0 flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 text-sm overflow-hidden cursor-pointer" onClick={handleGoToMessage}>
                      <FaThumbtack className="text-gray-500"/>
                      <FileIcon fileName={pinnedMessageInfo.message.fileName || ''} type={pinnedMessageInfo.message.type} className="text-lg"/>
                      <div className="truncate">
                          <p className="font-bold text-blue-600">Pinned Message</p>
                          <p className="text-gray-600 truncate">{pinnedMessageInfo.message.type === 'text' ? pinnedMessageInfo.message.content : pinnedMessageInfo.message.fileName || 'Voice Message'}</p>
                      </div>
                  </div>
                  <button onClick={handleUnpin} className="p-2 rounded-full hover:bg-gray-200"><FaTimes /></button>
              </div>
          )}
          <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto bg-gray-50">
            {selectedChat ? (
              <div className="space-y-2">
                {(messages[selectedChat.chatId] || []).map((msg, index) => {
                  const showDateHeader = lastMessageDate !== new Date(msg.timestamp).toDateString();
                  lastMessageDate = new Date(msg.timestamp).toDateString();
                  return (
                    <React.Fragment key={index}>
                      {showDateHeader && (<div className="text-center my-4"><span className="bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">{formatDateHeader(msg.timestamp)}</span></div>)}
                      <div data-message-index={index} className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'other' && (<img src={selectedChat.profile} alt={selectedChat.name} className="w-8 h-8 rounded-full object-cover self-start" onError={(e) => { e.target.src='https://placehold.co/100x100/E2E8F0/4A5568?text=??' }}/>)}
                        <div className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                            <div onContextMenu={(e) => handleContextMenu(e, msg, index)} className={`rounded-lg max-w-xs md:max-w-md ${msg.type === 'text' || msg.type === 'deleted' ? 'p-3' : 'p-2'} ${msg.sender === 'me' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                              {msg.type === 'deleted' ? ( <div className="flex items-center gap-4 italic text-sm"><span>This message was deleted</span>{lastDeleted?.index === index && <button onClick={handleUndoDelete} className="font-semibold hover:underline">Undo</button>}</div>) : (
                                <>
                                  {msg.isForwarded && <p className="text-xs opacity-70 mb-1 font-semibold">Forwarded</p>}
                                  {msg.replyTo && (<div className={`p-2 rounded mb-2 text-sm ${msg.sender === 'me' ? 'bg-blue-500' : 'bg-gray-300'}`}><p className="font-semibold">{msg.replyTo.sender === 'me' ? 'You' : selectedChat.name}</p><p className="opacity-80 truncate">{msg.replyTo.type === 'text' ? msg.replyTo.content : 'Media'}</p></div>)}
                                  {msg.type === 'text' && <p className="text-sm break-words">{msg.content}</p>}
                                  {msg.type === 'image' && <img src={msg.content} alt={msg.fileName} className="rounded-md max-w-full" />}
                                  {msg.type === 'audio' && <AudioPlayer src={msg.content} isSender={msg.sender === 'me'} isDownloaded={!!downloadedMedia[index]} onDownload={() => handleMediaDownload(index, msg.content, 'voice-message.wav')} />}
                                  {msg.type === 'file' && (<a href={msg.content} download={msg.sender !== 'me' ? msg.fileName : undefined} target={msg.sender === 'me' ? '_blank' : '_self'} rel="noopener noreferrer" className="flex items-center gap-3 cursor-pointer"><FileIcon fileName={msg.fileName} /><div className="flex-grow min-w-0"><p className={`font-bold text-sm truncate ${msg.sender === 'me' ? 'text-white' : 'text-gray-800'}`}>{msg.fileName}</p><p className={`text-xs ${msg.sender === 'me' ? 'text-blue-200' : 'text-gray-500'}`}>{(msg.fileSize / 1024).toFixed(2)} KB</p></div>{msg.sender !== 'me' && (<div className="p-2 rounded-full text-gray-500"><FaDownload /></div>)}</a>)}
                                </>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 mt-1 px-1">{formatTimestamp(msg.timestamp)} {msg.isEdited && '(edited)'}</span>
                        </div>
                        {msg.sender === 'me' && (<img src={currentUser?.profile || 'https://placehold.co/100x100/E2E8F0/4A5568?text=Me'} alt="current user" className="w-8 h-8 rounded-full object-cover self-start" />)}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (<div className="flex items-center justify-center h-full"><p className="text-xl text-center text-gray-600">Select a chat to begin</p></div>)}
          </div>
          <div className="flex-shrink-0 flex flex-col p-4 border-t border-gray-200">
            {replyingTo && (<div className="bg-gray-100 p-2 rounded-t-lg flex justify-between items-center"><div className="text-sm overflow-hidden"><p className="font-semibold text-blue-600">Replying to {replyingTo.sender === 'me' ? 'yourself' : selectedChat.name}</p><p className="text-gray-600 truncate">{replyingTo.type === 'text' ? replyingTo.content : 'Media message'}</p></div><button onClick={() => setReplyingTo(null)}><FaTimes /></button></div>)}
            {editingInfo.index !== null && (<div className="bg-gray-100 p-2 rounded-t-lg flex justify-between items-center"><div className="text-sm overflow-hidden"><p className="font-semibold text-blue-600">Editing message</p><p className="text-gray-600 truncate">{editingInfo.originalContent}</p></div><button onClick={cancelEdit}><FaTimes /></button></div>)}
            {selectedChat && (
              <div className={`relative flex items-center w-full space-x-2 ${(replyingTo || editingInfo.index !== null) ? 'pt-2' : ''}`}>
                {showEmojiPicker && (<div ref={emojiPickerRef} className="absolute bottom-16 left-0 z-10"><EmojiPicker onEmojiClick={onEmojiClick} width={350} height={400} /></div>)}
                <div className="relative flex-grow"><input ref={messageInputRef} type="text" placeholder={isRecording ? "Recording..." : "Type a message..."} className="w-full p-3 pr-12 rounded-full border bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} disabled={isRecording}/>
                    {editingInfo.index !== null ? (<button onClick={handleSaveEdit} className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700"><FaCheck size={14} /></button>) : (<button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"><FaPaperPlane size={14} /></button>)}
                </div>
                <button ref={emojiButtonRef} onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-3 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><FaSmile size={20} /></button>
                <button onClick={handleFileButtonClick} className="p-3 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><FaPaperclip size={20} /></button>
                <button onClick={handleMicButtonClick} className={`p-3 rounded-full hover:bg-gray-100 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-blue-600'}`}>{isRecording ? <FaStop size={20} /> : <FaMicrophone size={20} />}</button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {contextMenu.visible && (
          <div ref={contextMenuRef} style={{ top: contextMenu.y, left: contextMenu.x }} className="absolute bg-white rounded-md shadow-lg z-50 text-sm">
              <ul className="py-1">
                  {contextMenu.message.type === 'deleted' ? (
                      <li onClick={() => handleDelete(false)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3 text-red-600"><FaTrash /> Delete for me</li>
                  ) : (
                      <>
                          <li onClick={handleReply} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"><FaReply /> Reply</li>
                          <li onClick={handlePin} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"><FaThumbtack /> Pin</li>
                          <li onClick={handleForward} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"><FaShare /> Forward</li>
                          {contextMenu.message.sender === 'me' && contextMenu.message.type === 'text' && (<li onClick={handleEdit} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"><FaEdit /> Edit</li>)}
                          <hr className="my-1"/>
                          <li onClick={() => handleDelete(false)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3 text-red-600"><FaTrash /> Delete for me</li>
                          {contextMenu.message.sender === 'me' && (<li onClick={() => handleDelete(true)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3 text-red-600"><FaTrash /> Delete for everyone</li>)}
                      </>
                  )}
              </ul>
          </div>
      )}

      {forwardingInfo.visible && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                  <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-bold text-lg">Forward message to...</h3>
                      <button onClick={() => setForwardingInfo({visible: false, message: null})}><FaTimes/></button>
                  </div>
                  <div className="p-4"><input type="text" placeholder="Search for users or groups" className="w-full p-2 border rounded-lg" value={forwardSearchTerm} onChange={(e) => setForwardSearchTerm(e.target.value)} /></div>
                  <div className="h-64 overflow-y-auto p-4">
                      {allChats.filter(c => c.name.toLowerCase().includes(forwardSearchTerm.toLowerCase())).map(chat => (
                          <div key={chat.chatId} className="flex items-center p-2 rounded-lg hover:bg-gray-100">
                              <input type="checkbox" id={`fwd-${chat.chatId}`} className="mr-3" checked={forwardRecipients.includes(chat.chatId)} onChange={(e) => {
                                  if (e.target.checked) setForwardRecipients([...forwardRecipients, chat.chatId]);
                                  else setForwardRecipients(forwardRecipients.filter(id => id !== chat.chatId));
                              }}/>
                              <label htmlFor={`fwd-${chat.chatId}`} className="flex-grow flex items-center gap-3 cursor-pointer">
                                  <img src={chat.profile} alt={chat.name} className="w-10 h-10 rounded-full object-cover"/>
                                  <span>{chat.name}</span>
                              </label>
                          </div>
                      ))}
                  </div>
                  <div className="p-4 border-t text-right">
                      <button onClick={handleConfirmForward} disabled={forwardRecipients.length === 0} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400">Forward</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default ChatApplication;
