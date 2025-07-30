
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, format, startOfMonth } from "date-fns";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronsUpDown, ExternalLink } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";


const formSchema = z.object({
  homePrice: z.coerce.number().min(1, { message: "Home price is required." }),
  downPaymentPercent: z.coerce.number().min(0, { message: "Down payment is required." }),
  loanTerm: z.coerce.number().min(1, { message: "Loan term is required." }),
  interestRate: z.coerce.number().min(0, { message: "Interest rate is required." }),
  startDate: z.date(),
  propertyTaxes: z.coerce.number().min(0).optional(),
  homeInsurance: z.coerce.number().min(0).optional(),
  pmi: z.coerce.number().min(0).optional(),
  hoa: z.coerce.number().min(0).optional(),
  otherCosts: z.coerce.number().min(0).optional(),
});

type AmortizationData = { year: number; month: number; date: string; interest: number; principal: number; balance: number };

type MortgageResult = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  loanAmount: number;
  payoffDate: string;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  monthlyPmi: number;
  monthlyHoa: number;
  monthlyOtherCosts: number;
  totalMonthlyCost: number;
  totalPropertyTax: number;
  totalHomeInsurance: number;
  totalPmi: number;
  totalHoa: number;
  totalOtherCosts: number;
  totalOutOfPocket: number;
  downPaymentAmount: number;
  amortizationData: AmortizationData[];
};

const COLORS = {
  'Principal & Interest': 'hsl(var(--chart-1))',
  'Property Tax': 'hsl(var(--chart-2))',
  'Home Insurance': 'hsl(var(--chart-3))',
  'Other': 'hsl(var(--chart-4))',
};

const chartConfig = {
  'Principal & Interest': { label: 'P & I', color: COLORS['Principal & Interest'] },
  'Property Tax': { label: 'Taxes', color: COLORS['Property Tax'] },
  'Home Insurance': { label: 'Insurance', color: COLORS['Home Insurance'] },
  'Other': { label: 'Other', color: COLORS['Other'] },
} satisfies ChartConfig;

export default function MortgageCalculator() {
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      homePrice: 400000,
      downPaymentPercent: 20,
      loanTerm: 30,
      interestRate: 6.723,
      startDate: startOfMonth(new Date()),
      propertyTaxes: 1.2,
      homeInsurance: 1500,
      pmi: 0,
      hoa: 0,
      otherCosts: 4000
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const downPaymentAmount = values.homePrice * (values.downPaymentPercent / 100);
    const loanAmount = values.homePrice - downPaymentAmount;
    const monthlyInterestRate = values.interestRate / 100 / 12;
    const numberOfPayments = values.loanTerm * 12;

    const monthlyPayment = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;
    const payoffDate = format(addMonths(values.startDate, numberOfPayments), "MMMM yyyy");

    const monthlyPropertyTax = (values.homePrice * ((values.propertyTaxes || 0) / 100)) / 12;
    const monthlyHomeInsurance = (values.homeInsurance || 0) / 12;
    const monthlyPmi = values.pmi || 0;
    const monthlyHoa = values.hoa || 0;
    const monthlyOtherCosts = (values.otherCosts || 0) / 12;
    
    const totalMonthlyCost = monthlyPayment + monthlyPropertyTax + monthlyHomeInsurance + monthlyPmi + monthlyHoa + monthlyOtherCosts;
    
    const totalPropertyTax = monthlyPropertyTax * numberOfPayments;
    const totalHomeInsurance = monthlyHomeInsurance * numberOfPayments;
    const totalPmi = monthlyPmi * numberOfPayments;
    const totalHoa = monthlyHoa * numberOfPayments;
    const totalOtherCosts = monthlyOtherCosts * numberOfPayments;
    
    const totalOutOfPocket = totalPayment + totalPropertyTax + totalHomeInsurance + totalPmi + totalHoa + totalOtherCosts;
    
    let balance = loanAmount;
    const amortizationData: AmortizationData[] = [];
    for (let i = 0; i < numberOfPayments; i++) {
        const interestForMonth = balance * monthlyInterestRate;
        const principalForMonth = monthlyPayment - interestForMonth;
        balance -= principalForMonth;
        amortizationData.push({
            year: Math.floor(i / 12) + 1,
            month: (i % 12) + 1,
            date: format(addMonths(values.startDate, i), "MMM yyyy"),
            interest: interestForMonth,
            principal: principalForMonth,
            balance: balance < 0 ? 0 : balance,
        });
    }

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      loanAmount,
      payoffDate,
      monthlyPropertyTax,
      monthlyHomeInsurance,
      monthlyPmi,
      monthlyHoa,
      monthlyOtherCosts,
      totalMonthlyCost,
      totalPropertyTax,
      totalHomeInsurance,
      totalPmi,
      totalHoa,
      totalOtherCosts,
      totalOutOfPocket,
      downPaymentAmount,
      amortizationData,
    });
  }

  const annualAmortization = result ?
    result.amortizationData.reduce((acc, curr) => {
        const yearData = acc.find(d => d.year === curr.year);
        if (yearData) {
            yearData.interestPaid += curr.interest;
            yearData.principalPaid += curr.principal;
            yearData.balance = curr.balance;
        } else {
            acc.push({
                year: curr.year,
                dateRange: `Year ${curr.year}`,
                interestPaid: curr.interest,
                principalPaid: curr.principal,
                balance: curr.balance,
            });
        }
        return acc;
    }, [] as { year: number; dateRange: string; interestPaid: number; principalPaid: number; balance: number }[])
    : [];
    
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const pieChartData = result ? [
      { name: 'Principal & Interest', value: result.monthlyPayment, fill: COLORS['Principal & Interest'] },
      { name: 'Property Tax', value: result.monthlyPropertyTax, fill: COLORS['Property Tax'] },
      { name: 'Home Insurance', value: result.monthlyHomeInsurance, fill: COLORS['Home Insurance'] },
      { name: 'Other', value: result.monthlyPmi + result.monthlyHoa + result.monthlyOtherCosts, fill: COLORS['Other'] },
  ].filter(item => item.value > 0) : [];
  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle>Calculator</CardTitle>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="homePrice"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Home Price</FormLabel>
                        <FormControl>
                        <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="downPaymentPercent"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Down Payment (%)</FormLabel>
                        <FormControl>
                        <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="loanTerm"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Loan Term (Years)</FormLabel>
                        <FormControl>
                        <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Interest Rate (% Annual)</FormLabel>
                        <FormControl>
                        <Input type="number" step="0.001" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "MMMM yyyy")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Annual Taxes & Costs</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                            <FormField
                                control={form.control}
                                name="propertyTaxes"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Property Taxes (% Annual)</FormLabel>
                                    <FormControl>
                                    <Input type="number" step="0.1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="homeInsurance"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Home Insurance ($ Annual)</FormLabel>
                                    <FormControl>
                                    <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="pmi"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>PMI Insurance ($ Monthly)</FormLabel>
                                    <FormControl>
                                    <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="hoa"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>HOA Fee ($ Monthly)</FormLabel>
                                    <FormControl>
                                    <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="otherCosts"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Other Costs ($ Annual)</FormLabel>
                                    <FormControl>
                                    <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="submit" className="w-full">Calculate</Button>
                    <Button variant="outline" className="w-full" asChild>
                        <a href="#" target="_blank" rel="noopener noreferrer">Get Pre-Approval <ExternalLink className="ml-2 h-4 w-4" /></a>
                    </Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3 space-y-8">
        {!result && (
             <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                 <CardHeader>
                     <CardTitle>Your Mortgage Details</CardTitle>
                     <CardDescription>Results will appear here after calculation.</CardDescription>
                 </CardHeader>
                <CardContent>
                    <ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" />
                </CardContent>
             </Card>
        )}
        {result && (
            <>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                             <h3 className="text-lg font-semibold mb-4 text-center">Monthly Breakdown</h3>
                            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-64">
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
                            <div className="space-y-2 mt-4 text-sm">
                                <div className="flex justify-between"><span>Principal & Interest:</span> <strong>{formatCurrency(result.monthlyPayment)}</strong></div>
                                <div className="flex justify-between"><span>Property Tax:</span> <strong>{formatCurrency(result.monthlyPropertyTax)}</strong></div>
                                <div className="flex justify-between"><span>Home Insurance:</span> <strong>{formatCurrency(result.monthlyHomeInsurance)}</strong></div>
                                {result.monthlyPmi > 0 && <div className="flex justify-between"><span>PMI:</span> <strong>{formatCurrency(result.monthlyPmi)}</strong></div>}
                                {result.monthlyHoa > 0 && <div className="flex justify-between"><span>HOA:</span> <strong>{formatCurrency(result.monthlyHoa)}</strong></div>}
                                {result.monthlyOtherCosts > 0 && <div className="flex justify-between"><span>Other Costs:</span> <strong>{formatCurrency(result.monthlyOtherCosts)}</strong></div>}
                                <div className="flex justify-between border-t pt-2 font-bold text-base"><span>Total Monthly Cost:</span> <strong className="text-primary">{formatCurrency(result.totalMonthlyCost)}</strong></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-center">Total Payment Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>Loan Amount:</span> <strong>{formatCurrency(result.loanAmount)}</strong></div>
                                <div className="flex justify-between"><span>Down Payment:</span> <strong>{formatCurrency(result.downPaymentAmount)}</strong></div>
                                <div className="flex justify-between"><span>Total Mortgage Payments:</span> <strong>{formatCurrency(result.totalPayment)}</strong></div>
                                <div className="flex justify-between"><span>Total Interest Paid:</span> <strong>{formatCurrency(result.totalInterest)}</strong></div>
                                <div className="flex justify-between"><span>Total Property Tax:</span> <strong>{formatCurrency(result.totalPropertyTax)}</strong></div>
                                <div className="flex justify-between"><span>Total Home Insurance:</span> <strong>{formatCurrency(result.totalHomeInsurance)}</strong></div>
                                {result.totalPmi > 0 && <div className="flex justify-between"><span>Total PMI:</span> <strong>{formatCurrency(result.totalPmi)}</strong></div>}
                                {result.totalHoa > 0 && <div className="flex justify-between"><span>Total HOA:</span> <strong>{formatCurrency(result.totalHoa)}</strong></div>}
                                {result.totalOtherCosts > 0 && <div className="flex justify-between"><span>Total Other Costs:</span> <strong>{formatCurrency(result.totalOtherCosts)}</strong></div>}
                                <div className="flex justify-between border-t pt-2 font-bold text-base"><span>Total Out-of-Pocket:</span> <strong className="text-primary">{formatCurrency(result.totalOutOfPocket)}</strong></div>
                                <div className="flex justify-between mt-2"><span>Mortgage Payoff Date:</span> <strong>{result.payoffDate}</strong></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Amortization Schedule</CardTitle>
                        <div className="flex items-center space-x-2 pt-2">
                           <Button variant={scheduleView === 'annual' ? 'default' : 'outline'} size="sm" onClick={() => setScheduleView('annual')}>Annual</Button>
                           <Button variant={scheduleView === 'monthly' ? 'default' : 'outline'} size="sm" onClick={() => setScheduleView('monthly')}>Monthly</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96">
                            <Table>
                                <TableHeader className="sticky top-0 bg-secondary">
                                    <TableRow>
                                        <TableHead>{scheduleView === 'annual' ? 'Year' : 'Date'}</TableHead>
                                        <TableHead className="text-right">Principal Paid</TableHead>
                                        <TableHead className="text-right">Interest Paid</TableHead>
                                        <TableHead className="text-right">Remaining Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {scheduleView === 'annual' ? (
                                        annualAmortization.map((row) => (
                                            <TableRow key={row.year}>
                                                <TableCell>{row.dateRange}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.principalPaid)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.interestPaid)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        result.amortizationData.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.date}</TableCell>
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
            </>
        )}
      </div>
    </div>
  );
}
