"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, subDays, format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  calculationMethod: z.enum([
    "due_date",
    "last_period",
    "conception_date",
    "ultrasound",
    "ivf_transfer",
  ]),
  referenceDate: z.date({
    required_error: "A reference date is required.",
  }),
});

type FormData = z.infer<typeof formSchema>;
type PregnancyResult = {
  dueDate: Date;
  conceptionDate: Date;
  lastPeriodDate: Date;
  fetalAgeWeeks: number;
  fetalAgeDays: number;
  currentWeek: number;
  trimester: number;
  trimester1End: Date;
  trimester2End: Date;
};

const ResultCard = ({ title, value }: { title: string; value: string | number }) => (
    <div className="p-4 bg-secondary rounded-lg text-center">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold text-primary">{value}</p>
    </div>
);


const PregnancyCalculator = () => {
    const [result, setResult] = useState<PregnancyResult | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            calculationMethod: "last_period",
            referenceDate: new Date(),
        },
    });

    const onSubmit = (values: FormData) => {
        const { calculationMethod, referenceDate } = values;
        let lastPeriodDate: Date;
        
        switch (calculationMethod) {
            case "due_date":
                lastPeriodDate = subDays(referenceDate, 280);
                break;
            case "conception_date":
                lastPeriodDate = subDays(referenceDate, 14);
                break;
            case "ivf_transfer":
                // Assuming a 5-day blastocyst transfer
                const conceptionDateFromIvf = subDays(referenceDate, 5);
                lastPeriodDate = subDays(conceptionDateFromIvf, 14);
                break;
            case "ultrasound":
                 // This is a simplification. Ultrasound dating is more complex.
                 // For this example, let's assume ultrasound date is given at 8 weeks gestational age.
                lastPeriodDate = subDays(referenceDate, 56);
                break;
            case "last_period":
            default:
                lastPeriodDate = referenceDate;
                break;
        }

        const conceptionDate = addDays(lastPeriodDate, 14);
        const dueDate = addDays(lastPeriodDate, 280);
        const today = new Date();
        
        const daysSinceLMP = differenceInDays(today, lastPeriodDate);
        const currentWeek = Math.floor(daysSinceLMP / 7);
        const fetalAgeDaysTotal = differenceInDays(today, conceptionDate);
        const fetalAgeWeeks = Math.floor(fetalAgeDaysTotal / 7);
        const fetalAgeDays = fetalAgeDaysTotal % 7;

        const trimester1End = addDays(lastPeriodDate, 97); // End of week 13
        const trimester2End = addDays(lastPeriodDate, 188); // End of week 26
        
        let trimester = 1;
        if (today > trimester2End) trimester = 3;
        else if (today > trimester1End) trimester = 2;


        setResult({
            dueDate,
            conceptionDate,
            lastPeriodDate,
            fetalAgeWeeks,
            fetalAgeDays,
            currentWeek,
            trimester,
            trimester1End,
            trimester2End,
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
                                    name="calculationMethod"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Calculate Based On</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a method" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="last_period">Last Period Date</SelectItem>
                                                    <SelectItem value="due_date">Due Date</SelectItem>
                                                    <SelectItem value="conception_date">Conception Date</SelectItem>
                                                    <SelectItem value="ultrasound">Ultrasound Date</SelectItem>
                                                    <SelectItem value="ivf_transfer">IVF Transfer Date</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="referenceDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Reference Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Calculate</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                 {!result ? (
                     <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                         <CardHeader><CardTitle>Your Pregnancy Timeline</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                         <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                     </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Estimated Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ResultCard title="Estimated Due Date" value={format(result.dueDate, "PPP")} />
                                <ResultCard title="Estimated Conception Date" value={format(result.conceptionDate, "PPP")} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                               <ResultCard title="Fetal Age" value={`${result.fetalAgeWeeks} weeks, ${result.fetalAgeDays} days`} />
                               <ResultCard title="You Are In" value={`Week ${result.currentWeek}`} />
                               <ResultCard title="Current Trimester" value={result.trimester} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Key Milestones:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    <li>First day of last period: <strong>{format(result.lastPeriodDate, "PPP")}</strong></li>
                                    <li>End of 1st Trimester (~13 weeks): <strong>{format(result.trimester1End, "PPP")}</strong></li>
                                    <li>End of 2nd Trimester (~26 weeks): <strong>{format(result.trimester2End, "PPP")}</strong></li>
                                    <li>Estimated Due Date (~40 weeks): <strong>{format(result.dueDate, "PPP")}</strong></li>
                                </ul>
                            </div>
                             <div className="text-xs text-muted-foreground pt-4 border-t">
                                <p><strong>Disclaimer:</strong> This calculator provides an estimate based on the data you provide. It is not a substitute for professional medical advice. Please consult with your healthcare provider for accurate dates and information regarding your pregnancy.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default PregnancyCalculator;
