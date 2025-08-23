
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoaderCircle, Undo, XCircle, Award, Star, BookOpen, Play, CheckSquare, Heart, TimerIcon, Send } from 'lucide-react';
import { loadDictionary, isWordValid } from '@/lib/dictionary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const LETTER_SIZE = 56; // Corresponds to w-14 h-14
const LETTER_SPAWN_INTERVAL = 1800; // ms
const INITIAL_TIME = 10;
const TIME_BONUS_PER_LIFE = 10;
const TIME_BONUS_FACTOR = 1.5;

interface FallingLetter {
    id: number;
    text: string;
    x: number;
    duration: number;
}

const WordFallGame = () => {
    const [dictionary, setDictionary] = useState<Set<string> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [gameAreaSize, setGameAreaSize] = useState({ width: 0, height: 0 });
    
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
    const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([]);
    const [selectedLetters, setSelectedLetters] = useState<{ id: number, text: string }[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);

    const [score, setScore] = useState(0);
    const [longestWord, setLongestWord] = useState('');
    const [lives, setLives] = useState(3);
    const [timer, setTimer] = useState(INITIAL_TIME);

    const gameAreaRef = useRef<HTMLDivElement>(null);
    const letterIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    // --- Game Setup and Lifecycle ---

    useEffect(() => {
        const init = async () => {
            const dict = await loadDictionary();
            setDictionary(dict);
            setIsLoading(false);
        };
        init();

        return () => {
           if (letterIntervalRef.current) clearInterval(letterIntervalRef.current);
           if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
             if (gameAreaRef.current) {
                setGameAreaSize({
                    width: gameAreaRef.current.offsetWidth,
                    height: gameAreaRef.current.offsetHeight
                });
             }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isLoading]);
    
     useEffect(() => {
        if (gameState === 'playing' && lives <= 0) {
            finishGame();
        }
    }, [lives, gameState]);

     useEffect(() => {
        if (gameState === 'playing' && timer <= 0) {
            handleTimeUp();
        }
    }, [timer, gameState]);

    const startGame = useCallback(() => {
        if (!dictionary || gameAreaSize.width === 0) return;

        setGameState('playing');
        setSelectedLetters([]);
        setFoundWords([]);
        setScore(0);
        setLongestWord('');
        setFallingLetters([]);
        setLives(3);
        setTimer(INITIAL_TIME);
        
        if (letterIntervalRef.current) clearInterval(letterIntervalRef.current);
        letterIntervalRef.current = setInterval(spawnLetter, LETTER_SPAWN_INTERVAL);

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);

    }, [dictionary, gameAreaSize.width, spawnLetter]);

    // This effect ensures startGame is called once the game area is measured
    useEffect(() => {
        if (gameState === 'playing' && gameAreaSize.width > 0) {
            if (letterIntervalRef.current) clearInterval(letterIntervalRef.current);
            letterIntervalRef.current = setInterval(spawnLetter, LETTER_SPAWN_INTERVAL);
        }
    }, [gameState, gameAreaSize.width, spawnLetter]);


    const finishGame = () => {
        setGameState('gameover');
        if (letterIntervalRef.current) clearInterval(letterIntervalRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    
    // --- Letter and Word Logic ---

    const spawnLetter = useCallback(() => {
        if (gameAreaSize.width === 0) return;

        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const newChar = alphabet[Math.floor(Math.random() * alphabet.length)];
        
        const numLanes = Math.floor(gameAreaSize.width / (LETTER_SIZE + 10)); // +10 for padding
        const laneIndex = Math.floor(Math.random() * numLanes);
        const xPos = laneIndex * (LETTER_SIZE + 10) + 5;

        const newLetter: FallingLetter = {
            id: Date.now() + Math.random(),
            text: newChar,
            x: xPos,
            duration: Math.random() * 5 + 8, // 8-13 seconds to fall
        };

        setFallingLetters(prev => [...prev, newLetter]);

    }, [gameAreaSize.width]);
    
    const handleLetterMiss = (id: number) => {
        setFallingLetters(prev => prev.filter(l => l.id !== id));
        if (gameState === 'playing') {
            setLives(prev => prev - 1);
            toast({
                variant: "destructive",
                title: "Life Lost!",
                description: `A letter was missed. ${lives - 1} lives remaining.`,
            });
        }
    }

    const handleLetterClick = (letter: FallingLetter) => {
        if (gameState !== 'playing') return;
        setFallingLetters(prev => prev.filter(l => l.id !== letter.id));
        setSelectedLetters(prev => [...prev, { id: letter.id, text: letter.text }]);
    }
    
    const handleClear = () => {
        setSelectedLetters([]);
    }

    const handleUndo = () => {
        if (selectedLetters.length === 0) return;
        setSelectedLetters(prev => prev.slice(0, -1));
    }
    
    const handleSubmitWord = () => {
        const word = selectedLetters.map(l => l.text).join('');
        if (word.length <= 3) {
            toast({ variant: "destructive", title: "Too Short", description: "Words must be 4 letters or longer." });
            return;
        }

        if (dictionary && isWordValid(word.toLowerCase())) {
            if (foundWords.includes(word)) {
                toast({ variant: "destructive", title: "Already Found", description: `You've already found "${word}".` });
                return;
            }

            const points = word.length;
            const timeBonus = Math.floor(points * TIME_BONUS_FACTOR);

            setScore(prev => prev + points);
            setTimer(prev => prev + timeBonus);
            setFoundWords(prev => [...prev, word]);

            if (word.length > longestWord.length) {
                setLongestWord(word);
            }

            toast({
                title: `+${points} Points! 🎉`,
                description: `Added ${timeBonus} seconds to the timer.`,
            });
            handleClear();
        } else {
            toast({ variant: "destructive", title: "Not a Word", description: `"${word}" is not in our dictionary.` });
        }
    }
    
     const handleTimeUp = () => {
        setLives(prev => prev - 1);
        setTimer(INITIAL_TIME + TIME_BONUS_PER_LIFE);
        if (lives -1 > 0) {
            toast({
                variant: "destructive",
                title: "Time's Up!",
                description: `You lost a life. ${lives - 1} lives remaining.`,
            });
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Loading Word Engine...</p>
            </div>
        );
    }
    
    const currentWord = selectedLetters.map(l => l.text).join('');
    
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-card/50">
            <div className="p-4 border-b text-center bg-background/80 backdrop-blur-sm sticky top-16 z-10 flex flex-col sm:flex-row justify-around items-center gap-4">
                <div className="flex items-center gap-4">
                     <h1 className="text-2xl font-bold font-headline">Word Fall</h1>
                     {gameState !== 'playing' && (
                        <Button onClick={startGame} size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            {gameState === 'idle' ? 'Start Game' : 'Restart'}
                        </Button>
                     )}
                </div>
                <div className="flex items-center gap-4 text-center">
                    <div className="flex items-center gap-2 text-lg font-bold">
                        <Heart className="w-6 h-6 text-red-500" /> 
                        <span className="w-4">{lives}</span>
                    </div>
                     <div className="flex items-center gap-2 text-lg font-bold">
                        <TimerIcon className="w-6 h-6 text-blue-500" /> 
                        <span className="w-8">{timer}s</span>
                    </div>
                     <div className="flex items-center gap-2 text-lg font-bold">
                        <Award className="w-6 h-6 text-amber-500" /> 
                        <span>{score}</span>
                    </div>
                </div>
            </div>
            <div ref={gameAreaRef} className="flex-grow w-full h-full relative overflow-hidden bg-background">
                <AnimatePresence>
                    {fallingLetters.map(letter => (
                        <motion.button
                            key={letter.id}
                            initial={{ y: -LETTER_SIZE, x: letter.x, rotate: Math.random() * 60 - 30 }}
                            animate={{ y: gameAreaSize.height + LETTER_SIZE }}
                            transition={{ duration: letter.duration, ease: "linear" }}
                            onAnimationComplete={() => handleLetterMiss(letter.id)}
                            onClick={() => handleLetterClick(letter)}
                            className="absolute text-3xl font-bold text-primary-foreground bg-primary rounded-full w-14 h-14 flex items-center justify-center shadow-lg cursor-pointer"
                            style={{
                                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                            }}
                            whileHover={{ scale: 1.1, y: -10, transition: { duration: 0.1 } }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {letter.text}
                        </motion.button>
                    ))}
                </AnimatePresence>
                 {gameState === 'idle' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Card className="p-8 text-center bg-card/80">
                            <h2 className="text-2xl font-bold">Ready to Play?</h2>
                            <p className="text-muted-foreground mt-2">Click "Start Game" to begin!</p>
                        </Card>
                    </div>
                 )}
                 {gameState === 'gameover' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Card className="p-8 text-center bg-card/80 animate-pop-in">
                            <h2 className="text-3xl font-bold font-headline">Game Over!</h2>
                            <div className="grid grid-cols-2 gap-4 my-6 text-left">
                                <div className="font-semibold">Final Score:</div><div className="text-right font-bold text-primary">{score}</div>
                                <div className="font-semibold">Words Found:</div><div className="text-right font-bold text-primary">{foundWords.length}</div>
                                <div className="font-semibold">Longest Word:</div><div className="text-right font-bold text-primary">{longestWord || 'N/A'}</div>
                            </div>
                            <Button onClick={startGame} size="lg">
                                <Play className="mr-2 h-5 w-5" /> Play Again
                            </Button>
                        </Card>
                    </div>
                 )}
            </div>
             <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
                 <div className="max-w-md mx-auto">
                    <p className="text-sm text-muted-foreground text-center mb-1">Your Word</p>
                     <div className="flex items-center gap-2">
                        <Card className="flex-grow h-16 bg-muted">
                             <div className="flex items-center justify-center h-full text-3xl font-bold tracking-widest uppercase">
                                 {currentWord || <span className="text-muted-foreground/50 text-base normal-case">...</span>}
                             </div>
                        </Card>
                        <div className="flex flex-col gap-1">
                             <Button onClick={handleUndo} variant="outline" size="icon" className="h-8 w-8" disabled={selectedLetters.length === 0 || gameState !== 'playing'}>
                                <Undo className="h-4 w-4" /><span className="sr-only">Undo</span>
                            </Button>
                             <Button onClick={handleClear} variant="destructive" size="icon" className="h-8 w-8" disabled={selectedLetters.length === 0 || gameState !== 'playing'}>
                                <XCircle className="h-4 w-4" /><span className="sr-only">Clear</span>
                            </Button>
                        </div>
                         <Button onClick={handleSubmitWord} size="lg" className="h-16" disabled={currentWord.length <= 3 || gameState !== 'playing'}>
                            <Send className="h-6 w-6" />
                        </Button>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export default WordFallGame;

    