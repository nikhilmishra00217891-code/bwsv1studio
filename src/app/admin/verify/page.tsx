
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, LockKeyhole } from 'lucide-react';

const SECRET_KEY = "4_:5&;6-!7+?";
const VERIFIED_SESSION_KEY = 'faculty_verified_session';

export default function VerifyPage() {
  const [inputKey, setInputKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (inputKey === SECRET_KEY) {
      try {
        sessionStorage.setItem(VERIFIED_SESSION_KEY, 'true');
        toast({
          title: 'Verification Successful',
          description: 'Welcome to the User Management portal.',
        });
        router.push('/admin/users');
      } catch (error) {
         toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: 'Could not set session. Please enable session storage in your browser.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: 'The secret key is incorrect. Please try again.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-card/50 p-6">
      <Card className="w-full max-w-md shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Faculty Verification</CardTitle>
            <CardDescription>Enter the secret key to access user management.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="secretKey" className="sr-only">Secret Key</Label>
            <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    id="secretKey"
                    type="password"
                    placeholder="Enter secret key..."
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    required
                    className="pl-10"
                />
            </div>
          </CardContent>
          <CardContent>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <LoaderCircle className="animate-spin" /> : 'Verify Access'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
