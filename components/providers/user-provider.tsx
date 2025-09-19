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
    setLoading(); // This sets authState to 'loading'

    const unsubscribe = onAuthStateChanged(
  auth, 
  (firebaseUser) => {
    console.log("🔥 Auth state changed:", firebaseUser ? "User found" : "No user");

    if (firebaseUser) {
      setUser({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
      });
    } else {
      clearUser();
    }

    // ✅ mark loading as finished
    // even if no user is found
    setLoading(false);
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