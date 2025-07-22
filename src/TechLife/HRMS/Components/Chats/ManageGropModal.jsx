import React, { useState } from 'react';

function ManageGroupModal({ group, users, onAdd, onRemove, onClose }) {
  const groupMemberIds = group.members || [];

  const [search, setSearch] = useState('');

  const usersInGroup = users
    .filter(u => groupMemberIds.includes(u.id))
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  const usersNotInGroup = users
    .filter(u => !groupMemberIds.includes(u.id))
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-white p-0 rounded-lg w-96 shadow-xl max-h-[80vh] overflow-hidden">

        <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-3 border-b">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold focus:outline-none"
            aria-label="Close"
          >
            &times;
          </button>

          <h3 className="text-xl font-bold text-center text-gray-800">Manage Members</h3>

          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full mt-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="overflow-y-auto px-5 py-4 max-h-[calc(80vh-110px)]">

          <div className="mb-6">
            <p className="font-semibold mb-2">Remove User:</p>
            <ul className="space-y-1">
              {usersInGroup.map(u => (
                <li key={u.id} className="flex justify-between items-center px-2 py-1 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">{u.name}</span>
                  <button
                    onClick={() => onRemove(u.id, group.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                  >
                    Remove
                  </button>
                </li>
              ))}
              {usersInGroup.length === 0 && (
                <li className="text-sm text-gray-500 px-2">No users found.</li>
              )}
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-2">Add User:</p>
            <ul className="space-y-1">
              {usersNotInGroup.map(u => (
                <li key={u.id} className="flex justify-between items-center px-2 py-1 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">{u.name}</span>
                  <button
                    onClick={() => onAdd(u.id, group.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                  >
                    Add
                  </button>
                </li>
              ))}
              {usersNotInGroup.length === 0 && (
                <li className="text-sm text-gray-500 px-2">No users found.</li>
              )}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ManageGroupModal;
