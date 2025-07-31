import { useEffect, useState } from 'react';
import axios from 'axios';
import ChatApplication from './ChatApplication';

function ChatApp() {
    const [chatList, setChatList] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentUser = {
        name: 'You',
        id: 'ACS00000001',
        profile: 'https://placehold.co/100x100/E2E8F0/4A5568?text=Me'
    };

    useEffect(() => {
        axios.get(`http://localhost:8082/api/overview/${currentUser.id}`)
            .then(response => {
                const rawChatListData = response.data;

                const formattedChatList = rawChatListData.reduce((acc, chat) => {
                    if (chat.groupName !== undefined && chat.groupName !== null) {
                        acc.groups.push(chat);
                    } else {
                        acc.privateChatsWith.push(chat);
                    }
                    return acc;
                }, { groups: [], privateChatsWith: [] });
                
                setChatList(formattedChatList);
            })
            .catch(error => {
                console.error("Failed to fetch chat overview:", error);
                setChatList({ groups: [], privateChatsWith: [] });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [currentUser.id]);

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