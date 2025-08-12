import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getChatOverview } from '../../../../services/apiService';
import { transformOverviewToChatList } from '../../../../services/dataTransformer';
import ChatApplication from './ChatApplication';

const ChatListItemSkeleton = () => (
    <div className="flex items-center space-x-4 p-3">
        <div className="w-11 h-11 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
    </div>
);

const ChatAppSkeleton = () => (
    <div className="flex w-full h-full p-0 md:p-4 md:gap-4">
        {/* Sidebar Skeleton */}
        <div className="w-full md:w-[30%] h-full p-4 bg-white flex flex-col shadow-xl md:rounded-lg space-y-4">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
            <div className="flex-grow space-y-2 pr-2 overflow-hidden">
                <ChatListItemSkeleton />
                <ChatListItemSkeleton />
                <ChatListItemSkeleton />
                <ChatListItemSkeleton />
                <ChatListItemSkeleton />
                <ChatListItemSkeleton />
                <ChatListItemSkeleton />
            </div>
        </div>
        
        {/* This part is hidden on mobile to match the final layout's behavior */}
        <div className="hidden md:flex flex-col w-[70%] h-full bg-white md:rounded-lg shadow-xl">
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-xl text-gray-400">Loading Chats...</p>
                </div>
            </div>
        </div>
    </div>
);


function ChatApp() {
    const { userId } = useParams();
    const [chatList, setChatList] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentUser = {
        name: 'You',
        id: userId,
        profile: 'https://placehold.co/100x100/E2E8F0/4A5568?text=Me'
    };

    useEffect(() => {
        if (!userId) return;

        const fetchChatList = async () => {
            setIsLoading(true);
            try {
                const rawChatListData = await getChatOverview(userId);
                const formattedChatList = transformOverviewToChatList(rawChatListData);
                setChatList(formattedChatList);
            } catch (error) {
                console.error("Error in ChatApp component:", error);
                setChatList({ groups: [], privateChatsWith: [] });
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatList();
    }, [userId]);

    return (
        <div style={{ height: '90vh' }} className="flex h-screen bg-gray-100">
            {isLoading ? (
                <ChatAppSkeleton />
            ) : (
                <ChatApplication
                    currentUser={currentUser}
                    initialChats={chatList}
                />
            )}
        </div>
    );
}

export default ChatApp;
