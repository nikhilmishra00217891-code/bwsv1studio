
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoaderCircle, Undo, XCircle, Award, Star, BookOpen, Play } from 'lucide-react';
import { loadDictionary, isWordValid } from '@/lib/dictionary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const LETTER_SIZE = 56; // Corresponds to w-14 h-14
const LETTER_SPAWN_INTERVAL = 1500; // ms

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
    
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused'>('idle');
    const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([]);
    const [selectedLetters, setSelectedLetters] = useState<{ id: number, text: string }[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);

    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [longestWord, setLongestWord] = useState('');

    const gameAreaRef = useRef<HTMLDivElement>(null);
    const letterIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const init = async () => {
            const dict = await loadDictionary();
            setDictionary(dict);
            setIsLoading(false);
        };
        init();

        return () => {
            if (letterIntervalRef.current) {
                clearInterval(letterIntervalRef.current);
            }
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

    const spawnLetter = useCallback(() => {
        if (gameState !== 'playing' || gameAreaSize.width === 0) return;

        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const newChar = alphabet[Math.floor(Math.random() * alphabet.length)];
        
        const numLanes = Math.floor(gameAreaSize.width / (LETTER_SIZE + 10)); // +10 for padding
        const laneIndex = Math.floor(Math.random() * numLanes);
        const xPos = laneIndex * (LETTER_SIZE + 10) + (LETTER_SIZE / 2);

        const newLetter: FallingLetter = {
            id: Date.now(),
            text: newChar,
            x: xPos,
            duration: Math.random() * 5 + 8, // 8-13 seconds to fall
        };

        setFallingLetters(prev => [...prev, newLetter]);

    }, [gameState, gameAreaSize.width]);


    const startGame = useCallback(() => {
        if (!dictionary || gameAreaSize.width === 0) return;

        setGameState('playing');
        setSelectedLetters([]);
        setFoundWords([]);
        setScore(0);
        setStreak(0);
        setLongestWord('');
        setFallingLetters([]);
        
        if (letterIntervalRef.current) {
            clearInterval(letterIntervalRef.current);
        }
        letterIntervalRef.current = setInterval(spawnLetter, LETTER_SPAWN_INTERVAL);

    }, [dictionary, gameAreaSize.width, spawnLetter]);

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
    
    const currentWord = selectedLetters.map(l => l.text).join('');

    useEffect(() => {
        if (currentWord.length > 2 && dictionary && isWordValid(currentWord.toLowerCase()) && !foundWords.includes(currentWord)) {
            setFoundWords(prev => [...prev, currentWord]);
            
            const points = currentWord.length * 10;
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);

            if(currentWord.length > longestWord.length) {
                setLongestWord(currentWord);
            }

             toast({
                title: `+${points} Points! 🎉`,
                description: `"${currentWord}" is a valid word.`,
            });

            handleClear();
        }
    }, [currentWord, dictionary, toast, foundWords, longestWord.length]);


    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Loading Word Engine...</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-card/50">
            <div className="p-4 border-b text-center bg-background/80 backdrop-blur-sm sticky top-16 z-10 flex flex-col sm:flex-row justify-around items-center gap-4">
                <div className="flex items-center gap-4">
                     <h1 className="text-2xl font-bold font-headline">Word Fall</h1>
                    <Button onClick={startGame} size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        {gameState === 'idle' ? 'Start Game' : 'Restart'}
                    </Button>
                </div>
                <div className="flex items-center gap-4 text-center">
                    <div className="flex items-center gap-2 text-lg">
                        <Award className="w-6 h-6 text-primary" /> 
                        <span className="font-bold">{score}</span>
                    </div>
                     <div className="flex items-center gap-2 text-lg">
                        <Star className="w-6 h-6 text-primary" /> 
                        <span className="font-bold">{streak}</span>
                    </div>
                     <div className="flex items-center gap-2 text-lg">
                        <BookOpen className="w-6 h-6 text-primary" /> 
                        <span className="font-bold">{longestWord.length > 0 ? longestWord : '-'}</span>
                    </div>
                </div>
            </div>
            <div ref={gameAreaRef} className="flex-grow w-full h-full relative overflow-hidden bg-background">
                <AnimatePresence>
                    {fallingLetters.map(letter => (
                        <motion.button
                            key={letter.id}
                            initial={{ y: -100, x: letter.x, rotate: Math.random() * 90 - 45 }}
                            animate={{ y: gameAreaSize.height + 50 }}
                            transition={{ duration: letter.duration, ease: "linear" }}
                            onAnimationComplete={() => {
                                setFallingLetters(prev => prev.filter(l => l.id !== letter.id));
                            }}
                            onClick={() => handleLetterClick(letter)}
                            className="absolute text-3xl font-bold text-primary-foreground bg-primary rounded-full w-14 h-14 flex items-center justify-center shadow-lg cursor-pointer"
                            style={{
                                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                            }}
                            whileHover={{ scale: 1.1, y: -10 }}
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
            </div>
             <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
                 <div className="max-w-md mx-auto">
                    <p className="text-sm text-muted-foreground text-center mb-1">Your Word</p>
                     <div className="flex items-center gap-2">
                        <Card className="flex-grow h-16 bg-muted">
                             <div className="flex items-center justify-center h-full text-3xl font-bold tracking-widest">
                                 {currentWord || <span className="text-muted-foreground/50">...</span>}
                             </div>
                        </Card>
                        <div className="flex flex-col gap-1">
                             <Button onClick={handleUndo} variant="outline" size="icon" className="h-8 w-8" disabled={selectedLetters.length === 0}>
                                <Undo className="h-4 w-4" /><span className="sr-only">Undo</span>
                            </Button>
                             <Button onClick={handleClear} variant="destructive" size="icon" className="h-8 w-8" disabled={selectedLetters.length === 0}>
                                <XCircle className="h-4 w-4" /><span className="sr-only">Clear</span>
                            </Button>
                        </div>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export default WordFallGame;
