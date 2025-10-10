
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ResourcesPage() {
    const params = useParams();
    const courseId = params.courseId;

  return (
    <div className="flex h-full items-center justify-center bg-card/50 p-6">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Wrench className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">This Area is Under Construction!</CardTitle>
          <CardDescription>
            The Course Resources page is still being built. Our team is working hard to bring you all the materials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mt-2">
            Please check back soon for notes, DPPs, and other study materials.
          </p>
          <div className="mt-6 flex justify-center gap-4">
             <Button asChild>
                <Link href={`/courses/${courseId}/learnzone`}>
                    Back to Course Content
                </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
