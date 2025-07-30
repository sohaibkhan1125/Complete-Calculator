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
  startingAmount: z.coerce.number().min(0, "Starting amount is required."),
  additionalContribution: z.coerce.number().min(0),
  contributionFrequency: z.enum(["start", "end"]),
  returnRate: z.coerce.number().min(0, "Return rate is required."),
  compoundFrequency: z.coerce.number().min(1),
  investmentLength: z.coerce.number().min(0, "Investment length is required."),
}).refine(data => data.investmentLength > 0, {
  message: "Investment length must be greater than 0.",
  path: ["investmentLength"],
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
  endBalance: number;
  totalPrincipal: number;
  totalContributions: number;
  totalInterest: number;
  accumulationData: AccumulationData[];
};

const pieChartConfig = {
    startingAmount: { label: "Starting Amount", color: "hsl(var(--chart-1))" },
    contributions: { label: "Contributions", color: "hsl(var(--chart-2))" },
    interest: { label: "Interest", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const InvestmentCalculator = () => {
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startingAmount: 20000,
            additionalContribution: 1000,
            contributionFrequency: "end",
            returnRate: 6,
            compoundFrequency: 1, // Annually
            investmentLength: 10,
        },
    });

    const onSubmit = (values: FormData) => {
        const {
            startingAmount, additionalContribution, contributionFrequency,
            returnRate, compoundFrequency, investmentLength
        } = values;

        const totalPeriods = investmentLength * compoundFrequency;
        const ratePerPeriod = returnRate / 100 / compoundFrequency;
        
        let balance = startingAmount;
        let totalInterest = 0;
        let totalContributions = 0;

        const accumulationData: AccumulationData[] = [];
        const contributionPerPeriod = additionalContribution * 12 / compoundFrequency;

        for (let i = 1; i <= totalPeriods; i++) {
            let interestEarned = 0;
            if (contributionFrequency === 'start') {
                balance += contributionPerPeriod;
                interestEarned = balance * ratePerPeriod;
            } else { // end of period
                interestEarned = balance * ratePerPeriod;
                balance += contributionPerPeriod;
            }

            balance += interestEarned;
            totalInterest += interestEarned;
            totalContributions += contributionPerPeriod;
            
            const currentMonth = Math.floor( (i-1) * (12/compoundFrequency) ) + 1;

            accumulationData.push({
                period: i,
                year: Math.ceil(i / compoundFrequency),
                deposit: contributionPerPeriod,
                interest: interestEarned,
                endingBalance: balance
            });
        }
        
        const totalPrincipal = startingAmount + totalContributions;

        setResult({
            endBalance: balance,
            totalPrincipal,
            totalContributions,
            totalInterest,
            accumulationData
        });
    };
    
    const pieChartData = useMemo(() => {
        if (!result) return [];
        return [
            { name: 'Starting Amount', value: form.getValues('startingAmount'), fill: 'hsl(var(--chart-1))' },
            { name: 'Contributions', value: result.totalContributions, fill: 'hsl(var(--chart-2))' },
            { name: 'Interest', value: result.totalInterest, fill: 'hsl(var(--chart-3))' }
        ];
    }, [result, form]);

    const growthChartData = useMemo(() => {
        if (!result) return [];
        
        const yearlyData: {[key: number]: {year: number, principal: number, interest: number, balance: number}} = {};

        result.accumulationData.forEach(d => {
            if (!yearlyData[d.year]) {
                const prevYearBalance = yearlyData[d.year - 1]?.balance || form.getValues('startingAmount');
                yearlyData[d.year] = { year: d.year, principal: prevYearBalance + d.deposit, interest: d.interest, balance: d.endingBalance };
            } else {
                 yearlyData[d.year].principal += d.deposit;
                 yearlyData[d.year].interest += d.interest;
                 yearlyData[d.year].balance = d.endingBalance;
            }
        });

        return Object.values(yearlyData).map(y => ({
            name: `Year ${y.year}`,
            principal: y.principal - y.interest,
            interest: y.interest
        }));
    }, [result, form]);

    const scheduleData = useMemo(() => {
        if (!result) return [];
        if (scheduleView === 'annual') {
            const annual: Omit<AccumulationData, "period" | "month">[] = [];
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
        } else {
            return result.accumulationData.map(d => ({
                year: d.period, // show period as 'month'
                deposit: d.deposit,
                interest: d.interest,
                endingBalance: d.endingBalance
            }));
        }
    }, [result, scheduleView]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Investment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField name="startingAmount" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Starting Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField name="additionalContribution" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Additional Contribution ($ per month)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField name="contributionFrequency" control={form.control} render={({ field }) => (
                                    <FormItem className="space-y-3"><FormLabel>Contribution Frequency</FormLabel>
                                        <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="end" /></FormControl><FormLabel className="font-normal">End of Period</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="start" /></FormControl><FormLabel className="font-normal">Start of Period</FormLabel></FormItem>
                                        </RadioGroup>
                                        </FormControl><FormMessage />
                                    </FormItem>
                                )}/>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="returnRate" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Return Rate (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="compoundFrequency" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Compound Frequency</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="365">Daily</SelectItem>
                                                <SelectItem value="12">Monthly</SelectItem>
                                                <SelectItem value="4">Quarterly</SelectItem>
                                                <SelectItem value="1">Annually</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                <FormField name="investmentLength" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Investment Length (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
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
                                    <p className="text-muted-foreground">End Balance</p>
                                    <p className="text-4xl font-bold text-primary">{formatCurrency(result.endBalance)}</p>
                                </div>
                                <div className="space-y-2 text-sm">
                                     <div className="flex justify-between"><span>Starting Amount</span><strong>{formatCurrency(form.getValues('startingAmount'))}</strong></div>
                                     <div className="flex justify-between"><span>Total Contributions</span><strong>{formatCurrency(result.totalContributions)}</strong></div>
                                     <div className="flex justify-between"><span>Total Interest</span><strong>{formatCurrency(result.totalInterest)}</strong></div>
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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Accumulation Schedule</CardTitle>
                             <div className="flex items-center space-x-2">
                               <Button variant={scheduleView === 'annual' ? 'default' : 'outline'} size="sm" onClick={() => setScheduleView('annual')}>Annual</Button>
                               <Button variant={scheduleView === 'monthly' ? 'default' : 'outline'} size="sm" onClick={() => setScheduleView('monthly')}>Monthly</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <Table>
                                    <TableHeader><TableRow><TableHead>{scheduleView === 'annual' ? 'Year' : 'Period'}</TableHead><TableHead className="text-right">Deposit</TableHead><TableHead className="text-right">Interest</TableHead><TableHead className="text-right">Ending Balance</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {scheduleData.map(row => (
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

export default InvestmentCalculator;
