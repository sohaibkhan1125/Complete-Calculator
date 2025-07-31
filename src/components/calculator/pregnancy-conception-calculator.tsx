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
  FormDescription,
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
    "ultrasound",
  ]),
  referenceDate: z.date({
    required_error: "A reference date is required.",
  }),
  ultrasoundWeeks: z.coerce.number().optional(),
  ultrasoundDays: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;
type ConceptionResult = {
  conceptionDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  weekOfPregnancy?: number;
};

const ResultCard = ({ title, value }: { title: string; value: string | number }) => (
    <div className="p-4 bg-secondary rounded-lg text-center">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold text-primary">{value}</p>
    </div>
);


const PregnancyConceptionCalculator = () => {
    const [result, setResult] = useState<ConceptionResult | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            calculationMethod: "last_period",
            referenceDate: new Date(),
            ultrasoundWeeks: 8,
            ultrasoundDays: 0,
        },
    });

    const calculationMethod = form.watch("calculationMethod");

    const onSubmit = (values: FormData) => {
        const { referenceDate } = values;
        let conceptionDate: Date;
        
        switch (values.calculationMethod) {
            case "due_date":
                conceptionDate = subDays(referenceDate, 266);
                break;
            case "ultrasound":
                const gestationalAgeInDays = (values.ultrasoundWeeks || 0) * 7 + (values.ultrasoundDays || 0);
                const lmpFromUltrasound = subDays(referenceDate, gestationalAgeInDays);
                conceptionDate = addDays(lmpFromUltrasound, 14);
                break;
            case "last_period":
            default:
                conceptionDate = addDays(referenceDate, 14);
                break;
        }

        const fertileWindowStart = subDays(conceptionDate, 5);
        const fertileWindowEnd = conceptionDate;
        
        const lastPeriodDate = subDays(conceptionDate, 14);
        const weekOfPregnancy = Math.floor(differenceInDays(new Date(), lastPeriodDate) / 7);

        setResult({
            conceptionDate,
            fertileWindowStart,
            fertileWindowEnd,
            weekOfPregnancy,
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
                                                    <SelectItem value="ultrasound">Ultrasound Date</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {calculationMethod === 'ultrasound' && (
                                     <>
                                        <FormLabel>Gestational Age at Ultrasound</FormLabel>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField name="ultrasoundWeeks" control={form.control} render={({ field }) => (
                                                <FormItem><FormLabel>Weeks</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                             <FormField name="ultrasoundDays" control={form.control} render={({ field }) => (
                                                <FormItem><FormLabel>Days</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                        </div>
                                     </>
                                )}
                                <FormField
                                    control={form.control}
                                    name="referenceDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>
                                            {
                                                calculationMethod === 'last_period' ? 'First Day of Last Period' :
                                                calculationMethod === 'due_date' ? 'Estimated Due Date' :
                                                'Date of Ultrasound'
                                            }
                                        </FormLabel>
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
                         <CardHeader><CardTitle>Your Conception Timeline</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                         <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                     </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Estimated Conception Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ResultCard title="Estimated Conception Date" value={format(result.conceptionDate, "PPP")} />
                                <ResultCard title="Probable Fertile Window" value={`${format(result.fertileWindowStart, "MMM d")} - ${format(result.fertileWindowEnd, "d, yyyy")}`} />
                            </div>
                            
                            <div className="text-center pt-4 border-t">
                                <p className="text-muted-foreground">You are likely in</p>
                                <p className="text-2xl font-bold text-primary">Week {result.weekOfPregnancy}</p>
                                <p className="text-muted-foreground">of your pregnancy.</p>
                            </div>

                             <div className="text-xs text-muted-foreground pt-4 border-t">
                                <p><strong>Disclaimer:</strong> This calculator provides an estimate based on the data you provide. Ovulation and conception can vary from cycle to cycle. This tool is not a substitute for professional medical advice. Please consult with your healthcare provider for accurate dates and information regarding your pregnancy.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default PregnancyConceptionCalculator;
