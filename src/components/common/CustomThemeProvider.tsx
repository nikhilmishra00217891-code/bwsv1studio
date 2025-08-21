
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTheme } from 'next-themes';

export default function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const { userProfile, loading } = useAuth();
    const { setTheme, theme } = useTheme();

    useEffect(() => {
        if (loading) return; // Don't do anything until auth is resolved

        const root = document.documentElement;

        if (userProfile?.theme === 'custom' && userProfile.customTheme) {
            // This ensures that when the user profile loads with a custom theme,
            // the app's theme is set to 'custom' to match.
            if (theme !== 'custom') {
                setTheme('custom');
            }
        } else if (userProfile?.theme && userProfile.theme !== 'custom') {
             if (theme !== userProfile.theme) {
                setTheme(userProfile.theme);
            }
        }
    }, [userProfile, loading, setTheme, theme]);
    
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'custom' && userProfile?.theme === 'custom' && userProfile.customTheme) {
            const { primary, background } = userProfile.customTheme;
            root.style.setProperty('--primary', `${primary.h} ${primary.s}% ${primary.l}%`);
            root.style.setProperty('--card', `${background.h} ${background.s}% ${background.l}%`);
            root.classList.add('custom');
        } else {
            root.style.removeProperty('--primary');
            root.style.removeProperty('--card');
            root.classList.remove('custom');
        }
    }, [theme, userProfile]);


    return <>{children}</>;
}
