
"use client";

import { auth, db } from "@/lib/firebase/client"; // Correctly import from the client-only file
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useState, type ReactNode, Dispatch, SetStateAction } from "react";
import type { UserProfile } from "@/types";
import { getTextContent } from "@/lib/data/content";
import { useTheme } from "next-themes";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  textContent: Record<string, string | string[] | boolean>;
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
  const [textContent, setTextContent] = useState<Record<string, string | string[] | boolean>>({});
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  useEffect(() => {
    // Listen for real-time updates to the site content
    const contentDocRef = doc(db, "siteContent", "text");
    const unsubscribeContent = onSnapshot(contentDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setTextContent(docSnap.data());
        } else {
            // Create default if it doesn't exist
            getTextContent().then(setTextContent);
        }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Listen for real-time updates to the user's profile
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const profile = docSnap.data() as UserProfile;
            setUserProfile(profile);
            // Set the theme whenever the profile updates (if it has a theme)
            if (profile.theme) {
              setTheme(profile.theme);
            }
          } else {
            setUserProfile(null);
          }
           setLoading(false); // Set loading to false after the first profile fetch/update
        });
        
        return () => unsubscribeProfile(); // Cleanup the profile listener
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeContent();
    };
  }, [setTheme]);

  return (
    <AuthContext.Provider value={{ user, userProfile, textContent, loading, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
