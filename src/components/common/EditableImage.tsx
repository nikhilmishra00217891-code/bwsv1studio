
"use client";

import React, { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { useEditMode } from './EditModeProvider';
import { Button } from '../ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { saveTextContent } from '@/lib/data/content';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as AlertDialogFooterComponent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useAuth } from '@/components/auth/AuthProvider';

interface EditableImageProps extends Omit<ImageProps, 'src'> {
  contentId: string;
  src: string; // The default/fallback src
}

export function EditableImage(props: EditableImageProps) {
  const { contentId, src: defaultSrc, alt, className, ...rest } = props;
  const { isEditMode } = useEditMode();
  const { toast } = useToast();
  const { textContent, loading } = useAuth();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Directly determine the source based on auth context.
  // This is more stable than using component state and useEffect.
  const liveSrc = textContent[contentId] as string || defaultSrc;
  
  // Use the live source for the dialog input as well.
  const [newUrl, setNewUrl] = useState(liveSrc);

  const openDialog = () => {
    setNewUrl(liveSrc); // Ensure the dialog opens with the current image URL
    setIsDialogOpen(true);
  };
  
  const handleSave = async (urlToSave: string) => {
    try {
      if(urlToSave) new URL(urlToSave);
      
      await saveTextContent(contentId, urlToSave);
      toast({
        title: urlToSave ? 'Image Updated!' : 'Image Reset!',
        description: urlToSave ? 'Your new image is now live.' : 'The image has been reset to its default.',
      });
      setIsDialogOpen(false);
      // No need to set local state, AuthProvider will trigger re-render
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please enter a valid image URL (e.g., https://...).',
      });
    }
  };

  const handleRemove = () => {
    handleSave(''); // Saving an empty string removes the custom URL
  }
  
  const isPreviewableUrl = (url: string) => {
    try {
      new URL(url);
      return url.startsWith('http');
    } catch (e) {
      return false;
    }
  }

  if (isEditMode) {
    return (
      <>
        <div className={cn('relative group', className)}>
          <Image src={liveSrc} alt={alt} className="transition-opacity group-hover:opacity-50" {...rest} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" onClick={openDialog}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Image
            </Button>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Image URL</DialogTitle>
              <DialogDescription>
                Paste a new URL from an image hosting service like postimg.cc.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://i.postimg.cc/..."
              />
            </div>
             <div className="mt-4">
                <p className="text-sm font-medium">New Preview</p>
                {isPreviewableUrl(newUrl) ? (
                    <Image src={newUrl} alt="New image preview" width={200} height={120} className="mt-2 rounded-md border aspect-video object-contain" />
                ) : (
                    <div className="mt-2 rounded-md border aspect-video bg-muted flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Enter a valid URL to see a preview</p>
                    </div>
                )}
            </div>
            <DialogFooter className="sm:justify-between">
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/> Reset to Default</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This will remove your custom URL and revert to the default image.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooterComponent>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRemove}>Yes, Reset</AlertDialogAction>
                      </AlertDialogFooterComponent>
                  </AlertDialogContent>
              </AlertDialog>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => handleSave(newUrl)}>Save</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <Image src={liveSrc} alt={alt} className={className} {...rest} />;
}
