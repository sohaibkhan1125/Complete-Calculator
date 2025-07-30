"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
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
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const formSchema = z.object({
    autoPrice: z.coerce.number().min(0, "Auto price is required."),
    loanTerm: z.coerce.number().min(1, "Loan term is required."),
    interestRate: z.coerce.number().min(0, "Interest rate is required."),
    cashIncentives: z.coerce.number().min(0),
    downPayment: z.coerce.number().min(0),
    tradeInValue: z.coerce.number().min(0),
    amountOwedOnTradeIn: z.coerce.number().min(0),
    state: z.string().min(1, "State is required."),
    salesTax: z.coerce.number().min(0),
    otherFees: z.coerce.number().min(0),
});

type FormData = z.infer<typeof formSchema>;
type AmortizationData = { month: number; interest: number; principal: number; balance: number };
type CalculationResult = {
    monthlyPayment: number;
    totalLoanAmount: number;
    salesTaxAmount: number;
    upfrontPayment: number;
    totalLoanPayments: number;
    totalInterest: number;
    totalCost: number;
    amortizationData: AmortizationData[];
};

const chartConfig = {
    principal: { label: "Principal", color: "hsl(var(--chart-1))" },
    interest: { label: "Interest", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const AutoLoanCalculator = () => {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            autoPrice: 50000,
            loanTerm: 60,
            interestRate: 5,
            cashIncentives: 0,
            downPayment: 10000,
            tradeInValue: 0,
            amountOwedOnTradeIn: 0,
            state: "California",
            salesTax: 7,
            otherFees: 2000,
        },
    });

    const onSubmit = (values: FormData) => {
        const taxableAmount = values.autoPrice - values.tradeInValue;
        const salesTaxAmount = taxableAmount > 0 ? taxableAmount * (values.salesTax / 100) : 0;
        
        const upfrontPayment = values.downPayment + values.tradeInValue - values.amountOwedOnTradeIn - values.cashIncentives;
        
        const totalLoanAmount = values.autoPrice + salesTaxAmount + values.otherFees - upfrontPayment;

        if (totalLoanAmount <= 0) {
            setResult(null);
            // Maybe show a toast or message that no loan is needed
            return;
        }

        const monthlyInterestRate = values.interestRate / 100 / 12;
        const numberOfPayments = values.loanTerm;

        const monthlyPayment = (totalLoanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
        
        const totalLoanPayments = monthlyPayment * numberOfPayments;
        const totalInterest = totalLoanPayments - totalLoanAmount;
        const totalCost = values.autoPrice + totalInterest + salesTaxAmount + values.otherFees;
        
        let balance = totalLoanAmount;
        const amortizationData: AmortizationData[] = [];
        for (let i = 1; i <= numberOfPayments; i++) {
            const interestForMonth = balance * monthlyInterestRate;
            const principalForMonth = monthlyPayment - interestForMonth;
            balance -= principalForMonth;
            amortizationData.push({
                month: i,
                interest: interestForMonth,
                principal: principalForMonth,
                balance: balance < 0 ? 0 : balance,
            });
        }
        
        setResult({
            monthlyPayment,
            totalLoanAmount,
            salesTaxAmount,
            upfrontPayment,
            totalLoanPayments,
            totalInterest,
            totalCost,
            amortizationData,
        });
    };
    
    const pieChartData = useMemo(() => {
        if (!result) return [];
        return [
            { name: 'Principal', value: result.totalLoanAmount, fill: 'hsl(var(--chart-1))' },
            { name: 'Interest', value: result.totalInterest, fill: 'hsl(var(--chart-2))' }
        ];
    }, [result]);

    return (
        <TooltipProvider>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Loan Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField name="autoPrice" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Auto Price</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <FormField name="loanTerm" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Loan Term (months)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                     <FormField name="interestRate" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Interest Rate (%)</FormLabel>
                                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                 </div>
                                <FormField name="downPayment" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Down Payment</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <FormField name="tradeInValue" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Trade-in Value</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                     <FormField name="amountOwedOnTradeIn" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Owed on Trade-in</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                 <FormField name="cashIncentives" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cash Incentives</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="state" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a state" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField name="salesTax" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sales Tax (%)</FormLabel>
                                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                <FormField name="otherFees" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center">
                                            Title, Registration, Fees
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 ml-1.5 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Includes dealer fees, documentation fees, etc.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
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
                         <CardHeader>
                             <CardTitle>Your Loan Summary</CardTitle>
                             <CardDescription>Results will appear here after calculation.</CardDescription>
                         </CardHeader>
                     </Card>
                ) : (
                    <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Loan Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Monthly Payment</span>
                                    <span className="text-primary">{formatCurrency(result.monthlyPayment)}</span>
                                </div>
                                <div className="flex justify-between text-sm"><span>Total Loan Amount</span> <strong>{formatCurrency(result.totalLoanAmount)}</strong></div>
                                <div className="flex justify-between text-sm"><span>Sales Tax</span> <strong>{formatCurrency(result.salesTaxAmount)}</strong></div>
                                <div className="flex justify-between text-sm"><span>Upfront Payment</span> <strong>{formatCurrency(result.upfrontPayment)}</strong></div>
                                <div className="flex justify-between text-sm"><span>Total of {form.getValues('loanTerm')} Payments</span> <strong>{formatCurrency(result.totalLoanPayments)}</strong></div>
                                <div className="flex justify-between text-sm"><span>Total Interest</span> <strong>{formatCurrency(result.totalInterest)}</strong></div>
                                <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2"><span>Total Cost</span> <strong>{formatCurrency(result.totalCost)}</strong></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-center">Principal vs. Interest</h3>
                                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-64">
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
                        <CardHeader>
                            <CardTitle>Amortization Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Month</TableHead>
                                            <TableHead className="text-right">Principal</TableHead>
                                            <TableHead className="text-right">Interest</TableHead>
                                            <TableHead className="text-right">Remaining Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
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
        </TooltipProvider>
    );
};

export default AutoLoanCalculator;
