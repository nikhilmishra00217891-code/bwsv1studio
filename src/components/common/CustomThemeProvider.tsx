
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
            if (theme !== 'custom') {
                setTheme('custom');
            }
            const { primary, background } = userProfile.customTheme;
            root.style.setProperty('--primary', `${primary.h} ${primary.s}% ${primary.l}%`);
            root.style.setProperty('--card', `${background.h} ${background.s}% ${background.l}%`);
            root.classList.add('custom');
        } else if (userProfile?.theme && userProfile.theme !== 'custom') {
             if (theme !== userProfile.theme) {
                setTheme(userProfile.theme);
            }
            root.style.removeProperty('--primary');
            root.style.removeProperty('--card');
            root.classList.remove('custom');
        } else {
            // Default case, no specific user theme
             root.style.removeProperty('--primary');
             root.style.removeProperty('--card');
             root.classList.remove('custom');
        }
    }, [userProfile, loading, setTheme, theme]);
    
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'custom' && userProfile?.theme === 'custom' && userProfile.customTheme) {
             const { primary, background } = userProfile.customTheme;
            root.style.setProperty('--primary', `${primary.h} ${primary.s}% ${primary.l}%`);
            root.style.setProperty('--card', `${background.h} ${background.s}% ${background.l}%`);
            root.classList.add('custom');
        } else if (theme !== 'custom') {
            root.style.removeProperty('--primary');
            root.style.removeProperty('--card');
            root.classList.remove('custom');
        }
    }, [theme, userProfile]);


    return <>{children}</>;
}
