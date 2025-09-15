import React, { useEffect, useState, useRef, useMemo, useCallback, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Context } from '../HrmsContext';
import { Client } from '@stomp/stompjs';
import {
    FaMicrophone, FaPaperclip, FaSmile, FaPaperPlane, FaArrowLeft, FaStop,
    FaFileAlt, FaDownload, FaPlay, FaPause,
    FaVideo, FaPhone, FaReply, FaEdit, FaThumbtack, FaShare, FaTrash, FaTimes, FaCheck,
    FaChevronDown, FaImage, FaFileAudio, FaEye, FaAngleDoubleRight, FaCamera, FaPen, FaUsers, FaUser,
    FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileExcel, FaFileArchive
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import MicRecorder from 'mic-recorder-to-mp3';
import EmojiPicker from 'emoji-picker-react';
import {
    chatApi,
    getMessages,
    deleteMessageForMe,
    deleteMessageForEveryone,
    uploadFile,
    forwardMessage,
    getPinnedMessage,
    pinMessage,
    unpinMessage,
    clearChatHistory,
    uploadVoiceMessage,
    getGroupMembers
} from '../../../../services/apiService';
import { transformMessageDTOToUIMessage, generateChatListPreview } from '../../../../services/dataTransformer';

const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

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

const FileMessage = ({ msg, isMyMessage }) => {
    const downloadUrl = `${chatApi.defaults.baseURL}/chat/file/${msg.messageId}`;

    const content = (
        <div className={`flex items-center gap-3 p-2 rounded-lg max-w-xs md:max-w-sm ${isMyMessage ? 'bg-blue-600' : 'bg-gray-200'}`}>
            <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                <FileIcon fileName={msg.fileName} className="text-4xl" />
            </div>
            <div className="flex-grow overflow-hidden mr-2">
                <p className={`font-semibold truncate ${isMyMessage ? 'text-white' : 'text-gray-800'}`}>{msg.fileName}</p>
                <p className={`text-sm ${isMyMessage ? 'text-blue-200' : 'text-gray-600'}`}>{formatFileSize(msg.fileSize)}</p>
            </div>
            <div
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(downloadUrl, '_blank');
                }}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
            >
                <FaDownload size={18} />
            </div>
        </div>
    );
    return !isMyMessage ? <div onClick={() => window.open(downloadUrl, '_blank')} className="cursor-pointer">{content}</div> : content;
};

const AudioPlayer = ({ src, fileUrl, isSender, initialDuration = 0, fileSize = 0 }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(initialDuration);
    const [localSrc, setLocalSrc] = useState(src || null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            if (audio.duration !== Infinity && audio.duration > 0) {
                setDuration(audio.duration);
            }
        };
        const setAudioTime = () => setProgress(audio.currentTime);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [localSrc]);

    const handleDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const localUrl = URL.createObjectURL(blob);
            setLocalSrc(localUrl);
        } catch (error) {
            console.error("Failed to download audio:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const togglePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time) => {
        if (!time || time === Infinity) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration ? (progress / duration) * 100 : 0;

    if (!localSrc) {
        return (
            <div className="flex items-center gap-3 p-2 w-64">
                {isDownloading ? (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-400 bg-opacity-30">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <button onClick={handleDownload} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-400 bg-opacity-30 text-white hover:bg-opacity-40 transition-colors">
                        <FaDownload size={16} />
                    </button>
                )}
                <div className="flex-grow flex flex-col justify-center">
                    <p className="text-sm text-gray-700">Voice Message</p>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">{formatFileSize(fileSize)}</span>
                        <span className="text-xs text-gray-500">{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-3 p-2 w-64">
            <audio ref={audioRef} src={localSrc} preload="metadata" />
            <button onClick={togglePlayPause} className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isSender ? 'bg-white text-blue-600' : 'bg-gray-400 bg-opacity-30 text-white'}`}>
                {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} className="ml-1" />}
            </button>
            <div className="flex-grow flex flex-col justify-center">
                <div className="w-full h-1.5 bg-black/20 rounded-full cursor-pointer" onClick={(e) => {
                    if (!duration) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newTime = (clickX / rect.width) * duration;
                    if (audioRef.current) audioRef.current.currentTime = newTime;
                }}>
                    <div style={{ width: `${progressPercentage}%` }} className={`h-full rounded-full ${isSender ? 'bg-white' : 'bg-gray-300'}`}></div>
                </div>
                <span className={`text-xs self-end mt-1 ${isSender ? 'text-blue-200' : 'text-gray-500'}`}>{formatTime(duration)}</span>
            </div>
        </div>
    );
};
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

const getAudioDuration = (audioBlob) =>
    new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.decodeAudioData(event.target.result,
                (buffer) => {
                    const duration = buffer.duration ? Math.round(buffer.duration) : 0;
                    audioContext.close();
                    resolve(duration);
                },
                (error) => {
                    console.error("Error decoding audio data:", error);
                    audioContext.close();
                    resolve(0);
                }
            );
        };

        reader.onerror = (error) => {
            console.error("Error reading blob as ArrayBuffer:", error);
            resolve(0);
        };

        reader.readAsArrayBuffer(audioBlob);
    });
function ChatApplication({ currentUser, chats: initialChats, loadMoreChats, hasMore, isFetchingMore }) {
    const location = useLocation();
    const { theme } = useContext(Context);
    const navigate = useNavigate();
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
    const [pinnedMessage, setPinnedMessage] = useState(null);
    const [forwardingInfo, setForwardingInfo] = useState({ visible: false, message: null });
    const [forwardRecipients, setForwardRecipients] = useState([]);
    const [forwardSearchTerm, setForwardSearchTerm] = useState('');
    const [showPinnedMenu, setShowPinnedMenu] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
    const [activeGroupInfoTab, setActiveGroupInfoTab] = useState('Overview');
    const [groupMembers, setGroupMembers] = useState([]);
    const [isGroupDataLoading, setIsGroupDataLoading] = useState(false);
    const [imageInView, setImageInView] = useState(null);
    const [isChatDataReady, setIsChatDataReady] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});
    const [messagePages, setMessagePages] = useState({});
    const [hasMoreMessages, setHasMoreMessages] = useState({});
    const [isFetchingMoreMessages, setIsFetchingMoreMessages] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [newMessagesCount, setNewMessagesCount] = useState(0);
    const [recorder, setRecorder] = useState(new MicRecorder({ bitRate: 128 }));

    const sidebarScrollRef = useRef(null);
    const chatContainerRef = useRef(null);
    const stompClient = useRef(null);
    const typingTimeoutRef = useRef({});
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const emojiPickerRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const chatMenuRef = useRef(null);
    const chatMenuButtonRef = useRef(null);
    const contextMenuRef = useRef(null);
    const messageInputRef = useRef(null);
    const isManuallyClosing = useRef(false);
    const pinnedMenuRef = useRef(null);
    const pinnedMenuButtonRef = useRef(null);
    const onMessageReceivedRef = useRef(null);
    const isFetchingOldMessages = useRef(false);
    const subscriptions = useRef({});

    const chatIdFromUrl = useMemo(() => {
        if (typeof window !== 'undefined' && window.location.pathname.includes('/with')) {
            const params = new URLSearchParams(window.location.search);
            return params.get('id');
        }
        return null;
    }, []);

    const handleSidebarScroll = () => {
        const container = sidebarScrollRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (scrollHeight - scrollTop - clientHeight < 100) {
                console.log(`Scroll condition met. isFetchingMore: ${isFetchingMore}, hasMore: ${hasMore}`);
                if (hasMore && !isFetchingMore) {
                    loadMoreChats();
                }
            }
        }
    };

    const handleChatScroll = () => {
        const container = chatContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;

        if (scrollTop === 0 && !isMessagesLoading && !isFetchingMoreMessages) {
            const chatId = selectedChat.chatId;
            if (hasMoreMessages[chatId] !== false) {
                const nextPage = (messagePages[chatId] || 0) + 1;
                setMessagePages(prev => ({ ...prev, [chatId]: nextPage }));
                loadMoreMessages(chatId, nextPage);
            }
        }

        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 400;
        if (isScrolledUp !== showScrollToBottom) {
            setShowScrollToBottom(isScrolledUp);
            if (!isScrolledUp) {
                setNewMessagesCount(0);
            }
        }
    };

    const scrollToBottom = (behavior = 'smooth') => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: behavior
            });
        }
        setNewMessagesCount(0);
    };

    useEffect(() => {
        if (initialChats) {
            const correctedChats = {
                groups: initialChats.groups.map(chat =>
                    chat.chatId.toString() === chatIdFromUrl
                        ? { ...chat, unreadMessageCount: 0 }
                        : chat
                ),
                privateChatsWith: initialChats.privateChatsWith.map(chat =>
                    chat.chatId.toString() === chatIdFromUrl
                        ? { ...chat, unreadMessageCount: 0 }
                        : chat
                ),
            };
            setChatData(correctedChats);
            setIsChatDataReady(true);
        }
    }, [initialChats, chatIdFromUrl]);

    const loadMoreMessages = useCallback(async (chatId, pageNum) => {
        if ((pageNum > 0 && isFetchingMoreMessages) || (pageNum === 0 && isMessagesLoading)) {
            return;
        }

        if (pageNum > 0) {
            setIsFetchingMoreMessages(true);
            isFetchingOldMessages.current = true;
        } else {
            setIsMessagesLoading(true);
        }

        try {
            const rawMessages = await getMessages(currentUser.id, chatId, pageNum, 15);
            console.log("%c REFRESH (API) RAW DATA:", "color: red; font-weight: bold;", rawMessages);

            if (rawMessages.length === 0) {
                setHasMoreMessages(prev => ({ ...prev, [chatId]: false }));
                return;
            }

            const transformedMessages = rawMessages.map(transformMessageDTOToUIMessage);

            const chatContainer = chatContainerRef.current;
            const previousScrollHeight = chatContainer ? chatContainer.scrollHeight : 0;
            const previousScrollTop = chatContainer ? chatContainer.scrollTop : 0;

            setMessages(prev => ({
                ...prev,
                [chatId]: pageNum === 0
                    ? transformedMessages
                    : [...transformedMessages, ...(prev[chatId] || [])]
            }));

            if (pageNum > 0) {
                requestAnimationFrame(() => {
                    if (chatContainer) {
                        chatContainer.scrollTop = (chatContainer.scrollHeight - previousScrollHeight) + previousScrollTop;
                    }
                });
            }

            if (rawMessages.length === 0) {
                setHasMoreMessages(prev => ({ ...prev, [chatId]: false }));
            }

        } catch (error) {
            console.error(`Failed to load messages for chat ${chatId}:`, error);
        } finally {
            if (pageNum > 0) {
                setIsFetchingMoreMessages(false);
                setTimeout(() => { isFetchingOldMessages.current = false; }, 100);
            } else {
                setIsMessagesLoading(false);
            }
        }
    }, [currentUser.id, isFetchingMoreMessages, isMessagesLoading, getMessages]);
    useEffect(() => {
        if (!selectedChat) return;

        const chatId = selectedChat.chatId;

        setMessagePages(prev => ({ ...prev, [chatId]: 0 }));
        setHasMoreMessages(prev => ({ ...prev, [chatId]: true }));
        setMessages(prev => ({ ...prev, [chatId]: [] }));

        loadMoreMessages(chatId, 0);

        const fetchPinnedMessage = async () => {
            try {
                const pinnedMsgData = await getPinnedMessage(chatId, selectedChat.type, currentUser.id);
                setPinnedMessage(pinnedMsgData);
            } catch (error) {
                console.error("Failed to fetch pinned message:", error);
                setPinnedMessage(null);
            }
        };
        fetchPinnedMessage();

    }, [selectedChat, currentUser.id]);

    const updateLastMessage = useCallback((chatId, message) => {
        setChatData(prev => {
            const updateChat = (chat) => {
                if (chat.chatId === chatId) {
                    const isNewUnread = message && message.type !== 'deleted' && !message.isDeleted && message.sender !== currentUser.id && selectedChat?.chatId !== chatId;

                    const overviewItem = {
                        lastMessage: message ? (message.fileName || message.content) : '',
                        lastMessageType: message ? message.type.toUpperCase() : null,
                        lastMessageSenderId: message ? message.sender : null
                    };

                    return {
                        ...chat,
                        lastMessage: message ? generateChatListPreview(overviewItem, currentUser.id) : 'Chat cleared',
                        lastMessageTimestamp: message?.timestamp || new Date(0).toISOString(),
                        unreadMessageCount: (chat.unreadMessageCount || 0) + (isNewUnread ? 1 : 0)
                    };
                }
                return chat;
            };

            const newGroups = prev.groups.map(updateChat);
            const newPrivate = prev.privateChatsWith.map(updateChat);

            return { groups: newGroups, privateChatsWith: newPrivate };
        });
    }, [currentUser.id, selectedChat]);

    const onMessageReceived = useCallback((payload) => {
        const container = chatContainerRef.current;
        const shouldScrollOnReceive = container
            ? (container.scrollHeight - container.scrollTop - container.clientHeight) < 300
            : true;

        const parsedData = JSON.parse(payload.body);
        console.log("%c LIVE MSG (WebSocket) RAW DATA:", "color: green; font-weight: bold;", parsedData);
        console.log("Received WebSocket Message:", parsedData);

        if (parsedData.type === 'STATUS_UPDATE') {
            const { status, chatId, messageIds } = parsedData;

            setMessages(prevMessages => {
                const chatKey = selectedChat?.type === 'group' ? parsedData.groupId : chatId;
                const chatMessages = prevMessages[chatKey] || [];
                const newStatus = status.toLowerCase();

                const updatedMessages = chatMessages.map(msg => {
                    if (messageIds.includes(msg.messageId)) {
                        if (newStatus === 'seen') {
                            return { ...msg, status: 'seen' };
                        }
                        if (newStatus === 'delivered' && msg.status === 'sent') {
                            return { ...msg, status: 'delivered' };
                        }
                    }
                    return msg;
                });
                return { ...prevMessages, [chatKey]: updatedMessages };
            });
            return;
        }


        if (parsedData.type === 'PIN_UPDATE') {
            const pinnedDto = parsedData.payload;
            const eventChatId = pinnedDto.groupId || (pinnedDto.sender === currentUser.id ? pinnedDto.receiver : pinnedDto.sender);

            if (selectedChat?.chatId === eventChatId) {
                setPinnedMessage(pinnedDto);
            }
            return;

        } else if (parsedData.type === 'UNPIN_UPDATE') {
            const unpinPayload = parsedData.payload;

            let eventChatId;
            if (selectedChat.type === 'group') {
                eventChatId = unpinPayload.groupId;
            } else {
                eventChatId = unpinPayload.senderId === currentUser.id
                    ? unpinPayload.receiverId
                    : unpinPayload.senderId;
            }
            if (selectedChat?.chatId === eventChatId) {
                setPinnedMessage(null);
            }
            return;
        }

        const receivedMessage = parsedData;
        const messageChatId = receivedMessage.groupId || (receivedMessage.sender === currentUser.id ? receivedMessage.receiver : receivedMessage.sender);

        if (!messageChatId) {
            console.warn("Received message without a clear chat ID", receivedMessage);
            return;
        }

        if (receivedMessage.isDeleted || receivedMessage.type === 'deleted') {
            setMessages(prevMessages => {
                const chatMessages = prevMessages[messageChatId] || [];
                let wasLastMessage = false;

                if (chatMessages.length > 0) {
                    const lastMessage = chatMessages[chatMessages.length - 1];
                    wasLastMessage = lastMessage.messageId === receivedMessage.messageId || lastMessage.id === receivedMessage.messageId;
                }

                const updatedMessages = chatMessages.map(msg => {
                    if (msg.messageId === receivedMessage.messageId || msg.id === receivedMessage.messageId) {
                        return { ...msg, type: 'deleted', content: 'This message was deleted', fileName: null, fileSize: null, isDeleted: true };
                    }
                    return msg;
                });

                if (wasLastMessage) {
                    const newLastMessage = updatedMessages.length > 0 ? updatedMessages[updatedMessages.length - 1] : null;
                    updateLastMessage(messageChatId, newLastMessage);
                }

                return { ...prevMessages, [messageChatId]: updatedMessages };
            });
            return;
        }

        if (receivedMessage.isEdited) {
            setMessages(prevMessages => {
                const chatMessages = prevMessages[messageChatId] || [];

                const updatedMessages = chatMessages.map(msg => {
                    if (msg.messageId === receivedMessage.id || msg.messageId === receivedMessage.messageId) {
                        const updatedMsg = {
                            ...msg,
                            content: receivedMessage.content,
                            isEdited: true
                        };

                        if (chatMessages.length > 0 && chatMessages[chatMessages.length - 1].messageId === msg.messageId) {
                            updateLastMessage(messageChatId, updatedMsg);
                        }

                        return updatedMsg;
                    }

                    return msg;
                });

                return { ...prevMessages, [messageChatId]: updatedMessages };
            });
            return;
        }

        const transformedForEditCheck = transformMessageDTOToUIMessage(receivedMessage);

        setMessages(prevMessages => {
            const chatMessages = prevMessages[messageChatId] || [];
            const finalServerId = receivedMessage.messageId || receivedMessage.id;

            const messageAlreadyExists = chatMessages.some(m => m.messageId === finalServerId && m.status === 'sent');
            if (messageAlreadyExists) {
                return prevMessages;
            }

            let newChatMessages = [...chatMessages];
            let messageProcessed = false;
            let finalMessageForUpdate = null;

            const isProperAck = receivedMessage.sender === currentUser.id && receivedMessage.client_id;
            const isBroadcastOfOwnMessage = receivedMessage.sender === currentUser.id && !receivedMessage.client_id;
            const isIncoming = receivedMessage.sender !== currentUser.id;

            if (isProperAck) {
                const optimisticIndex = newChatMessages.findIndex(m => m.id === receivedMessage.client_id);
                if (optimisticIndex > -1) {
                    const transformedServerMessage = transformMessageDTOToUIMessage(receivedMessage);
                    newChatMessages[optimisticIndex] = { ...newChatMessages[optimisticIndex], ...transformedServerMessage, status: 'sent' };
                    finalMessageForUpdate = newChatMessages[optimisticIndex];
                    messageProcessed = true;
                }
            } else if (isBroadcastOfOwnMessage) {
                const optimisticIndex = newChatMessages.findLastIndex(m => m.status === 'sending' && m.sender === currentUser.id);
                if (optimisticIndex > -1) {
                    const transformedServerMessage = transformMessageDTOToUIMessage(receivedMessage);
                    newChatMessages[optimisticIndex] = { ...newChatMessages[optimisticIndex], ...transformedServerMessage, status: 'sent' };
                    finalMessageForUpdate = newChatMessages[optimisticIndex];
                    messageProcessed = true;
                } else if (!chatMessages.some(m => m.messageId === finalServerId)) {
                    const finalMessage = transformMessageDTOToUIMessage(receivedMessage);
                    newChatMessages.push(finalMessage);
                    finalMessageForUpdate = finalMessage;
                    messageProcessed = true;
                }
            } else if (isIncoming) {
                if (!chatMessages.some(m => m.messageId === finalServerId)) {
                    const finalMessage = transformMessageDTOToUIMessage(receivedMessage);
                    newChatMessages.push(finalMessage);
                    finalMessageForUpdate = finalMessage;
                    messageProcessed = true;

                    if (showScrollToBottom) {
                        setNewMessagesCount(prevCount => prevCount + 1);
                    }
                }
            }

            if (messageProcessed) {
                updateLastMessage(messageChatId, finalMessageForUpdate);
                return { ...prevMessages, [messageChatId]: newChatMessages };
            }

            return prevMessages;
        });
        const isIncoming = parsedData.sender !== currentUser.id && !parsedData.isEdited && !parsedData.isDeleted && parsedData.type !== 'deleted';
        if (isIncoming && shouldScrollOnReceive) {
            setTimeout(() => scrollToBottom('smooth'), 100);
        }
    }, [currentUser.id, updateLastMessage, selectedChat, showScrollToBottom]);

    const allChats = useMemo(() => [
        ...chatData.privateChatsWith.filter(user => user.chatId !== currentUser?.id),
        ...chatData.groups,
    ].sort((a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp)), [chatData, currentUser.id]);

    const handleTypingEvent = useCallback((payload) => {
        const typingUpdate = JSON.parse(payload.body);

        if (typingUpdate.senderId === currentUser.id) return;

        const chatIdKey = typingUpdate.type === 'TEAM' ? typingUpdate.groupId : typingUpdate.senderId;
        if (!chatIdKey) return;
        const senderChatInfo = allChats.find(c => c.chatId === typingUpdate.senderId);
        const senderName = senderChatInfo?.name || 'Someone';

        setTypingUsers(prev => {
            const newTypingUsers = { ...prev };

            if (typingTimeoutRef.current[chatIdKey]) {
                clearTimeout(typingTimeoutRef.current[chatIdKey]);
            }

            if (typingUpdate.typing) {
                newTypingUsers[chatIdKey] = `${senderName} is typing...`;
                typingTimeoutRef.current[chatIdKey] = setTimeout(() => {
                    setTypingUsers(p => {
                        const updated = { ...p };
                        delete updated[chatIdKey];
                        return updated;
                    });
                }, 3000);

            } else {
                delete newTypingUsers[chatIdKey];
            }
            return newTypingUsers;
        });
    }, [currentUser.id, allChats]);

    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    });

    useEffect(() => {
        if (!isMessagesLoading && chatContainerRef.current) {
            scrollToBottom('auto');
        }
    }, [isMessagesLoading, selectedChat]);

    useEffect(() => {
        if (!currentUser?.id || !isChatDataReady) return;

        if (stompClient.current) {
            return;
        }

        const brokerURL = `wss://hrms.anasolconsultancyservices.com/api/chat?employeeId=${currentUser.id}`;
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

                const presenceHandler = (payload) => {
                    const statusUpdate = JSON.parse(payload.body);
                    if (statusUpdate.userId === currentUser.id) return;

                    setChatData(prev => {
                        const newPrivateChats = prev.privateChatsWith.map(chat => {
                            if (chat.chatId === statusUpdate.userId) {
                                return { ...chat, isOnline: statusUpdate.isOnline };
                            }
                            return chat;
                        });
                        return { ...prev, privateChatsWith: newPrivateChats };
                    });
                };

                subscriptions.current['private'] = client.subscribe(`/user/queue/private`, messageHandler);
                subscriptions.current['private-ack'] = client.subscribe(`/user/queue/private-ack`, messageHandler);
                subscriptions.current['group-ack'] = client.subscribe(`/user/queue/group-ack`, messageHandler);
                subscriptions.current['presence'] = client.subscribe('/topic/presence', presenceHandler);
                subscriptions.current['typing'] = client.subscribe('/user/queue/typing-status', handleTypingEvent);
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
                const typingSubId = `group-typing-${groupId}`;
                subscriptions.current[typingSubId] = stompClient.current.subscribe(`/topic/typing-status/${groupId}`, handleTypingEvent);
            }
        });

    }, [isConnected, groupIds, chatData.groups, groupMembers, currentUser.id]);

    const openChat = useCallback((targetChat) => {
        if (!currentUser?.id || !stompClient.current?.active) {
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

        const newUrl = `/chat/${currentUser.id}/with?id=${targetChat.chatId}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

    }, [currentUser.id]);

    const closeChat = useCallback(() => {
        isManuallyClosing.current = true;

        if (!selectedChat || !currentUser?.id) {
            isManuallyClosing.current = false;
            return;
        }

        if (stompClient.current?.active) {
            const destination = `/app/presence/close/${selectedChat.chatId}`;
            stompClient.current.publish({ destination, body: "{}" });
        }

        setSelectedChat(null);
        setIsChatOpen(false);

        const newUrl = `/chat/${currentUser.id}`;
        navigate(newUrl);

    }, [selectedChat, currentUser.id, navigate]);

    const handleChatSelect = useCallback((chat) => {
        if ((chat.unreadMessageCount || 0) > 0) {
            setChatData(prev => ({
                ...prev,
                groups: prev.groups.map(g => g.chatId === chat.chatId ? { ...g, unreadMessageCount: 0 } : g),
                privateChatsWith: prev.privateChatsWith.map(p => p.chatId === chat.chatId ? { ...p, unreadMessageCount: 0 } : p),
            }));
        }

        if (selectedChat && selectedChat.chatId !== chat.chatId) {
        }
        openChat(chat);
    }, [selectedChat, openChat]);

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
        const fetchGroupData = async () => {
            if (!isGroupInfoModalOpen || !selectedChat || selectedChat.type !== 'group') {
                return;
            }

            console.log("Group Info useEffect running. Tab:", activeGroupInfoTab, "Current members count:", groupMembers.length);

            if (activeGroupInfoTab === 'Members' && groupMembers.length === 0) {
                try {
                    setIsGroupDataLoading(true);
                    console.log("Fetching members for team ID:", selectedChat.chatId);

                    const teamDetailsResponse = await getGroupMembers(selectedChat.chatId);
                    console.log("API response from getGroupMembers:", teamDetailsResponse);

                    const teamDetails = Array.isArray(teamDetailsResponse) && teamDetailsResponse.length > 0
                        ? teamDetailsResponse[0]
                        : null;

                    if (teamDetails && teamDetails.employees) {
                        console.log("Setting group members state with:", teamDetails.employees);
                        setGroupMembers(teamDetails.employees);
                    } else {
                        console.log("No 'employees' array found in the final object. Setting empty array.");
                        setGroupMembers([]);
                    }
                } catch (error) {
                    console.error("Failed to fetch group members:", error);
                    setGroupMembers([]);
                } finally {
                    setIsGroupDataLoading(false);
                }
            }
        };

        fetchGroupData();
    }, [isGroupInfoModalOpen, activeGroupInfoTab, selectedChat, groupMembers.length]);

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

    const sendTypingStatus = (isTyping) => {
        if (!stompClient.current?.active || !selectedChat) return;

        const payload = {
            senderId: currentUser.id,
            typing: isTyping,
            type: selectedChat.type === 'group' ? 'TEAM' : 'PRIVATE',
            receiverId: selectedChat.type === 'private' ? selectedChat.chatId : null,
            groupId: selectedChat.type === 'group' ? selectedChat.chatId : null,
        };

        stompClient.current.publish({
            destination: '/app/typing',
            body: JSON.stringify(payload),
        });
    };

    const handleSendMessage = () => {
        if (!message.trim() || !selectedChat) return;

        sendTypingStatus(false);

        const clientId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        const isReply = replyingTo !== null;

        const optimisticMessage = {
            id: clientId,
            messageId: clientId,
            sender: currentUser.id,
            content: message,
            timestamp: new Date().toISOString(),
            status: 'sending',
            type: 'text',
            fileName: null,
            fileSize: null,
            isEdited: false,
            replyTo: replyingTo,
            isForwarded: false,
        };

        updateLastMessage(selectedChat.chatId, optimisticMessage);
        setMessages(prev => ({
            ...prev,
            [selectedChat.chatId]: [...(prev[selectedChat.chatId] || []), optimisticMessage]
        }));

        let destination;
        let payload;

        if (isReply) {
            destination = '/app/reply';
            payload = {
                replyToMessageId: replyingTo.messageId,
                sender: currentUser.id,
                content: message,
                clientId: clientId,
                receiver: selectedChat.type === 'private' ? selectedChat.chatId : null,
                groupId: selectedChat.type === 'group' ? selectedChat.chatId : null,
                type: selectedChat.type === 'group' ? 'TEAM' : 'PRIVATE',
            };
        } else {
            destination = '/app/send';
            payload = {
                sender: currentUser.id,
                content: message,
                type: selectedChat.type === 'group' ? 'TEAM' : 'PRIVATE',
                receiver: selectedChat.type === 'private' ? selectedChat.chatId : null,
                groupId: selectedChat.type === 'group' ? selectedChat.chatId : null,
                clientId: clientId,
            };
        }

        stompClient.current.publish({ destination, body: JSON.stringify(payload) });

        setMessage('');
        setShowEmojiPicker(false);
        setReplyingTo(null);
        setTimeout(() => scrollToBottom('smooth'), 100);
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

        const localPreviewContent = URL.createObjectURL(file);

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
            fileUrl: localPreviewContent,
            isEdited: false,
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
        formData.append('type', selectedChat.type === 'group' ? 'TEAM' : 'PRIVATE');

        if (selectedChat.type === 'group') {
            formData.append('groupId', selectedChat.chatId);
        } else {
            formData.append('receiver', selectedChat.chatId);
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
    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
                console.log('Permission granted, starting recorder...');
                recorder.start().then(() => {
                    setIsRecording(true);
                }).catch((e) => console.error('Recorder start error:', e));
            })
            .catch((e) => {
                console.error('Microphone permission denied:', e);
                alert('Microphone permission is required for voice messages.');
            });
    };
    const stopRecording = () => {
        console.log('Stopping recorder...');
        setIsRecording(false); 
        recorder.stop().getMp3().then(async ([buffer, blob]) => {
            console.log('Recording stopped, got MP3 blob:', blob);

            if (!selectedChat) return;

            const audioFile = new File([blob], `voice-message-${Date.now()}.mp3`, {
                type: 'audio/mp3',
                lastModified: Date.now()
            });

            const localPreviewUrl = URL.createObjectURL(audioFile);
            const clientId = Date.now().toString() + Math.random().toString(36).substring(2, 9);

            const optimisticMessage = {
                id: clientId, messageId: clientId, sender: currentUser.id,
                content: localPreviewUrl, timestamp: new Date().toISOString(),
                status: 'sending', type: 'audio', fileName: audioFile.name,
                fileSize: audioFile.size, fileUrl: localPreviewUrl, isEdited: false,
                duration: 0
            };

            updateLastMessage(selectedChat.chatId, optimisticMessage);
            setMessages(prev => ({ ...prev, [selectedChat.chatId]: [...(prev[selectedChat.chatId] || []), optimisticMessage] }));

            const formData = new FormData();
            formData.append('file', audioFile);
            formData.append('sender', currentUser.id);
            formData.append('client_id', clientId);
            formData.append('fileType', audioFile.type);
            formData.append('fileName', audioFile.name);
            formData.append('type', selectedChat.type === 'group' ? 'TEAM' : 'PRIVATE');

            if (selectedChat.type === 'group') {
                formData.append('groupId', selectedChat.chatId);
            } else {
                formData.append('receiver', selectedChat.chatId);
            }

            try {
                await uploadVoiceMessage(formData);
            } catch (error) {
                console.error("Voice message upload failed:", error);
                setMessages(prev => {
                    const chatMessages = prev[selectedChat.chatId] || [];
                    const newMessages = chatMessages.map(m => m.id === clientId ? { ...m, status: 'failed' } : m);
                    return { ...prev, [selectedChat.chatId]: newMessages };
                });
            }
        }).catch((e) => {
            console.error('Stop recording error:', e);
            alert('Could not record audio. Please try again.');
        });
    };

    const handleConfirmClearChat = async () => {
        if (!selectedChat) return;
        try {
            await clearChatHistory(currentUser.id, selectedChat.chatId);
            setMessages(prev => ({ ...prev, [selectedChat.chatId]: [] }));
            updateLastMessage(selectedChat.chatId, null);
        } catch (error) {
            console.error("Failed to clear chat:", error);
        } finally {
            setShowClearConfirm(false);
        }
    };

    const handleMediaDownload = (src, fileName) => { const link = document.createElement('a'); link.href = src; link.setAttribute('download', fileName || 'download'); document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    const handleContextMenu = (event, message, index) => { event.preventDefault(); event.stopPropagation(); const menuWidth = 180; const menuHeight = 250; let x = event.pageX; let y = event.pageY; if (x + menuWidth > window.innerWidth) x -= menuWidth; if (y + menuHeight > window.innerHeight) y -= menuHeight; setContextMenu({ visible: true, x, y, message, index }); };
    const handleReply = () => { setReplyingTo(contextMenu.message); setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null }); messageInputRef.current.focus(); };
    const handleEdit = () => { setEditingInfo({ index: contextMenu.index, originalContent: contextMenu.message.content }); setMessage(contextMenu.message.content); setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null }); messageInputRef.current.focus(); };

    const handleSaveEdit = () => {
        const updatedContent = message.trim();

        if (updatedContent === '' || editingInfo.index === null || !stompClient.current?.active) {
            cancelEdit();
            return;
        }

        const chatId = selectedChat.chatId;
        const currentMessages = messages[chatId];
        const messageToEdit = currentMessages[editingInfo.index];
        const messageId = messageToEdit.messageId;

        if (updatedContent === editingInfo.originalContent || typeof messageId !== 'number') {
            cancelEdit();
            return;
        }

        const optimisticUpdatedMessage = {
            ...messageToEdit,
            content: updatedContent,
            isEdited: true,
        };

        const updatedMessagesList = currentMessages.map((msg, index) =>
            index === editingInfo.index ? optimisticUpdatedMessage : msg
        );

        setMessages(prev => ({
            ...prev,
            [chatId]: updatedMessagesList,
        }));

        if (editingInfo.index === currentMessages.length - 1) {
            updateLastMessage(chatId, optimisticUpdatedMessage);
        }

        const payload = {
            messageId: messageId,
            content: updatedContent,
            sender: currentUser.id,
        };

        const destination = '/app/edit';

        stompClient.current.publish({
            destination,
            body: JSON.stringify(payload)
        });

        cancelEdit();
    };

    const cancelEdit = () => { setEditingInfo({ index: null, originalContent: '' }); setMessage(''); };



    const handleDelete = async (forEveryone) => {
        const chatId = selectedChat.chatId;
        const currentMessages = [...(messages[chatId] || [])];
        const messageToDelete = currentMessages[contextMenu.index];
        const messageId = messageToDelete?.messageId;

        if (!messageId || typeof messageId !== 'number' || messageToDelete.status === 'sending' || messageToDelete.status === 'failed') {
            console.error("Invalid messageId or message status for deletion:", messageId, messageToDelete.status);
            setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null });
            return;
        }

        try {
            if (forEveryone) {
                await deleteMessageForEveryone(messageId, currentUser.id);
            } else {
                await deleteMessageForMe(messageId, currentUser.id);
                const nextMessages = currentMessages.filter((_, i) => i !== contextMenu.index);
                setMessages(prev => ({ ...prev, [chatId]: nextMessages }));
                const newLastMessage = nextMessages.length > 0 ? nextMessages[nextMessages.length - 1] : null;
                updateLastMessage(chatId, newLastMessage);
            }
        } catch (error) {
            console.error(`Failed to delete message ${messageId} in component:`, error);
        } finally {
            setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null });
        }
    };

    const handleUndoDelete = () => { if (!lastDeleted) return; const currentMessages = [...messages[selectedChat.chatId]]; currentMessages[lastDeleted.index] = lastDeleted.message; setMessages(prev => ({ ...prev, [selectedChat.chatId]: currentMessages })); setLastDeleted(null); };
    const handlePin = async () => {
        if (!contextMenu.message?.messageId) return;

        try {
            const messageIdToPin = contextMenu.message.messageId;
            const response = await pinMessage(messageIdToPin, currentUser.id);
            setPinnedMessage(response);
        } catch (error) {
            console.error("Failed to pin message:", error);
        } finally {
            setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null });
        }
    };

    const handleUnpin = async () => {
        if (!pinnedMessage?.messageId) return;

        try {
            await unpinMessage(pinnedMessage.messageId, currentUser.id);
            setPinnedMessage(null);
        } catch (error) {
            console.error("Failed to unpin message:", error);
        } finally {
            setShowPinnedMenu(false);
        }
    };

    const handleGoToMessage = () => {
        setShowPinnedMenu(false);
        if (pinnedMessage) {
            const messageIndex = chatMessages.findIndex(m => m.messageId === pinnedMessage.messageId);

            if (messageIndex !== -1) {
                const messageElement = document.querySelector(`[data-message-index='${messageIndex}']`);
                if (messageElement) {
                    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    messageElement.classList.add('animate-pulse', 'bg-blue-200');
                    setTimeout(() => messageElement.classList.remove('animate-pulse', 'bg-blue-200'), 2500);
                }
            }
        }
    };

    const handleForward = () => {
        setForwardingInfo({ visible: true, message: contextMenu.message });
        setContextMenu({ visible: false, x: 0, y: 0, message: null, index: null });
    };

    const handleConfirmForward = async () => {
        const originalMsg = forwardingInfo.message;
        if (!originalMsg || forwardRecipients.length === 0) {
            return;
        }

        const forwardData = {
            sender: currentUser.id,
            forwardMessageId: originalMsg.messageId,
            forwardTo: forwardRecipients.map(chatId => {
                const chat = allChats.find(c => c.chatId === chatId);
                if (chat.type === 'private') {
                    return { receiver: chat.chatId };
                } else {
                    return { groupId: chat.chatId };
                }
            })
        };

        try {
            await forwardMessage(forwardData);
            const newLastMessageObject = {
                ...forwardingInfo.message,
                sender: currentUser.id,
                timestamp: new Date().toISOString(),
            };
            forwardRecipients.forEach(chatId => {
                updateLastMessage(chatId, newLastMessageObject);
            });

        } catch (error) {
            console.error("Failed to forward message:", error);
        } finally {
            setForwardingInfo({ visible: false, message: null });
            setForwardRecipients([]);
            setForwardSearchTerm('');
        }
    };

    const filteredChats = allChats.filter(chat => chat.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    useEffect(() => {
        if (isManuallyClosing.current) {
            isManuallyClosing.current = false;
            return;
        }

        if (chatIdFromUrl && allChats.length > 0 && isConnected && !selectedChat) {
            const chatToSelect = allChats.find(c => c.chatId.toString() === chatIdFromUrl);
            if (chatToSelect) {
                handleChatSelect(chatToSelect);
            }
        }
    }, [allChats, chatIdFromUrl, selectedChat, handleChatSelect, isConnected]);

    useEffect(() => {
        const newChatTarget = location.state?.newChatTarget;
        if (newChatTarget && isChatDataReady) {
            const chatExists = allChats.some(chat => chat.chatId === newChatTarget.chatId);
            if (!chatExists) {
                console.log("New chat detected. Adding to chat list:", newChatTarget);

                setChatData(prevData => {
                    const updatedPrivateChats = [newChatTarget, ...prevData.privateChatsWith];

                    return {
                        ...prevData,
                        privateChatsWith: updatedPrivateChats,
                    };
                });
            }
        }
    }, [isChatDataReady, allChats, location.state]);

    const openGroupInfoModal = () => {
        if (selectedChat?.type === 'group') {
            setActiveGroupInfoTab('Overview');
            setGroupMembers([]);
            setIsGroupInfoModalOpen(true);
        }
    };

    const formatTimestamp = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString.endsWith('Z') ? isoString : isoString + 'Z');
        if (isNaN(date)) return '';
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDateHeader = (isoString) => {
        if (!isoString) return '';
        const date = new Date(String(isoString).endsWith('Z') ? isoString : isoString + 'Z');
        if (isNaN(date)) return 'Invalid Date';
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatLastSeen = (isoString) => {
        if (!isoString) return 'Offline';
        const date = new Date(String(isoString).endsWith('Z') ? isoString : isoString + 'Z');
        if (isNaN(date)) return 'Offline';
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return `last seen today at ${formatTimestamp(isoString)}`;
        }
        return `last seen on ${date.toLocaleDateString()}`;
    };

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

    const getSenderInfo = (senderId) => {
        if (!currentUser) return { name: 'Unknown', profile: null };
        if (senderId === currentUser.id) return { name: 'You', profile: currentUser.profile };
        const allUsers = [...chatData.privateChatsWith, ...(currentChatInfo?.members || [])];
        const member = allUsers.find(m => m.chatId === senderId || m.employeeId === senderId);
        return member
            ? { name: member.name || member.employeeName, profile: member.profile || null }
            : { name: 'Unknown User', profile: null };
    };

    const getFileUrl = (msg) => {
        const baseUrl = chatApi.defaults.baseURL;

        if (msg.fileUrl && msg.fileUrl.startsWith('blob:')) {
            return msg.fileUrl;
        }

        if (msg.fileUrl && msg.fileUrl.startsWith('/api')) {
            const origin = new URL(baseUrl).origin;
            return `${origin}${msg.fileUrl}`;
        } else if (msg.fileUrl) {
            return msg.fileUrl;
        }

        const messageIdForUrl = msg.id || msg.messageId;
        if (messageIdForUrl) {
            return `${baseUrl}/chat/file/${messageIdForUrl}`;
        }
        return msg.content;
    };

    return (
        <div className="w-full h-full bg-gray-100 font-sans">
            <div className="flex w-full h-full p-0 md:p-4 md:gap-4">
                <div className={`relative w-full md:w-[30%] h-full p-4 bg-white flex flex-col shadow-xl md:rounded-lg ${isChatOpen ? 'hidden md:flex' : 'flex'}`}>
                    <div className="mb-4 flex-shrink-0"><input type="text" placeholder="Search chats users..." className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                    <div ref={sidebarScrollRef} onScroll={handleSidebarScroll} className="flex-grow space-y-2 pr-2 overflow-y-auto custom-scrollbar">
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
                        {isFetchingMore && (
                            <div className="flex justify-center items-center p-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`w-full md:w-[70%] h-full flex flex-col bg-white md:rounded-lg shadow-xl relative ${isChatOpen ? 'flex' : 'hidden md:flex'}`}>
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
                                        <button
                                            onClick={() => {
                                                if (currentChatInfo.type === 'private') {
                                                    navigate(`/employees/${currentUser.id}/public/${currentChatInfo.chatId}`);
                                                } else {
                                                    openGroupInfoModal();
                                                }
                                            }}
                                            disabled={!currentChatInfo}
                                            className="text-left"
                                        >
                                            <p className="font-bold text-lg truncate">{currentChatInfo.name}</p>
                                        </button>
                                        {currentChatInfo.type === 'private' ? (
                                            <p className="text-sm text-gray-500">{currentChatInfo.isOnline ? 'Online' : formatLastSeen(currentChatInfo.lastMessageTimestamp)}</p>
                                        ) : (
                                            <p className="text-sm text-gray-500">{currentChatInfo.memberCount || 0} members</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2"><button className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><FaVideo size={20} /></button><button className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><FaPhone size={20} /></button><div className="relative"><button ref={chatMenuButtonRef} onClick={() => setShowChatMenu(!showChatMenu)} className="p-2 rounded-full hover:bg-gray-100"><BsThreeDotsVertical size={20} /></button>{showChatMenu && (<div ref={chatMenuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20"><button onClick={() => { setShowClearConfirm(true); setShowChatMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Clear chat</button></div>)}</div></div>
                            </div>

                            {pinnedMessage && (
                                <div className="flex-shrink-0 flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center gap-2 text-sm overflow-hidden cursor-pointer flex-grow min-w-0" onClick={handleGoToMessage}>
                                        <FaThumbtack className="text-gray-500 flex-shrink-0" />
                                        <FileIcon fileName={pinnedMessage.fileName || ''} type={pinnedMessage.messageType} className="text-lg flex-shrink-0" />
                                        <div className="truncate">
                                            <p className="font-bold text-blue-600">Pinned Message</p>
                                            <p className="text-gray-600 truncate">
                                                {pinnedMessage.messageType === 'text' ? pinnedMessage.content : pinnedMessage.fileName || 'Pinned Media'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative flex-shrink-0">
                                        <button ref={pinnedMenuButtonRef} onClick={() => setShowPinnedMenu(!showPinnedMenu)} className="p-2 rounded-full hover:bg-gray-200">
                                            <FaChevronDown />
                                        </button>
                                        {showPinnedMenu && (
                                            <div ref={pinnedMenuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 text-sm">
                                                <ul className="py-1">
                                                    <li onClick={handleGoToMessage} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3">
                                                        <FaAngleDoubleRight /> Go to message
                                                    </li>
                                                    <li onClick={handleUnpin} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3 text-red-600">
                                                        <FaTimes /> Unpin
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div ref={chatContainerRef} onScroll={handleChatScroll} className="flex-grow p-4 overflow-y-auto bg-gray-50">
                                {isFetchingMoreMessages && (
                                    <div className="flex justify-center items-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
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
                                                                                <p className="opacity-80 truncate">
                                                                                    {['image', 'audio', 'file'].includes(msg.replyTo.type) ? msg.replyTo.content : msg.replyTo.content}
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {msg.type === 'image' ? (
                                                                            <div className="relative">
                                                                                <button onClick={() => setImageInView(fileUrl)}>
                                                                                    <img src={fileUrl} alt={msg.fileName || 'image'} className="rounded-md max-w-full" style={{ maxHeight: '300px' }} />
                                                                                </button>
                                                                                {!isMyMessage && (
                                                                                    <a href={fileUrl} download={msg.fileName} onClick={(e) => e.stopPropagation()} className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <FaDownload />
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ) : msg.type === 'audio' ? (
                                                                            <div className={`${isMyMessage ? 'bg-blue-600' : 'bg-gray-200'} rounded-lg`}>
                                                                                <AudioPlayer src={fileUrl} fileUrl={fileUrl} isSender={isMyMessage} initialDuration={msg.duration} fileSize={msg.fileSize} />
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

                                        {typingUsers[selectedChat.chatId] && (
                                            <div className="flex items-end gap-2 justify-start">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center self-start flex-shrink-0">
                                                    <FaUser className="text-gray-500" size={18} />
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <div className="p-3 rounded-lg bg-gray-200 text-gray-800">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex-shrink-0 flex flex-col p-4 border-t border-gray-200">
                                {replyingTo && (
                                    <div className="bg-gray-100 p-2 rounded-t-lg flex justify-between items-center">
                                        <div className="text-sm overflow-hidden">
                                            <p className="font-semibold text-blue-600">Replying to {replyingTo.sender === currentUser?.id ? 'yourself' : getSenderInfo(replyingTo.sender).name}</p>
                                            <p className="text-gray-600 truncate">
                                                {['image', 'audio', 'file'].includes(replyingTo.type) ? replyingTo.fileName : replyingTo.content}
                                            </p>
                                        </div>
                                        <button onClick={() => setReplyingTo(null)}><FaTimes /></button>
                                    </div>
                                )}

                                {editingInfo.index !== null && (<div className="bg-gray-100 p-2 rounded-t-lg flex justify-between items-center"><div className="text-sm overflow-hidden"><p className="font-semibold text-blue-600">Editing message</p><p className="text-gray-600 truncate">{editingInfo.originalContent}</p></div><button onClick={cancelEdit}><FaTimes /></button></div>)}
                                {currentChatInfo && (
                                    <div className={`relative flex items-center w-full space-x-2 ${(replyingTo || editingInfo.index !== null) ? 'pt-2' : ''}`}>
                                        {showEmojiPicker && (
                                            <div ref={emojiPickerRef} className="absolute bottom-full mb-2 left-0 z-40 w-[95vw] max-w-sm">
                                                <EmojiPicker onEmojiClick={onEmojiClick} width="100%" height={350} />
                                            </div>
                                        )}
                                        <div className="relative flex-grow">
                                            <input ref={messageInputRef} type="text" placeholder={isRecording ? "Recording..." : "Type a message..."} className="w-full p-3 pr-24 rounded-full border bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" value={message} onChange={(e) => { setMessage(e.target.value); sendTypingStatus(true); }} onKeyDown={handleKeyDown} disabled={isRecording} />
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
                {showScrollToBottom && (
                    <button
                        onClick={() => scrollToBottom()}
                        className="absolute bottom-24 right-8 z-10 bg-blue-600/80 backdrop-blur-sm text-white rounded-full p-3 shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-110 animate-fade-in"
                        aria-label="Scroll to bottom"
                    >
                        {newMessagesCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {newMessagesCount > 9 ? '9+' : newMessagesCount}
                            </span>
                        )}
                        <FaChevronDown size={20} />
                    </button>
                )}
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

                                {contextMenu.message.status !== 'sending' && contextMenu.message.status !== 'failed' && (
                                    <>
                                        {contextMenu.message.sender === currentUser?.id && contextMenu.message.type === 'text' && !contextMenu.message.isForwarded && (new Date() - new Date(contextMenu.message.timestamp) < 15 * 60 * 1000) && (
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

            {forwardingInfo.visible && (<div className="fixed inset-0 bg-opacity-100 flex items-center justify-center z-[100]"><div className="bg-white rounded-lg shadow-2xl w-full max-w-md"><div className="p-4 border-b flex justify-between items-center"><h3 className="font-bold text-lg">Forward message to...</h3><button onClick={() => setForwardingInfo({ visible: false, message: null })}><FaTimes /></button></div><div className="p-4"><input type="text" placeholder="Search for users or groups" className="w-full p-2 border rounded-lg" value={forwardSearchTerm} onChange={(e) => setForwardSearchTerm(e.target.value)} /></div><div className="h-64 overflow-y-auto p-4">{allChats.filter(c => c.name?.toLowerCase().includes(forwardSearchTerm.toLowerCase())).map(chat => (<div key={chat.chatId} className="flex items-center p-2 rounded-lg hover:bg-gray-100"><input type="checkbox" id={`fwd-${chat.chatId}`} className="mr-3 h-4 w-4 accent-blue-600" checked={forwardRecipients.includes(chat.chatId)} onChange={(e) => { if (e.target.checked) setForwardRecipients([...forwardRecipients, chat.chatId]); else setForwardRecipients(forwardRecipients.filter(id => id !== chat.chatId)); }} />
                <label htmlFor={`fwd-${chat.chatId}`} className="flex-grow flex items-center gap-3 cursor-pointer">
                    {chat.type === 'group' ? (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><FaUsers className="text-gray-500" /></div>
                    ) : (
                        <img src={chat.profile} alt={chat.name} className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/100x100/E2E8F0/4A5568?text=U' }} />
                    )}
                    <span>{chat.name}</span>
                </label>
            </div>))}</div><div className="p-4 border-t text-right"><button onClick={handleConfirmForward} disabled={forwardRecipients.length === 0} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer">Forward</button></div></div></div>)}

            {isProfileModalOpen && currentChatInfo && currentChatInfo.type !== 'group' && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]" onClick={() => setIsProfileModalOpen(false)}>
                    <img src={currentChatInfo.profile} alt={currentChatInfo.name} className="max-w-[80vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
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
                                    {isGroupDataLoading ? (
                                        <p className="text-center text-gray-500">Loading members...</p>
                                    ) : (
                                        groupMembers.map((member, i) => (
                                            <div key={member.employeeId || i} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50">
                                                {member.employeeImage ? (
                                                    <img src={member.employeeImage} alt={member.displayName} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <FaUser className="text-gray-500" size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-semibold">{member.displayName}</span>
                                                    {member.jobTitlePrimary && <p className="text-sm text-gray-500">{member.jobTitlePrimary}</p>}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            {activeGroupInfoTab === 'Media' && (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                    {chatMessages.filter(msg => ['image', 'video'].includes(msg.type)).map((msg, i) => (
                                        <button key={i} onClick={() => setImageInView(getFileUrl(msg))}>
                                            <img src={getFileUrl(msg)} alt={msg.fileName} className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeGroupInfoTab === 'Files' && (
                                <div className="space-y-3">
                                    {(() => {
                                        const files = chatMessages.filter(msg => msg.type === 'file');
                                        return files.length > 0 ? (
                                            files.map(fileMsg => (
                                                <FileMessage key={fileMsg.id} msg={fileMsg} isMyMessage={false} />
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-500 p-4">No files found in this chat.</p>
                                        );
                                    })()}
                                </div>
                            )}

                            {activeGroupInfoTab === 'Links' && (
                                <div className="space-y-3">
                                    {(() => {
                                        const linkMessages = chatMessages.filter(msg => msg.type === 'text' && (msg.content.includes('http://') || msg.content.includes('https://')));
                                        const allLinks = linkMessages.flatMap(linkMsg => {
                                            const linkRegex = /(https?:\/\/[^\s]+)/g;
                                            const links = linkMsg.content.match(linkRegex);
                                            return links ? links.map(link => ({
                                                id: linkMsg.id,
                                                url: link,
                                                sender: getSenderInfo(linkMsg.sender).name,
                                                timestamp: linkMsg.timestamp
                                            })) : [];
                                        });

                                        return allLinks.length > 0 ? (
                                            allLinks.map((link, index) => (
                                                <div key={`${link.id}-${index}`} className="p-3 bg-gray-100 rounded-lg">
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{link.url}</a>
                                                    <p className="text-xs text-gray-500 mt-1">Shared by {link.sender} on {new Date(link.timestamp).toLocaleDateString()}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-500 p-4">No links found in this chat.</p>
                                        );
                                    })()}
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

            {showClearConfirm && (
                <div className="fixed inset-0 bg-opacity-100 flex items-center justify-center z-[110]">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Clear Chat?</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to clear all messages in this chat? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={handleConfirmClearChat} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">
                                Clear Chat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatApplication;