"use client";

import { ReactNode, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUserStore } from "@/store/useUserStore";

type Props = {
  children: ReactNode;
};

const UserProvider = ({ children }: Props) => {
  const { setUser, clearUser, setLoading } = useUserStore();

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        clearUser();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, clearUser, setLoading]);

  return <>{children}</>;
};

export default UserProvider;
