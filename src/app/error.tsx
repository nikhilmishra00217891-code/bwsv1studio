'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-card/50 p-6">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Wrench className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">This Area is Under Construction!</CardTitle>
          <CardDescription>
            Oops! It looks like you've found a page that's still being built or something went wrong.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mt-2">
            Our team is working hard behind the scenes. Please try again in a bit, or head back to your dashboard.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" onClick={() => reset()}>
              Try Again
            </Button>
             <Button asChild>
                <Link href="/dashboard">
                    Go to Dashboard
                </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
