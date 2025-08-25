
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
    
    router.push(`/warzone/solo?${queryParams}`);
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
  }

  return (
    <div className="bg-background min-h-[calc(100vh-4rem)] py-20 md:py-28 flex items-center justify-center relative overflow-hidden">
        {/* Background elements for atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background z-0"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-[pulse_8s_infinite]"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-[pulse_10s_infinite_2s]"></div>

        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-2xl z-10"
        >
             <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-lg">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="text-center">
                    <motion.div variants={itemVariants} className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <Flame className="h-12 w-12 text-primary" />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <CardTitle className="text-4xl font-headline">Setup Your Battle</CardTitle>
                        <CardDescription className="text-lg mt-2">Configure your solo training grounds and prepare for battle.</CardDescription>
                    </motion.div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <motion.div variants={itemVariants} className="space-y-2">
                            <Label htmlFor="topic" className="text-base">Topic</Label>
                            <Input
                            id="topic"
                            placeholder="e.g., Photosynthesis, Indian History, Quadratic Equations"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="h-12 text-base bg-background/50"
                            required
                            />
                        </motion.div>
                        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                            <Label htmlFor="grade" className="text-base">Grade</Label>
                            <Select value={grade} onValueChange={setGrade} required>
                                <SelectTrigger className="h-12 text-base bg-background/50"><SelectValue placeholder="Select Grade" /></SelectTrigger>
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
                                <SelectTrigger className="h-12 text-base bg-background/50"><SelectValue placeholder="Select Difficulty" /></SelectTrigger>
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
                                <SelectTrigger className="h-12 text-base bg-background/50"><SelectValue placeholder="Select Number" /></SelectTrigger>
                                <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                </SelectContent>
                            </Select>
                            </div>
                        </motion.div>
                        <motion.div variants={itemVariants} className="pt-4">
                            <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={isLoading}>
                            {isLoading ? (
                                <LoaderCircle className="animate-spin" />
                            ) : (
                                'Start Solo Battle'
                            )}
                            </Button>
                        </motion.div>
                    </CardContent>
                </form>
            </Card>
        </motion.div>
    </div>
  );
}
