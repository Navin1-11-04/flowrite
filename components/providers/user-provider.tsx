"use client";

import { ReactNode, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUserStore } from "@/store/useUserStore";

type Props = {
  children: ReactNode;
};

const UserProvider = ({ children }: Props) => {
  const { setUser, clearUser, setLoading, setError } = useUserStore();

  useEffect(() => {
    console.log("🔄 UserProvider: Starting auth listener");
    setLoading(true);

    const unsubscribe = onAuthStateChanged(
      auth, 
      (firebaseUser) => {
        console.log("🔥 Auth state changed:", firebaseUser ? "User found" : "No user");
        
        if (firebaseUser) {
          console.log("👤 Setting user:", {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email
          });
          
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
          });
        } else {
          console.log("🚫 Clearing user");
          clearUser();
        }

        console.log("⏳ Setting loading to false");
        setLoading(false);
        
        // Debug: Check store state after update
        setTimeout(() => {
          console.log("📊 Store state after auth update:", useUserStore.getState());
        }, 100);
      },
      (error) => {
        console.error("🚨 Auth error:", error);
        setError({
          code: error.code,
          message: error.message
        });
        setLoading(false);
      }
    );

    return () => {
      console.log("🧹 Cleaning up auth listener");
      unsubscribe();
    };
  }, [setUser, clearUser, setLoading, setError]);

  return <>{children}</>;
};

export default UserProvider;