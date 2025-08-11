"use client";

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formatCurrency = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const formSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be positive."),
  frequency: z.enum(['hour', 'day', 'week', 'month', 'year']),
  hoursPerWeek: z.coerce.number().min(0).max(168),
  daysPerWeek: z.coerce.number().min(0).max(7),
  holidaysPerYear: z.coerce.number().min(0),
  vacationDaysPerYear: z.coerce.number().min(0),
});

type FormData = z.infer<typeof formSchema>;

type CalculationResult = {
  unadjusted: Record<string, number>;
  adjusted: Record<string, number>;
};

const SalaryCalculator = () => {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 50000,
            frequency: 'year',
            hoursPerWeek: 40,
            daysPerWeek: 5,
            holidaysPerYear: 10,
            vacationDaysPerYear: 15,
        },
    });

    const onSubmit = (values: FormData) => {
        let annualSalary = 0;
        switch (values.frequency) {
            case 'hour':
                annualSalary = values.amount * values.hoursPerWeek * 52;
                break;
            case 'day':
                annualSalary = values.amount * values.daysPerWeek * 52;
                break;
            case 'week':
                annualSalary = values.amount * 52;
                break;
            case 'month':
                annualSalary = values.amount * 12;
                break;
            case 'year':
                annualSalary = values.amount;
                break;
        }

        // Unadjusted calculations
        const unadjustedWeekly = annualSalary / 52;
        const unadjustedDaily = values.daysPerWeek > 0 ? unadjustedWeekly / values.daysPerWeek : 0;
        const unadjustedHourly = values.hoursPerWeek > 0 ? unadjustedWeekly / values.hoursPerWeek : 0;
        
        const unadjusted = {
            annual: annualSalary,
            quarterly: annualSalary / 4,
            monthly: annualSalary / 12,
            semiMonthly: annualSalary / 24,
            biWeekly: annualSalary / 26,
            weekly: unadjustedWeekly,
            daily: unadjustedDaily,
            hourly: unadjustedHourly,
        };

        // Adjusted calculations
        const totalWorkDaysPerYear = (values.daysPerWeek * 52) - values.holidaysPerYear - values.vacationDaysPerYear;
        const hoursPerDay = values.daysPerWeek > 0 ? values.hoursPerWeek / values.daysPerWeek : 0;
        const totalWorkHoursPerYear = totalWorkDaysPerYear * hoursPerDay;

        const adjustedHourly = totalWorkHoursPerYear > 0 ? annualSalary / totalWorkHoursPerYear : 0;
        const adjustedDaily = totalWorkDaysPerYear > 0 ? annualSalary / totalWorkDaysPerYear : 0;
        
        const adjustedWeekly = adjustedDaily * values.daysPerWeek;
        const adjustedAnnual = adjustedWeekly * 52;

        const adjusted = {
            annual: adjustedAnnual,
            quarterly: adjustedAnnual / 4,
            monthly: adjustedAnnual / 12,
            semiMonthly: adjustedAnnual / 24,
            biWeekly: adjustedAnnual / 26,
            weekly: adjustedWeekly,
            daily: adjustedDaily,
            hourly: adjustedHourly,
        };
        
        setResult({ unadjusted, adjusted });
    };

    const resultRows = [
        { label: 'Annual', key: 'annual' },
        { label: 'Quarterly', key: 'quarterly' },
        { label: 'Monthly', key: 'monthly' },
        { label: 'Semi-monthly', key: 'semiMonthly' },
        { label: 'Bi-weekly', key: 'biWeekly' },
        { label: 'Weekly', key: 'weekly' },
        { label: 'Daily', key: 'daily' },
        { label: 'Hourly', key: 'hourly' },
    ];


    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Salary Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="amount" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Salary Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="frequency" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Per</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="hour">Hour</SelectItem>
                                                    <SelectItem value="day">Day</SelectItem>
                                                    <SelectItem value="week">Week</SelectItem>
                                                    <SelectItem value="month">Month</SelectItem>
                                                    <SelectItem value="year">Year</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="hoursPerWeek" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Hours per Week</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="daysPerWeek" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Days per Week</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="holidaysPerYear" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Holidays per Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="vacationDaysPerYear" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Vacation Days per Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                                <Button type="submit" className="w-full">Calculate</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                {result && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Salary Breakdown</CardTitle>
                            <CardDescription>Comparison of salary based on standard work year versus a year adjusted for holidays and vacation days.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead className="text-right">Unadjusted</TableHead>
                                        <TableHead className="text-right">Adjusted for Holidays/Vacation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {resultRows.map(row => (
                                        <TableRow key={row.key}>
                                            <TableCell className="font-medium">{row.label}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(result.unadjusted[row.key as keyof typeof result.unadjusted])}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(result.adjusted[row.key as keyof typeof result.adjusted])}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default SalaryCalculator;