"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  differenceInYears,
  differenceInMonths,
  differenceInWeeks,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  subYears,
  subMonths,
  subDays,
} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  dob: z.date({
    required_error: "Date of birth is required.",
  }),
  targetDate: z.date({
    required_error: "Target date is required.",
  }),
}).refine(data => data.dob <= data.targetDate, {
    message: "Date of birth cannot be in the future.",
    path: ["dob"],
});


type FormData = z.infer<typeof formSchema>;
type AgeResult = {
    years: number;
    months: number;
    days: number;
    totalWeeks: number;
    totalDays: number;
    totalHours: number;
    totalMinutes: number;
    totalSeconds: number;
};

const ResultCard = ({ title, value, unit }: { title: string; value: string; unit?: string }) => (
    <div className="p-4 bg-secondary rounded-lg text-center">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-primary">{value} <span className="text-lg font-normal">{unit}</span></p>
    </div>
);


const AgeCalculator = () => {
    const [result, setResult] = useState<AgeResult | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dob: new Date(2000, 0, 1),
            targetDate: new Date(),
        },
    });

    const onSubmit = (values: FormData) => {
        const { dob, targetDate } = values;
        
        const years = differenceInYears(targetDate, dob);
        const monthsDate = subYears(targetDate, years);
        const months = differenceInMonths(monthsDate, dob);
        const daysDate = subMonths(monthsDate, months);
        const days = differenceInDays(daysDate, dob);

        const totalWeeks = differenceInWeeks(targetDate, dob);
        const totalDays = differenceInDays(targetDate, dob);
        const totalHours = differenceInHours(targetDate, dob);
        const totalMinutes = differenceInMinutes(targetDate, dob);
        const totalSeconds = differenceInSeconds(targetDate, dob);

        setResult({
            years,
            months,
            days,
            totalWeeks,
            totalDays,
            totalHours,
            totalMinutes,
            totalSeconds,
        });
    };

    return (
         <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Enter Your Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                               <FormField
                                    control={form.control}
                                    name="dob"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Date of Birth</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn( "w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )}
                                                >
                                                {field.value ? ( format(field.value, "PPP") ) : ( <span>Pick a date</span> )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="targetDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Age at the Date of</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn( "w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )}
                                                >
                                                {field.value ? ( format(field.value, "PPP") ) : ( <span>Pick a date</span> )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Calculate Age</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                 {!result ? (
                     <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                         <CardHeader><CardTitle>Your Age</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                         <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                     </Card>
                ) : (
                    <Card>
                        <CardHeader className="text-center">
                             <CardTitle>Your Age Is</CardTitle>
                              <p className="text-4xl font-bold text-primary pt-2">
                                {result.years} <span className="text-2xl font-semibold text-foreground">years</span>, {result.months} <span className="text-2xl font-semibold text-foreground">months</span>, {result.days} <span className="text-2xl font-semibold text-foreground">days</span>
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <h3 className="text-lg font-semibold text-center mt-4">Or In Other Units:</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <ResultCard title="Total Weeks" value={result.totalWeeks.toLocaleString()} unit="weeks" />
                                <ResultCard title="Total Days" value={result.totalDays.toLocaleString()} unit="days" />
                                <ResultCard title="Total Hours" value={result.totalHours.toLocaleString()} unit="hours" />
                                <ResultCard title="Total Minutes" value={result.totalMinutes.toLocaleString()} unit="minutes" />
                                <ResultCard title="Total Seconds" value={result.totalSeconds.toLocaleString()} unit="seconds" />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AgeCalculator;
