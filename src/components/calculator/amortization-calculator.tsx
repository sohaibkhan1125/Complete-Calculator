"use client";

import { useState, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronsUpDown, Printer } from "lucide-react";

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formSchema = z.object({
  loanAmount: z.coerce.number().min(1, "Loan amount is required."),
  loanTermYears: z.coerce.number().min(0).default(15),
  loanTermMonths: z.coerce.number().min(0).default(0),
  interestRate: z.coerce.number().min(0, "Interest rate is required.").default(6),
}).refine(data => data.loanTermYears > 0 || data.loanTermMonths > 0, {
  message: "Loan term must be greater than 0.",
  path: ["loanTermYears"],
});

type FormData = z.infer<typeof formSchema>;
type AmortizationData = { month: number; year: number; interest: number; principal: number; balance: number };
type CalculationResult = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortizationData: AmortizationData[];
};

const pieChartConfig = {
    principal: { label: "Principal", color: "hsl(var(--chart-1))" },
    interest: { label: "Interest", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const AmortizationCalculator = () => {
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            loanAmount: 200000,
            loanTermYears: 15,
            loanTermMonths: 0,
            interestRate: 6,
        },
    });

    const onSubmit = (values: FormData) => {
        const principal = values.loanAmount;
        const monthlyInterestRate = values.interestRate / 100 / 12;
        const numberOfMonths = values.loanTermYears * 12 + values.loanTermMonths;
    
        if (numberOfMonths === 0) return;
    
        const monthlyPayment = (principal * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfMonths));
        const totalPayment = monthlyPayment * numberOfMonths;
        const totalInterest = totalPayment - principal;
    
        let balance = principal;
        const amortizationData: AmortizationData[] = [];
        for (let i = 1; i <= numberOfMonths; i++) {
            const interestPaid = balance * monthlyInterestRate;
            const principalPaid = monthlyPayment - interestPaid;
            balance -= principalPaid;
            amortizationData.push({ 
                month: i,
                year: Math.floor((i - 1) / 12) + 1,
                principal: principalPaid, 
                interest: interestPaid, 
                balance: balance < 0 ? 0 : balance 
            });
        }
        
        setResult({
            monthlyPayment,
            totalPayment,
            totalInterest,
            amortizationData,
        });
    };
    
    const pieChartData = useMemo(() => {
        if (!result) return [];
        return [
            { name: 'Principal', value: form.getValues('loanAmount'), fill: 'hsl(var(--chart-1))' },
            { name: 'Interest', value: result.totalInterest, fill: 'hsl(var(--chart-2))' }
        ];
    }, [result, form]);

    const annualSchedule = useMemo(() => {
        if (!result) return [];
        const annual: { year: number; interest: number; principal: number; balance: number }[] = [];
        result.amortizationData.forEach(d => {
            const yearData = annual.find(a => a.year === d.year);
            if(yearData) {
                yearData.interest += d.interest;
                yearData.principal += d.principal;
                yearData.balance = d.balance;
            } else {
                annual.push({
                    year: d.year,
                    principal: d.principal,
                    interest: d.interest,
                    balance: d.balance
                });
            }
        });
        return annual;
    }, [result]);

    const balanceChartData = useMemo(() => {
        if (!result) return [];
        return annualSchedule.map(item => ({
            name: `Year ${item.year}`,
            Balance: item.balance,
            "Interest Paid": item.interest,
        }));
    }, [annualSchedule, result]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Loan Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField name="loanAmount" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Loan Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormLabel>Loan Term</FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="loanTermYears" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Years</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="loanTermMonths" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Months</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                                <FormField name="interestRate" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Annual Interest Rate (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <Button type="submit" className="w-full">Calculate</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3 space-y-8">
                 {!result ? (
                     <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                         <CardHeader><CardTitle>Your Loan Summary</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                         <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                     </Card>
                ) : (
                    <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Results Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="text-center">
                                    <p className="text-muted-foreground">Monthly Payment</p>
                                    <p className="text-4xl font-bold text-primary">{formatCurrency(result.monthlyPayment)}</p>
                                </div>
                                <div className="space-y-2 text-sm">
                                     <div className="flex justify-between"><span>Total Principal</span><strong>{formatCurrency(form.getValues('loanAmount'))}</strong></div>
                                     <div className="flex justify-between"><span>Total Interest</span><strong>{formatCurrency(result.totalInterest)}</strong></div>
                                     <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total Payments</span><strong>{formatCurrency(result.totalPayment)}</strong></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-center">Principal vs. Interest</h3>
                                <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                            <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {pieChartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.fill} />)}
                                            </Pie>
                                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Loan Balance Over Time</CardTitle></CardHeader>
                        <CardContent>
                             <ChartContainer config={{}} className="w-full h-80">
                                <ResponsiveContainer>
                                    <BarChart data={balanceChartData}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                        <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                                        <RechartsTooltip 
                                            cursor={{ fill: 'hsl(var(--muted))' }} 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="p-2 bg-background border rounded-lg shadow-sm">
                                                            <p className="font-bold">{payload[0].payload.name}</p>
                                                            <p className="text-sm text-chart-1">Balance: {formatCurrency(payload[0].value as number)}</p>
                                                            <p className="text-sm text-chart-2">Interest Paid: {formatCurrency(payload[1].value as number)}</p>
                                                        </div>
                                                    )
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="Balance" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Interest Paid" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Amortization Schedule</CardTitle>
                            <div className="flex items-center space-x-2">
                               <Button variant={scheduleView === 'annual' ? 'default' : 'outline'} size="sm" onClick={() => setScheduleView('annual')}>Annual</Button>
                               <Button variant={scheduleView === 'monthly' ? 'default' : 'outline'} size="sm" onClick={() => setScheduleView('monthly')}>Monthly</Button>
                               <Button variant="outline" size="icon" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <Table>
                                    <TableHeader><TableRow>
                                        <TableHead>{scheduleView === 'annual' ? 'Year' : 'Month'}</TableHead>
                                        <TableHead className="text-right">Principal</TableHead>
                                        <TableHead className="text-right">Interest</TableHead>
                                        <TableHead className="text-right">Ending Balance</TableHead>
                                    </TableRow></TableHeader>
                                    <TableBody>
                                        {scheduleView === 'annual' ? annualSchedule.map(row => (
                                            <TableRow key={row.year}>
                                                <TableCell>{row.year}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.principal)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.interest)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                                            </TableRow>
                                        )) : result.amortizationData.map(row => (
                                            <TableRow key={row.month}>
                                                <TableCell>{row.month}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.principal)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.interest)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default AmortizationCalculator;
