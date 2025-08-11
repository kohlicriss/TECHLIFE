import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import {
    FaMicrophone, FaPaperclip, FaSmile, FaPaperPlane, FaArrowLeft, FaStop,
    FaFileAlt, FaDownload, FaPlay, FaPause,
    FaVideo, FaPhone, FaReply, FaEdit, FaThumbtack, FaShare, FaTrash, FaTimes, FaCheck,
    FaChevronDown, FaImage, FaFileAudio, FaEye, FaAngleDoubleRight, FaCamera, FaPen, FaUsers, FaUser,
    FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileExcel, FaFileArchive
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import {
    getMessages,
    updateMessage,
    deleteMessageForMe,
    deleteMessageForEveryone,
    uploadFile
} from '../../../../services/apiService';
import { transformMessageDTOToUIMessage } from '../../../../services/dataTransformer';


// Helper to format file size
const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Updated FileIcon to show specific icons for different file types
const FileIcon = ({ fileName, className = "text-3xl" }) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension)) return <FaFilePdf className={`text-red-500 ${className}`} />;
    if (['doc', 'docx'].includes(extension)) return <FaFileWord className={`text-blue-700 ${className}`} />;
    if (['ppt', 'pptx'].includes(extension)) return <FaFilePowerpoint className={`text-orange-500 ${className}`} />;
    if (['xls', 'xlsx'].includes(extension)) return <FaFileExcel className={`text-green-600 ${className}`} />;
    if (['zip', 'rar', '7z'].includes(extension)) return <FaFileArchive className={`text-yellow-500 ${className}`} />;
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) return <FaImage className={`text-purple-500 ${className}`} />;
    if (['mp3', 'wav', 'ogg'].includes(extension)) return <FaFileAudio className={`text-pink-500 ${className}`} />;
    return <FaFileAlt className={`text-gray-500 ${className}`} />;
};


// New component to render file messages
const FileMessage = ({ msg, isMyMessage }) => {
    // FIXED: Use msg.messageId instead of msg.content to build the URL
    const downloadUrl = `http://192.168.0.244:8082/api/chat/file/${msg.messageId}`;

    const containerClasses = `flex items-center gap-3 p-2 rounded-lg max-w-xs md:max-w-sm ${isMyMessage ? 'bg-blue-600' : 'bg-gray-200'}`;

    const content = (
        <div className={containerClasses}>
            <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                 <FileIcon fileName={msg.fileName} className="text-4xl" />
            </div>
            <div className="flex-grow overflow-hidden mr-2">
                <p className={`font-semibold truncate ${isMyMessage ? 'text-white' : 'text-gray-800'}`}>{msg.fileName}</p>
                <p className={`text-sm ${isMyMessage ? 'text-blue-200' : 'text-gray-600'}`}>{formatFileSize(msg.fileSize)}</p>
            </div>
            {!isMyMessage && (
                 <a href={downloadUrl} download={msg.fileName} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-black/20 hover:bg-black/30 text-white transition-colors">
                    <FaDownload size={18} />
                </a>
            )}
        </div>
    );

    // Make the file clickable for download only for the receiver
    return !isMyMessage ? <a href={downloadUrl} download={msg.fileName} target="_blank" rel="noopener noreferrer">{content}</a> : content;
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
                <div className="flex-grow"><p className="text-sm text-gray-700">Voice Message</p><p className="text-xs text-gray-500">{formatFileSize(0)}</p></div>
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

// Skeleton component for loading messages
const MessageSkeleton = () => (
    <div className="space-y-4 p-4">
        <div className="flex items-end gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
            <div className="h-10 rounded-lg bg-gray-200 animate-pulse w-48"></div>
        </div>
        <div className="flex items-end gap-2 justify-end">
            <div className="h-12 rounded-lg bg-blue-200 animate-pulse w-32"></div>
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
        </div>
        <div className="flex items-end gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
            <div className="h-16 rounded-lg bg-gray-200 animate-pulse w-64"></div>
        </div>
        <div className="flex items-end gap-2 justify-end">
            <div className="h-10 rounded-lg bg-blue-200 animate-pulse w-40"></div>
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
        </div>
         <div className="flex items-end gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
            <div className="h-10 rounded-lg bg-gray-200 animate-pulse w-32"></div>
        </div>
    </div>
);


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
    const [isChatDataReady, setIsChatDataReady] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const chatContainerRef = useRef(null);
    const stompClient = useRef(null);
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
    const onMessageReceivedRef = useRef(null);
    const subscriptions = useRef({});

    useEffect(() => {
        if (initialChats) {
            setChatData(initialChats);
            setIsChatDataReady(true);
        }
    }, [initialChats]);

    useEffect(() => {
        if (!selectedChat) return;

        const fetchMessages = async () => {
            setIsMessagesLoading(true);
            try {
                const rawMessages = await getMessages(currentUser.id, selectedChat.chatId);
                const transformedMessages = rawMessages.map(transformMessageDTOToUIMessage);
                setMessages(prev => ({ ...prev, [selectedChat.chatId]: transformedMessages }));
            } catch (error) {
                console.error(`Failed to process messages for chat ${selectedChat.chatId}:`, error);
                setMessages(prev => ({ ...prev, [selectedChat.chatId]: [] }));
            } finally {
                setIsMessagesLoading(false);
            }
        };

        fetchMessages();
    }, [selectedChat, currentUser.id]);

    const updateLastMessage = useCallback((chatId, message) => {
        const generatePreview = (msg) => {
            if (!msg) return 'Chat cleared';
            if (msg.type === 'deleted') return 'This message was deleted';
            
            const prefix = msg.sender === currentUser.id ? 'You: ' : '';
            
            if (msg.type === 'image') return prefix + '📷 Image';
            if (msg.type === 'audio') return prefix + '🎤 Voice Message';
            if (msg.type === 'file') return prefix + `📄 ${msg.fileName}`;
            if (msg.content) return prefix + msg.content;
            
            return '...';
        };

        setChatData(prev => {
            const newGroups = prev.groups.map(g => {
                if (g.chatId === chatId) {
                    return {
                        ...g,
                        lastMessage: generatePreview(message),
                        lastMessageTimestamp: message?.timestamp || new Date(0).toISOString(),
                        unreadMessageCount: (g.unreadMessageCount || 0) + (message && message.sender !== currentUser.id && selectedChat?.chatId !== chatId ? 1 : 0)
                    };
                }
                return g;
            });
            const newPrivate = prev.privateChatsWith.map(p => {
                if (p.chatId === chatId) {
                    return {
                        ...p,
                        lastMessage: generatePreview(message),
                        lastMessageTimestamp: message?.timestamp || new Date(0).toISOString(),
                        unreadMessageCount: (p.unreadMessageCount || 0) + (message && message.sender !== currentUser.id && selectedChat?.chatId !== chatId ? 1 : 0)
                    };
                }
                return p;
            });
            return { groups: newGroups, privateChatsWith: newPrivate };
        });
    }, [currentUser.id, selectedChat]);

    const onMessageReceived = useCallback((payload) => {
        const receivedMessage = JSON.parse(payload.body);

        const isAck = receivedMessage.sender === currentUser.id && receivedMessage.client_id;
        const isIncoming = receivedMessage.sender !== currentUser.id;
        const messageChatId = receivedMessage.groupId || (isAck ? receivedMessage.receiver : receivedMessage.sender);

        if (!messageChatId) {
            console.warn("Received message without a clear chat ID", receivedMessage);
            return;
        }

        if (receivedMessage.fileName && !receivedMessage.content && !receivedMessage.id) {
             console.warn("Received a file message stub, ignoring until full data arrives:", receivedMessage);
             return;
        }

        setMessages(prevMessages => {
            const chatMessages = prevMessages[messageChatId] || [];
            let newChatMessages = [...chatMessages];
            let messageProcessed = false;
            let finalMessageForUpdate = null;

            const finalServerId = receivedMessage.messageId || receivedMessage.id;

            const messageAlreadyExists = chatMessages.some(m => m.messageId === finalServerId && m.status !== 'sending');
            if (messageAlreadyExists) {
                return prevMessages;
            }
            
            if (isAck) {
                const optimisticIndex = newChatMessages.findIndex(m => m.id === receivedMessage.client_id);
                if (optimisticIndex > -1) {
                    const optimisticMessage = newChatMessages[optimisticIndex];
                    const transformedServerMessage = transformMessageDTOToUIMessage({
                        ...receivedMessage,
                        messageId: finalServerId,
                        id: finalServerId,
                    });

                    newChatMessages[optimisticIndex] = {
                        ...optimisticMessage,
                        ...transformedServerMessage,
                        status: 'sent',
                    };
                    finalMessageForUpdate = newChatMessages[optimisticIndex];
                    messageProcessed = true;
                }
            } else if (isIncoming) {
                const finalMessage = transformMessageDTOToUIMessage({
                    ...receivedMessage,
                    id: finalServerId,
                    messageId: finalServerId,
                });
                newChatMessages.push(finalMessage);
                finalMessageForUpdate = finalMessage;
                messageProcessed = true;
            }

            if (messageProcessed) {
                updateLastMessage(messageChatId, finalMessageForUpdate);
                return { ...prevMessages, [messageChatId]: newChatMessages };
            }

            return prevMessages;
        });
    }, [currentUser.id, updateLastMessage]);


    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    });

    useEffect(() => {
        if (!currentUser?.id || !isChatDataReady) return;

        if (stompClient.current) {
            return;
        }

        const brokerURL = `ws://192.168.0.244:8082/ws?employeeId=${currentUser.id}`;
        const client = new Client({
            brokerURL,
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnected(true);
                const messageHandler = (payload) => {
                    if (onMessageReceivedRef.current) {
                        onMessageReceivedRef.current(payload);
                    }
                };
                subscriptions.current['private'] = client.subscribe(`/user/queue/private`, messageHandler);
                subscriptions.current['private-ack'] = client.subscribe(`/user/queue/private-ack`, messageHandler);
                subscriptions.current['group-ack'] = client.subscribe(`/user/queue/group-ack`, messageHandler);
            },
            onWebSocketError: (error) => console.error('WebSocket Error:', error),
            onStompError: (frame) => console.error('STOMP Error:', frame.headers['message'], frame.body),
            onWebSocketClose: () => {
                setIsConnected(false);
            }
        });

        client.activate();
        stompClient.current = client;

        return () => {
            if (stompClient.current?.active) {
                stompClient.current.deactivate();
                stompClient.current = null;
            }
        };
    }, [currentUser?.id, isChatDataReady]);

    const groupIds = useMemo(() => {
        return (chatData.groups || []).map(g => g.chatId).sort().join(',');
    }, [chatData.groups]);

    useEffect(() => {
        if (!isConnected || !stompClient.current?.active) return;

        const messageHandler = (payload) => {
            if (onMessageReceivedRef.current) {
                onMessageReceivedRef.current(payload);
            }
        };

        const requiredGroupIds = new Set((chatData.groups || []).map(g => g.chatId.toString()));
        const currentSubKeys = Object.keys(subscriptions.current);
        const subscribedGroupIds = new Set(currentSubKeys.filter(key => key.startsWith('group-')).map(key => key.replace('group-', '')));

        subscribedGroupIds.forEach(groupId => {
            if (!requiredGroupIds.has(groupId)) {
                const subId = `group-${groupId}`;
                if (subscriptions.current[subId]) {
                    subscriptions.current[subId].unsubscribe();
                    delete subscriptions.current[subId];
                }
            }
        });

        requiredGroupIds.forEach(groupId => {
            if (!subscribedGroupIds.has(groupId)) {
                const subId = `group-${groupId}`;
                subscriptions.current[subId] = stompClient.current.subscribe(`/topic/team-${groupId}`, messageHandler);
            }
        });

    }, [isConnected, groupIds, chatData.groups]);

    const openChat = useCallback((targetChat) => {
        if (!stompClient.current || !stompClient.current.active) {
            return;
        }
        const destination = `/app/presence/open/${targetChat.chatId}`;
        const payload = {
            userId: currentUser.id,
            type: targetChat.type === 'group' ? 'TEAM' : 'PRIVATE'
        };
        stompClient.current.publish({ destination, body: JSON.stringify(payload) });
        setSelectedChat(targetChat);
        setIsChatOpen(true);
    }, [currentUser.id]);

    const closeChat = useCallback(() => {
        if (!selectedChat || !stompClient.current?.active) return;
        const destination = `/app/presence/close/${selectedChat.chatId}`;
        stompClient.current.publish({ destination, body: "{}" });
        setSelectedChat(null);
        setIsChatOpen(false);
    }, [selectedChat]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (selectedChat && stompClient.current && stompClient.current.active) {
                const destination = `/app/presence/close/${selectedChat.chatId}`;
                stompClient.current.publish({ destination, body: "{}" });
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [selectedChat]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, selectedChat]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && !emojiButtonRef.current?.contains(event.target)) setShowEmojiPicker(false);
            if (showChatMenu && chatMenuRef.current && !chatMenuRef.current.contains(event.target) && !chatMenuButtonRef.current?.contains(event.target)) setShowChatMenu(false);
            if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(event.target)) setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null });
            if (showPinnedMenu && pinnedMenuRef.current && !pinnedMenuRef.current.contains(event.target) && !pinnedMenuButtonRef.current?.contains(event.target)) setShowPinnedMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker, showChatMenu, contextMenu.visible, showPinnedMenu]);

    const handleSendMessage = () => { if (message.trim() && selectedChat) { addAndSendMessage({ type: 'text', content: message }); } };
    
    const addAndSendMessage = (messageObject) => {
        if (!selectedChat || !stompClient.current?.active) return;
        const clientId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        const optimisticMessage = {
            id: clientId,
            messageId: clientId,
            sender: currentUser.id,
            content: messageObject.content,
            timestamp: new Date().toISOString(),
            status: 'sending',
            type: messageObject.type,
            fileName: messageObject.fileName || null,
            fileSize: messageObject.fileSize || null,
            isEdited: false,
            replyTo: replyingTo,
            isForwarded: false,
        };
        
        updateLastMessage(selectedChat.chatId, optimisticMessage);

        setMessages(prev => ({
            ...prev,
            [selectedChat.chatId]: [...(prev[selectedChat.chatId] || []), optimisticMessage]
        }));
        const basePayload = {
            sender: currentUser.id,
            content: messageObject.content,
            kind: messageObject.type === 'text' ? 'send' : messageObject.type,
            fileName: messageObject.fileName || null,
        };
        let payload;
        if (selectedChat.type === 'group') {
            payload = { ...basePayload, type: 'TEAM', groupId: selectedChat.chatId, receiver: null };
        } else {
            payload = { ...basePayload, type: 'PRIVATE', groupId: null, receiver: selectedChat.chatId };
        }
        const stompPayload = { ...payload, client_id: clientId };
        const destination = '/app/chat/send';
        stompClient.current.publish({ destination, body: JSON.stringify(stompPayload) });
        if (messageObject.type === 'text') {
            setMessage('');
            setShowEmojiPicker(false);
        }
        setReplyingTo(null);
    };


    const handleKeyDown = (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (editingInfo.index !== null) handleSaveEdit(); else handleSendMessage(); } };
    const onEmojiClick = (emojiObject) => setMessage(prev => prev + emojiObject.emoji);
    const handleFileButtonClick = () => fileInputRef.current.click();

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file || !selectedChat) return;

        let messageType = 'file';
        if (file.type.startsWith('image/')) {
            messageType = 'image';
        } else if (file.type.startsWith('audio/')) {
            messageType = 'audio';
        }

        const clientId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        
        const localPreviewContent = (messageType === 'image' || messageType === 'audio') ? URL.createObjectURL(file) : file.name;

        const optimisticMessage = {
            id: clientId,
            messageId: clientId,
            sender: currentUser.id,
            content: localPreviewContent,
            timestamp: new Date().toISOString(),
            status: 'sending',
            type: messageType,
            fileName: file.name,
            fileSize: file.size,
        };

        updateLastMessage(selectedChat.chatId, optimisticMessage);

        setMessages(prev => ({
            ...prev,
            [selectedChat.chatId]: [...(prev[selectedChat.chatId] || []), optimisticMessage]
        }));

        const formData = new FormData();
        formData.append('file', file);
        formData.append('sender', currentUser.id);
        formData.append('client_id', clientId);
        formData.append('fileType', file.type);

        if (selectedChat.type === 'group') {
            formData.append('groupId', selectedChat.chatId);
            formData.append('type', 'TEAM');
        } else {
            formData.append('receiver', selectedChat.chatId);
            formData.append('type', 'PRIVATE');
        }

        try {
            await uploadFile(formData);
        } catch (error) {
            console.error("File upload failed in component:", error);
            setMessages(prev => {
                const chatMessages = prev[selectedChat.chatId] || [];
                const newMessages = chatMessages.map(m => m.id === clientId ? { ...m, status: 'failed' } : m);
                return { ...prev, [selectedChat.chatId]: newMessages };
            });
        } finally {
            event.target.value = null;
        }
    };

    const handleMicButtonClick = () => { if (isRecording) stopRecording(); else startRecording(); };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsRecording(true);
            audioChunksRef.current = [];
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
                
                stream.getTracks().forEach(track => track.stop());

                if (!selectedChat) return;

                const mockEvent = { target: { files: [audioFile], value: null } };
                handleFileChange(mockEvent);
            };
            
            mediaRecorderRef.current.start();
        } catch (error) {
            console.error("Mic error:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleClearChat = () => {
        if (!selectedChat) return;
        setMessages(prev => ({ ...prev, [selectedChat.chatId]: [] }));
        updateLastMessage(selectedChat.chatId, null);
        setShowChatMenu(false);
    };
    const handleMediaDownload = (src, fileName) => { const link = document.createElement('a'); link.href = src; link.setAttribute('download', fileName || 'download'); document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    const handleContextMenu = (event, message, index) => { event.preventDefault(); event.stopPropagation(); const menuWidth = 180; const menuHeight = 250; let x = event.pageX; let y = event.pageY; if (x + menuWidth > window.innerWidth) x -= menuWidth; if (y + menuHeight > window.innerHeight) y -= menuHeight; setContextMenu({ visible: true, x, y, message, index }); };
    const handleReply = () => { setReplyingTo(contextMenu.message); setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null }); messageInputRef.current.focus(); };
    const handleEdit = () => { setEditingInfo({ index: contextMenu.index, originalContent: contextMenu.message.content }); setMessage(contextMenu.message.content); setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null }); messageInputRef.current.focus(); };

    const handleSaveEdit = async () => {
        const updatedContent = message.trim();
        if (updatedContent === '' || editingInfo.index === null) return;

        const chatId = selectedChat.chatId;
        const currentMessages = messages[chatId];
        const messageToEdit = currentMessages[editingInfo.index];
        const messageId = messageToEdit.messageId;

        if (!messageId || messageId === editingInfo.originalContent) {
            cancelEdit();
            return;
        }

        try {
            await updateMessage(messageId, updatedContent, selectedChat.type === 'group' ? 'TEAM' : 'PRIVATE', currentUser.id);
            const updatedMessages = [...currentMessages];
            updatedMessages[editingInfo.index] = { ...updatedMessages[editingInfo.index], content: updatedContent, isEdited: true };
            setMessages(prev => ({ ...prev, [chatId]: updatedMessages }));
        } catch (error) {
            console.error(`Failed to update message ${messageId} in component:`, error);
        } finally {
            cancelEdit();
        }
    };

    const cancelEdit = () => { setEditingInfo({ index: null, originalContent: '' }); setMessage(''); };

    const handleDelete = async (forEveryone) => {
        const chatId = selectedChat.chatId;
        const currentMessages = [...(messages[chatId] || [])];
        const messageToDelete = currentMessages[contextMenu.index];
        const messageId = messageToDelete?.messageId;

        if (!messageId || messageToDelete.status === 'sending' || messageToDelete.status === 'failed') {
            setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null });
            return;
        }

        try {
            let nextMessages;
            if (forEveryone) {
                await deleteMessageForEveryone(messageId, currentUser.id);
                nextMessages = [...currentMessages];
                nextMessages[contextMenu.index] = { ...messageToDelete, type: 'deleted', content: 'This message was deleted', originalMessage: messageToDelete };
                setLastDeleted({ index: contextMenu.index, message: messageToDelete });
                setTimeout(() => setLastDeleted(null), 5000);
            } else {
                await deleteMessageForMe(messageId, currentUser.id);
                nextMessages = currentMessages.filter((_, i) => i !== contextMenu.index);
            }

            setMessages(prev => ({ ...prev, [chatId]: nextMessages }));
            const newLastMessage = nextMessages.length > 0 ? nextMessages[nextMessages.length - 1] : null;
            updateLastMessage(chatId, newLastMessage);
        } catch (error) {
            console.error(`Failed to delete message ${messageId} in component:`, error);
        } finally {
            setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null });
        }
    };

    const handleUndoDelete = () => { if (!lastDeleted) return; const currentMessages = [...messages[selectedChat.chatId]]; currentMessages[lastDeleted.index] = lastDeleted.message; setMessages(prev => ({ ...prev, [selectedChat.chatId]: currentMessages })); setLastDeleted(null); };
    const handlePin = () => { setPinnedMessages(prev => ({ ...prev, [selectedChat.chatId]: { message: contextMenu.message, index: contextMenu.index } })); setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null }); };
    const handleUnpin = () => { setPinnedMessages(prev => { const newPinned = { ...prev }; delete newPinned[selectedChat.chatId]; return newPinned; }); setShowPinnedMenu(false); };
    const handleGoToMessage = () => { setShowPinnedMenu(false); const pinnedInfo = pinnedMessages[selectedChat.chatId]; if (pinnedInfo) { const messageElement = document.querySelector(`[data-message-index='${pinnedInfo.index}']`); if (messageElement) { messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); messageElement.classList.add('animate-pulse', 'bg-blue-200'); setTimeout(() => messageElement.classList.remove('animate-pulse', 'bg-blue-200'), 2500); } } };
    const handleForward = () => { setForwardingInfo({ visible: true, message: contextMenu.message }); setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null }); };

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
        if ((chat.unreadMessageCount || 0) > 0) {
            setChatData(prev => ({
                ...prev,
                groups: prev.groups.map(g => g.chatId === chat.chatId ? { ...g, unreadMessageCount: 0 } : g),
                privateChatsWith: prev.privateChatsWith.map(p => p.chatId === chat.chatId ? { ...p, unreadMessageCount: 0 } : p),
            }));
        }
        if (selectedChat && selectedChat.chatId !== chat.chatId) {
            closeChat();
        }
        openChat(chat);
    };

    const openGroupInfoModal = () => {
        if (selectedChat?.type === 'group') {
            setActiveGroupInfoTab('Overview');
            setIsGroupInfoModalOpen(true);
        }
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
            case 'sending': return 'ring-yellow-400';
            case 'sent': return 'ring-gray-400';
            case 'delivered': return 'ring-blue-500';
            case 'seen': return 'ring-green-500';
            case 'failed': return 'ring-red-500';
            default: return 'ring-transparent';
        }
    };

    let lastMessageDate = null;

    const currentChatInfo = selectedChat ? allChats.find(c => c.chatId === selectedChat.chatId) : null;
    const chatMessages = currentChatInfo ? messages[currentChatInfo.chatId] || [] : [];
    const pinnedMessageInfo = currentChatInfo ? pinnedMessages[currentChatInfo.chatId] : null;

    const getSenderInfo = (senderId) => {
        if (!currentUser) return { name: 'Unknown', profile: null };
        if (senderId === currentUser.id) return { name: currentUser.name, profile: currentUser.profile };
        const allUsers = [...chatData.privateChatsWith, ...(currentChatInfo?.members || [])];
        const member = allUsers.find(m => m.chatId === senderId || m.employeeId === senderId);
        return member
            ? { name: member.name || member.employeeName, profile: member.profile || null }
            : { name: 'Unknown User', profile: null };
    };
    
    // FIXED: Use msg.messageId for confirmed messages to build the URL
    const getFileUrl = (msg) => {
        // Optimistic messages have a local blob URL in `content`
        if (msg.status === 'sending' || msg.status === 'failed') {
            return msg.content;
        }
        // Confirmed messages use the messageId to build the URL
        return `http://192.168.0.244:8082/api/chat/file/${msg.messageId}`;
    };


    return (
        <div className="w-full h-full bg-gray-100 font-sans">
            <div className="flex w-full h-full p-0 md:p-4 md:gap-4">
                {/* Chat List Panel */}
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
                                    ) : chat.profile ? (
                                        <img src={chat.profile} alt={chat.name} className="w-11 h-11 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center">
                                            <FaUser className="text-gray-500" size={24} />
                                        </div>
                                    )}
                                    {chat.isOnline && (<span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>)}
                                </div>
                                <div className="flex-1 min-w-0 mx-3"><p className="font-semibold text-gray-800 truncate">{chat.name}</p><p className="text-sm text-gray-500 truncate">{chat.lastMessage || 'No messages yet'}</p></div>
                                {(chat.unreadMessageCount || 0) > 0 && (<div className="flex-shrink-0"><span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{chat.unreadMessageCount}</span></div>)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window Panel */}
                <div className={`w-full md:w-[70%] h-full flex flex-col bg-white md:rounded-lg shadow-xl ${isChatOpen ? 'flex' : 'hidden md:flex'}`}>
                    {!currentChatInfo ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <FaUsers className="mx-auto text-6xl text-gray-300" />
                                <p className="mt-4 text-xl text-center text-gray-600">Select a chat to begin</p>
                                <p className="text-gray-400">Start a conversation with your team or colleagues.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
                                <div className="flex items-center space-x-3 flex-grow min-w-0">
                                    <button onClick={closeChat} className="md:hidden p-2 rounded-full hover:bg-gray-100"><FaArrowLeft /></button>
                                    <button onClick={() => currentChatInfo.type !== 'group' && currentChatInfo.profile && setIsProfileModalOpen(true)} className="flex-shrink-0">
                                        {currentChatInfo.type === 'group' ? (
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                <FaUsers className="text-gray-500" size={28} />
                                            </div>
                                        ) : currentChatInfo.profile ? (
                                            <img src={currentChatInfo.profile} alt={currentChatInfo.name} className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                <FaUser className="text-gray-500" size={28} />
                                            </div>
                                        )}
                                    </button>
                                    <div className="truncate">
                                        <button onClick={openGroupInfoModal} disabled={currentChatInfo.type !== 'group'} className="text-left">
                                            <p className="font-bold text-lg truncate">{currentChatInfo.name}</p>
                                        </button>
                                        {currentChatInfo.type === 'private' ? (
                                            <p className="text-sm text-gray-500">{currentChatInfo.isOnline ? 'Online' : formatLastSeen(currentChatInfo.lastMessageTimestamp)}</p>
                                        ) : (
                                            <p className="text-sm text-gray-500">{currentChatInfo.memberCount || 0} members</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2"><button className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><FaVideo size={20} /></button><button className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><FaPhone size={20} /></button><div className="relative"><button ref={chatMenuButtonRef} onClick={() => setShowChatMenu(!showChatMenu)} className="p-2 rounded-full hover:bg-gray-100"><BsThreeDotsVertical size={20} /></button>{showChatMenu && (<div ref={chatMenuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20"><button onClick={handleClearChat} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Clear chat</button></div>)}</div></div>
                            </div>

                            {/* Pinned Message Bar */}
                            {pinnedMessageInfo && (
                                <div className="flex-shrink-0 flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center gap-2 text-sm overflow-hidden cursor-pointer flex-grow min-w-0" onClick={handleGoToMessage}><FaThumbtack className="text-gray-500 flex-shrink-0" /><FileIcon fileName={pinnedMessageInfo.message.fileName || ''} type={pinnedMessageInfo.message.type} className="text-lg flex-shrink-0" /><div className="truncate"><p className="font-bold text-blue-600">Pinned Message</p><p className="text-gray-600 truncate">{pinnedMessageInfo.message.type === 'text' ? pinnedMessageInfo.message.content : pinnedMessageInfo.message.fileName || 'Voice Message'}</p></div></div>
                                    <div className="relative flex-shrink-0"><button ref={pinnedMenuButtonRef} onClick={() => setShowPinnedMenu(!showPinnedMenu)} className="p-2 rounded-full hover:bg-gray-200"><FaChevronDown /></button>{showPinnedMenu && (<div ref={pinnedMenuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 text-sm"><ul className="py-1"><li onClick={handleGoToMessage} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"><FaAngleDoubleRight /> Go to message</li><li onClick={handleUnpin} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3 text-red-600"><FaTimes /> Unpin</li></ul></div>)}</div>
                                </div>
                            )}

                            {/* Messages Area */}
                            <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto bg-gray-50">
                                {isMessagesLoading ? (
                                    <MessageSkeleton />
                                ) : (
                                    <div className="space-y-2">
                                        {chatMessages.map((msg, index) => {
                                            const isMyMessage = msg.sender === currentUser?.id;
                                            const msgDate = new Date(msg.timestamp).toDateString();
                                            const showDateHeader = lastMessageDate !== msgDate;
                                            if (showDateHeader) {
                                                lastMessageDate = msgDate;
                                            }
                                            const senderInfo = !isMyMessage ? getSenderInfo(msg.sender) : null;
                                            
                                            const fileUrl = getFileUrl(msg);

                                            return (
                                                <React.Fragment key={msg.messageId || msg.id}>
                                                    {showDateHeader && (
                                                        <div className="text-center my-4">
                                                            <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">{formatDateHeader(msg.timestamp)}</span>
                                                        </div>
                                                    )}
                                                    <div data-message-index={index} className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                                        {!isMyMessage && (() => {
                                                            const profileSrc = currentChatInfo.type === 'group' ? senderInfo?.profile : currentChatInfo.profile;
                                                            const profileName = currentChatInfo.type === 'group' ? senderInfo?.name : currentChatInfo.name;
                                                            return profileSrc ? (
                                                                <img src={profileSrc} alt={profileName} className="w-8 h-8 rounded-full object-cover self-start flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center self-start flex-shrink-0">
                                                                    <FaUser className="text-gray-500" size={18} />
                                                                </div>
                                                            );
                                                        })()}
                                                        <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                                            {currentChatInfo.type === 'group' && !isMyMessage && (
                                                                <p className="text-xs text-gray-500 mb-1 ml-2 font-semibold">{senderInfo?.name}</p>
                                                            )}
                                                            <div onContextMenu={(e) => handleContextMenu(e, msg, index)} className={`rounded-lg max-w-xs md:max-w-md group relative
                                                                ${(msg.type === 'image' || msg.type === 'deleted') ? 'p-0 bg-transparent' : ''}
                                                                ${(msg.type === 'text') ? (isMyMessage ? 'bg-blue-600 text-white p-3' : 'bg-gray-200 text-gray-800 p-3') : ''}
                                                                ${(msg.type === 'audio' || msg.type === 'file') ? (isMyMessage ? 'bg-blue-600' : 'bg-gray-200') : ''}
                                                                `}>
                                                                {msg.type === 'deleted' ? (
                                                                    <div className="flex items-center gap-2 italic text-sm opacity-70 p-3">
                                                                        <span>This message was deleted</span>
                                                                        {lastDeleted?.index === index && <button onClick={handleUndoDelete} className="font-semibold hover:underline">Undo</button>}
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {msg.isForwarded && <div className="flex items-center gap-1.5 text-xs opacity-70 mb-1 font-semibold"><FaShare /> Forwarded</div>}
                                                                        {msg.replyTo && (
                                                                            <div className={`p-2 rounded mb-2 text-sm ${isMyMessage ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                                                <p className="font-semibold">{msg.replyTo.sender === currentUser?.id ? 'You' : getSenderInfo(msg.replyTo.sender).name}</p>
                                                                                <p className="opacity-80 truncate">{['image', 'audio', 'file'].includes(msg.replyTo.type) ? 'Media message' : msg.replyTo.content}</p>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {msg.type === 'image' ? (
                                                                            <div className="relative">
                                                                                <button onClick={() => setImageInView(fileUrl)}>
                                                                                    <img src={fileUrl} alt={msg.fileName || 'image'} className="rounded-md max-w-full" style={{maxHeight: '300px'}}/>
                                                                                </button>
                                                                                {!isMyMessage && (
                                                                                    <a href={fileUrl} download={msg.fileName} onClick={(e) => e.stopPropagation()} className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <FaDownload />
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ) : msg.type === 'audio' ? (
                                                                            <div className="p-2">
                                                                                <AudioPlayer src={fileUrl} isSender={isMyMessage} isDownloaded={!!downloadedMedia[index] || isMyMessage} onDownload={() => handleMediaDownload(fileUrl, 'voice-message.wav')} />
                                                                            </div>
                                                                        ) : msg.type === 'file' ? (
                                                                            <FileMessage msg={msg} isMyMessage={isMyMessage} />
                                                                        ) : (
                                                                            <p className="text-sm break-words">{msg.content}</p>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-400 mt-1 px-1">{msg.status === 'sending' ? 'Sending...' : msg.status === 'failed' ? 'Failed' : formatTimestamp(msg.timestamp)} {msg.isEdited ? '(edited)' : ''}</span>
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
                            
                            {/* Message Input Area */}
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
                                        <div className="relative flex-grow">
                                            <input ref={messageInputRef} type="text" placeholder={isRecording ? "Recording..." : "Type a message..."} className="w-full p-3 pr-24 rounded-full border bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} disabled={isRecording} />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                                <button ref={emojiButtonRef} onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><FaSmile size={20} /></button>
                                                <button onClick={handleFileButtonClick} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><FaPaperclip size={20} /></button>
                                            </div>
                                        </div>
                                        {message.trim() || editingInfo.index !== null ? (
                                            <button onClick={editingInfo.index !== null ? handleSaveEdit : handleSendMessage} className={`p-3 rounded-full text-white ${editingInfo.index !== null ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                                {editingInfo.index !== null ? <FaCheck size={20} /> : <FaPaperPlane size={20} />}
                                            </button>
                                        ) : (
                                            <button onClick={handleMicButtonClick} className={`p-3 rounded-full hover:bg-gray-100 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-blue-600'}`}>
                                                {isRecording ? <FaStop size={20} /> : <FaMicrophone size={20} />}
                                            </button>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modals and Context Menus */}
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
                                
                                {contextMenu.message.status !== 'sending' && contextMenu.message.status !== 'failed' && (
                                    <>
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
                            </>
                        )}
                    </ul>
                </div>
            )}

            {forwardingInfo.visible && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"><div className="bg-white rounded-lg shadow-2xl w-full max-w-md"><div className="p-4 border-b flex justify-between items-center"><h3 className="font-bold text-lg">Forward message to...</h3><button onClick={() => setForwardingInfo({ visible: false, message: null })}><FaTimes /></button></div><div className="p-4"><input type="text" placeholder="Search for users or groups" className="w-full p-2 border rounded-lg" value={forwardSearchTerm} onChange={(e) => setForwardSearchTerm(e.target.value)} /></div><div className="h-64 overflow-y-auto p-4">{allChats.filter(c => c.name?.toLowerCase().includes(forwardSearchTerm.toLowerCase())).map(chat => (<div key={chat.chatId} className="flex items-center p-2 rounded-lg hover:bg-gray-100"><input type="checkbox" id={`fwd-${chat.chatId}`} className="mr-3 h-4 w-4 accent-blue-600" checked={forwardRecipients.includes(chat.chatId)} onChange={(e) => { if (e.target.checked) setForwardRecipients([...forwardRecipients, chat.chatId]); else setForwardRecipients(forwardRecipients.filter(id => id !== chat.chatId)); }} />
                <label htmlFor={`fwd-${chat.chatId}`} className="flex-grow flex items-center gap-3 cursor-pointer">
                    {chat.type === 'group' ? (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><FaUsers className="text-gray-500" /></div>
                    ) : (
                        <img src={chat.profile} alt={chat.name} className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/100x100/E2E8F0/4A5568?text=U' }} />
                    )}
                    <span>{chat.name}</span>
                </label>
            </div>))}</div><div className="p-4 border-t text-right"><button onClick={handleConfirmForward} disabled={forwardRecipients.length === 0} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400">Forward</button></div></div></div>)}

            {isProfileModalOpen && currentChatInfo && currentChatInfo.type !== 'group' && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]" onClick={() => setIsProfileModalOpen(false)}>
                    <img src={currentChatInfo.profile} alt={currentChatInfo.name} className="max-w-[80vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {isGroupInfoModalOpen && currentChatInfo?.type === 'group' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]" onClick={() => setIsGroupInfoModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                            <h3 className="font-bold text-xl">Group Info</h3>
                            <button onClick={() => setIsGroupInfoModalOpen(false)} className="p-2 rounded-full hover:bg-gray-200"><FaTimes /></button>
                        </div>
                        <div className="flex border-b flex-shrink-0">
                            {['Overview', 'Members', 'Media'].map(tab => (
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
                                        <button key={i} onClick={() => setImageInView(getFileUrl(msg))}>
                                            <img src={getFileUrl(msg)} alt={msg.fileName} className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80" />
                                        </button>
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
