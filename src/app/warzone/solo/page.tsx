
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateQuiz, type GenerateQuizInput, type GenerateQuizOutput, type Question } from '@/ai/flows/generate-quiz-flow';
import { useEffect, useState, useMemo } from 'react';
import { LoaderCircle, ShieldCheck, ShieldX, Clock, Trophy, ArrowRight, BookOpen, Check, X, ChevronsRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Answer {
  questionIndex: number;
  answer: string;
  isCorrect: boolean;
  timeTaken: number;
}

const QuizUI = () => {
  const searchParams = useSearchParams();
  const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const quizParams: GenerateQuizInput = useMemo(() => ({
    topic: searchParams.get('topic') || '',
    grade: searchParams.get('grade') || '',
    difficulty: (searchParams.get('difficulty') as 'Easy' | 'Medium' | 'Hard') || 'Medium',
    numberOfQuestions: parseInt(searchParams.get('numQuestions') || '10', 10),
  }), [searchParams]);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizParams.topic || !quizParams.grade) {
        setError('Missing required quiz parameters.');
        setLoading(false);
        return;
      }
      try {
        const data = await generateQuiz(quizParams);
        setQuizData(data);
      } catch (e: any) {
        console.error(e);
        setError('Failed to generate the quiz. The AI might be busy. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizParams]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTime(prevTime => prevTime + 1);
    }, 1000);

    if (currentQuestionIndex >= (quizData?.questions.length || 0)) {
        clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [currentQuestionIndex, quizData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <LoaderCircle className="h-16 w-16 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-headline font-bold">Generating Your Warzone...</h2>
        <p className="text-muted-foreground mt-2">The AI is crafting the perfect questions on "{quizParams.topic}" for you.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <Card className="max-w-lg">
            <CardHeader><CardTitle className="text-destructive">Generation Failed</CardTitle></CardHeader>
            <CardContent>
                <p>{error}</p>
                <Button asChild className="mt-4">
                    <a href="/warzone">Try Again</a>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizData || quizData.questions.length === 0) {
    return <p>No quiz data available.</p>;
  }
  
  const isQuizFinished = currentQuestionIndex >= quizData.questions.length;
  
  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === quizData.questions[currentQuestionIndex].correctAnswer;
    setUserAnswers(prev => [...prev, {
      questionIndex: currentQuestionIndex,
      answer,
      isCorrect,
      timeTaken: 0, // Placeholder
    }]);

    setTimeout(() => {
        setIsAnswered(false);
        setSelectedAnswer(null);
        setCurrentQuestionIndex(prev => prev + 1);
    }, 1500); // Wait 1.5 seconds before moving to the next question
  };

  const AnswerReview = ({ question, userAnswer }: { question: Question, userAnswer: Answer }) => {
    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-lg">Q. {question.questionText}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {question.options.map((option, i) => {
                        const isCorrect = option === question.correctAnswer;
                        const isUserChoice = option === userAnswer.answer;
                        return (
                            <div key={i} className={cn(
                                "flex items-center gap-3 p-3 rounded-md border",
                                isCorrect ? "bg-green-100/50 border-green-400" : "",
                                isUserChoice && !isCorrect ? "bg-red-100/50 border-red-400" : ""
                            )}>
                                {isCorrect ? <Check className="w-5 h-5 text-green-600" /> : isUserChoice ? <X className="w-5 h-5 text-red-600" /> : <div className="w-5 h-5"/>}
                                <span>{option}</span>
                            </div>
                        )
                    })}
                </div>
                <Alert className="mt-4">
                    <BookOpen className="h-4 w-4" />
                    <AlertTitle>Explanation</AlertTitle>
                    <AlertDescription>
                        {question.explanation}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

  if (isQuizFinished) {
    const score = userAnswers.filter(a => a.isCorrect).length;
    const accuracy = (score / quizData.questions.length) * 100;
    
     return (
        <div className="animate-fade-in text-center p-4 md:p-8 max-w-4xl mx-auto w-full">
            {!isReviewMode ? (
                 <Card className="shadow-2xl border-primary/20">
                    <CardHeader>
                        <Trophy className="h-16 w-16 mx-auto text-amber-400 mb-4"/>
                        <CardTitle className="text-4xl font-headline">Battle Report</CardTitle>
                        <CardDescription>Well done, soldier. Here's your performance breakdown.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Score</p>
                                <p className="text-3xl font-bold">{score}/{quizData.questions.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Accuracy</p>
                                <p className="text-3xl font-bold">{accuracy.toFixed(0)}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Time</p>
                                <p className="text-3xl font-bold">{totalTime}s</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                             <Button size="lg" asChild>
                                <a href="/warzone">
                                    New Warzone <ChevronsRight className="ml-2 h-5 w-5" />
                                </a>
                            </Button>
                             <Button size="lg" variant="outline" onClick={() => setIsReviewMode(true)}>
                                <BookOpen className="mr-2 h-5 w-5" /> Review Answers
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div>
                     <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold font-headline">Quiz Review</h2>
                        <p className="text-muted-foreground">Learn from your battle to win the war.</p>
                    </div>
                    {quizData.questions.map((q, index) => (
                        <AnswerReview key={index} question={q} userAnswer={userAnswers[index]} />
                    ))}
                    <Button size="lg" className="mt-8" onClick={() => setIsReviewMode(false)}>
                        Back to Summary
                    </Button>
                </div>
            )}
        </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;


  return (
    <div className="p-4 md:p-8 w-full max-w-4xl mx-auto animate-fade-in">
        <div className="text-center mb-6">
            <p className="text-sm font-semibold text-primary">{quizParams.topic} - {quizParams.difficulty}</p>
            <h1 className="text-2xl md:text-3xl font-bold font-headline">{currentQuestion.questionText}</h1>
        </div>
        
        <div className="mb-6">
            <Progress value={progress} />
            <p className="text-center text-sm text-muted-foreground mt-2">Question {currentQuestionIndex + 1} of {quizData.questions.length}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
                const isCorrect = option === currentQuestion.correctAnswer;
                const isSelected = selectedAnswer === option;
                
                return (
                    <Button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        disabled={isAnswered}
                        className={cn(
                            "h-auto py-4 text-base justify-start transition-all duration-300 transform-gpu",
                            isAnswered && isCorrect && "bg-green-600 hover:bg-green-600 text-white animate-pop-in",
                            isAnswered && isSelected && !isCorrect && "bg-destructive hover:bg-destructive text-white animate-[shake_0.82s_cubic-bezier(.36,.07,.19,.97)_both]",
                            isAnswered && !isSelected && !isCorrect && "opacity-50"
                        )}
                    >
                         <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0",
                             isAnswered && isCorrect && "bg-white border-green-600",
                             isAnswered && isSelected && !isCorrect && "bg-white border-destructive",
                             !isAnswered && "border-primary/50"
                         )}>
                             {isAnswered && isCorrect && <ShieldCheck className="w-4 h-4 text-green-600"/>}
                             {isAnswered && isSelected && !isCorrect && <ShieldX className="w-4 h-4 text-destructive"/>}
                         </div>
                        <span className="text-left">{option}</span>
                    </Button>
                )
            })}
        </div>
    </div>
  );
};


export default function WarzoneSoloPage() {
    return (
        <div className="bg-card/50 min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <Suspense fallback={
                 <div className="flex flex-col items-center justify-center text-center p-8">
                    <LoaderCircle className="h-16 w-16 animate-spin text-primary mb-4" />
                 </div>
            }>
                <QuizUI />
            </Suspense>
        </div>
    )
}
