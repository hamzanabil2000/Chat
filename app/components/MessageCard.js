import React, { useState, useRef, useEffect } from "react";
import moment from "moment";

function MessageCard({ message, me, other, onReply, onDelete, messages = [] }) {
  const [showDialog, setShowDialog] = useState(false);
  const isMessageFromMe = message.sender === me.id;
  const dialogRef = useRef(null);

  const formatTimeAgo = (timestamp) => {
    let date;

    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp && typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (typeof timestamp === "number") {
      date = new Date(timestamp);
    } else if (typeof timestamp === "string" && !isNaN(Number(timestamp))) {
      date = new Date(Number(timestamp) * 1000);
    } else {
      console.error("Invalid timestamp format:", timestamp);
      return "Invalid time";
    }

    const momentDate = moment(date);
    return momentDate.isValid() ? momentDate.fromNow() : "Invalid time";
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  useEffect(() => {
    if (showDialog && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [showDialog]);

  // Ensure messages is an array and find the replied message
  const repliedMessage = Array.isArray(messages)
    ? messages.find((msg) => msg.id === message.parentMsgId)
    : null;

  return (
    <div
      key={message.id}
      className={`relative flex mb-4 ${
        isMessageFromMe ? "justify-end" : "justify-start"
      }`}
      onContextMenu={handleContextMenu}
    >
      <div className={`w-10 h-10 ${isMessageFromMe ? "ml-2 mr-2" : "mr-2"}`}>
        {isMessageFromMe ? (
          <img
            className="w-full h-full object-cover rounded-full"
            src={me.avatarUrl}
            alt="Avatar"
          />
        ) : (
          <img
            className="w-full h-full object-cover rounded-full"
            src={other.avatarUrl}
            alt="Avatar"
          />
        )}
      </div>

      <div
        className={`p-2 rounded-md ${
          isMessageFromMe
            ? "bg-blue-500 text-white self-end"
            : "bg-[#19D39E] text-white self-start"
        }`}
      >
        {repliedMessage && (
          <div className="mb-2 p-2 bg-gray-700 rounded-md">
            <p className="font-semibold text-gray-300">Replied Message:</p>
            {repliedMessage.image && (
              <img src={repliedMessage.image} className="max-h-60 w-60 mb-4" alt="Replied message" />
            )}
            <p>{repliedMessage.content}</p>
          </div>
        )}
        {message.image && (
          <img src={message.image} className="max-h-60 w-60 mb-4" alt="Message" />
        )}
        <p>{message.content}</p>
        <div className="text-xs text-gray-200">
          {formatTimeAgo(message.time)}
        </div>
      </div>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Options</h3>
          <p className="py-4">Select an action below:</p>
          <div className="text-center">
            <button
              onClick={() => {
                onDelete(message.id);
                handleCloseDialog();
              }}
              className="block w-full p-3 mb-2 text-red-500 hover:bg-red-100 rounded-lg"
            >
              Delete
            </button>
            <button
              onClick={() => {
                onReply(message);
                handleCloseDialog();
              }}
              className="block w-full p-3 text-blue-500 hover:bg-blue-100 rounded-lg"
            >
              Reply
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleCloseDialog}>Close</button>
        </form>
      </dialog>
    </div>
  );
}

export default MessageCard;
