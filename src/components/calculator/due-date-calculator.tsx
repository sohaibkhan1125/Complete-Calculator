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
import { Input } from "@/components/ui/input";
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
    "last_period",
    "conception_date",
    "ivf_transfer",
    "ultrasound",
  ]),
  referenceDate: z.date({
    required_error: "A reference date is required.",
  }),
  cycleLength: z.coerce.number().min(20).max(45).optional().default(28),
  ultrasoundWeeks: z.coerce.number().optional(),
  ultrasoundDays: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;
type DueDateResult = {
  dueDate: Date;
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  trimester: number;
};

const ResultCard = ({ title, value }: { title: string; value: string | number }) => (
    <div className="p-4 bg-secondary rounded-lg text-center">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold text-primary">{value}</p>
    </div>
);


const DueDateCalculator = () => {
    const [result, setResult] = useState<DueDateResult | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            calculationMethod: "last_period",
            referenceDate: new Date(),
            cycleLength: 28,
            ultrasoundWeeks: 8,
            ultrasoundDays: 0,
        },
    });
    
    const calculationMethod = form.watch("calculationMethod");

    const onSubmit = (values: FormData) => {
        const { referenceDate } = values;
        let dueDate: Date;
        let lmp: Date;
        
        switch (values.calculationMethod) {
            case "conception_date":
                dueDate = addDays(referenceDate, 266);
                lmp = subDays(referenceDate, 14);
                break;
            case "ivf_transfer":
                 // Assuming a 5-day blastocyst transfer
                const conceptionDateFromIvf = subDays(referenceDate, 5);
                dueDate = addDays(conceptionDateFromIvf, 266);
                lmp = subDays(conceptionDateFromIvf, 14);
                break;
            case "ultrasound":
                const gestationalAgeInDays = (values.ultrasoundWeeks || 0) * 7 + (values.ultrasoundDays || 0);
                lmp = subDays(referenceDate, gestationalAgeInDays);
                dueDate = addDays(lmp, 280);
                break;
            case "last_period":
            default:
                const cycleAdjustment = (values.cycleLength || 28) - 28;
                dueDate = addDays(referenceDate, 280 + cycleAdjustment);
                lmp = referenceDate;
                break;
        }

        const gestationalAgeTotalDays = differenceInDays(new Date(), lmp);
        const gestationalAgeWeeks = Math.floor(gestationalAgeTotalDays / 7);
        const gestationalAgeDays = gestationalAgeTotalDays % 7;

        let trimester = 1;
        if (gestationalAgeWeeks > 26) trimester = 3;
        else if (gestationalAgeWeeks > 13) trimester = 2;

        setResult({
            dueDate,
            gestationalAgeWeeks,
            gestationalAgeDays,
            trimester,
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
                                                    <SelectItem value="conception_date">Conception Date</SelectItem>
                                                    <SelectItem value="ivf_transfer">IVF Transfer Date</SelectItem>
                                                    <SelectItem value="ultrasound">Ultrasound Date</SelectItem>
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
                                        <FormLabel>
                                            {
                                                calculationMethod === 'last_period' ? 'First Day of Your Last Period' :
                                                calculationMethod === 'conception_date' ? 'Date of Conception' :
                                                calculationMethod === 'ivf_transfer' ? 'Date of IVF Transfer' :
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
                                {calculationMethod === 'last_period' && (
                                     <FormField name="cycleLength" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Average Cycle Length (Days)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                )}
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
                                <Button type="submit" className="w-full">Calculate Due Date</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                 {!result ? (
                     <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                         <CardHeader><CardTitle>Your Due Date</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                         <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                     </Card>
                ) : (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Your Estimated Due Date</CardTitle>
                             <p className="text-4xl font-bold text-primary pt-2">{format(result.dueDate, "MMMM d, yyyy")}</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ResultCard title="Gestational Age" value={`${result.gestationalAgeWeeks} weeks, ${result.gestationalAgeDays} days`} />
                                <ResultCard title="You Are In" value={`Trimester ${result.trimester}`} />
                            </div>
                             <div className="text-xs text-muted-foreground pt-4 border-t">
                                <p><strong>Disclaimer:</strong> This calculator provides an estimate and should not replace professional medical advice. Due dates can vary. Consult with your healthcare provider for accurate information about your pregnancy.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default DueDateCalculator;
