
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoaderCircle, Undo, XCircle, Award, Play, Send, Heart, TimerIcon } from 'lucide-react';
import { loadDictionary, isWordValid } from '@/lib/dictionary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const LETTER_SIZE = 56; // Corresponds to w-14 h-14
const WORD_SPAWN_INTERVAL = 5000; // ms between new words
const INITIAL_TIME = 10;
const TIME_BONUS_PER_LIFE = 10;
const TIME_BONUS_FACTOR = 1.5;

interface FallingLetter {
    id: number;
    text: string;
    x: number;
    duration: number;
}

const easyWords = [
    'APPLE', 'BALL', 'CAT', 'DOG', 'FISH', 'GAME', 'HAND', 'IDEA', 'JUMP', 'KITE',
    'LION', 'MOON', 'NEST', 'ORANGE', 'PEN', 'QUIZ', 'RAIN', 'SUN', 'TREE', 'UNIT',
    'VOICE', 'WATER', 'YARN', 'ZEBRA', 'BIRD', 'BOOK', 'DUCK', 'EARTH', 'FIRE',
    'GOLD', 'HOUSE', 'ICE', 'JUICE', 'LOVE', 'MILK', 'NOTE', 'OVEN', 'PIZZA', 'RING'
];

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


const WordFallGame = () => {
    const [dictionary, setDictionary] = useState<Set<string> | null>(null);
    const [wordList, setWordList] = useState<string[]>([]);
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
    const wordIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    const { toast } = useToast();

    // --- Game Cleanup ---
    const cleanupIntervals = () => {
        if (wordIntervalRef.current) {
            clearInterval(wordIntervalRef.current);
            wordIntervalRef.current = null;
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    };
    
    // --- Game Setup and Lifecycle ---

    useEffect(() => {
        const init = async () => {
            const dict = await loadDictionary();
            setDictionary(dict);
            // Create a word list for picking random words from
            const validWords = Array.from(dict).filter(word => word.length >= 4 && word.length <= 8);
            easyWords.forEach(word => validWords.push(word.toLowerCase()));
            setWordList(validWords);
            setIsLoading(false);
        };
        init();

        return cleanupIntervals;
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
        if (gameState === 'playing' && timer <= 0) {
            if (lives > 1) {
                setLives(prev => prev - 1);
                setTimer(INITIAL_TIME + TIME_BONUS_PER_LIFE);
                toast({
                    variant: "destructive",
                    title: "Time's Up!",
                    description: `You lost a life. ${lives - 1} lives remaining.`,
                });
            } else {
                setLives(0);
                setGameState('gameover');
            }
        }
    }, [timer, lives, gameState, toast]);


    const spawnWord = useCallback(() => {
        if (gameAreaSize.width === 0 || wordList.length === 0) return;
    
        const word = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
        const shuffledLetters = shuffleArray(word.split(''));
    
        shuffledLetters.forEach((char, index) => {
            setTimeout(() => {
                const numLanes = Math.floor(gameAreaSize.width / (LETTER_SIZE + 10));
                const laneIndex = Math.floor(Math.random() * numLanes);
                const xPos = laneIndex * (LETTER_SIZE + 10) + 5;
    
                const newLetter: FallingLetter = {
                    id: Date.now() + Math.random(),
                    text: char,
                    x: xPos,
                    duration: Math.random() * 5 + 8,
                };
    
                setFallingLetters(prev => [...prev, newLetter]);
            }, index * 400); // Stagger the letter drops
        });
    
    }, [gameAreaSize.width, wordList]);


    // This effect starts the letter spawning interval when the game starts
    useEffect(() => {
        if (gameState === 'playing') {
            wordIntervalRef.current = setInterval(spawnWord, WORD_SPAWN_INTERVAL);
            timerIntervalRef.current = setInterval(() => {
                setTimer(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        } else {
            cleanupIntervals();
        }
        
        return cleanupIntervals;
    }, [gameState, spawnWord]);


    const startGame = () => {
        if (!dictionary || gameAreaSize.width === 0) return;

        setGameState('idle'); 

        setTimeout(() => {
            setGameState('playing');
            setSelectedLetters([]);
            setFoundWords([]);
            setScore(0);
            setLongestWord('');
            setFallingLetters([]);
            setLives(3);
            setTimer(INITIAL_TIME);
            
            // Spawn the very first word immediately
            spawnWord();
        }, 50);
    };

    // --- Letter and Word Logic ---
    
    const handleAnimationComplete = (id: number) => {
        setFallingLetters(prev => prev.filter(l => l.id !== id));
    };


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
        if (gameState !== 'playing') return;

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
    
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Loading Word Engine...</p>
            </div>
        );
    }
    
    const currentWord = selectedLetters.map(l => l.text).join('');
    
    return (
        <div className="flex flex-col h-screen bg-card/50">
            <div className="p-4 border-b text-center bg-background/80 backdrop-blur-sm sticky top-0 z-10 flex flex-col sm:flex-row justify-around items-center gap-4">
                <div className="flex items-center gap-4">
                     <h1 className="text-2xl font-bold font-headline">Word Fall</h1>
                     {gameState !== 'playing' && (
                        <Button onClick={startGame} size="sm" disabled={isLoading || gameAreaSize.width === 0}>
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
            <div className="flex-grow w-full relative bg-background flex flex-col">
                <div ref={gameAreaRef} className="w-full flex-grow relative overflow-hidden">
                    <AnimatePresence>
                        {fallingLetters.map(letter => (
                            <motion.button
                                key={letter.id}
                                initial={{ y: -LETTER_SIZE, x: letter.x, rotate: Math.random() * 60 - 30 }}
                                animate={{ y: gameAreaSize.height + LETTER_SIZE }}
                                transition={{ duration: letter.duration, ease: "linear" }}
                                onAnimationComplete={() => handleAnimationComplete(letter.id)}
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
        </div>
    );
};

export default WordFallGame;

    