
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoaderCircle } from 'lucide-react';
import { loadDictionary } from '@/lib/dictionary';
import { Button } from '@/components/ui/button';

const getRandomWord = (dictionary: Set<string>): string => {
    const words = Array.from(dictionary);
    const fiveLetterWords = words.filter(w => w.length >= 4 && w.length <= 6);
    const randomIndex = Math.floor(Math.random() * fiveLetterWords.length);
    return fiveLetterWords[randomIndex];
}

const shuffle = (word: string): string[] => {
    return word.split('').sort(() => 0.5 - Math.random());
}

interface FallingLetter {
    id: string;
    text: string;
    x: number;
    y: number;
    duration: number;
}

const WordFallGame = () => {
    const { user } = useAuth();
    const [dictionary, setDictionary] = useState<Set<string> | null>(null);
    const [letters, setLetters] = useState<FallingLetter[]>([]);
    const [word, setWord] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [gameAreaSize, setGameAreaSize] = useState({ width: 0, height: 0 });

    const gameAreaRef = useRef<HTMLDivElement>(null);

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
    }, []);

    const startGame = () => {
        if (!dictionary || gameAreaSize.width === 0) return;

        const newWord = getRandomWord(dictionary);
        const shuffledLetters = shuffle(newWord);

        setWord(newWord);

        const newLetters = shuffledLetters.map((char, index) => ({
            id: `${Date.now()}-${index}`,
            text: char.toUpperCase(),
            x: Math.random() * (gameAreaSize.width - 40),
            y: -50,
            duration: Math.random() * 5 + 5, // Fall duration between 5 and 10 seconds
        }));
        setLetters(newLetters);
    };

    useEffect(() => {
        if (!isLoading && dictionary && gameAreaSize.width > 0) {
            startGame();
        }
    }, [isLoading, dictionary, gameAreaSize.width]);


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
            <div className="p-4 border-b text-center bg-background/80 backdrop-blur-sm">
                <h1 className="text-2xl font-bold font-headline">Word Fall</h1>
                 <Button onClick={startGame} size="sm" className="mt-2">New Word</Button>
            </div>
            <div ref={gameAreaRef} className="flex-grow w-full h-full relative overflow-hidden">
                <AnimatePresence>
                    {letters.map(letter => (
                        <motion.div
                            key={letter.id}
                            initial={{ x: letter.x, y: letter.y }}
                            animate={{ y: gameAreaSize.height + 20 }}
                            transition={{ duration: letter.duration, ease: "linear" }}
                            onAnimationComplete={() => {
                                setLetters(l => l.filter(item => item.id !== letter.id));
                            }}
                            className="absolute text-3xl font-bold text-primary"
                            style={{
                                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                            }}
                        >
                            {letter.text}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
             <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
                 <div className="text-center">
                     <p className="text-muted-foreground">Selected Word</p>
                     <div className="h-12 mt-2 w-full max-w-sm mx-auto bg-muted rounded-lg flex items-center justify-center">
                         <p className="text-2xl font-bold tracking-widest">[WORD]</p>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export default WordFallGame;
