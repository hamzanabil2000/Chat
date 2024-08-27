"use client";

import { app, firestore } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Users from "./components/Users";
import ChatRoom from "./components/ChatRoom";

export default function Home() {
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  useEffect(() => {
    // Use onAuthStateChanged to listen for changes in authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setUser(data);
        } else {
          console.log("No such document!");
        }
      } else {
        setUser(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  if (user == null) {
    return <div className="text-4xl">Loading...</div>;
  }

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
