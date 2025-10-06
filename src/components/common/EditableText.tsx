
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useEditMode } from './EditModeProvider';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { saveTextContent } from '@/lib/data/content';
import { useAuth } from '@/components/auth/AuthProvider';

interface EditableTextProps {
  contentId: string;
  defaultValue: string;
  multiline?: boolean;
  as?: 'span' | 'badge' | 'input';
  className?: string;
  onSave: (contentId: string, value: string) => void;
}

export function EditableText({ 
  contentId, 
  defaultValue, 
  multiline = false, 
  as = 'span',
  className,
  onSave
}: EditableTextProps) {
  const { isEditMode } = useEditMode();
  const { textContent } = useAuth();
  const [text, setText] = useState(defaultValue);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const liveValue = textContent[contentId] as string || defaultValue;

  useEffect(() => {
    setText(liveValue);
  }, [liveValue]);

  const handleSave = async () => {
    if (text === liveValue) {
        setIsEditing(false);
        return;
    };
    try {
      await saveTextContent(contentId, text);
      if (onSave) onSave(contentId, text);
      toast({
        title: "Content saved!",
        description: "Your changes are now live.",
      });
    } catch (error) {
      console.error("Failed to save content:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Could not save your changes. Please try again.",
      });
      setText(defaultValue); // Revert on failure
    } finally {
        setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setText(defaultValue);
      setIsEditing(false);
    }
  };
  
  if (isEditMode) {
    if (isEditing) {
       if (multiline) {
            return (
                <Textarea
                    value={text}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setText(e.target.value)}
                    className={cn(
                        "w-full bg-primary/10 border-2 border-dashed border-primary/50 focus-visible:ring-primary text-inherit font-inherit leading-inherit tracking-inherit p-2 resize-none overflow-hidden",
                        className
                    )}
                    autoFocus
                />
            );
       }
       return (
            <Input
                value={text}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onChange={(e) => setText(e.target.value)}
                className={cn(
                    "w-full bg-primary/10 border-2 border-dashed border-primary/50 focus-visible:ring-primary text-inherit font-inherit h-auto p-2",
                     className
                )}
                autoFocus
            />
       )
    }
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className={cn(
            "border-2 border-dashed border-transparent hover:border-primary/50 p-1 rounded transition-colors duration-200 w-full text-left",
            className
        )}
      >
        {as === 'badge' ? <Badge variant="secondary" className="text-base">{text}</Badge> : text}
      </button>
    )
  }

  // Display mode
  if (as === 'badge') {
    return <Badge variant="secondary" className={className}>{text}</Badge>
  }

  if (multiline) {
    return (
        <span className={className}>
            {text.split('\n').map((line, index, array) => (
                <React.Fragment key={index}>
                    {line}
                    {index < array.length - 1 && <br />}
                </React.Fragment>
            ))}
        </span>
    );
  }

  return <span className={className}>{text}</span>;
}
