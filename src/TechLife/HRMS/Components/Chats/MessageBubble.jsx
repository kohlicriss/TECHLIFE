import { useEffect, useRef, useState } from 'react';

function MessageBubble({
  msg,
  isLastSentByMeAndSeen,
  isLastSentByMe,
  lastMyMessage,
  selectedUser,
  onReply,
  onPinToggle,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onForward,
  hasReplyToLastMyMessage
}) {
  const isMe = msg.sender === 'me';
  const isGroup = selectedUser?.isGroup;
  const isDeleted = msg.text === 'This message was deleted';
  const isFileSentByMe = isMe && msg.type === 'file';

  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState('bottom');
  const [fileDownloaded, setFileDownloaded] = useState(isMe);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [fileToHandle, setFileToHandle] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const bubbleRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (!isDeleted) {
      calculateMenuPosition();
      setShowMenu(true);
    } else {
      calculateMenuPosition();
      setShowMenu(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const calculateMenuPosition = () => {
    const rect = bubbleRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    setMenuPosition(rect.bottom + 200 > windowHeight ? 'top' : 'bottom');
  };

  const handleMenuAction = (action) => {
    if (action === 'reply') onReply(msg);
    if (action === 'forward') onForward(msg);
    if (action === 'pin') onPinToggle(msg);
    if (action === 'edit') onEdit && onEdit(msg);
    if (action === 'deleteForMe') onDeleteForMe(msg);
    if (action === 'deleteForEveryone') onDeleteForEveryone && onDeleteForEveryone(msg);
    setShowMenu(false);
  };

  const getReadableFileType = (type) => {
    switch (type) {
      case 'pdf': return 'PDF Document';
      case 'word': return 'Word Document';
      case 'excel': return 'Excel Sheet';
      case 'ppt': return 'PowerPoint';
      default: return 'File';
    }
  };

  const triggerDownload = async (url, filename) => {
    try {
      // Always fetch the file from the original URL (handles both sender and receiver)
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      alert('Download failed. Please try again.');
      console.error('Download failed:', err);
    }
  };

  const openFile = (filetype, url) => {
    let viewerURL = url;
    // For office files, use Office viewer
    if (["word", "excel", "ppt"].includes(filetype)) {
      viewerURL = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }
    // For PDFs, open directly in new tab (most browsers support inline viewing)
    // For images, open directly
    // For other files, try to open in new tab (browser will preview if possible, else download)
    const win = window.open(viewerURL, '_blank', 'noopener,noreferrer');
    if (win) win.focus();
  };

  return (
    <div
      ref={bubbleRef}
      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-2 relative`}
      onContextMenu={handleContextMenu}
    >
      {isGroup && !isMe && (
        <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender}</p>
      )}

      <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${isMe ? 'bg-green-700 text-white' : 'bg-gray-200 text-black'}`}>
        {/* Forwarded Label */}
        {msg.isForwarded && (
          <p className={`text-xs italic mb-1 ${isMe ? 'text-gray-200' : 'text-gray-600'}`}>
            Forwarded
          </p>
        )}

        {msg.replyTo && (
          <div className={`mb-1 border-l-4 ${isMe ? 'border-blue-300' : 'border-blue-500'} pl-2 text-xs ${isMe ? 'text-white bg-green-900' : 'text-black bg-gray-300'} rounded`}>
            <p className="font-semibold">
              {msg.replyTo.sender === 'me' ? 'You' : msg.replyTo.sender}
            </p>
            <p className="truncate">{msg.replyTo.text}</p>
          </div>
        )}

        {msg.type === 'text' && <p className="break-words">{msg.text}</p>}

        {msg.type === 'system' && (
          <p className="italic text-gray-600 text-sm text-center">{msg.text}</p>
        )}

        {msg.type === 'image' && (
          !fileDownloaded && !isMe ? (
            <button
              onClick={() => setFileDownloaded(true)}
              className="bg-white text-green-800 font-semibold hover:bg-gray-200 mt-2 text-sm px-3 py-[6px] rounded"
            >
              Download Image
            </button>
          ) : (
            <div
              onClick={() => setShowImageModal(true)}
              className="bg-green-800 p-1 rounded-xl max-w-xs shadow cursor-pointer"
            >
              <img
                src={msg.url}
                alt="sent-img"
                className="rounded-md max-h-60 w-full object-cover"
              />
            </div>
          )
        )}

        {msg.type === 'file' && (
          !fileDownloaded && !isMe ? (
            <div className="bg-green-800 text-white w-72 h-[140px] rounded-xl p-3 shadow-md flex flex-col justify-between">
              <div className="flex gap-3 items-start">
                <img
                  src={
                    msg.filetype === 'pdf'
                      ? '/pdf-icon.png'
                      : msg.filetype === 'word'
                      ? '/word-icon.png'
                      : msg.filetype === 'excel'
                      ? '/excel-icon.png'
                      : msg.filetype === 'ppt'
                      ? '/ppt-icon.png'
                      : '/file-icon.png'
                  }
                  alt="File icon"
                  className="w-10 h-10 mt-1"
                />
                <div className="flex flex-col flex-1 justify-between h-full overflow-hidden">
                  <div>
                    <p className="text-sm font-bold truncate whitespace-nowrap overflow-hidden max-w-[160px]">
                      {msg.filename}
                    </p>
                    <p className="text-xs text-gray-200 mt-1">
                      {getReadableFileType(msg.filetype)} • {msg.filesize || '20 KB'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setFileDownloaded(true)}
                className="bg-white text-green-800 font-semibold hover:bg-gray-200 mt-2 text-sm px-3 py-[6px] rounded w-full"
              >
                Download File
              </button>
            </div>
          ) : (
            <div className="bg-green-800 text-white w-72 h-[140px] rounded-xl p-3 shadow-md">
              <div className="flex gap-3 items-start h-full">
                <img
                  src={
                    msg.filetype === 'pdf'
                      ? '/pdf-icon.png'
                      : msg.filetype === 'word'
                      ? '/word-icon.png'
                      : msg.filetype === 'excel'
                      ? '/excel-icon.png'
                      : msg.filetype === 'ppt'
                      ? '/ppt-icon.png'
                      : '/file-icon.png'
                  }
                  alt="File icon"
                  className="w-10 h-10 mt-1"
                />
                <div className="flex flex-col flex-1 justify-between h-full overflow-hidden">
                  <div>
                    <p className="text-sm font-bold truncate whitespace-nowrap overflow-hidden max-w-[160px]">
                      {msg.filename}
                    </p>
                    <p className="text-xs text-gray-200 mt-1">
                      {getReadableFileType(msg.filetype)} • {msg.filesize || '20 KB'}
                    </p>
                  </div>
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => openFile(msg.filetype, msg.url)}
                      className="bg-white text-green-800 font-semibold hover:bg-gray-200 px-3 py-[6px] rounded text-sm w-24"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => {
                        setFileToHandle(msg);
                        setCustomFileName(msg.filename);
                        setShowSaveModal(true);
                      }}
                      className="bg-white text-green-800 font-semibold hover:bg-gray-200 px-3 py-[6px] rounded text-sm w-24"
                    >
                      Save as...
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {msg.type === 'audio' && (
          <audio controls src={msg.url} className="mt-1">
            Your browser does not support the audio element.
          </audio>
        )}

        <div className="flex justify-end gap-1 mt-1 text-[10px] opacity-70">
          <span>{msg.time}</span>
          {msg.edited && <span className="ml-1">(edited)</span>}
        </div>
      </div>

      {isMe && isLastSentByMe && (
        <div className="text-[10px] text-gray-500 mt-1">
          {selectedUser?.online ? 'Seen' : 'Delivered'}
        </div>
      )}

      {showMenu && (
        <div
          className={`absolute z-50 w-44 bg-white border shadow-md rounded-md ${isMe ? 'right-0' : 'left-0'} ${menuPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
          {!isDeleted && (
            <>
              <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleMenuAction('reply')}>Reply</p>
              <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleMenuAction('forward')}>Forward</p>
              <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleMenuAction('pin')}>
                {msg.pinned ? 'Unpin' : 'Pin'}
              </p>
              {isMe && msg.type === 'text' && (
                <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleMenuAction('edit')}>
                  Edit
                </p>
              )}
            </>
          )}
          <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleMenuAction('deleteForMe')}>
            Delete for me
          </p>
          {isMe && !isDeleted && (
            <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleMenuAction('deleteForEveryone')}>
              Delete for everyone
            </p>
          )}
        </div>
      )}

      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
          <img
            src={msg.url}
            alt="Full"
            className="max-w-[90%] max-h-[90%] rounded shadow-lg"
          />
        </div>
      )}

      {showSaveModal && fileToHandle && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setShowSaveModal(false)}>
          <div className="bg-white w-[300px] p-4 rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">Save File As</h2>
            <input
              type="text"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await triggerDownload(fileToHandle.url, customFileName);
                  setShowSaveModal(false);
                }}
                className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 text-sm"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
