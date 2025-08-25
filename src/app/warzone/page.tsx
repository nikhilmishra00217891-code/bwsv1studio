
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flame, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WarzoneSetupPage() {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !grade || !difficulty || !numQuestions) {
      toast({
        variant: 'destructive',
        title: 'All Fields Required',
        description: 'Please fill out all the settings for your quiz.',
      });
      return;
    }
    
    setIsLoading(true);

    const queryParams = new URLSearchParams({
        topic,
        grade,
        difficulty,
        numQuestions,
    }).toString();

    // We will build the solo page in the next phase.
    // For now, we just navigate to it with the right parameters.
    router.push(`/warzone/solo?${queryParams}`);
  };

  return (
    <div className="bg-card/50 min-h-[calc(100vh-4rem)] py-20 md:py-28 animate-fade-in">
      <div className="container mx-auto px-6 max-w-2xl">
        <Card className="shadow-2xl border-primary/20">
          <form onSubmit={handleSubmit}>
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <Flame className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-4xl font-headline">Enter the Warzone</CardTitle>
              <CardDescription className="text-lg">Configure your solo training grounds and prepare for battle.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-base">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Photosynthesis, Indian History, Quadratic Equations"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-base">Grade</Label>
                  <Select value={grade} onValueChange={setGrade} required>
                    <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select Grade" /></SelectTrigger>
                    <SelectContent>
                      {['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Competitive Exams'].map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-base">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty} required>
                    <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select Difficulty" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numQuestions" className="text-base">Questions</Label>
                  <Select value={numQuestions} onValueChange={setNumQuestions} required>
                    <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select Number" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={isLoading}>
                  {isLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    'Start Solo Battle'
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
