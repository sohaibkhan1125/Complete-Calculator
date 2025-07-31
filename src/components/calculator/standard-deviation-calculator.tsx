"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
    numbers: z.string().min(1, 'Please enter a list of numbers.'),
    dataType: z.enum(['sample', 'population']).default('sample'),
});

type FormData = z.infer<typeof formSchema>;
type CalculationResult = {
    mean: number;
    sum: number;
    variance: number;
    stdDev: number;
    marginOfError: number;
    count: number;
};

const StandardDeviationCalculator = () => {
    const [result, setResult] = useState<CalculationResult | null>(null);
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            numbers: '10, 12, 23, 23, 16, 23, 21, 16',
            dataType: 'sample',
        },
    });

    const onSubmit = (values: FormData) => {
        const numbersStr = values.numbers.split(',').map(s => s.trim()).filter(s => s !== '');
        const numbers = numbersStr.map(Number).filter(n => !isNaN(n));

        if (numbers.length === 0) {
            toast({
                variant: "destructive",
                title: "Invalid Input",
                description: "Please enter valid, comma-separated numbers.",
            });
            return;
        }

        const n = numbers.length;
        const sum = numbers.reduce((acc, val) => acc + val, 0);
        const mean = sum / n;

        const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.dataType === 'sample' ? n - 1 : n);
        const stdDev = Math.sqrt(variance);

        // For margin of error, we'll assume a 95% confidence level, so Z-score is 1.96
        const zScore = 1.96;
        const marginOfError = zScore * (stdDev / Math.sqrt(n));

        setResult({
            mean,
            sum,
            variance,
            stdDev,
            marginOfError,
            count: n,
        });
    };

    const formatNumber = (num: number) => {
        if (isNaN(num) || !isFinite(num)) return "N/A";
        return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }

    return (
         <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Enter Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    name="numbers"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Enter comma-separated numbers</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={5} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="dataType"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Data Type</FormLabel>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 space-x-4">
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl><RadioGroupItem value="sample" /></FormControl>
                                                        <FormLabel className="font-normal">Sample</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl><RadioGroupItem value="population" /></FormControl>
                                                        <FormLabel className="font-normal">Population</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
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
                        <CardHeader>
                            <CardTitle>Results</CardTitle>
                            <CardDescription>Statistical analysis will appear here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" />
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                         <CardHeader>
                            <CardTitle>Statistical Results</CardTitle>
                            <CardDescription>Based on a count of {result.count} numbers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-4 bg-secondary rounded-lg">
                                    <p className="text-sm text-muted-foreground">Mean (Average)</p>
                                    <p className="text-2xl font-bold">{formatNumber(result.mean)}</p>
                                </div>
                                <div className="p-4 bg-secondary rounded-lg">
                                    <p className="text-sm text-muted-foreground">Sum</p>
                                    <p className="text-2xl font-bold">{formatNumber(result.sum)}</p>
                                </div>
                                <div className="p-4 bg-secondary rounded-lg">
                                    <p className="text-sm text-muted-foreground">Variance</p>
                                    <p className="text-2xl font-bold">{formatNumber(result.variance)}</p>
                                </div>
                                <div className="p-4 bg-secondary rounded-lg">
                                    <p className="text-sm text-muted-foreground">Margin of Error (95%)</p>
                                    <p className="text-2xl font-bold">±{formatNumber(result.marginOfError)}</p>
                                </div>
                            </div>
                            <div className="p-6 bg-primary text-primary-foreground rounded-lg text-center">
                                <p className="text-lg">Standard Deviation</p>
                                <p className="text-4xl font-bold">{formatNumber(result.stdDev)}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default StandardDeviationCalculator;
