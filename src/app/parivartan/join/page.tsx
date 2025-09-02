
'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { joinChamber } from '@/lib/data/parivartan';

function JoinLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading } = useAuth();
  const { toast } = useToast();
  const chamberId = searchParams.get('id');

  useEffect(() => {
    if (loading) {
      return; // Wait until auth state is confirmed
    }

    if (!chamberId) {
      toast({ variant: 'destructive', title: 'Invalid Invite Link' });
      router.replace('/parivartan');
      return;
    }

    if (!user || !userProfile) {
      // User is not logged in, redirect to login but preserve the invite link
      const loginUrl = `/login?redirect=/parivartan/join?id=${chamberId}`;
      router.replace(loginUrl);
      return;
    }

    const attemptJoin = async () => {
      try {
        const joinedChamber = await joinChamber(
          chamberId.toUpperCase(),
          user.uid,
          userProfile.displayName || 'Anonymous',
          userProfile.photoURL || ''
        );
        if (joinedChamber) {
          toast({ title: "Joined Chamber!", description: `Welcome to ${joinedChamber.name}.` });
        }
      } catch (error: any) {
        toast({ variant: "destructive", title: "Failed to Join", description: error.message });
      } finally {
        // Redirect to the main Parivartan page regardless of success or failure.
        // The main page will automatically select the newly joined chamber.
        router.replace('/parivartan');
      }
    };

    attemptJoin();
  }, [user, userProfile, loading, chamberId, router, toast]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">Joining chamber...</p>
    </div>
  );
}

export default function JoinChamberPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        }>
            <JoinLogic />
        </Suspense>
    );
}
