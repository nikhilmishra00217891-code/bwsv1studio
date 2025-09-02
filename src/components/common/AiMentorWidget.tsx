
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { askAiMentor } from "@/app/actions";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquareHeart, Send, LoaderCircle, BookDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function AiMentorWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! I'm your BWS Buddy. How can I help you with your studies today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askAiMentor(messages.concat(userMessage));
      setMessages((prevMessages) => {
        return [...prevMessages, { role: "assistant", content: response }];
      });

    } catch (error) {
      console.error("AI Mentor Error:", error);
      const errorMessage = "Sorry, I'm having trouble connecting right now. Please try again in a bit.";
       setMessages((prevMessages) => {
         return [...prevMessages, { role: "assistant", content: errorMessage }];
      });
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "BWS Buddy is taking a short break. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message, index: number) => {
      if (message.role === 'system') {
          return null; // System messages are not rendered
      }

      return (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3",
            message.role === "user" ? "justify-end" : ""
          )}
        >
          {message.role === "assistant" && (
            <Avatar className="w-8 h-8 border-2 border-primary">
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
          )}
          <div
            className={cn(
              "max-w-xs md:max-w-md rounded-2xl p-3 text-sm",
              message.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-none"
                : "bg-secondary rounded-bl-none"
            )}
          >
            {message.content}
          </div>
            {message.role === "user" && (
            <Avatar className="w-8 h-8">
                <AvatarImage src="https://placehold.co/100x100.png" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
          )}
        </div>
      )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="h-16 w-16 rounded-full shadow-lg"
          size="icon"
          aria-label="Ask AI Mentor"
          id="ai-mentor"
        >
          <MessageSquareHeart className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-2xl font-headline text-center">BWS Buddy - Your AI Mentor</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="flex items-start gap-3">
                 <Avatar className="w-8 h-8 border-2 border-primary">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                <div className="bg-secondary rounded-2xl rounded-bl-none p-3 flex items-center gap-2">
                    <LoaderCircle className="w-4 h-4 animate-spin"/>
                    <span className="text-sm text-muted-foreground">BWS Buddy is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any topic..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
