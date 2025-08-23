
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoaderCircle, Undo, XCircle } from 'lucide-react';
import { loadDictionary, isWordValid } from '@/lib/dictionary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const getRandomWord = (dictionary: Set<string>): string => {
    const words = Array.from(dictionary);
    const fiveLetterWords = words.filter(w => w.length >= 4 && w.length <= 7);
    const randomIndex = Math.floor(Math.random() * fiveLetterWords.length);
    return fiveLetterWords[randomIndex].toUpperCase();
}

const shuffle = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

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

    const gameAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        const init = async () => {
            const dict = await loadDictionary();
            setDictionary(dict);
            setIsLoading(false);
        };
        init();
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

    const startGame = useCallback(() => {
        if (!dictionary || gameAreaSize.width === 0) return;

        const newWord = getRandomWord(dictionary);
        const shuffledLetters = shuffle(newWord.split(''));

        setGameState('playing');
        setSelectedLetters([]);
        
        setFallingLetters(shuffledLetters.map((char, index) => ({
            id: index,
            text: char,
            x: Math.random() * (gameAreaSize.width - 60) + 30, // Padding
            duration: Math.random() * 5 + 8, // 8-13 seconds
        })));
    }, [dictionary, gameAreaSize.width]);

    const handleLetterClick = (letter: FallingLetter) => {
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
        if (currentWord.length > 1 && dictionary) {
            if (isWordValid(currentWord)) {
                 toast({
                    title: `Correct! 🎉`,
                    description: `"${currentWord}" is a valid word.`,
                });
                // In Phase 2, we will add points here.
                handleClear();
            }
        }
    }, [currentWord, dictionary, toast]);


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
            <div className="p-4 border-b text-center bg-background/80 backdrop-blur-sm sticky top-16 z-10">
                <h1 className="text-2xl font-bold font-headline">Word Fall</h1>
                 <Button onClick={startGame} size="sm" className="mt-2" disabled={gameState === 'playing' && fallingLetters.length > 0}>
                    {gameState === 'idle' || fallingLetters.length === 0 ? 'Start Game' : 'New Word'}
                </Button>
            </div>
            <div ref={gameAreaRef} className="flex-grow w-full h-full relative overflow-hidden bg-background">
                <AnimatePresence>
                    {fallingLetters.map(letter => (
                        <motion.button
                            key={letter.id}
                            initial={{ y: -100, x: letter.x, rotate: Math.random() * 90 - 45 }}
                            animate={{ y: gameAreaSize.height + 50 }}
                            transition={{ duration: letter.duration, ease: "linear" }}
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
