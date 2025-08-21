
"use client";

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, MessageSquareQuote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitFeedback } from '@/app/actions';

export default function FeedbackWidget() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You must be logged in to submit feedback.',
      });
      return;
    }

    if (feedback.trim().length < 10) {
        toast({
            variant: 'destructive',
            title: 'Feedback too short',
            description: 'Please provide at least 10 characters of feedback.',
        });
        return;
    }

    setIsLoading(true);
    const { success, message } = await submitFeedback(user.uid, feedback);
    setIsLoading(false);

    if (success) {
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been sent to our team.',
      });
      setFeedback('');
      setIsDialogOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: message,
      });
    }
  };

  if (!user) {
    return null; // Don't show the widget if the user is not logged in.
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-16 w-16 rounded-full shadow-lg"
          size="icon"
          aria-label="Submit Feedback"
          variant="outline"
        >
          <MessageSquareQuote className="h-8 w-8 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve! Tell us what you like or what could be better.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Your valuable feedback..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[150px]"
          disabled={isLoading}
        />
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" disabled={isLoading}>Cancel</Button>
            </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
