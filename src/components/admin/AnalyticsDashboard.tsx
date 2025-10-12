
"use client";

import { useMemo } from 'react';
import type { UserProfile, Course } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Calendar, BarChart2, BookOpen } from "lucide-react";
import { isToday, isThisMonth, isWithinInterval, subDays } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card className="bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function AnalyticsDashboard({ users, allCourses }: { users: UserProfile[], allCourses: Course[] }) {

    const analytics = useMemo(() => {
        const now = new Date();
        const totalUsers = users.length;
        const newToday = users.filter(u => u.createdAt && isToday(new Date(u.createdAt))).length;
        const newThisWeek = users.filter(u => u.createdAt && isWithinInterval(new Date(u.createdAt), { start: subDays(now, 7), end: now })).length;
        const newThisMonth = users.filter(u => u.createdAt && isThisMonth(new Date(u.createdAt))).length;

        const gradeDistribution = users.reduce((acc, user) => {
            const grade = user.grade || 'N/A';
            acc[grade] = (acc[grade] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const gradeChartData = Object.entries(gradeDistribution)
            .map(([name, count]) => ({ name, count }))
            .sort((a,b) => b.count - a.count);

        const safeAllCourses = allCourses || [];
        const courseMap = new Map(safeAllCourses.map(course => [course.id, course.title]));
        const courseDistribution = users.reduce((acc, user) => {
            user.enrolledCourses?.forEach(courseId => {
                const courseTitle = courseMap.get(courseId) || 'Unknown Course';
                acc[courseTitle] = (acc[courseTitle] || 0) + 1;
            });
            return acc;
        }, {} as Record<string, number>);
        
        const courseChartData = Object.entries(courseDistribution)
            .map(([name, count]) => ({ name, count }))
            .sort((a,b) => b.count - a.count);

        return {
            totalUsers,
            newToday,
            newThisWeek,
            newThisMonth,
            gradeChartData,
            courseChartData,
        }
    }, [users, allCourses]);


    return (
        <div className="space-y-6">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Users" value={analytics.totalUsers} icon={Users} />
                <StatCard title="New Today" value={analytics.newToday} icon={UserPlus} />
                <StatCard title="New This Week" value={analytics.newThisWeek} icon={Calendar} />
                <StatCard title="New This Month" value={analytics.newThisMonth} icon={Calendar} />
            </div>

            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BarChart2 className="w-5 h-5" />
                            <CardTitle>Student Distribution by Grade</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={analytics.gradeChartData}>
                                <XAxis 
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                    allowDecimals={false}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)'
                                    }}
                                />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Students" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            <CardTitle>Student Distribution by Course</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={analytics.courseChartData}>
                                <XAxis 
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={0}
                                    angle={-25}
                                    textAnchor="end"
                                    height={70}
                                />
                                <YAxis 
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                    allowDecimals={false}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)'
                                    }}
                                />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Enrolled" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

