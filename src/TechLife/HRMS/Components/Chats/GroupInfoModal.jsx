import React, { useState, useRef, useEffect } from 'react';

function GroupInfoModal({
  group,
  users,
  onClose,
  onUpdateGroupName,
  onManageMembers,
  currentUserId,
  onUpdateGroupImage,
  onUpdateGroupDescription,
  messages
}) {
  const groupMessages = messages && group && group.id ? (messages[group.id] || []) : [];

  const mediaMessages = groupMessages.filter(m => m.type === 'image');

  const fileTypes = ['pdf', 'word', 'excel', 'ppt', 'other'];
  const fileMessages = groupMessages.filter(m => m.type === 'file' && fileTypes.includes(m.filetype));

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const linkMessages = groupMessages.filter(m => typeof m.text === 'string' && urlRegex.test(m.text));
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const memberList = (group.members || [])
    .map(id => users.find(u => u.id === id))
    .filter(Boolean);

  const adminIds = group.adminIds || [];

  const sortedMembers = [
    ...memberList.filter(m => adminIds.includes(m.id)),
    ...memberList.filter(m => !adminIds.includes(m.id))
  ];

  const isGroup = group?.isGroup;
  const isCurrentUserAdmin = group.adminIds?.includes(currentUserId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(group.name);
  const nameInputRef = useRef(null);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(group.description || '');

  useEffect(() => {
    if (isEditingName) nameInputRef.current?.focus();
  }, [isEditingName]);

  const handleEditSave = () => {
    setIsEditingName(false);
    if (editedName.trim() && editedName !== group.name) {
      onUpdateGroupName(group.id, editedName.trim());
    }
  };

  const cancelNameEdit = () => {
    setEditedName(group.name);
    setIsEditingName(false);
  };

  const handleDescriptionSave = () => {
    setIsEditingDescription(false);
    if (editedDescription.trim() !== group.description) {
      onUpdateGroupDescription(group.id, editedDescription.trim());
    }
  };

  const cancelDescriptionEdit = () => {
    setEditedDescription(group.description || '');
    setIsEditingDescription(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpdateGroupImage(group.id, file);
    }
  };

  const handleRedirect = (userId) => {
    window.location.href = `/profile/${userId}`;
  };

  const filteredMembers = sortedMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
        <div className="bg-white rounded-lg shadow-lg w-[26rem] h-[90vh] max-h-[90vh] flex overflow-hidden relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-xl text-gray-500 hover:text-black z-50"
          >
            &times;
          </button>

          <div className="w-40 border-r bg-gray-50 p-4 space-y-2 overflow-y-auto">
            {['overview', 'members', 'media', 'files', 'links'].map(tab => (
              <button
                key={tab}
                className={`capitalize w-full text-left px-3 py-1 rounded ${activeTab === tab
                  ? 'bg-blue-100 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white sticky top-0 z-10 border-b px-4 py-3">
              {activeTab === 'overview' && (
                <div className="flex flex-col items-center">
                  {isGroup ? (
                    <div className="relative">
                      <img
                        src={group.imageUrl || "/group-icon.png"}
                        alt="Group"
                        className="w-16 h-16 rounded-full object-cover mb-2 cursor-pointer"
                        onClick={() => group.imageUrl && setShowPreview(true)}
                      />
                      {isCurrentUserAdmin && (
                        <label className="absolute bottom-1 right-1 bg-white rounded-full p-1 cursor-pointer shadow">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <span className="text-sm">✎</span>
                        </label>
                      )}
                    </div>
                  ) : (
                    <div className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl mb-2">
                      {group.name.charAt(0)}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {isEditingName ? (
                      <>
                        <input
                          ref={nameInputRef}
                          value={editedName}
                          onChange={e => setEditedName(e.target.value)}
                          onBlur={handleEditSave}
                          onKeyDown={e => e.key === 'Enter' && handleEditSave()}
                          className="text-lg font-bold border-b border-blue-400 focus:outline-none"
                        />
                        <button
                          onClick={cancelNameEdit}
                          className="text-gray-400 hover:text-black text-base"
                          title="Cancel edit"
                        >✖</button>
                      </>
                    ) : (
                      <>
                        <h2 className="text-lg font-bold">{group.name}</h2>
                        {isGroup && (
                          <button
                            onClick={() => setIsEditingName(true)}
                            className="text-sm text-gray-500 hover:text-black"
                            title="Edit group name"
                          >✎</button>
                        )}
                      </>
                    )}
                  </div>

                  {group.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Created on {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {activeTab !== 'overview' && (
                <h2 className="text-lg font-semibold text-gray-700 text-center">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h2>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'overview' && (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-gray-700">Description</p>
                  {isEditingDescription ? (
                    <div className="mt-1">
                      <textarea
                        className="text-sm border rounded w-full p-1"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        onBlur={handleDescriptionSave}
                        rows={3}
                      />
                      <button
                        className="text-xs text-gray-500 mt-1 hover:text-black"
                        onClick={cancelDescriptionEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1 mt-1">
                      <p className="text-sm text-gray-600">{group.description || 'No description yet.'}</p>
                      {isCurrentUserAdmin && (
                        <button
                          onClick={() => setIsEditingDescription(true)}
                          className="text-xs text-gray-500 hover:text-black"
                          title="Edit description"
                        >✎</button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'members' && (
                <>
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 mb-3 border rounded"
                  />
                  {isGroup && isCurrentUserAdmin && (
                    <div className="mb-3">
                      <button
                        onClick={() => onManageMembers(group)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                      >
                        ⚙️ Manage Members
                      </button>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {filteredMembers.map(member => (
                      <li
                        key={member.id}
                        className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded cursor-pointer hover:bg-gray-200"
                        onClick={() => handleRedirect(member.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                            {member.name.charAt(0)}
                          </div>
                          <span>{member.name}</span>
                        </div>
                        {adminIds.includes(member.id) && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Admin</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {activeTab === 'media' && (
                <div>
                  {mediaMessages.length === 0 ? (
                    <div className="text-center text-gray-600">No media files yet.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {mediaMessages.map((msg, idx) => (
                        <div key={msg.id || idx} className="flex flex-col items-center">
                          <img
                            src={msg.url}
                            alt={msg.filename || 'Image'}
                            className="rounded-lg max-h-40 w-full object-cover cursor-pointer border"
                            onClick={() => window.open(msg.url, '_blank')}
                          />
                          <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">{msg.filename}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'files' && (
                <div>
                  {fileMessages.length === 0 ? (
                    <div className="text-center text-gray-600">No files yet.</div>
                  ) : (
                    <ul className="space-y-3">
                      {fileMessages.map((msg, idx) => (
                        <li key={msg.id || idx} className="flex items-center gap-3 bg-gray-100 p-2 rounded">
                          <img
                            src={
                              msg.filetype === 'pdf' ? '/pdf-icon.png'
                              : msg.filetype === 'word' ? '/word-icon.png'
                              : msg.filetype === 'excel' ? '/excel-icon.png'
                              : msg.filetype === 'ppt' ? '/ppt-icon.png'
                              : '/file-icon.png'
                            }
                            alt="File icon"
                            className="w-8 h-8"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{msg.filename}</p>
                            <p className="text-xs text-gray-500">{msg.filesize || ''}</p>
                          </div>
                          <button
                            className="text-blue-600 text-xs font-semibold px-2 py-1 rounded hover:underline"
                            onClick={() => window.open(msg.url, '_blank')}
                          >Open</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {activeTab === 'links' && (
                <div>
                  {linkMessages.length === 0 ? (
                    <div className="text-center text-gray-600">No links shared yet.</div>
                  ) : (
                    <ul className="space-y-2">
                      {linkMessages.map((msg, idx) => {
                        const links = (msg.text.match(urlRegex) || []);
                        return links.map((link, lidx) => (
                          <li key={msg.id + '-' + lidx} className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline truncate"
                              style={{ maxWidth: '200px' }}
                            >{link}</a>
                            <span className="text-xs text-gray-500 ml-2 truncate">{msg.filename || ''}</span>
                          </li>
                        ));
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowPreview(false)}
        >
          <img
            src={group.imageUrl}
            alt="Full Preview"
            className="max-w-full max-h-full rounded"
          />
        </div>
      )}
    </>
  );
}

export default GroupInfoModal;
