
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = 'personalTodoList';

const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
}

export default function PersonalTodoList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                const { date, tasks: storedTasks } = JSON.parse(storedData);
                if (date === getTodayDateString()) {
                    setTasks(storedTasks);
                } else {
                    // It's a new day, clear the list
                    localStorage.removeItem(STORAGE_KEY);
                }
            }
        } catch (error) {
            console.error("Failed to load tasks from localStorage", error);
        }
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        try {
            const dataToStore = JSON.stringify({ date: getTodayDateString(), tasks });
            localStorage.setItem(STORAGE_KEY, dataToStore);
        } catch (error) {
            console.error("Failed to save tasks to localStorage", error);
        }
    }, [tasks, isMounted]);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            const newTask: Task = {
                id: Date.now(),
                text: newTaskText.trim(),
                completed: false,
            };
            setTasks(prevTasks => [...prevTasks, newTask]);
            setNewTaskText('');
        }
    };

    const toggleTask = (taskId: number) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const deleteTask = (taskId: number) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    };

    const clearCompleted = () => {
        setTasks(prevTasks => prevTasks.filter(task => !task.completed));
    };

    const completedCount = tasks.filter(t => t.completed).length;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-headline">Personal To-Do List</CardTitle>
                <CardDescription>Plan your day. This list resets automatically every day at midnight.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                    <Input
                        placeholder="Add a new task for today..."
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                    />
                    <Button type="submit" size="icon">
                        <Plus className="h-4 w-4" />
                    </Button>
                </form>

                <ScrollArea className="h-64 pr-4">
                    <AnimatePresence>
                        {tasks.map(task => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                className="flex items-center gap-3 p-2 rounded-md group hover:bg-muted"
                            >
                                <Checkbox
                                    id={`task-${task.id}`}
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTask(task.id)}
                                />
                                <Label
                                    htmlFor={`task-${task.id}`}
                                    className={cn(
                                        "flex-grow cursor-pointer",
                                        task.completed && "line-through text-muted-foreground"
                                    )}
                                >
                                    {task.text}
                                </Label>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteTask(task.id)}
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                     {tasks.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Your list is empty. Add a task to get started!</p>
                    )}
                </ScrollArea>

                {tasks.length > 0 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <span className="text-sm text-muted-foreground">
                            {completedCount}/{tasks.length} completed
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearCompleted}
                            disabled={completedCount === 0}
                        >
                            Clear Completed
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
