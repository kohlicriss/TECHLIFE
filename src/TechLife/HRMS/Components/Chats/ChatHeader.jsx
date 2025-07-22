import { useState } from 'react';
import { IoArrowBack, IoVideocamOutline, IoCallOutline } from 'react-icons/io5';
import VideoCallModal from './VideoCallModal';
import NormalCallModal from './NormalCallModal';

function ChatHeader({ selectedUser, onClearChat, onBack, onGroupInfo, currentUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleClearChat = () => {
    onClearChat();
    setMenuOpen(false);
  };

  const isGroup = selectedUser?.isGroup;

  return (
    <>
      <div className="flex items-center justify-between p-4  bg-white">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-2xl p-2 hover:bg-gray-100 rounded-full"
            onClick={onBack}
          >
            <IoArrowBack />
          </button>

          <div className="relative">
            {isGroup ? (
              <img
                src={selectedUser.imageUrl || "/group-icon.png"}
                alt="Group"
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onClick={() => selectedUser.imageUrl && setShowPreview(true)}
              />
            ) : (
              <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer">
                {selectedUser?.name?.charAt(0)}
              </div>
            )}

            {!isGroup && selectedUser?.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </div>

          <div>
            <p
              className="font-medium cursor-pointer"
              onClick={() => {
                if (isGroup) {
                  onGroupInfo();
                } else {
                  window.location.href = `/profile/${selectedUser?.id}`;
                }
              }}
            >
              {selectedUser?.name}
            </p>
            <p className="text-sm text-gray-500">
              {isGroup
                ? `${selectedUser?.members?.length || 0} Members`
                : selectedUser?.online
                ? 'Online'
                : `Last seen ${selectedUser?.lastSeen}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* Video Call Icon */}
          <button
            onClick={() => setShowVideoCall(true)}
            className="text-xl text-gray-500 hover:text-gray-700"
            title="Start Video Call"
          >
            <IoVideocamOutline size={22} />
          </button>

          {/* Audio Call Icon */}
          <button
            onClick={() => setShowAudioCall(true)}
            className="text-xl text-gray-500 hover:text-gray-700"
            title="Start Call"
          >
            <IoCallOutline size={22} />
          </button>

          <button
            onClick={toggleMenu}
            className="text-2xl px-2 hover:bg-gray-100 rounded"
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 bg-white border rounded shadow-md z-50">
              <p
                onClick={handleClearChat}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
              >
                Clear Chat
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Video Call Modal */}
      {showVideoCall && (
        <VideoCallModal
          onClose={() => setShowVideoCall(false)}
          selectedUser={selectedUser}
          currentUser={currentUser}
          isCaller={true}
        />
      )}

      {/* Audio Call Modal */}
      {showAudioCall && (
        <NormalCallModal
          onClose={() => setShowAudioCall(false)}
          selectedUser={selectedUser}
          currentUser={currentUser}
          isCaller={true}
        />
      )}

      {/* Image Preview for Group */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowPreview(false)}
        >
          <img
            src={selectedUser.imageUrl}
            alt="Group Full Preview"
            className="max-w-full max-h-full rounded"
          />
        </div>
      )}
    </>
  );
}

export default ChatHeader;
