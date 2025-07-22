import React, { useState } from "react";

function ForwardModal({ users, groups, onForwardTo, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");

  const combinedList = [
    ...groups.map((g) => ({ ...g, isGroup: true })),
    ...users.map((u) => ({ ...u, isGroup: false })),
  ];

  const filteredList = combinedList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0    bg-opacity-100 flex items-center justify-center z-114">
      <div className="bg-white p-6  shadow-2xl rounded-lg w-80 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-xl text-gray-500 hover:text-black"
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold mb-4 text-center">Forward to</h2>

        <input
          type="text"
          placeholder="Search users or groups..."
          className="w-full mb-4 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="max-h-64 overflow-y-auto">
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => onForwardTo(item)}
                className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center gap-3"
              >
                {item.isGroup ? (
                  <img
                    src="/group-icon.png"
                    alt="Group"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{item.name}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center">
              No results found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForwardModal;
