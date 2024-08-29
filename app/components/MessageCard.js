import React from "react";
import moment from "moment";

function MessageCard({ message, me, other }) {
  const isMessageFromMe = message.sender === me.id;

  const formatTimeAgo = (timestamp) => {
    let date;
  
    // Check if timestamp is a native Date object
    if (timestamp instanceof Date) {
      date = timestamp;
    } 
    // Check if timestamp has a toDate method (Firestore Timestamp)
    else if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } 
    // Handle Unix timestamp in milliseconds
    else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } 
    // Handle Unix timestamp in seconds (if applicable)
    else if (typeof timestamp === 'string' && !isNaN(Number(timestamp))) {
      date = new Date(Number(timestamp) * 1000);
    } 
    // Handle invalid timestamp
    else {
      console.error('Invalid timestamp format:', timestamp);
      return 'Invalid time';
    }
  
    // Format the date using moment.js
    const momentDate = moment(date);
    return momentDate.isValid() ? momentDate.fromNow() : 'Invalid time';
  };
  
  
  
  

  return (
    <div
      key={message.id}
      className={`flex mb-4 ${
        isMessageFromMe ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar on the left or right based on the sender */}
      <div className={`w-10 h-10 ${isMessageFromMe ? "ml-2 mr-2" : "mr-2"}`}>
        {isMessageFromMe && (
          <img
            className="w-full h-full object-cover rounded-full"
            src={me.avatarUrl}
            alt="Avatar"
          />
        )}
        {!isMessageFromMe && (
          <img
            className="w-full h-full object-cover rounded-full"
            src={other.avatarUrl}
            alt="Avatar"
          />
        )}
      </div>

      {/* Message bubble on the right or left based on the sender */}
      <div
        className={` text-white p-2 rounded-md ${
          isMessageFromMe ? "bg-blue-500 self-end" : "bg-[#19D39E] self-start"
        }`}
      >
        {message.image && (
          <img src={message.image} className="max-h-60 w-60 mb-4" />
        )}
        <p>{message.content}</p>
        <div className="text-xs text-gray-200">
          {formatTimeAgo(message.time)}
        </div>
      </div>
    </div>
  );
}

export default MessageCard;
