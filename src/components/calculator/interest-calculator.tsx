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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronsUpDown } from "lucide-react";

const formSchema = z.object({
  initialInvestment: z.coerce.number().min(0, "Initial investment is required."),
  annualContribution: z.coerce.number().min(0),
  monthlyContribution: z.coerce.number().min(0),
  contributionTiming: z.enum(["start", "end"]),
  interestRate: z.coerce.number().min(0, "Interest rate is required."),
  compoundingFrequency: z.coerce.number().min(1),
  investmentLengthYears: z.coerce.number().min(0),
  investmentLengthMonths: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100),
  inflationRate: z.coerce.number().min(0).max(100),
}).refine(data => data.investmentLengthYears > 0 || data.investmentLengthMonths > 0, {
  message: "Investment length must be greater than 0.",
  path: ["investmentLengthYears"],
});

type FormData = z.infer<typeof formSchema>;
type AccumulationData = {
    period: number;
    year: number;
    deposit: number;
    interest: number;
    endingBalance: number;
};
type CalculationResult = {
  endingBalance: number;
  totalPrincipal: number;
  totalContributions: number;
  totalInterest: number;
  interestOnInitial: number;
  interestOnContributions: number;
  buyingPower: number;
  accumulationData: AccumulationData[];
};

const pieChartConfig = {
    initialInvestment: { label: "Initial Investment", color: "hsl(var(--chart-1))" },
    contributions: { label: "Contributions", color: "hsl(var(--chart-2))" },
    interest: { label: "Interest", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const InterestCalculator = () => {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            initialInvestment: 20000,
            annualContribution: 5000,
            monthlyContribution: 0,
            contributionTiming: "end",
            interestRate: 5,
            compoundingFrequency: 1,
            investmentLengthYears: 5,
            investmentLengthMonths: 0,
            taxRate: 0,
            inflationRate: 3,
        },
    });

    const onSubmit = (values: FormData) => {
        const {
            initialInvestment, annualContribution, monthlyContribution, contributionTiming,
            interestRate, compoundingFrequency, investmentLengthYears, investmentLengthMonths,
            taxRate, inflationRate
        } = values;

        const totalMonths = investmentLengthYears * 12 + investmentLengthMonths;
        const totalPeriods = Math.floor(totalMonths / (12 / compoundingFrequency));
        const ratePerPeriod = interestRate / 100 / compoundingFrequency;
        const taxRateDecimal = taxRate / 100;

        let balance = initialInvestment;
        let totalInterest = 0;
        let totalContributions = 0;
        let interestOnInitial = 0;
        let interestOnContributions = 0;

        const accumulationData: AccumulationData[] = [];
        let runningContributions = 0;

        for (let i = 1; i <= totalPeriods; i++) {
            const periodContribution = (annualContribution / compoundingFrequency) + (monthlyContribution * (12 / compoundingFrequency));
            
            let interestEarned = 0;
            if (contributionTiming === 'start') {
                balance += periodContribution;
                runningContributions += periodContribution;
                interestEarned = balance * ratePerPeriod;
            } else { // end of period
                interestEarned = balance * ratePerPeriod;
                balance += periodContribution;
                runningContributions += periodContribution;
            }

            const taxOnInterest = interestEarned * taxRateDecimal;
            const netInterest = interestEarned - taxOnInterest;
            
            const interestRatioInitial = (initialInvestment + interestOnInitial) / balance;
            const periodInterestOnInitial = netInterest * interestRatioInitial;
            const periodInterestOnContributions = netInterest * (1 - interestRatioInitial);

            interestOnInitial += periodInterestOnInitial;
            interestOnContributions += periodInterestOnContributions;

            balance += netInterest;
            totalInterest += netInterest;
            totalContributions += periodContribution;
            
            accumulationData.push({
                period: i,
                year: Math.ceil(i / compoundingFrequency),
                deposit: periodContribution,
                interest: netInterest,
                endingBalance: balance
            });
        }
        
        const totalPrincipal = initialInvestment + totalContributions;
        const totalYears = totalMonths / 12;
        const buyingPower = balance / Math.pow(1 + inflationRate / 100, totalYears);

        setResult({
            endingBalance: balance,
            totalPrincipal,
            totalContributions,
            totalInterest,
            interestOnInitial,
            interestOnContributions,
            buyingPower,
            accumulationData
        });
    };
    
    const pieChartData = useMemo(() => {
        if (!result) return [];
        return [
            { name: 'Initial Investment', value: form.getValues('initialInvestment'), fill: 'hsl(var(--chart-1))' },
            { name: 'Contributions', value: result.totalContributions, fill: 'hsl(var(--chart-2))' },
            { name: 'Interest', value: result.totalInterest, fill: 'hsl(var(--chart-3))' }
        ];
    }, [result, form]);

    const growthChartData = useMemo(() => {
        if (!result) return [];
        
        const yearlyData: {[key: number]: {year: number, principal: number, interest: number, balance: number}} = {};

        result.accumulationData.forEach(d => {
            if (!yearlyData[d.year]) {
                const prevYearBalance = yearlyData[d.year - 1]?.balance || form.getValues('initialInvestment');
                yearlyData[d.year] = { year: d.year, principal: prevYearBalance + d.deposit, interest: d.interest, balance: d.endingBalance };
            } else {
                 yearlyData[d.year].principal += d.deposit;
                 yearlyData[d.year].interest += d.interest;
                 yearlyData[d.year].balance = d.endingBalance;
            }
        });

        return Object.values(yearlyData).map(y => ({
            name: `Year ${y.year}`,
            principal: y.principal - y.interest, // show principal base for the year
            interest: y.interest
        }));
    }, [result, form]);

    const annualSchedule = useMemo(() => {
        if (!result) return [];
        const annual: Omit<AccumulationData, "period">[] = [];
        result.accumulationData.forEach(d => {
            const yearData = annual.find(a => a.year === d.year);
            if(yearData) {
                yearData.deposit += d.deposit;
                yearData.interest += d.interest;
                yearData.endingBalance = d.endingBalance;
            } else {
                annual.push({
                    year: d.year,
                    deposit: d.deposit,
                    interest: d.interest,
                    endingBalance: d.endingBalance
                });
            }
        });
        return annual;
    }, [result]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Calculator Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField name="initialInvestment" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Initial Investment</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="annualContribution" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Annual Contribution</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="monthlyContribution" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Monthly Contribution</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                                <FormField name="contributionTiming" control={form.control} render={({ field }) => (
                                    <FormItem className="space-y-3"><FormLabel>Contribution Timing</FormLabel>
                                        <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="end" /></FormControl><FormLabel className="font-normal">End of Period</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="start" /></FormControl><FormLabel className="font-normal">Start of Period</FormLabel></FormItem>
                                        </RadioGroup>
                                        </FormControl><FormMessage />
                                    </FormItem>
                                )}/>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="interestRate" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Interest Rate (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="compoundingFrequency" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Compounding</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="365">Daily</SelectItem>
                                                <SelectItem value="12">Monthly</SelectItem>
                                                <SelectItem value="4">Quarterly</SelectItem>
                                                <SelectItem value="2">Semi-Annually</SelectItem>
                                                <SelectItem value="1">Annually</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="investmentLengthYears" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Length (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="investmentLengthMonths" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Length (Months)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <FormField name="taxRate" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Tax Rate on Interest (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                     <FormField name="inflationRate" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Inflation Rate (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                                <Button type="submit" className="w-full">Calculate</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3 space-y-8">
                 {!result ? (
                     <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                         <CardHeader><CardTitle>Your Investment Summary</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                         <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                     </Card>
                ) : (
                    <>
                    <Card>
                        <CardHeader><CardTitle>Results Summary</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <div className="text-center">
                                    <p className="text-muted-foreground">Ending Balance</p>
                                    <p className="text-4xl font-bold text-primary">{formatCurrency(result.endingBalance)}</p>
                                </div>
                                <div className="space-y-2 text-sm">
                                     <div className="flex justify-between"><span>Total Principal</span><strong>{formatCurrency(result.totalPrincipal)}</strong></div>
                                     <div className="flex justify-between"><span>Total Contributions</span><strong>{formatCurrency(result.totalContributions)}</strong></div>
                                     <div className="flex justify-between"><span>Total Interest Earned</span><strong>{formatCurrency(result.totalInterest)}</strong></div>
                                     <div className="flex justify-between pl-4 text-xs"><span>On Initial Investment</span><strong>{formatCurrency(result.interestOnInitial)}</strong></div>
                                     <div className="flex justify-between pl-4 text-xs"><span>On Contributions</span><strong>{formatCurrency(result.interestOnContributions)}</strong></div>
                                     <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Buying Power (After Inflation)</span><strong>{formatCurrency(result.buyingPower)}</strong></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-center">Investment Composition</h3>
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
                        <CardHeader><CardTitle>Growth Over Time</CardTitle></CardHeader>
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
                                                            <p className="text-sm text-chart-1">Principal: {formatCurrency(payload[0].value as number)}</p>
                                                            <p className="text-sm text-chart-2">Interest: {formatCurrency(payload[1].value as number)}</p>
                                                        </div>
                                                    )
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="principal" fill="hsl(var(--chart-1))" stackId="a" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="interest" fill="hsl(var(--chart-2))" stackId="a" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Accumulation Schedule</CardTitle></CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Year</TableHead><TableHead className="text-right">Deposit</TableHead><TableHead className="text-right">Interest</TableHead><TableHead className="text-right">Ending Balance</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {annualSchedule.map(row => (
                                            <TableRow key={row.year}>
                                                <TableCell>{row.year}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.deposit)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.interest)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.endingBalance)}</TableCell>
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

export default InterestCalculator;
