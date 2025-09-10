
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useEditMode } from './EditModeProvider';
import { Button } from '../ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { saveTextContent } from '@/lib/data/content';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter as AlertDialogFooterComponent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


interface EditableImageProps extends React.ComponentProps<typeof Image> {
  contentId: string;
}

export function EditableImage(props: EditableImageProps) {
  const { contentId, src, alt, className, ...rest } = props;
  const { isEditMode } = useEditMode();
  const { toast } = useToast();

  const [currentSrc, setCurrentSrc] = useState(src);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  
  // A more robust check to see if the URL is valid enough to be rendered in a preview.
  const isPreviewableUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const handleSave = async (urlToSave: string) => {
    try {
      // Allow saving an empty string to remove the URL
      if(urlToSave) {
        new URL(urlToSave);
      }
      await saveTextContent(contentId, urlToSave);
      setCurrentSrc(urlToSave || props.src); // Fallback to original src if removed
      toast({
        title: urlToSave ? 'Image Updated!' : 'Image Removed!',
        description: urlToSave ? 'Your new image is now live.' : 'The custom image has been removed.',
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save image URL:', error);
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please enter a valid and complete image URL (e.g., https://...).',
      });
    }
  };

  const handleRemove = () => {
    handleSave('');
  }

  if (isEditMode) {
    return (
      <>
        <div className={cn('relative group', className)}>
          <Image src={currentSrc as string} alt={alt} className="transition-opacity group-hover:opacity-50" {...rest} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              onClick={() => {
                setNewUrl(currentSrc as string);
                setIsDialogOpen(true);
              }}
            >
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
                <p className="text-sm font-medium">Current Preview</p>
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
                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/> Remove URL</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This will remove the custom URL for this ad slot and revert it to the default placeholder.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooterComponent>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRemove}>Yes, Remove</AlertDialogAction>
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

  return <Image src={currentSrc as string} alt={alt} className={className} {...rest} />;
}
