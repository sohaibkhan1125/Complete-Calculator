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
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formSchema = z.object({
  loanAmount: z.coerce.number().min(1, "Loan amount is required."),
  loanTermYears: z.coerce.number().min(0).default(3),
  loanTermMonths: z.coerce.number().min(0).default(0),
  monthlyPayment: z.coerce.number().min(1, "Monthly payment is required."),
}).refine(data => data.loanTermYears > 0 || data.loanTermMonths > 0, {
  message: "Loan term must be greater than 0.",
  path: ["loanTermYears"],
});

type FormData = z.infer<typeof formSchema>;
type AmortizationData = { month: number; year: number; interest: number; principal: number; balance: number };
type CalculationResult = {
  interestRate: number;
  totalPayment: number;
  totalInterest: number;
  amortizationData: AmortizationData[];
};

const InterestRateCalculator = () => {
    const [result, setResult] = useState<CalculationResult | null>(null);
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            loanAmount: 32000,
            loanTermYears: 3,
            loanTermMonths: 0,
            monthlyPayment: 960,
        },
    });

    // Function to calculate interest rate using Newton-Raphson method or a binary search
    const calculateRate = (loanAmount: number, numberOfMonths: number, monthlyPayment: number) => {
        let high = 1; // 100%
        let low = 0;
        let mid = 0.5;
        
        // Check if payment is sufficient
        if (loanAmount / numberOfMonths >= monthlyPayment) {
            return NaN; // Payment is not even enough to cover principal
        }

        for (let i = 0; i < 100; i++) { // Limit iterations to 100
            mid = (high + low) / 2;
            const guess = loanAmount * mid * Math.pow((1 + mid), numberOfMonths) / (Math.pow((1 + mid), numberOfMonths) - 1);
            if (Math.abs(guess - monthlyPayment) < 0.0001) { // Precision threshold
                return mid * 12 * 100;
            } else if (guess > monthlyPayment) {
                high = mid;
            } else {
                low = mid;
            }
        }
        return mid * 12 * 100; // Return best guess after iterations
    };

    const onSubmit = (values: FormData) => {
        const { loanAmount, loanTermYears, loanTermMonths, monthlyPayment } = values;
        const numberOfMonths = loanTermYears * 12 + loanTermMonths;

        const calculatedRate = calculateRate(loanAmount, numberOfMonths, monthlyPayment);

        if (isNaN(calculatedRate)) {
            toast({
                variant: "destructive",
                title: "Calculation Error",
                description: "The monthly payment is not sufficient to cover the loan amount over the specified term. Please increase the payment or extend the term.",
            });
            setResult(null);
            console.error("Payment is not sufficient to cover the loan.");
            return;
        }

        const monthlyInterestRate = (calculatedRate / 100) / 12;
        const totalPayment = monthlyPayment * numberOfMonths;
        const totalInterest = totalPayment - loanAmount;

        let balance = loanAmount;
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
            interestRate: calculatedRate,
            totalPayment,
            totalInterest,
            amortizationData,
        });
    };

    const balanceChartData = useMemo(() => {
        if (!result) return [];
        return result.amortizationData.map(item => ({
            name: `Month ${item.month}`,
            Balance: item.balance,
            "Interest Paid": item.interest,
        }));
    }, [result]);
    
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
                                <FormField name="monthlyPayment" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Monthly Payment</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <Button type="submit" className="w-full">Calculate Interest Rate</Button>
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
                        <CardHeader className="text-center">
                            <CardTitle>Calculated Results</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-muted-foreground">Annual Interest Rate</p>
                                <p className="text-3xl font-bold text-primary">{result.interestRate.toFixed(3)}%</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Total Payments</p>
                                <p className="text-3xl font-bold text-primary">{formatCurrency(result.totalPayment)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Total Interest</p>
                                <p className="text-3xl font-bold text-primary">{formatCurrency(result.totalInterest)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Loan Amortization Graph</CardTitle></CardHeader>
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
                                        <Bar dataKey="Balance" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={10} />
                                        <Bar dataKey="Interest Paid" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={10} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Amortization Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <Table>
                                    <TableHeader><TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead className="text-right">Principal</TableHead>
                                        <TableHead className="text-right">Interest</TableHead>
                                        <TableHead className="text-right">Ending Balance</TableHead>
                                    </TableRow></TableHeader>
                                    <TableBody>
                                        {result.amortizationData.map(row => (
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

export default InterestRateCalculator;
