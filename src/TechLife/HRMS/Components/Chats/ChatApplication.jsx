import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import {
    FaMicrophone, FaPaperclip, FaSmile, FaPaperPlane, FaArrowLeft, FaStop,
    FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileAlt, FaDownload, FaPlay, FaPause,
    FaVideo, FaPhone, FaReply, FaEdit, FaThumbtack, FaShare, FaTrash, FaTimes, FaCheck,
    FaChevronDown, FaImage, FaFileAudio, FaEye, FaAngleDoubleRight, FaCamera, FaPen, FaUsers
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';

const FileIcon = ({ fileName, type, className = "text-3xl" }) => {
    if (type === 'image') return <FaImage className={`text-purple-500 ${className}`} />;
    if (type === 'audio') return <FaFileAudio className={`text-pink-500 ${className}`} />;
    const extension = fileName?.split('.').pop().toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className={`text-red-500 ${className}`} />;
    if (['doc', 'docx'].includes(extension)) return <FaFileWord className={`text-blue-500 ${className}`} />;
    if (['xls', 'xlsx'].includes(extension)) return <FaFileExcel className={`text-green-500 ${className}`} />;
    if (['ppt', 'pptx'].includes(extension)) return <FaFilePowerpoint className={`text-orange-500 ${className}`} />;
    return <FaFileAlt className={`text-gray-500 ${className}`} />;
};

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
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleEnded);
        }
    }, [src]);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(e => console.error("Audio play failed:", e));
        }
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
            <audio ref={audioRef} src={src} preload="metadata" />
            <button onClick={togglePlayPause} className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isSender ? 'bg-white text-blue-600' : 'bg-gray-400 bg-opacity-30 text-white'}`}>{isPlaying ? <FaPause size={16} /> : <FaPlay size={16} className="ml-1" />}</button>
            <div className="flex-grow flex flex-col justify-center">
                <div className="w-full h-1 bg-gray-400 bg-opacity-50 rounded-full"><div style={{ width: `${progressPercentage}%` }} className={`h-full rounded-full ${isSender ? 'bg-white' : 'bg-gray-300'}`}></div></div>
                <span className={`text-xs self-end mt-1 ${isSender ? 'text-blue-200' : 'text-gray-500'}`}>{formatTime(duration)}</span>
            </div>
        </div>
    );
};


function ChatApplication({ currentUser, initialChats }) {
    const [chatData, setChatData] = useState({ groups: [], privateChatsWith: [] });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState({});
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [downloadedMedia, setDownloadedMedia] = useState({});
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, message: null, index: null });
    const [editingInfo, setEditingInfo] = useState({ index: null, originalContent: '' });
    const [replyingTo, setReplyingTo] = useState(null);
    const [lastDeleted, setLastDeleted] = useState(null);
    const [pinnedMessages, setPinnedMessages] = useState({});
    const [forwardingInfo, setForwardingInfo] = useState({ visible: false, message: null });
    const [forwardRecipients, setForwardRecipients] = useState([]);
    const [forwardSearchTerm, setForwardSearchTerm] = useState('');
    const [showPinnedMenu, setShowPinnedMenu] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
    const [activeGroupInfoTab, setActiveGroupInfoTab] = useState('Overview');
    const [imageInView, setImageInView] = useState(null);

    const chatContainerRef = useRef(null);
    const stompClient = useRef(null);
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
    const pinnedMenuRef = useRef(null);
    const pinnedMenuButtonRef = useRef(null);

    useEffect(() => {
        if (initialChats) {
            const allUsersForLookup = initialChats.privateChatsWith || [];
            if (currentUser && !allUsersForLookup.find(u => u.chatId === currentUser.id)) {
                allUsersForLookup.push({ ...currentUser, chatId: currentUser.id, employeeName: currentUser.name, profile: currentUser.profile });
            }

            const enrichedGroups = initialChats.groups.map(group => ({
                ...group,
                type: 'group',
                name: group.groupName,
                members: allUsersForLookup,
                lastMessageTimestamp: group.lastSeen || new Date(0).toISOString(),
            }));
            const enrichedPrivate = initialChats.privateChatsWith.map(p => ({
                ...p,
                type: 'private',
                name: p.employeeName,
                lastMessageTimestamp: p.lastSeen || new Date(0).toISOString()
            }));
            setChatData({ groups: enrichedGroups, privateChatsWith: enrichedPrivate });
        }
    }, [initialChats, currentUser]);

    useEffect(() => {
        if (!selectedChat) return;
        
        if (messages[selectedChat.chatId]) return;

        setIsMessagesLoading(true);
        axios.get(`http://localhost:8082/api/chat/${currentUser.id}/${selectedChat.chatId}`)
            .then(response => {
                const fetchedMessages = (response.data || []).map(msg => {
                    const timestamp = new Date(`${msg.date} ${msg.time}`).toISOString();
                    const messageType = msg.kind === 'send' ? 'text' : msg.kind;

                    let fileName = null;
                    if (messageType === 'file' && msg.content?.startsWith('File: ')) {
                        fileName = msg.content.substring(6).trim();
                    }
                    
                    let status = null;
                    if (msg.sender === currentUser.id) {
                        status = (msg.isSeen === 'true' || msg.isSeen === true) ? 'seen' : 'sent';
                    }

                    return {
                        ...msg,
                        timestamp,
                        type: messageType,
                        fileName,
                        status,
                        content: messageType === 'file' ? msg.messageId : msg.content
                    };
                });

                setMessages(prev => ({
                    ...prev,
                    [selectedChat.chatId]: fetchedMessages
                }));
            })
            .catch(error => {
                console.error(`Failed to fetch messages for chat ${selectedChat.chatId}:`, error);
                setMessages(prev => ({
                    ...prev,
                    [selectedChat.chatId]: []
                }));
            })
            .finally(() => {
                setIsMessagesLoading(false);
            });
    }, [selectedChat, currentUser.id]);

    const updateLastMessage = (chatId, message) => {
        const generatePreview = (msg) => {
            if (!msg) return 'Chat cleared';
            if (msg.type === 'deleted') return 'This message was deleted';
            const prefix = msg.isForwarded ? 'Forwarded: ' : '';
            if (msg.type === 'image') return prefix + '📷 Image';
            if (msg.type === 'audio') return prefix + '🎤 Voice Message';
            if (msg.type === 'file') return prefix + `📄 ${msg.fileName || 'File'}`;
            if (msg.content) return prefix + msg.content;
            return '...';
        };

        setChatData(prev => {
            const newGroups = prev.groups.map(g => g.chatId === chatId ? { ...g, lastMessage: generatePreview(message), lastMessageTimestamp: message?.timestamp || new Date(0).toISOString() } : g);
            const newPrivate = prev.privateChatsWith.map(p => p.chatId === chatId ? { ...p, lastMessage: generatePreview(message), lastMessageTimestamp: message?.timestamp || new Date(0).toISOString() } : p);
            return { groups: newGroups, privateChatsWith: newPrivate };
        });
    };

    useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat])

    useEffect(() => {
        if (!currentUser?.id) return;

        const onMessageReceived = (payload) => {
            const receivedMessage = JSON.parse(payload.body);
            
            const finalMessage = {
                ...receivedMessage,
                timestamp: new Date(`${receivedMessage.date} ${receivedMessage.time}`).toISOString(),
                type: receivedMessage.kind === 'send' ? 'text' : receivedMessage.kind,
                 // For received files, content should be the messageId for the download link
                content: receivedMessage.kind === 'file' ? receivedMessage.messageId : receivedMessage.content
            };

            const chatId = selectedChatRef.current?.chatId; // Determine chat ID from the message 
            const messageChatId = (finalMessage.sender === currentUser.id) ? finalMessage.receiver : finalMessage.sender;

            setMessages(prev => ({
                ...prev,
                [messageChatId]: [...(prev[messageChatId] || []), finalMessage]
            }));
            updateLastMessage(messageChatId, finalMessage);
        };
        
        const client = new Client({
            brokerURL: 'ws://localhost:8082/ws',
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('STOMP client connected.');
                // Subscribe to user-specific queue to receive messages
                client.subscribe(`/user/${currentUser.id}/queue/private`, onMessageReceived);
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        stompClient.current = client;

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        };
    }, [currentUser]);

    useEffect(() => { if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, [messages, selectedChat]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && !emojiButtonRef.current?.contains(event.target)) setShowEmojiPicker(false);
            if (showChatMenu && chatMenuRef.current && !chatMenuRef.current.contains(event.target) && !chatMenuButtonRef.current?.contains(event.target)) setShowChatMenu(false);
            if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(event.target)) setContextMenu({ visible: false });
            if (showPinnedMenu && pinnedMenuRef.current && !pinnedMenuRef.current.contains(event.target) && !pinnedMenuButtonRef.current?.contains(event.target)) setShowPinnedMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker, showChatMenu, contextMenu, showPinnedMenu]);

    // **send messages via STOMP**
    const addAndSendMessage = (messageObject) => {
        const chatId = selectedChat?.chatId;
        if (!chatId || !stompClient.current?.connected) {
            console.error("Cannot send message: no chat selected or STOMP client not connected.");
            return;
        }

        const payload = {
            sender: currentUser.id,
            receiver: chatId,
            content: messageObject.content,
            kind: messageObject.type === 'text' ? 'send' : messageObject.type,
            fileName: messageObject.fileName || null,
        };

        stompClient.current.publish({
            destination: '/app/chat/send',
            body: JSON.stringify(payload),
        });

        if (messageObject.type === 'text') {
            setMessage('');
            setShowEmojiPicker(false);
        }
        setReplyingTo(null);
    };

    const handleSendMessage = () => { if (message.trim() && selectedChat) { addAndSendMessage({ type: 'text', content: message }); } };
    const handleKeyDown = (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (editingInfo.index !== null) handleSaveEdit(); else handleSendMessage(); } };
    const onEmojiClick = (emojiObject) => setMessage(prev => prev + emojiObject.emoji);
    const handleFileButtonClick = () => fileInputRef.current.click();

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file || !selectedChat) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('senderId', currentUser.id);
        formData.append('receiverId', selectedChat.chatId);

        try {
            await axios.post('http://localhost:8082/api/upload', formData);
        } catch (error) {
            console.error("File upload failed:", error);
            alert("File could not be sent.");
        } finally {
            event.target.value = null;
        }
    };
    
    const handleMicButtonClick = () => { if (isRecording) stopRecording(); else startRecording(); };
    const startRecording = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); setIsRecording(true); audioChunksRef.current = []; mediaRecorderRef.current = new MediaRecorder(stream); mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data); mediaRecorderRef.current.onstop = () => { const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' }); const audioUrl = URL.createObjectURL(audioBlob); addAndSendMessage({ type: 'audio', content: audioUrl }); stream.getTracks().forEach(track => track.stop()); }; mediaRecorderRef.current.start(); } catch (error) { console.error("Mic error:", error); alert("Could not access microphone."); } };
    const stopRecording = () => { if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); setIsRecording(false); } };
    const handleClearChat = () => {
        if (!selectedChat) return;
        setMessages(prev => ({ ...prev, [selectedChat.chatId]: [] }));
        updateLastMessage(selectedChat.chatId, null);
        setShowChatMenu(false);
    };
    const handleMediaDownload = (msgIndex, src, fileName) => { const link = document.createElement('a'); link.href = src; link.setAttribute('download', fileName || 'download'); document.body.appendChild(link); link.click(); document.body.removeChild(link); setDownloadedMedia(prev => ({ ...prev, [msgIndex]: true })); };
    const handleContextMenu = (event, message, index) => { event.preventDefault(); event.stopPropagation(); const menuWidth = 180; const menuHeight = 250; let x = event.pageX; let y = event.pageY; if (message.sender === currentUser?.id) x -= menuWidth; if (y + menuHeight > window.innerHeight) y -= menuHeight; setContextMenu({ visible: true, x, y, message, index }); };
    const handleReply = () => { setReplyingTo(contextMenu.message); setContextMenu({ visible: false }); messageInputRef.current.focus(); };
    const handleEdit = () => { setEditingInfo({ index: contextMenu.index, originalContent: contextMenu.message.content }); setMessage(contextMenu.message.content); setContextMenu({ visible: false }); messageInputRef.current.focus(); };
    const handleSaveEdit = () => { if (message.trim() === '') return; const currentMessages = messages[selectedChat.chatId]; const updatedMessages = [...currentMessages]; updatedMessages[editingInfo.index].content = message; updatedMessages[editingInfo.index].isEdited = true; setMessages(prev => ({ ...prev, [selectedChat.chatId]: updatedMessages })); setEditingInfo({ index: null, originalContent: '' }); setMessage(''); };
    const cancelEdit = () => { setEditingInfo({ index: null, originalContent: '' }); setMessage(''); };
    const handleDelete = (forEveryone) => {
        const chatId = selectedChat.chatId;
        const currentMessages = [...(messages[chatId] || [])];
        const messageToDelete = currentMessages[contextMenu.index];
        let nextMessages = [...currentMessages];
        if (forEveryone) {
            nextMessages[contextMenu.index] = { ...messageToDelete, type: 'deleted', content: 'This message was deleted', originalMessage: messageToDelete };
            setLastDeleted({ index: contextMenu.index, message: messageToDelete });
            setTimeout(() => setLastDeleted(null), 5000);
        } else {
            nextMessages.splice(contextMenu.index, 1);
        }
        setMessages(prev => ({ ...prev, [chatId]: nextMessages }));
        const newLastMessage = nextMessages.length > 0 ? nextMessages[nextMessages.length - 1] : null;
        updateLastMessage(chatId, newLastMessage);
        setContextMenu({ visible: false });
    };
    const handleUndoDelete = () => { if (!lastDeleted) return; const currentMessages = [...messages[selectedChat.chatId]]; currentMessages[lastDeleted.index] = lastDeleted.message; setMessages(prev => ({ ...prev, [selectedChat.chatId]: currentMessages })); setLastDeleted(null); };
    const handlePin = () => { setPinnedMessages(prev => ({ ...prev, [selectedChat.chatId]: { message: contextMenu.message, index: contextMenu.index } })); setContextMenu({ visible: false }); };
    const handleUnpin = () => { setPinnedMessages(prev => { const newPinned = { ...prev }; delete newPinned[selectedChat.chatId]; return newPinned; }); setShowPinnedMenu(false); };
    const handleGoToMessage = () => { setShowPinnedMenu(false); const pinnedInfo = pinnedMessages[selectedChat.chatId]; if (pinnedInfo) { const messageElement = document.querySelector(`[data-message-index='${pinnedInfo.index}']`); if (messageElement) { messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); messageElement.classList.add('animate-pulse', 'bg-blue-200'); setTimeout(() => messageElement.classList.remove('animate-pulse', 'bg-blue-200'), 2500); } } };
    const handleForward = () => { setForwardingInfo({ visible: true, message: contextMenu.message }); setContextMenu({ visible: false }); };
    
    const handleConfirmForward = () => {
        const originalMsg = forwardingInfo.message;
        if (!originalMsg) return;

        forwardRecipients.forEach(chatId => {
            const forwardedMessage = {
                type: originalMsg.type,
                content: originalMsg.content,
                fileName: originalMsg.fileName,
                fileSize: originalMsg.fileSize,
                isForwarded: true,
                sender: currentUser?.id,
                timestamp: new Date().toISOString(),
                status: 'sent',
                replyTo: null
            };
            setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), forwardedMessage] }));
            updateLastMessage(chatId, forwardedMessage);
        });
        setForwardingInfo({ visible: false, message: null });
        setForwardRecipients([]);
        setForwardSearchTerm('');
    };

    const allChats = [
        ...chatData.privateChatsWith.filter(user => user.chatId !== currentUser?.id),
        ...chatData.groups,
    ].sort((a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp));

    const filteredChats = allChats.filter(chat => chat.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleChatSelect = (chat) => {
        if (chat.unreadMessageCount > 0) {
            setChatData(prev => ({
                ...prev,
                groups: prev.groups.map(g => g.chatId === chat.chatId ? { ...g, unreadMessageCount: 0 } : g),
                privateChatsWith: prev.privateChatsWith.map(p => p.chatId === chat.chatId ? { ...p, unreadMessageCount: 0 } : p),
            }));
        }
        setSelectedChat(chat);
        setIsChatOpen(true);
    };

    const openGroupInfoModal = () => {
        if (selectedChat?.type === 'group') {
            setActiveGroupInfoTab('Overview');
            setIsGroupInfoModalOpen(true);
        }
    };

    const extractLinks = (messages) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return messages.reduce((acc, msg) => {
            if (msg.type === 'text' && msg.content) {
                const matches = msg.content.match(urlRegex);
                if (matches) { acc.push(...matches); }
            }
            return acc;
        }, []);
    };

    const formatTimestamp = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (isNaN(date)) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateHeader = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (isNaN(date)) return 'Invalid Date';
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatLastSeen = (isoString) => { if (!isoString) return 'Offline'; const date = new Date(isoString); if (isNaN(date)) return 'Offline'; const today = new Date(); if (date.toDateString() === today.toDateString()) return `last seen today at ${formatTimestamp(isoString)}`; return `last seen on ${date.toLocaleDateString()}`; };

    const getStatusRingColor = (status) => {
        switch (status) {
            case 'sent': return 'ring-gray-400';
            case 'delivered': return 'ring-blue-500';
            case 'seen': return 'ring-green-500';
            default: return 'ring-transparent';
        }
    };

    let lastMessageDate = null;

    const currentChatInfo = selectedChat ? allChats.find(c => c.chatId === selectedChat.chatId) : null;
    const chatMessages = currentChatInfo ? messages[currentChatInfo.chatId] || [] : [];
    const pinnedMessageInfo = currentChatInfo ? pinnedMessages[currentChatInfo.chatId] : null;

    const getSenderInfo = (senderId) => {
        if (!currentUser) return { name: 'Unknown', profile: '' };
        if (senderId === currentUser.id) return { name: currentUser.name, profile: currentUser.profile };
        
        const allUsers = [...chatData.privateChatsWith, ...(currentChatInfo?.members || [])];
        const member = allUsers.find(m => m.chatId === senderId);
        return member
            ? { name: member.employeeName, profile: member.profile }
            : { name: 'Unknown User', profile: 'https://placehold.co/100x100/E2E8F0/4A5568?text=??' };
    };

    return (
        <div className="w-full h-full bg-gray-100 font-sans">
            <div className="flex w-full h-full p-0 md:p-4 md:gap-4">
                <div className={`relative w-full md:w-[30%] h-full p-4 bg-white flex flex-col shadow-xl md:rounded-lg ${isChatOpen ? 'hidden md:flex' : 'flex'}`}>
                    <div className="mb-4 flex-shrink-0"><input type="text" placeholder="Search chats or users..." className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                    <div className="flex-grow space-y-2 pr-2 overflow-y-auto custom-scrollbar">
                        {filteredChats.map(chat => (
                            <div key={chat.chatId} onClick={() => handleChatSelect(chat)} className={`p-3 flex items-center rounded-lg cursor-pointer group ${selectedChat?.chatId === chat.chatId ? 'bg-blue-100' : 'hover:bg-blue-50'}`}>
                                <div className="relative flex-shrink-0">
                                    {chat.type === 'group' ? (
                                        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center">
                                            <FaUsers className="text-gray-500" size={24} />
                                        </div>
                                    ) : (
                                        <img src={chat.profile} alt={chat.name} className="w-11 h-11 rounded-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/100x100/E2E8F0/4A5568?text=??' }} />
                                    )}
                                    {chat.isOnline && (<span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>)}
                                </div>
                                <div className="flex-1 min-w-0 mx-3"><p className="font-semibold text-gray-800 truncate">{chat.name}</p><p className="text-sm text-gray-500 truncate">{chat.lastMessage || 'No messages yet'}</p></div>
                                {chat.unreadMessageCount > 0 && (<div className="flex-shrink-0"><span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{chat.unreadMessageCount}</span></div>)}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`w-full md:w-[70%] h-full flex flex-col bg-white md:rounded-lg shadow-xl ${isChatOpen ? 'flex' : 'hidden md:flex'}`}>
                    {!currentChatInfo ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-xl text-center text-gray-600">Select a chat to begin</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
                                <div className="flex items-center space-x-3 flex-grow min-w-0">
                                    <button onClick={() => setIsChatOpen(false)} className="md:hidden p-2 rounded-full hover:bg-gray-100"><FaArrowLeft /></button>
                                    <button onClick={() => setIsProfileModalOpen(true)} className="flex-shrink-0">
                                        {currentChatInfo.type === 'group' ? (
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                <FaUsers className="text-gray-500" size={28} />
                                            </div>
                                        ) : (
                                            <img src={currentChatInfo.profile} alt={currentChatInfo.name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/100x100/E2E8F0/4A5568?text=??' }} />
                                        )}
                                    </button>
                                    <div className="truncate">
                                        <button onClick={openGroupInfoModal} disabled={currentChatInfo.type !== 'group'} className="text-left">
                                            <p className="font-bold text-lg truncate">{currentChatInfo.name}</p>
                                        </button>
                                        {currentChatInfo.type === 'private' ? (
                                            <p className="text-sm text-gray-500">{currentChatInfo.isOnline ? 'Online' : formatLastSeen(currentChatInfo.lastSeen)}</p>
                                        ) : (
                                            <p className="text-sm text-gray-500">{currentChatInfo.memberCount || 0} members</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2"><button className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><FaVideo size={20} /></button><button className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><FaPhone size={20} /></button><div className="relative"><button ref={chatMenuButtonRef} onClick={() => setShowChatMenu(!showChatMenu)} className="p-2 rounded-full hover:bg-gray-100"><BsThreeDotsVertical size={20} /></button>{showChatMenu && (<div ref={chatMenuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20"><button onClick={handleClearChat} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Clear chat</button></div>)}</div></div>
                            </div>

                            {pinnedMessageInfo && (
                                <div className="flex-shrink-0 flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center gap-2 text-sm overflow-hidden cursor-pointer flex-grow min-w-0" onClick={handleGoToMessage}><FaThumbtack className="text-gray-500 flex-shrink-0" /><FileIcon fileName={pinnedMessageInfo.message.fileName || ''} type={pinnedMessageInfo.message.type} className="text-lg flex-shrink-0" /><div className="truncate"><p className="font-bold text-blue-600">Pinned Message</p><p className="text-gray-600 truncate">{pinnedMessageInfo.message.type === 'text' ? pinnedMessageInfo.message.content : pinnedMessageInfo.message.fileName || 'Voice Message'}</p></div></div>
                                    <div className="relative flex-shrink-0"><button ref={pinnedMenuButtonRef} onClick={() => setShowPinnedMenu(!showPinnedMenu)} className="p-2 rounded-full hover:bg-gray-200"><FaChevronDown /></button>{showPinnedMenu && (<div ref={pinnedMenuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 text-sm"><ul className="py-1"><li onClick={handleGoToMessage} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"><FaAngleDoubleRight /> Go to message</li><li onClick={handleUnpin} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3 text-red-600"><FaTimes /> Unpin</li></ul></div>)}</div>
                                </div>
                            )}
                            <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto bg-gray-50">
                                {isMessagesLoading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <p className="text-gray-500">Loading messages...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {chatMessages.map((msg, index) => {
                                            const isMyMessage = msg.sender === currentUser?.id;
                                            const showDateHeader = lastMessageDate !== new Date(msg.timestamp).toDateString();
                                            if (showDateHeader) {
                                                lastMessageDate = new Date(msg.timestamp).toDateString();
                                            }
                                            const senderInfo = !isMyMessage ? getSenderInfo(msg.sender) : null;
                                            const isMedia = ['image', 'audio', 'file'].includes(msg.type);

                                            return (
                                                <React.Fragment key={msg.messageId || index}>
                                                    {showDateHeader && (
                                                        <div className="text-center my-4">
                                                            <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">{formatDateHeader(msg.timestamp)}</span>
                                                        </div>
                                                    )}
                                                    <div data-message-index={index} className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                                        {!isMyMessage && (
                                                            <img src={currentChatInfo.type === 'group' ? senderInfo?.profile : currentChatInfo.profile} alt={senderInfo?.name} className="w-8 h-8 rounded-full object-cover self-start" onError={(e) => { e.target.src = 'https://placehold.co/100x100/E2E8F0/4A5568?text=??' }} />
                                                        )}
                                                        <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                                            {currentChatInfo.type === 'group' && !isMyMessage && (
                                                                <p className="text-xs text-gray-500 mb-1 ml-2 font-semibold">{senderInfo?.name}</p>
                                                            )}
                                                            <div onContextMenu={(e) => handleContextMenu(e, msg, index)} className={`rounded-lg max-w-xs md:max-w-md ${isMedia || msg.type === 'deleted' ? 'p-2' : 'p-3'} ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                                {msg.type === 'deleted' ? (
                                                                    <div className="flex items-center gap-2 italic text-sm opacity-70">
                                                                        <span>This message was deleted</span>
                                                                        {lastDeleted?.index === index && <button onClick={handleUndoDelete} className="font-semibold hover:underline">Undo</button>}
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {msg.isForwarded && <div className="flex items-center gap-1.5 text-xs opacity-70 mb-1 font-semibold"><FaShare /> Forwarded</div>}
                                                                        {msg.replyTo && (
                                                                            <div className={`p-2 rounded mb-2 text-sm ${isMyMessage ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                                                <p className="font-semibold">{msg.replyTo.sender === currentUser?.id ? 'You' : getSenderInfo(msg.replyTo.sender).name}</p>
                                                                                <p className="opacity-80 truncate">{['image', 'audio', 'file'].includes(msg.replyTo.type) ? `Media (${msg.replyTo.type})` : msg.replyTo.content}</p>
                                                                            </div>
                                                                        )}
                                                                        {msg.type === 'image' ? (
                                                                            <button onClick={() => setImageInView(`http://localhost:8082/api/chat/file/${msg.messageId}`)}><img src={`http://localhost:8082/api/chat/file/${msg.messageId}`} alt={msg.fileName || 'image'} className="rounded-md max-w-full" /></button>
                                                                        ) : msg.type === 'audio' ? (
                                                                            <AudioPlayer src={`http://localhost:8082/api/chat/file/${msg.messageId}`} isSender={isMyMessage} isDownloaded={!!downloadedMedia[index]} onDownload={() => handleMediaDownload(index, `http://localhost:8082/api/chat/file/${msg.messageId}`, 'voice-message.wav')} />
                                                                        ) : msg.type === 'file' ? (
                                                                            isMyMessage ? (
                                                                                <a 
                                                                                    href={`http://localhost:8082/api/chat/file/${msg.messageId}`} 
                                                                                    target="_blank" 
                                                                                    rel="noopener noreferrer" 
                                                                                    className="flex items-center gap-3 cursor-pointer"
                                                                                >
                                                                                    <FileIcon fileName={msg.fileName} type={msg.type} />
                                                                                    <div className="flex-grow min-w-0">
                                                                                        <p className="font-bold text-sm truncate text-white">{msg.fileName}</p>
                                                                                        <p className="text-xs text-blue-200">{msg.fileSize ? `${(msg.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}</p>
                                                                                    </div>
                                                                                </a>
                                                                            ) : (
                                                                                <div className="flex items-center gap-3">
                                                                                    <FileIcon fileName={msg.fileName} type={msg.type} />
                                                                                    <div className="flex-grow min-w-0">
                                                                                        <p className="font-bold text-sm truncate text-gray-800">{msg.fileName}</p>
                                                                                        <p className="text-xs text-gray-500">{msg.fileSize ? `${(msg.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}</p>
                                                                                    </div>
                                                                                    <a 
                                                                                        href={`http://localhost:8082/api/chat/file/${msg.messageId}`} 
                                                                                        download={msg.fileName}
                                                                                        className="p-2 rounded-full text-gray-500 hover:bg-gray-300 cursor-pointer"
                                                                                    >
                                                                                        <FaDownload />
                                                                                    </a>
                                                                                </div>
                                                                            )
                                                                        ) : (
                                                                            <p className="text-sm break-words">{msg.content}</p>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-400 mt-1 px-1">{formatTimestamp(msg.timestamp)} {msg.isEdited ? '(edited)' : ''}</span>
                                                        </div>
                                                        {isMyMessage && (
                                                            <div className={`relative w-8 h-8 self-start flex-shrink-0`}>
                                                                <img src={currentUser?.profile || 'https://placehold.co/100x100/E2E8F0/4A5568?text=Me'} alt="current user" className={`w-full h-full rounded-full object-cover ring-2 ${getStatusRingColor(msg.status)}`} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0 flex flex-col p-4 border-t border-gray-200">
                                {replyingTo && (<div className="bg-gray-100 p-2 rounded-t-lg flex justify-between items-center"><div className="text-sm overflow-hidden"><p className="font-semibold text-blue-600">Replying to {replyingTo.sender === currentUser?.id ? 'yourself' : getSenderInfo(replyingTo.sender).name}</p><p className="text-gray-600 truncate">{['image', 'audio', 'file'].includes(replyingTo.type) ? 'Media message' : replyingTo.content}</p></div><button onClick={() => setReplyingTo(null)}><FaTimes /></button></div>)}
                                {editingInfo.index !== null && (<div className="bg-gray-100 p-2 rounded-t-lg flex justify-between items-center"><div className="text-sm overflow-hidden"><p className="font-semibold text-blue-600">Editing message</p><p className="text-gray-600 truncate">{editingInfo.originalContent}</p></div><button onClick={cancelEdit}><FaTimes /></button></div>)}
                                {currentChatInfo && (
                                    <div className={`relative flex items-center w-full space-x-2 ${(replyingTo || editingInfo.index !== null) ? 'pt-2' : ''}`}>
                                        {showEmojiPicker && (
                                            <div ref={emojiPickerRef} className="absolute bottom-full mb-2 left-0 z-40 w-[95vw] max-w-sm">
                                                <EmojiPicker onEmojiClick={onEmojiClick} width="100%" height={350} />
                                            </div>
                                        )}
                                        <div className="relative flex-grow"><input ref={messageInputRef} type="text" placeholder={isRecording ? "Recording..." : "Type a message..."} className="w-full p-3 pr-12 rounded-full border bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} disabled={isRecording} /><button onClick={editingInfo.index !== null ? handleSaveEdit : handleSendMessage} className={`absolute right-2 top-1/2 -translate-y-1/2 text-white p-2 rounded-full ${editingInfo.index !== null ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{editingInfo.index !== null ? <FaCheck size={14} /> : <FaPaperPlane size={14} />}</button></div><button ref={emojiButtonRef} onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-3 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><FaSmile size={20} /></button><button onClick={handleFileButtonClick} className="p-3 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><FaPaperclip size={20} /></button><button onClick={handleMicButtonClick} className={`p-3 rounded-full hover:bg-gray-100 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-blue-600'}`}>{isRecording ? <FaStop size={20} /> : <FaMicrophone size={20} />}</button><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
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
                                {contextMenu.message.sender === currentUser?.id && contextMenu.message.type === 'text' && (new Date() - new Date(contextMenu.message.timestamp) < 15 * 60 * 1000) && (
                                    <li onClick={handleEdit} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"><FaEdit /> Edit</li>
                                )}
                                <hr className="my-1" />
                                <li onClick={() => handleDelete(false)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3 text-red-600"><FaTrash /> Delete for me</li>
                                {contextMenu.message.sender === currentUser?.id && (
                                    <li onClick={() => handleDelete(true)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3 text-red-600"><FaTrash /> Delete for everyone</li>
                                )}
                            </>
                        )}
                    </ul>
                </div>
            )}

            {forwardingInfo.visible && (<div className="fixed inset-0 bg-opacity-100 flex items-center justify-center z-[100]"><div className="bg-white rounded-lg shadow-2xl w-full max-w-md"><div className="p-4 border-b flex justify-between items-center"><h3 className="font-bold text-lg">Forward message to...</h3><button onClick={() => setForwardingInfo({ visible: false, message: null })}><FaTimes /></button></div><div className="p-4"><input type="text" placeholder="Search for users or groups" className="w-full p-2 border rounded-lg" value={forwardSearchTerm} onChange={(e) => setForwardSearchTerm(e.target.value)} /></div><div className="h-64 overflow-y-auto p-4">{allChats.filter(c => c.name?.toLowerCase().includes(forwardSearchTerm.toLowerCase())).map(chat => (<div key={chat.chatId} className="flex items-center p-2 rounded-lg hover:bg-gray-100"><input type="checkbox" id={`fwd-${chat.chatId}`} className="mr-3 h-4 w-4 accent-blue-600" checked={forwardRecipients.includes(chat.chatId)} onChange={(e) => { if (e.target.checked) setForwardRecipients([...forwardRecipients, chat.chatId]); else setForwardRecipients(forwardRecipients.filter(id => id !== chat.chatId)); }} />
                <label htmlFor={`fwd-${chat.chatId}`} className="flex-grow flex items-center gap-3 cursor-pointer">
                    {chat.type === 'group' ? (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><FaUsers className="text-gray-500" /></div>
                    ) : (
                        <img src={chat.profile} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <span>{chat.name}</span>
                </label>
            </div>))}</div><div className="p-4 border-t text-right"><button onClick={handleConfirmForward} disabled={forwardRecipients.length === 0} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400">Forward</button></div></div></div>)}

            {isProfileModalOpen && currentChatInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]" onClick={() => setIsProfileModalOpen(false)}>
                    <img src={currentChatInfo.profile} alt={currentChatInfo.name} className="max-w-[80vw] max-h-[80vh] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {isGroupInfoModalOpen && currentChatInfo?.type === 'group' && (
                <div className="fixed inset-0 bg-opacity-100 flex items-center justify-center z-[100]" onClick={() => setIsGroupInfoModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                            <h3 className="font-bold text-xl">Group Info</h3>
                            <button onClick={() => setIsGroupInfoModalOpen(false)} className="p-2 rounded-full hover:bg-gray-200"><FaTimes /></button>
                        </div>
                        <div className="flex border-b flex-shrink-0">
                            {['Overview', 'Members', 'Media', 'Files', 'Links'].map(tab => (
                                <button key={tab} onClick={() => setActiveGroupInfoTab(tab)} className={`flex-1 p-3 text-sm font-semibold ${activeGroupInfoTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 overflow-y-auto flex-grow">
                            {activeGroupInfoTab === 'Overview' && (
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center">
                                        <FaUsers className="text-gray-500" size={80} />
                                    </div>
                                    <h2 className="text-2xl font-bold">{currentChatInfo.name}</h2>
                                    <p className="text-gray-600">{currentChatInfo.memberCount || 0} members</p>
                                </div>
                            )}
                            {activeGroupInfoTab === 'Members' && (
                                <div className="space-y-3">
                                    {currentChatInfo.members?.map((member, i) => (
                                        <div key={i} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50">
                                            <img src={member.profile} alt={member.employeeName} className="w-10 h-10 rounded-full object-cover" />
                                            <span className="font-semibold">{member.employeeName}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeGroupInfoTab === 'Media' && (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                    {chatMessages.filter(msg => msg.type === 'image').map((msg, i) => (
                                        <button key={i} onClick={() => setImageInView(`http://localhost:8082/api/chat/file/${msg.messageId}`)}>
                                            <img src={`http://localhost:8082/api/chat/file/${msg.messageId}`} alt={msg.fileName} className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            {activeGroupInfoTab === 'Files' && (
                                <div className="space-y-3">
                                    {chatMessages.filter(msg => msg.type === 'file').map((msg, i) => (
                                        <a key={i} href={`http://localhost:8082/api/chat/file/${msg.messageId}`} download={msg.fileName} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
                                            <FileIcon fileName={msg.fileName} />
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm truncate text-gray-800">{msg.fileName}</p>
                                                <p className="text-xs text-gray-500">{msg.fileSize ? `${(msg.fileSize / 1024).toFixed(2)} KB` : ''}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                            {activeGroupInfoTab === 'Links' && (
                                <div className="space-y-3">
                                    {extractLinks(chatMessages).map((link, i) => (
                                        <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-blue-600 truncate">
                                            {link}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {imageInView && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[120]" onClick={() => setImageInView(null)}>
                    <img src={imageInView} alt="Full view" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}

export default ChatApplication;