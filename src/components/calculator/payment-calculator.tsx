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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ChevronsUpDown, Printer, Save } from "lucide-react";
import Link from "next/link";

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const fixedTermSchema = z.object({
  loanAmount: z.coerce.number().min(1, "Loan amount is required."),
  loanTermYears: z.coerce.number().min(0, "Loan term is required.").default(15),
  interestRate: z.coerce.number().min(0, "Interest rate is required.").default(6),
});

const fixedPaymentSchema = z.object({
  loanAmount: z.coerce.number().min(1, "Loan amount is required."),
  monthlyPayment: z.coerce.number().min(1, "Monthly payment is required."),
  interestRate: z.coerce.number().min(0, "Interest rate is required."),
});

type AmortizationData = { year: number; month: number; date: string; interest: number; principal: number; balance: number };
type FixedTermResult = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortizationData: AmortizationData[];
};

type FixedPaymentResult = {
  totalMonths: number;
  totalYears: number;
  remainingMonths: number;
  totalPayment: number;
  totalInterest: number;
  amortizationData: AmortizationData[];
};

const pieChartConfig = {
    principal: { label: "Principal", color: "hsl(var(--chart-1))" },
    interest: { label: "Interest", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;


export default function PaymentCalculator() {
  const [activeTab, setActiveTab] = useState("fixed-term");
  const [fixedTermResult, setFixedTermResult] = useState<FixedTermResult | null>(null);
  const [fixedPaymentResult, setFixedPaymentResult] = useState<FixedPaymentResult | null>(null);
  const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');

  const fixedTermForm = useForm<z.infer<typeof fixedTermSchema>>({
    resolver: zodResolver(fixedTermSchema),
    defaultValues: { loanAmount: 200000, loanTermYears: 15, interestRate: 6 },
  });

  const fixedPaymentForm = useForm<z.infer<typeof fixedPaymentSchema>>({
    resolver: zodResolver(fixedPaymentSchema),
    defaultValues: { loanAmount: 200000, monthlyPayment: 1700, interestRate: 6 },
  });

  function onFixedTermSubmit(values: z.infer<typeof fixedTermSchema>) {
    const principal = values.loanAmount;
    const monthlyInterestRate = values.interestRate / 100 / 12;
    const numberOfPayments = values.loanTermYears * 12;

    if (numberOfPayments === 0) return;

    const monthlyPayment = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    let balance = principal;
    const amortizationData: AmortizationData[] = [];
    for (let i = 0; i < numberOfPayments; i++) {
        const interestForMonth = balance * monthlyInterestRate;
        const principalForMonth = monthlyPayment - interestForMonth;
        balance -= principalForMonth;
        amortizationData.push({
            year: Math.floor(i / 12) + 1,
            month: (i % 12) + 1,
            date: `Month ${i+1}`,
            interest: interestForMonth,
            principal: principalForMonth,
            balance: balance < 0 ? 0 : balance,
        });
    }

    setFixedTermResult({ monthlyPayment, totalPayment, totalInterest, amortizationData });
    setFixedPaymentResult(null);
  }

  function onFixedPaymentSubmit(values: z.infer<typeof fixedPaymentSchema>) {
    const principal = values.loanAmount;
    const monthlyInterestRate = values.interestRate / 100 / 12;
    const monthlyPayment = values.monthlyPayment;

    if (monthlyPayment <= principal * monthlyInterestRate) {
        // Handle case where payment doesn't cover interest
        alert("Monthly payment is too low to cover interest. Loan will never be paid off.");
        return;
    }

    const totalMonths = -(Math.log(1 - (principal * monthlyInterestRate) / monthlyPayment) / Math.log(1 + monthlyInterestRate));
    const totalYears = Math.floor(totalMonths / 12);
    const remainingMonths = Math.ceil(totalMonths % 12);

    const totalPayment = monthlyPayment * Math.ceil(totalMonths);
    const totalInterest = totalPayment - principal;

    let balance = principal;
    const amortizationData: AmortizationData[] = [];
    for (let i = 0; i < Math.ceil(totalMonths); i++) {
        const interestForMonth = balance * monthlyInterestRate;
        const principalForMonth = monthlyPayment - interestForMonth;
        balance -= principalForMonth;
        if(balance < 0) {
            const lastPrincipal = principalForMonth + balance;
            balance = 0;
             amortizationData.push({ year: Math.floor(i / 12) + 1, month: (i % 12) + 1, date: `Month ${i+1}`, interest: interestForMonth, principal: lastPrincipal, balance });
            break;
        }
        amortizationData.push({ year: Math.floor(i / 12) + 1, month: (i % 12) + 1, date: `Month ${i+1}`, interest: interestForMonth, principal: principalForMonth, balance });
    }

    setFixedPaymentResult({ totalMonths: Math.ceil(totalMonths), totalYears, remainingMonths, totalPayment, totalInterest, amortizationData });
    setFixedTermResult(null);
  }
  
  const currentResult = activeTab === 'fixed-term' ? fixedTermResult : fixedPaymentResult;
  const currentLoanAmount = activeTab === 'fixed-term' ? fixedTermForm.getValues('loanAmount') : fixedPaymentForm.getValues('loanAmount');

  const pieChartData = useMemo(() => {
    if (!currentResult) return [];
    return [
        { name: 'Principal', value: currentLoanAmount, fill: 'hsl(var(--chart-1))' },
        { name: 'Interest', value: currentResult.totalInterest, fill: 'hsl(var(--chart-2))' }
    ];
  }, [currentResult, currentLoanAmount]);

  const annualAmortization = useMemo(() => {
    if (!currentResult) return [];
    return currentResult.amortizationData.reduce((acc, curr) => {
        const yearData = acc.find(d => d.year === curr.year);
        if (yearData) {
            yearData.interest += curr.interest;
            yearData.principal += curr.principal;
            yearData.balance = curr.balance;
        } else {
            acc.push({ year: curr.year, interest: curr.interest, principal: curr.principal, balance: curr.balance });
        }
        return acc;
    }, [] as { year: number; interest: number; principal: number; balance: number }[]);
  }, [currentResult]);

  const growthChartData = useMemo(() => {
    if (!annualAmortization.length) return [];
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;
    return annualAmortization.map(row => {
        cumulativePrincipal += row.principal;
        cumulativeInterest += row.interest;
        return {
            name: `Year ${row.year}`,
            balance: row.balance,
            principal: cumulativePrincipal,
            interest: cumulativeInterest
        };
    });
  }, [annualAmortization]);

  const handlePrint = () => {
      window.print();
  }

  const renderResults = () => {
    if (!currentResult) {
        return (
             <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                 <CardHeader><CardTitle>Your Loan Details</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
             </Card>
        );
    }
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-2">
                        {fixedTermResult && (
                             <div className="flex justify-between font-bold text-lg"><span>Monthly Payment</span><span className="text-primary">{formatCurrency(fixedTermResult.monthlyPayment)}</span></div>
                        )}
                        {fixedPaymentResult && (
                            <div className="flex justify-between font-bold text-lg">
                                <span>Payoff Time</span>
                                <span className="text-primary">{fixedPaymentResult.totalYears} years, {fixedPaymentResult.remainingMonths} months</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm"><span>Total of All Payments</span> <strong>{formatCurrency(currentResult.totalPayment)}</strong></div>
                        <div className="flex justify-between text-sm"><span>Total Interest Paid</span> <strong>{formatCurrency(currentResult.totalInterest)}</strong></div>
                    </div>
                    <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {pieChartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.fill} />)}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name"/>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Amortization Chart</CardTitle></CardHeader>
                <CardContent>
                     <ChartContainer config={{}} className="w-full h-80">
                        <ResponsiveContainer>
                            <BarChart data={growthChartData}>
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
                                                    <p className="text-sm text-chart-1">Principal Paid: {formatCurrency(payload[0].payload.principal)}</p>
                                                    <p className="text-sm text-chart-2">Interest Paid: {formatCurrency(payload[0].payload.interest)}</p>
                                                    <p className="text-sm text-chart-3">Balance: {formatCurrency(payload[0].payload.balance)}</p>
                                                </div>
                                            )
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="principal" name="Principal Paid" fill="hsl(var(--chart-1))" stackId="a" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="interest" name="Interest Paid" fill="hsl(var(--chart-2))" stackId="a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Amortization Schedule</CardTitle>
                    <div className="flex items-center space-x-2">
                       <Button variant={scheduleView === 'annual' ? 'default' : 'outline'} size="sm" onClick={() => setScheduleView('annual')}>Annual</Button>
                       <Button variant={scheduleView === 'monthly' ? 'default' : 'outline'} size="sm" onClick={() => setScheduleView('monthly')}>Monthly</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96">
                        <Table>
                            <TableHeader className="sticky top-0 bg-secondary">
                                <TableRow>
                                    <TableHead>{scheduleView === 'annual' ? 'Year' : 'Month'}</TableHead>
                                    <TableHead className="text-right">Principal Paid</TableHead>
                                    <TableHead className="text-right">Interest Paid</TableHead>
                                    <TableHead className="text-right">Ending Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scheduleView === 'annual' ? (
                                    annualAmortization.map((row) => (
                                        <TableRow key={row.year}>
                                            <TableCell>{row.year}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(row.principal)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(row.interest)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    currentResult.amortizationData.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.month}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(row.principal)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(row.interest)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
            <div className="flex flex-col sm:flex-row gap-4">
                 <Button className="w-full" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Schedule</Button>
                 <Button variant="secondary" className="w-full" disabled><Save className="mr-2 h-4 w-4" /> Save Calculation</Button>
             </div>
             <div className="text-sm text-center text-muted-foreground space-y-2">
                 <p>For more specific calculations, check out our other tools:</p>
                 <div className="flex justify-center gap-4">
                     <Button variant="link" asChild><Link href="/auto-loan-calculator">Auto Loan Calculator</Link></Button>
                     <Button variant="link" asChild><Link href="/mortgage-calculator">Mortgage Calculator</Link></Button>
                 </div>
             </div>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fixed-term">Fixed Term</TabsTrigger>
                <TabsTrigger value="fixed-payment">Fixed Payments</TabsTrigger>
              </TabsList>
              <TabsContent value="fixed-term">
                <Card>
                  <CardHeader>
                    <CardTitle>Calculate Monthly Payment</CardTitle>
                    <CardDescription>Enter your loan details to find out your monthly payment.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...fixedTermForm}>
                      <form onSubmit={fixedTermForm.handleSubmit(onFixedTermSubmit)} className="space-y-6">
                        <FormField control={fixedTermForm.control} name="loanAmount" render={({ field }) => (
                          <FormItem><FormLabel>Loan Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={fixedTermForm.control} name="loanTermYears" render={({ field }) => (
                          <FormItem><FormLabel>Loan Term (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={fixedTermForm.control} name="interestRate" render={({ field }) => (
                          <FormItem><FormLabel>Interest Rate (% Annual)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" className="w-full">Calculate</Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="fixed-payment">
                 <Card>
                  <CardHeader>
                    <CardTitle>Calculate Loan Term</CardTitle>
                    <CardDescription>Enter your desired monthly payment to find out how long it will take to pay off your loan.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...fixedPaymentForm}>
                      <form onSubmit={fixedPaymentForm.handleSubmit(onFixedPaymentSubmit)} className="space-y-6">
                        <FormField control={fixedPaymentForm.control} name="loanAmount" render={({ field }) => (
                           <FormItem><FormLabel>Loan Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={fixedPaymentForm.control} name="monthlyPayment" render={({ field }) => (
                           <FormItem><FormLabel>Monthly Payment</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={fixedPaymentForm.control} name="interestRate" render={({ field }) => (
                           <FormItem><FormLabel>Interest Rate (% Annual)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" className="w-full">Calculate</Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        </div>
        <div className="lg:col-span-3">
            {renderResults()}
        </div>
    </div>
  );
}
