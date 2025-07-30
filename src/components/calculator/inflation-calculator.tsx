"use client";

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cpiData, cpiDataByYear } from '@/lib/cpi-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const cpiSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be positive."),
  fromYear: z.coerce.number(),
  fromMonth: z.coerce.number(),
  toYear: z.coerce.number(),
  toMonth: z.coerce.number(),
});

const flatRateSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be positive."),
  rate: z.coerce.number(),
  years: z.coerce.number().min(0, "Years must be positive."),
});

const ResultDisplay = ({ title, value, description }: { title: string; value: string; description?: string }) => (
    <Card className="text-center mt-6">
        <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-4xl font-bold text-primary">{value}</p>
            {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
        </CardContent>
    </Card>
);

const InflationCalculator = () => {
    const [cpiResult, setCpiResult] = useState<string | null>(null);
    const [forwardResult, setForwardResult] = useState<string | null>(null);
    const [backwardResult, setBackwardResult] = useState<string | null>(null);

    const years = useMemo(() => Object.keys(cpiData).map(Number).sort((a, b) => b - a), []);
    const months = [
        { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
        { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
        { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
        { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' },
    ];
    
    const cpiForm = useForm<z.infer<typeof cpiSchema>>({
        resolver: zodResolver(cpiSchema),
        defaultValues: { amount: 100, fromYear: 2015, fromMonth: 1, toYear: new Date().getFullYear(), toMonth: 6 },
    });

    const forwardForm = useForm<z.infer<typeof flatRateSchema>>({
        resolver: zodResolver(flatRateSchema),
        defaultValues: { amount: 100, rate: 3, years: 10 },
    });

    const backwardForm = useForm<z.infer<typeof flatRateSchema>>({
        resolver: zodResolver(flatRateSchema),
        defaultValues: { amount: 100, rate: 3, years: 10 },
    });

    const onCpiSubmit = (values: z.infer<typeof cpiSchema>) => {
        const fromCpi = cpiData[values.fromYear]?.[months[values.fromMonth-1].name];
        const toCpi = cpiData[values.toYear]?.[months[values.toMonth-1].name];
        if (fromCpi && toCpi) {
            const result = values.amount * (toCpi / fromCpi);
            setCpiResult(formatCurrency(result));
        } else {
            setCpiResult("N/A - Data not available for selected period.");
        }
    };

    const onForwardSubmit = (values: z.infer<typeof flatRateSchema>) => {
        const result = values.amount * Math.pow(1 + values.rate / 100, values.years);
        setForwardResult(formatCurrency(result));
    };

    const onBackwardSubmit = (values: z.infer<typeof flatRateSchema>) => {
        const result = values.amount / Math.pow(1 + values.rate / 100, values.years);
        setBackwardResult(formatCurrency(result));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Tabs defaultValue="cpi" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                        <TabsTrigger value="cpi">CPI Historical Conversion</TabsTrigger>
                        <TabsTrigger value="forward">Forward Flat Rate</TabsTrigger>
                        <TabsTrigger value="backward">Backward Flat Rate</TabsTrigger>
                    </TabsList>
                    <TabsContent value="cpi">
                        <Card>
                            <CardContent className="pt-6">
                                <Form {...cpiForm}>
                                    <form onSubmit={cpiForm.handleSubmit(onCpiSubmit)} className="space-y-6">
                                        <FormField name="amount" control={cpiForm.control} render={({ field }) => (
                                            <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField name="fromMonth" control={cpiForm.control} render={({ field }) => (
                                                <FormItem><FormLabel>From Month</FormLabel>
                                                    <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>{months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.name}</SelectItem>)}</SelectContent>
                                                    </Select><FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField name="fromYear" control={cpiForm.control} render={({ field }) => (
                                                <FormItem><FormLabel>From Year</FormLabel>
                                                    <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                                                    </Select><FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField name="toMonth" control={cpiForm.control} render={({ field }) => (
                                                <FormItem><FormLabel>To Month</FormLabel>
                                                    <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>{months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.name}</SelectItem>)}</SelectContent>
                                                    </Select><FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField name="toYear" control={cpiForm.control} render={({ field }) => (
                                                <FormItem><FormLabel>To Year</FormLabel>
                                                    <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                                                    </Select><FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <Button type="submit" className="w-full">Calculate</Button>
                                    </form>
                                </Form>
                                {cpiResult && <ResultDisplay title="Equivalent Value" value={cpiResult} />}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="forward">
                        <Card>
                            <CardContent className="pt-6">
                                <Form {...forwardForm}>
                                    <form onSubmit={forwardForm.handleSubmit(onForwardSubmit)} className="space-y-6">
                                        <FormField name="amount" control={forwardForm.control} render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name="rate" control={forwardForm.control} render={({ field }) => (<FormItem><FormLabel>Inflation Rate (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name="years" control={forwardForm.control} render={({ field }) => (<FormItem><FormLabel>Number of Years</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <Button type="submit" className="w-full">Calculate</Button>
                                    </form>
                                </Form>
                                {forwardResult && <ResultDisplay title="Amount After Inflation" value={forwardResult} />}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="backward">
                        <Card>
                            <CardContent className="pt-6">
                                <Form {...backwardForm}>
                                    <form onSubmit={backwardForm.handleSubmit(onBackwardSubmit)} className="space-y-6">
                                        <FormField name="amount" control={backwardForm.control} render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name="rate" control={backwardForm.control} render={({ field }) => (<FormItem><FormLabel>Inflation Rate (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name="years" control={backwardForm.control} render={({ field }) => (<FormItem><FormLabel>Number of Years Ago</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <Button type="submit" className="w-full">Calculate</Button>
                                    </form>
                                </Form>
                                {backwardResult && <ResultDisplay title="Equivalent Purchasing Power in the Past" value={backwardResult} />}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                 <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Historical U.S. Inflation Rates (2013-2025)</CardTitle>
                        <CardDescription>Average annual inflation rates based on CPI data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-72">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Year</TableHead>
                                        <TableHead className="text-right">Average Annual Inflation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(cpiDataByYear).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA)).map(([year, data]) => (
                                        <TableRow key={year}>
                                            <TableCell>{year}</TableCell>
                                            <TableCell className="text-right">{data.inflationRate}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Related Links</CardTitle></CardHeader>
                    <CardContent className="flex flex-col space-y-2">
                        <Link href="/interest-calculator" className="text-primary hover:underline">Interest Calculator</Link>
                        <Link href="/loan-calculator" className="text-primary hover:underline">Loan Calculator</Link>
                        <Link href="/investment-calculator" className="text-primary hover:underline">Investment Calculator</Link>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>About This Calculator</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>The Inflation Calculator uses historical CPI data from the U.S. Bureau of Labor Statistics (1913–2025) to convert purchasing power between years. Flat-rate inflation scenarios are hypothetical and use user-defined rates.</p>
                        <p>Typical inflation rates hover around ~3% historically in the U.S., but users can adjust as needed for their calculations.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InflationCalculator;
