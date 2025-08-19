
"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getContent, saveContent } from "@/lib/data";
import { LoaderCircle, Save } from "lucide-react";

type FormValues = {
  heroTitle: string;
  heroSubtitle: string;
};

export default function ContentPage() {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>();
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const content = await getContent();
      if (content) {
        reset(content);
      }
      setLoading(false);
    };
    fetchContent();
  }, [reset]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await saveContent(data);
      toast({
        title: "Success!",
        description: "Website content has been updated.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem saving the content. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-[calc(100vh-8rem)] py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Manage Website Content</CardTitle>
            <CardDescription>
              Update the text displayed on the public pages of the website. Changes will be live immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6 p-4 border rounded-lg">
                 <h3 className="text-xl font-headline text-primary">Homepage Hero Section</h3>
                 <div className="space-y-2">
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <Input id="heroTitle" {...register("heroTitle", { required: true })} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Textarea id="heroSubtitle" {...register("heroSubtitle", { required: true })} />
                 </div>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Save />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
