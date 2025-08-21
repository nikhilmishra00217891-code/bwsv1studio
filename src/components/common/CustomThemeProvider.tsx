
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const { userProfile } = useAuth();

    useEffect(() => {
        const root = document.documentElement;

        if (userProfile?.theme === 'custom' && userProfile.customTheme) {
            const { primary, background } = userProfile.customTheme;
            root.style.setProperty('--primary', `${primary.h} ${primary.s}% ${primary.l}%`);
            root.style.setProperty('--card', `${background.h} ${background.s}% ${background.l}%`);
            // We can derive other colors from these, or set them explicitly if needed
            // For now, let's keep other colors as they are in globals.css for simplicity
        } else {
            // Cleanup inline styles if not using a custom theme
            root.style.removeProperty('--primary');
            root.style.removeProperty('--card');
        }
    }, [userProfile]);

    return <>{children}</>;
}
