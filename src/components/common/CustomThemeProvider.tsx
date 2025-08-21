
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTheme } from 'next-themes';

export default function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const { userProfile } = useAuth();
    const { theme } = useTheme();

    useEffect(() => {
        const root = document.documentElement;

        // This effect *only* manages the CSS variables for the custom theme.
        // It applies them when the theme is 'custom' and removes them otherwise.
        if (theme === 'custom' && userProfile?.theme === 'custom' && userProfile.customTheme) {
            const { primary, background } = userProfile.customTheme;
            root.style.setProperty('--primary', `${primary.h} ${primary.s}% ${primary.l}%`);
            root.style.setProperty('--card', `${background.h} ${background.s}% ${background.l}%`);
            root.style.setProperty('--background', `${background.h} ${background.s}% ${background.l}%`);
            root.classList.add('custom');
        } else {
            root.style.removeProperty('--primary');
            root.style.removeProperty('--card');
            root.style.removeProperty('--background');
            root.classList.remove('custom');
        }
    }, [theme, userProfile]);


    return <>{children}</>;
}
