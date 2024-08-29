"use client";

import { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { app } from "@/lib/firebase"; // Import the app initialization from your Firebase config
import { getAuth, signOut } from "firebase/auth";
import UsersCard from "./UsersCard";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const Users = ({ userData, setSelectedChatroom }) => {
  const [activeTab, setActiveTab] = useState("chatrooms");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [users, setUsers] = useState([]);
  const [userChatrooms, setUserChatrooms] = useState([]);
  const router = useRouter();
  const auth = getAuth(app);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Initialize Realtime Database
  const db = getDatabase(app);

  // Get all users from Realtime Database
  useEffect(() => {
    setLoading2(true);
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      const usersArray = usersData
        ? Object.keys(usersData).map((id) => ({ id, ...usersData[id] }))
        : [];
      setUsers(usersArray);
      setLoading2(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  // Get chatrooms from Realtime Database
  useEffect(() => {
    setLoading(true);
    if (!userData?.id) {
      setLoading(false);
      return;
    }

    const chatroomsRef = ref(db, "chatrooms");
    const chatroomsQuery = query(
      chatroomsRef,
      orderByChild(`users/${userData.id}`),
      equalTo(true)
    );

    const unsubscribeChatrooms = onValue(chatroomsQuery, (snapshot) => {
      const chatroomsData = snapshot.val();
      const chatroomsArray = chatroomsData
        ? Object.keys(chatroomsData).map((id) => ({ id, ...chatroomsData[id] }))
        : [];
      setUserChatrooms(chatroomsArray);
      setLoading(false);
    });

    // Cleanup function for chatrooms
    return () => unsubscribeChatrooms();
  }, [userData]);

  // Create a chatroom in Realtime Database
  const createChat = async (user) => {
    const chatroomsRef = ref(db, "chatrooms");

    // Check if a chatroom already exists for these users
    const existingChatroomsQuery = query(
      chatroomsRef,
      orderByChild("users"),
      equalTo([userData.id, user.id].sort().join("_"))
    );

    onValue(
      existingChatroomsQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          // Chatroom already exists
          toast.error("Chatroom already exists for these users.");
        } else {
          // Chatroom doesn't exist, proceed to create a new one
          const newChatroomRef = push(chatroomsRef);

          const usersData = {
            [userData.id]: userData,
            [user.id]: user,
          };

          const chatroomData = {
            users: {
              [userData.id]: true,
              [user.id]: true,
            },
            usersData,
            timestamp: Date.now(),
            lastMessage: null,
          };

          set(newChatroomRef, chatroomData)
            .then(() => {
              console.log("Chatroom created with ID:", newChatroomRef.key);
              setActiveTab("chatrooms");
            })
            .catch((error) => {
              console.error("Error creating chatroom:", error);
            });
        }
      },
      { onlyOnce: true }
    );
  };

  //open chatroom
  const openChat = (chatroom) => {
    const otherUserId = Object.keys(chatroom.users).find(
      (id) => id !== userData.id
    );
    const data = {
      id: chatroom.id,
      myData: userData,
      otherData: chatroom.usersData[otherUserId],
    };
    setSelectedChatroom(data);
  };

  const logoutClick = () => {
    signOut(auth)
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="shadow-lg h-screen overflow-auto mt-4 mb-20">
      <div className="flex flex-col lg:flex-row justify-between p-4 space-y-4 lg:space-y-0">
        <button
          className={`btn btn-outline ${
            activeTab === "users" ? "btn-primary" : ""
          }`}
          onClick={() => handleTabClick("users")}
        >
          Users
        </button>
        <button
          className={`btn btn-outline ${
            activeTab === "chatrooms" ? "btn-primary" : ""
          }`}
          onClick={() => handleTabClick("chatrooms")}
        >
          Chatrooms
        </button>
        <button className={`btn btn-outline`} onClick={logoutClick}>
          Logout
        </button>
      </div>

      <div>
        {activeTab === "chatrooms" && (
          <>
            <h1 className="px-4 text-base font-semibold">Chatrooms</h1>
            {loading && (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            )}
            {userChatrooms.map((chatroom) => {
              const otherUserId = Object.keys(chatroom.users).find(
                (id) => id !== userData?.id
              );
              const otherUserData = chatroom.usersData[otherUserId];

              return (
                <div
                  key={chatroom.id}
                  onClick={() => {
                    openChat(chatroom);
                  }}
                >
                  <UsersCard
                    name={otherUserData.name}
                    avatarUrl={otherUserData.avatarUrl}
                    latestMessage={chatroom.lastMessage}
                    type={"chat"}
                  />
                </div>
              );
            })}
          </>
        )}

        {activeTab === "users" && (
          <>
            <h1 className="mt-4 px-4 text-base font-semibold">Users</h1>
            {loading2 && (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            )}
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  createChat(user);
                }}
              >
                {user.id !== userData?.id && (
                  <UsersCard
                    name={user.name}
                    avatarUrl={user.avatarUrl}
                    latestMessage={""}
                    type={"user"}
                  />
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Users;
