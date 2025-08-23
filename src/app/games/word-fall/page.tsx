
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Text, Rect } from 'react-konva';
import Konva from 'konva';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoaderCircle } from 'lucide-react';
import { loadDictionary } from '@/lib/dictionary';
import { Button } from '@/components/ui/button';

const getRandomWord = (dictionary: Set<string>): string => {
    const words = Array.from(dictionary);
    // For now, let's focus on 5-letter words for simplicity
    const fiveLetterWords = words.filter(w => w.length === 5);
    const randomIndex = Math.floor(Math.random() * fiveLetterWords.length);
    return fiveLetterWords[randomIndex];
}

const shuffle = (word: string): string[] => {
    return word.split('').sort(() => 0.5 - Math.random());
}

interface FallingLetter {
    id: number;
    text: string;
    x: number;
    y: number;
    vy: number; // velocity y
}

const WordFallGame = () => {
    const { user } = useAuth();
    const [dictionary, setDictionary] = useState<Set<string> | null>(null);
    const [letters, setLetters] = useState<FallingLetter[]>([]);
    const [word, setWord] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);

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
             const container = document.getElementById('game-container');
             if (container) {
                setStageSize({
                    width: container.offsetWidth,
                    height: container.offsetHeight
                });
             }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);

    }, []);

    const startGame = () => {
        if (!dictionary) return;

        const newWord = getRandomWord(dictionary);
        const shuffledLetters = shuffle(newWord);

        setWord(newWord);

        const newLetters = shuffledLetters.map((char, index) => ({
            id: index,
            text: char.toUpperCase(),
            x: Math.random() * (stageSize.width - 40) + 20,
            y: - (Math.random() * 200 + 50),
            vy: Math.random() * 1 + 0.5,
        }));
        setLetters(newLetters);
    };

    useEffect(() => {
        if (!isLoading && dictionary && stageSize.width > 0) {
            startGame();
        }
    }, [isLoading, dictionary, stageSize.width]);

    useEffect(() => {
        const anim = new Konva.Animation(frame => {
            if (!frame) return;

            setLetters(prevLetters => 
                prevLetters.map(letter => {
                    const newY = letter.y + letter.vy;

                    // Reset letter if it goes off screen
                    if (newY > stageSize.height + 20) {
                         return {
                            ...letter,
                            y: -50,
                            x: Math.random() * (stageSize.width - 40) + 20
                        };
                    }
                    
                    return { ...letter, y: newY };
                })
            );

        }, layerRef.current);

        anim.start();
        return () => anim.stop();
    }, [stageSize.height, stageSize.width]);


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
            <div id="game-container" className="flex-grow w-full h-full">
                <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
                    <Layer ref={layerRef}>
                        {/* Background */}
                        <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="hsl(var(--background))" />
                        
                        {letters.map(letter => (
                            <Text
                                key={letter.id}
                                x={letter.x}
                                y={letter.y}
                                text={letter.text}
                                fontSize={32}
                                fontFamily='Poppins'
                                fill="hsl(var(--primary))"
                                shadowColor="black"
                                shadowBlur={5}
                                shadowOpacity={0.2}
                            />
                        ))}
                    </Layer>
                </Stage>
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
