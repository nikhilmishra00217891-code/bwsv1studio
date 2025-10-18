
"use client";

import { useState, useEffect } from 'react';
import type { Course, Coupon } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, LoaderCircle, ArrowLeft, TicketPercent, Trash2 } from 'lucide-react';
import { createCoupon, deleteCoupon, updateCoupon, listenForCoupons, getCouponsForCourse } from '@/lib/data/coupons';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

const CreateCouponDialog = ({ courseId, onCouponCreated }: { courseId: string, onCouponCreated: () => void }) => {
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState<number>(10);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || discount <= 0 || discount > 100) {
            toast({
                variant: 'destructive',
                title: 'Invalid Input',
                description: 'Please provide a valid code and a discount percentage between 1 and 100.',
            });
            return;
        }
        setIsLoading(true);
        try {
            await createCoupon(courseId, code, discount);
            toast({
                title: "Coupon Created!",
                description: `Code "${code.toUpperCase()}" is now active.`,
            });
            onCouponCreated();
            setIsOpen(false);
            setCode('');
            setDiscount(10);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Creation Failed',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Coupon
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Coupon</DialogTitle>
                        <DialogDescription>
                            Create a new discount coupon for this course.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right">Code</Label>
                            <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="discount" className="text-right">Discount (%)</Label>
                            <Input id="discount" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="col-span-3" required min="1" max="100"/>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <LoaderCircle className="animate-spin" /> : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};


export default function CouponManagementClient({ initialCourse }: { initialCourse: Course }) {
    const { toast } = useToast();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getCouponsForCourse(initialCourse.id).then(initialCoupons => {
            setCoupons(initialCoupons);
            setIsLoading(false);

            const unsubscribe = listenForCoupons(initialCourse.id, (updatedCoupons) => {
                setCoupons(updatedCoupons);
            });
            return () => unsubscribe();
        });
    }, [initialCourse.id]);

    const handleToggleActive = async (coupon: Coupon, isActive: boolean) => {
        try {
            await updateCoupon(coupon.courseId, coupon.id, { isActive });
            toast({
                title: `Coupon ${isActive ? 'Enabled' : 'Disabled'}`,
            });
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        }
    }
    
    const handleDelete = async (coupon: Coupon) => {
        try {
            await deleteCoupon(coupon.courseId, coupon.id);
            toast({
                title: "Coupon Deleted",
            });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
        }
    }

    const getCouponDate = (coupon: Coupon) => {
        if (!coupon.createdAt) return new Date();
        
        // Firestore Timestamps from onSnapshot are objects, from server they are strings.
        if (typeof coupon.createdAt === 'string') {
            return new Date(coupon.createdAt);
        }
        
        // Check if it looks like a Firestore Timestamp object
        if (coupon.createdAt && typeof (coupon.createdAt as any).toDate === 'function') {
            return (coupon.createdAt as any).toDate();
        }

        // Fallback for unexpected formats
        return new Date();
    }

    return (
        <div className="animate-fade-in p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="sm">
                    <Link href="/admin/coupons">
                        <ArrowLeft className="mr-2 w-4 h-4"/> Back to Courses
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-headline">{initialCourse.title}</h1>
                    <p className="text-muted-foreground">Coupon Management</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2"><TicketPercent/> Existing Coupons</CardTitle>
                            <CardDescription>View, manage, or create new coupons for this course.</CardDescription>
                        </div>
                        <CreateCouponDialog courseId={initialCourse.id} onCouponCreated={() => {}}/>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <LoaderCircle className="animate-spin w-8 h-8 text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Times Used</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coupons.length > 0 ? coupons.map(coupon => (
                                    <TableRow key={coupon.id} className={cn(!coupon.isActive && 'bg-muted/50')}>
                                        <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                                        <TableCell>{coupon.discountPercentage}%</TableCell>
                                        <TableCell>{format(getCouponDate(coupon), 'PPP')}</TableCell>
                                        <TableCell>{coupon.timesUsed}</TableCell>
                                        <TableCell>
                                            <Badge variant={coupon.isActive ? 'default' : 'secondary'} className={cn(coupon.isActive && 'bg-green-600')}>{coupon.isActive ? 'Active' : 'Inactive'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Switch 
                                                checked={coupon.isActive}
                                                onCheckedChange={(checked) => handleToggleActive(coupon, checked)}
                                                aria-label="Toggle coupon status"
                                            />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the coupon "{coupon.code}". This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(coupon)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No coupons have been created for this course yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
