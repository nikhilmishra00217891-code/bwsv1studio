
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTheme } from 'next-themes';

export default function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const { userProfile, loading } = useAuth();
    const { setTheme, theme } = useTheme();

    useEffect(() => {
        if (loading) return; // Don't do anything until auth is resolved

        // On initial load, set the theme from the user's profile if it exists
        if (userProfile?.theme && theme !== userProfile.theme) {
            setTheme(userProfile.theme);
        }
        
    }, [userProfile, loading, setTheme, theme]);
    
    useEffect(() => {
        const root = document.documentElement;

        // This effect *only* manages the CSS variables for the custom theme.
        // It applies them when the theme is 'custom' and removes them otherwise.
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
