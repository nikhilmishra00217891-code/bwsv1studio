"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { askAiMentor } from "@/app/actions";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquareHeart, Send, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiMentorWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! I'm your BhaiyaBot. How can I help you with your studies today?",
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

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askAiMentor(newMessages);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      console.error("AI Mentor Error:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "BhaiyaBot is taking a short break. Please try again later.",
      });
       setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again in a bit." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 animate-bounce"
          size="icon"
          aria-label="Ask AI Mentor"
          id="ai-mentor"
        >
          <MessageSquareHeart className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-2xl font-headline text-center">BhaiyaBot - Your AI Mentor</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
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
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                 <Avatar className="w-8 h-8 border-2 border-primary">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                <div className="bg-secondary rounded-2xl rounded-bl-none p-3 flex items-center gap-2">
                    <LoaderCircle className="w-4 h-4 animate-spin"/>
                    <span className="text-sm text-muted-foreground">BhaiyaBot is thinking...</span>
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
