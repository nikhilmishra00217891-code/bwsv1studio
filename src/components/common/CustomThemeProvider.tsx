
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTheme } from 'next-themes';

export default function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const { userProfile } = useAuth();
    const { setTheme } = useTheme();

    useEffect(() => {
        const root = document.documentElement;

        if (userProfile?.theme === 'custom' && userProfile.customTheme) {
            const { primary, background } = userProfile.customTheme;
            setTheme('light'); // Set a base theme for custom styles to work on
            root.style.setProperty('--primary', `${primary.h} ${primary.s}% ${primary.l}%`);
            root.style.setProperty('--card', `${background.h} ${background.s}% ${background.l}%`);
        } else if (userProfile?.theme) {
            setTheme(userProfile.theme);
            root.style.removeProperty('--primary');
            root.style.removeProperty('--card');
        } else {
             root.style.removeProperty('--primary');
             root.style.removeProperty('--card');
        }
    }, [userProfile, setTheme]);

    return <>{children}</>;
}
