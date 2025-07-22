import { useState, useEffect } from "react";

function ChatSidebar({
  users,
  groups,
  selectedUser,
  setSelectedUser,
  messages,
  setMessages,
}) {
  useEffect(() => {
    if (!selectedUser) return;
    const chatId = selectedUser.id;
    const chatMessages = messages[chatId] || [];
    let updated = false;
    const newMsgs = chatMessages.map((m) => {
      if (m.sender !== "me" && !m.read) {
        updated = true;
        return { ...m, read: true };
      }
      return m;
    });
    if (updated) {
      setMessages((prev) => ({ ...prev, [chatId]: newMsgs }));
    }
  }, [selectedUser, messages, setMessages]);

  const [search, setSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    const newCounts = {};
    Object.keys(messages).forEach((id) => {
      const msgs = messages[id] || [];
      newCounts[id] = msgs.filter((m) => m.sender !== "me" && !m.read).length;
    });
    if (selectedUser) newCounts[selectedUser.id] = 0;
    setUnreadCounts(newCounts);
  }, [messages, selectedUser]);

  const combinedList = [
    ...groups.map((group) => ({ ...group, isGroup: true })),
    ...users.map((user) => ({ ...user, isGroup: false })),
  ];

  const filteredList = combinedList.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedList = filteredList.sort((a, b) => {
    const aMessages = messages[a.id] || [];
    const bMessages = messages[b.id] || [];
    const aLastMsg = aMessages[aMessages.length - 1];
    const bLastMsg = bMessages[bMessages.length - 1];
    const aLastTime = aLastMsg ? aLastMsg.timestamp || 0 : 0;
    const bLastTime = bLastMsg ? bLastMsg.timestamp || 0 : 0;
    return bLastTime - aLastTime;
  });

  return (
    <div
      className={`flex flex-col bg-white border-r border-gray-200 ${
        selectedUser
          ? "hidden md:flex md:w-1/3 lg:w-1/4"
          : "w-full md:w-1/3 lg:w-1/4"
      }`}
    >
      {/* Changed text-xl to text-lg */}
      <h2 className="text-lg font-bold p-4 border-b border-gray-200">Chats</h2>

      {/* Added text-sm */}
      <input
        type="text"
        placeholder="Search users or groups..."
        className="mx-4 my-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex-1 overflow-y-auto">
        {sortedList.map((item) => {
          const itemMessages = messages[item.id] || [];
          const lastMessage = itemMessages[itemMessages.length - 1];
          const unreadCount = unreadCounts[item.id] || 0;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedUser(item)}
              className={`flex items-center gap-3 p-2 mx-2 my-1 rounded-lg border border-transparent hover:bg-gray-100 hover:border-gray-200 cursor-pointer ${
                selectedUser?.id === item.id
                  ? "bg-gray-100 border-gray-200"
                  : ""
              }`}
            >
              <div className="relative">
                {item.isGroup ? (
                  <img
                    src={item.imageUrl || "/group-icon.png"}
                    alt="Group"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-base">
                    {item.name.charAt(0)}
                  </div>
                )}
                {!item.isGroup && item.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm truncate max-w-[120px]">
                    {item.name}
                  </p>
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[24px] text-center font-semibold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate w-40 flex items-center gap-1">
                  {lastMessage ? (
                    lastMessage.type === "image" ? (
                      <>
                        <span role="img" aria-label="image">
                          🖼️
                        </span>
                        <span>Photo</span>
                      </>
                    ) : lastMessage.type === "file" ? (
                      <>
                        <span role="img" aria-label="file">
                          📎
                        </span>
                        <span>
                          {lastMessage.filename ? lastMessage.filename : "File"}
                        </span>
                      </>
                    ) : lastMessage.type === "audio" ? (
                      <>
                        <span role="img" aria-label="voice">
                          🎤
                        </span>
                        <span>Voice message</span>
                      </>
                    ) : (
                      lastMessage.text
                    )
                  ) : item.isGroup ? (
                    "No messages yet"
                  ) : item.online ? (
                    "Online"
                  ) : (
                    `Last seen ${item.lastSeen}`
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChatSidebar;
