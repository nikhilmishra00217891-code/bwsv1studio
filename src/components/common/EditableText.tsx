
"use client";

import { useEffect, useState, useRef } from 'react';
import { useEditMode } from './EditModeProvider';
import { getTextContent, saveTextContent } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  contentId: string;
  defaultValue: string;
  multiline?: boolean;
  className?: string;
}

export function EditableText({ contentId, defaultValue, multiline = false, className }: EditableTextProps) {
  const { isEditMode } = useEditMode();
  const [text, setText] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const fetchedText = await getTextContent(contentId);
      setText(fetchedText || defaultValue);
      setIsLoading(false);
    };
    fetchContent();
  }, [contentId, defaultValue]);
  
  useEffect(() => {
    if (isEditMode && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditMode, text]);

  const handleSave = async (newText: string) => {
    if (newText === text) return;
    try {
      await saveTextContent(contentId, newText);
      setText(newText);
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
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    handleSave(e.target.value);
  };
  
  if (isLoading && !isEditMode) {
    return <span className={cn("animate-pulse bg-muted-foreground/20 rounded-md", className)}>{defaultValue}</span>
  }

  if (isEditMode) {
    return (
      <Textarea
        ref={textareaRef}
        defaultValue={text}
        onBlur={handleBlur}
        onKeyDown={(e) => {
            if(e.key === 'Enter' && !multiline) {
                e.preventDefault();
                (e.target as HTMLTextAreaElement).blur();
            }
        }}
        className={cn(
            "w-full bg-primary/10 border-2 border-dashed border-primary/50 focus-visible:ring-primary text-inherit font-inherit leading-inherit tracking-inherit text-center p-2 resize-none overflow-hidden",
            multiline ? "" : "h-auto",
            className,
        )}
      />
    );
  }

  return <span className={className}>{text}</span>;
}
