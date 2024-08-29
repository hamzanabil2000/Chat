"use client";

import { app } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Users from "./components/Users";
import ChatRoom from "./components/ChatRoom";

export default function Home() {
  const auth = getAuth(app);
  const db = getDatabase(app); // Initialize Realtime Database
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  useEffect(() => {
    // Use onAuthStateChanged to listen for changes in authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`); // Reference to the user in the Realtime Database
        const snapshot = await get(userRef); // Get the user data from the Realtime Database
        if (snapshot.exists()) {
          const data = { id: snapshot.key, ...snapshot.val() };
          setUser(data);
        } else {
          console.log("No such user data in Realtime Database!");
        }
      } else {
        setUser(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, db, router]);

  // if (user == null) {
  //   return <div className="text-4xl">Loading...</div>;
  // }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left side users */}
      <div className="flex-shrink-0 w-3/12">
        <Users userData={user} setSelectedChatroom={setSelectedChatroom} />
      </div>

      {/* Right side chat room */}
      <div className="flex-grow w-3/12">
        {selectedChatroom ? (
          <>
            <ChatRoom user={user} selectedChatroom={selectedChatroom} />
          </>
        ) : (
          <>
            <div className="flex items-center justify-center h-full">
              <div className="text-2xl text-gray-400">Select a chatroom</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
