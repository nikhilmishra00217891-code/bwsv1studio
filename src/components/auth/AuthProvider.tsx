
"use client";

import { auth, db } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState, type ReactNode, Dispatch, SetStateAction } from "react";
import type { UserProfile } from "@/types";
import { getTextContent } from "@/lib/data/content";
import { useTheme } from "next-themes";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  textContent: Record<string, string>;
  loading: boolean;
  setUserProfile: Dispatch<SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    userProfile: null,
    textContent: {}, 
    loading: true,
    setUserProfile: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [textContent, setTextContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  useEffect(() => {
    const fetchContent = async () => {
        const content = await getTextContent();
        setTextContent(content);
    };
    fetchContent();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const profile = userDocSnap.data() as UserProfile;
          setUserProfile(profile);
          // Set the theme once when the profile loads
          if (profile.theme) {
            setTheme(profile.theme);
          }
        } else {
            setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setTheme]);

  return (
    <AuthContext.Provider value={{ user, userProfile, textContent, loading, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
