import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getChatOverview } from '../../../../services/apiService';
import { transformOverviewToChatList } from '../../../../services/dataTransformer';
import ChatApplication from './ChatApplication';

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
        <div style={{ height: '90vh' }} className="flex h-screen">
            {isLoading ? (
                <div className="w-full flex items-center justify-center">
                    <p className="text-xl text-gray-500">Loading Chats...</p>
                </div>
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