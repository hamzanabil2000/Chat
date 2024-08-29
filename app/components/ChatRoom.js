import React, { useState, useEffect, useRef } from "react";
import MessageCard from "./MessageCard";
import MessageInput from "./MessageInput";
import { ref, onValue, push, serverTimestamp, update } from "firebase/database";
import { database } from "@/lib/firebase"; // Updated import

function ChatRoom({ user, selectedChatroom }) {
  const me = selectedChatroom?.myData;
  const other = selectedChatroom?.otherData;
  const chatRoomId = selectedChatroom?.id;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesContainerRef = useRef(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Get messages
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

  console.log(messages);

  // Send message
  const sendMessage = async () => {
    const messagesRef = ref(database, `messages/${chatRoomId}`);
    // Check if the message is not empty
    if (message === "" && !image) {
      return;
    }

    try {
      // Add a new message to the Realtime Database
      const newMessage = {
        chatRoomId: chatRoomId,
        sender: me.id,
        content: message,
        time: serverTimestamp(),
        image: image || null,
      };

      await push(messagesRef, newMessage);
      setMessage("");
      setImage("");

      // Update the last message in the chatroom
      const chatroomRef = ref(database, `chatrooms/${chatRoomId}`);
      await update(chatroomRef, {
        lastMessage: message ? message : "Image",
      });
    } catch (error) {
      console.error("Error sending message:", error.message);
    }

    // Scroll to the bottom after sending a message
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Messages container with overflow and scroll */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-10">
        {messages?.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            me={me}
            other={other}
          />
        ))}
      </div>

      {/* Input box at the bottom */}
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
