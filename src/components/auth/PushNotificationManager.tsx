
"use client";

import { useEffect, useState } from 'react';
import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';
import { useAuth } from './AuthProvider';
import { savePushToken } from '@/lib/data/user';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '../ui/button';
import { BellRing, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VAPID_KEY = 'BCm2_B1eWYhSdPlv2OaUrP5JyMGA6ZZ4gXhlyV0wc10SJiKbwr6gQBVWIqQ1wsKZfsyH7jB4IchtxdB9yWAfAXE';

export default function PushNotificationManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !user) {
      return;
    }

    const checkPermission = () => {
      if (Notification.permission === 'default') {
        // We've never asked before. Show our custom dialog first.
        const hasAsked = localStorage.getItem('pushPermissionAsked');
        if (!hasAsked) {
          setShowPermissionDialog(true);
        }
      } else if (Notification.permission === 'granted') {
        // We have permission, let's get the token.
        setupPushNotifications();
      }
    };

    // Give the app a moment to load before checking, prevents dialog from flashing on page load
    const timer = setTimeout(checkPermission, 3000);
    return () => clearTimeout(timer);

  }, [user]);

  const setupPushNotifications = async () => {
    const fcm = messaging();
    if (!fcm || !user) return;

    try {
      const currentToken = await getToken(fcm, { vapidKey: VAPID_KEY });
      if (currentToken) {
        // Save the token to the user's profile
        await savePushToken(user.uid, currentToken);
        console.log('FCM Token stored successfully.');
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
      toast({
        variant: 'destructive',
        title: 'Notification Error',
        description: 'Could not set up notifications. Please try again from your profile.',
      });
    }
  };

  const handleRequestPermission = async () => {
    localStorage.setItem('pushPermissionAsked', 'true');
    setShowPermissionDialog(false);

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({ title: 'Notifications Enabled!', description: 'You will now receive updates from us.' });
        await setupPushNotifications();
      } else {
        toast({ variant: 'destructive', title: 'Notifications Blocked', description: 'You can enable them later from your profile settings.' });
      }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
  };

  if (!showPermissionDialog) {
    return null;
  }

  return (
    <AlertDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <BellRing className="h-12 w-12 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-2xl font-headline">Enable Notifications?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Stay updated with live class alerts, new announcements, and personalized messages from your mentors. We won't spam you!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2 pt-4">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={() => localStorage.setItem('pushPermissionAsked', 'true')}>
                <BellOff className="mr-2" /> Maybe Later
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleRequestPermission}>
                <BellRing className="mr-2" /> Yes, Enable
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
