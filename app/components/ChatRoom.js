import React, { useState, useEffect, useRef } from "react";
import MessageCard from "./MessageCard";
import MessageInput from "./MessageInput";
import {
  ref,
  onValue,
  push,
  serverTimestamp,
  update,
  remove,
} from "firebase/database";
import { database } from "@/lib/firebase";

function ChatRoom({ user, selectedChatroom }) {
  const me = selectedChatroom?.myData;
  const other = selectedChatroom?.otherData;
  const chatRoomId = selectedChatroom?.id;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!chatRoomId) return;

    const messagesRef = ref(database, `messages/${chatRoomId}`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      const messagesArray = messagesData
        ? Object.keys(messagesData).map((key) => ({
            id: key,
            ...messagesData[key],
          }))
        : [];
      setMessages(messagesArray);
    });

    return () => {
      unsubscribe();
    };
  }, [chatRoomId]);

  const sendMessage = async () => {
    const messagesRef = ref(database, `messages/${chatRoomId}`);
    if (message === "" && !image) {
      return;
    }

    try {
      const newMessage = {
        chatRoomId: chatRoomId,
        sender: me.id,
        content: message,
        time: serverTimestamp(),
        image: image || null,
        parentMsgId: replyMessage ? replyMessage.id : null, // Include parent message ID
      };

      await push(messagesRef, newMessage);
      setMessage("");
      setImage("");
      setReplyMessage(null); // Clear reply message

      const chatroomRef = ref(database, `chatrooms/${chatRoomId}`);
      await update(chatroomRef, {
        lastMessage: message ? message : "Image",
      });
    } catch (error) {
      console.error("Error sending message:", error.message);
    }

    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const handleReply = (message) => {
    setReplyMessage(message);
  };

  const handleDelete = async (messageId) => {
    try {
      await remove(ref(database, `messages/${chatRoomId}/${messageId}`));
    } catch (error) {
      console.error("Error deleting message:", error.message);
    }
  };

  const handleClearReply = () => {
    setReplyMessage(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-10">
        {messages?.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            me={me}
            other={other}
            onReply={handleReply}
            onDelete={handleDelete}
            messages={messages}
          />
        ))}
      </div>

      {replyMessage && (
        <div className="bg-gray-200 p-5 border-b border-gray-300">
          <p className="text-gray-600">Replying to:</p>
          <MessageCard
            message={replyMessage}
            me={me}
            other={other}
            onReply={handleReply}
            onDelete={handleDelete}
          />
          <button onClick={handleClearReply} className="text-blue-500 mt-2">
            Cancel Reply
          </button>
        </div>
      )}

      <MessageInput
        sendMessage={sendMessage}
        message={message}
        setMessage={setMessage}
        image={image}
        setImage={setImage}
      />
    </div>
  );
}

export default ChatRoom;
