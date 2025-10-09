import { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getChatOverview } from '../../../../services/apiService';
import { transformOverviewToChatList } from '../../../../services/dataTransformer';
import ChatApplication from './ChatApplication';
import { Context } from '../HrmsContext';

const ChatListItemSkeleton = () => (
    <div className="flex items-center space-x-4 p-3">
        <div className="w-11 h-11 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
    </div>
);

const ChatAppSkeleton = ({ theme }) => (
    <div className={`flex w-full h-full p-0 md:p-4 md:gap-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {/* Sidebar Skeleton */}
        <div className={`w-full md:w-[30%] h-full p-4 flex flex-col shadow-xl md:rounded-lg space-y-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
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
        <div className={`hidden md:flex flex-col w-[70%] h-full md:rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>Loading Chats...</p>
                </div>
            </div>
        </div>
    </div>
);


function ChatApp() {
    const { userId } = useParams();
    const { theme,userData} = useContext(Context);
    const [chatList, setChatList] = useState({ groups: [], privateChatsWith: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchingMore = useRef(false);

    const currentUser = {
        name: userData?.displayName || 'You',
        id: userId,
        profile: userData?.employeeImage || 'https://placehold.co/100x100/E2E8F0/4A5568?text=Me'
    };

    const loadChats = async (pageNum) => {
        console.log(`%c loadChats function started for page: ${pageNum}`, 'color: blue; font-weight: bold;');

        if (!hasMore || fetchingMore.current) {
            console.log(`%c Request for page ${pageNum} blocked. hasMore=${hasMore}, fetchingMore.current=${fetchingMore.current}`, 'color: red;');
            return;
        }

        fetchingMore.current = true;

        if (pageNum === 0) {
            setIsLoading(true);
        } else {
            setIsFetchingMore(true);
        }

        try {
            console.log(`%c Sending API request for page: ${pageNum}`, 'color: green;');
            const rawChatListData = await getChatOverview(userId, pageNum, 10);

            if (rawChatListData.length === 0) {
                setHasMore(false);
                return;
            }

            const formattedChatList = transformOverviewToChatList(rawChatListData, userId);

            setChatList(prevChatList => {
                if (pageNum === 0) {
                    return formattedChatList;
                }
                const existingGroupIds = new Set(prevChatList.groups.map(g => g.chatId));
                const existingPrivateIds = new Set(prevChatList.privateChatsWith.map(p => p.chatId));
                const newUniqueGroups = formattedChatList.groups.filter(g => !existingGroupIds.has(g.chatId));
                const newUniquePrivate = formattedChatList.privateChatsWith.filter(p => !existingPrivateIds.has(p.chatId));
                return {
                    groups: [...prevChatList.groups, ...newUniqueGroups],
                    privateChatsWith: [...prevChatList.privateChatsWith, ...newUniquePrivate]
                };
            });

            if (rawChatListData.length < 10) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error loading chats:", error);
        } finally {
            if (pageNum === 0) {
                setIsLoading(false);
            }
            setIsFetchingMore(false);

            fetchingMore.current = false;
            console.log(`%c Finished fetch for page ${pageNum}. Lock released.`, 'color: orange;');
        }
    };

    const handleLoadMore = () => {
        console.log("handleLoadMore triggered!");
        if (fetchingMore.current || !hasMore) {
            console.log("handleLoadMore blocked by ref lock or no more data.");
            return;
        }
        const nextPage = page + 1;
        setPage(nextPage);
        loadChats(nextPage);
    };

    useEffect(() => {
        if (userId) {
            loadChats(0);
        }
    }, [userId]);

    return (
        <div className={`flex h-full w-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {isLoading ? (
                <ChatAppSkeleton theme={theme} />
            ) : (
                <ChatApplication
                    currentUser={currentUser}
                    chats={chatList}
                    loadMoreChats={handleLoadMore}
                    hasMore={hasMore}
                    isFetchingMore={isFetchingMore}
                    theme={theme}
                />
            )}
        </div>
    );
}

export default ChatApp;