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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const formSchema = z.object({
  interestRate: z.coerce.number().min(0, "Interest rate must be positive."),
  fromPeriod: z.coerce.number(),
  toPeriod: z.coerce.number(),
});

type FormData = z.infer<typeof formSchema>;

const compoundingPeriods = [
    { name: "Daily", value: 365 },
    { name: "Monthly (APR)", value: 12 },
    { name: "Quarterly", value: 4 },
    { name: "Semi-Annually", value: 2 },
    { name: "Annually (APY)", value: 1 },
];

const CompoundInterestCalculator = () => {
    const [result, setResult] = useState<string | null>(null);
    const [resultDescription, setResultDescription] = useState<string | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            interestRate: 6,
            fromPeriod: 12, // Monthly
            toPeriod: 1, // Annually
        },
    });

    const onSubmit = (values: FormData) => {
        const { interestRate, fromPeriod, toPeriod } = values;
        const rateDecimal = interestRate / 100;

        // Step 1: Convert the input rate to an effective annual rate (APY).
        const effectiveAnnualRate = Math.pow(1 + rateDecimal / fromPeriod, fromPeriod) - 1;

        // Step 2: Convert the effective annual rate to the target nominal rate.
        const equivalentRate = toPeriod * (Math.pow(1 + effectiveAnnualRate, 1 / toPeriod) - 1);

        const resultPercentage = equivalentRate * 100;
        
        const fromPeriodName = compoundingPeriods.find(p => p.value === fromPeriod)?.name;
        const toPeriodName = compoundingPeriods.find(p => p.value === toPeriod)?.name;

        setResult(`${resultPercentage.toFixed(5)}%`);
        setResultDescription(`${interestRate}% ${fromPeriodName} = ${resultPercentage.toFixed(5)}% ${toPeriodName}`);
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Interest Rate Converter</CardTitle>
                <CardDescription>Convert an interest rate from one compounding period to another.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="interestRate"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Input Interest Rate (%)</FormLabel>
                                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <FormField
                                name="fromPeriod"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Input Compounding Period</FormLabel>
                                    <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {compoundingPeriods.map(p => <SelectItem key={p.value} value={String(p.value)}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                            <div className="pt-6 hidden sm:block">
                                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                            </div>

                            <FormField
                                name="toPeriod"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Output Compounding Period</FormLabel>
                                     <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {compoundingPeriods.map(p => <SelectItem key={p.value} value={String(p.value)}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        
                        <Button type="submit" className="w-full">Calculate</Button>
                    </form>
                </Form>

                {result && (
                     <Card className="text-center mt-8 bg-secondary">
                        <CardHeader>
                            <CardTitle className="text-lg text-muted-foreground">Equivalent Interest Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-primary">{result}</p>
                            {resultDescription && <p className="text-sm text-muted-foreground mt-2">{resultDescription}</p>}
                        </CardContent>
                    </Card>
                )}
                 <p className="text-xs text-muted-foreground mt-6 text-center">
                    Note: For actual investment growth calculations, please use the <a href="/interest-calculator" className="text-primary underline">Interest Calculator</a> tool.
                </p>
            </CardContent>
        </Card>
    );
};

export default CompoundInterestCalculator;
