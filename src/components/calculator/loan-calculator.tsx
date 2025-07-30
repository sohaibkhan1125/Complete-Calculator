
"use client";

import { useState } from "react";
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
  FormDescription,
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
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addYears, addMonths, format } from "date-fns";

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const amortizedSchema = z.object({
  loanAmount: z.coerce.number().min(1, "Loan amount is required."),
  loanTermYears: z.coerce.number().min(0),
  loanTermMonths: z.coerce.number().min(0),
  interestRate: z.coerce.number().min(0, "Interest rate is required."),
}).refine(data => data.loanTermYears > 0 || data.loanTermMonths > 0, {
    message: "Loan term must be greater than 0.",
    path: ["loanTermYears"],
});

const deferredSchema = z.object({
  loanAmount: z.coerce.number().min(1, "Loan amount is required."),
  loanTermYears: z.coerce.number().min(0),
  loanTermMonths: z.coerce.number().min(0),
  interestRate: z.coerce.number().min(0, "Interest rate is required."),
}).refine(data => data.loanTermYears > 0 || data.loanTermMonths > 0, {
    message: "Loan term must be greater than 0.",
    path: ["loanTermYears"],
});

const bondSchema = z.object({
  dueAmount: z.coerce.number().min(1, "Due amount is required."),
  loanTermYears: z.coerce.number().min(0),
  loanTermMonths: z.coerce.number().min(0),
  interestRate: z.coerce.number().min(0, "Interest rate is required."),
}).refine(data => data.loanTermYears > 0 || data.loanTermMonths > 0, {
    message: "Loan term must be greater than 0.",
    path: ["loanTermYears"],
});

type AmortizationData = { month: number; principal: number; interest: number; balance: number };
type AmortizedResult = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  chartData: any[];
  amortizationData: AmortizationData[];
};

type DeferredResult = {
  amountDue: number;
  totalInterest: number;
  chartData: any[];
  scheduleData: { year: number; interest: number; balance: number }[];
};

type BondResult = {
  amountReceived: number;
  totalInterest: number;
  chartData: any[];
  scheduleData: { year: number; value: number }[];
};

const chartConfig = {
  principal: { label: "Principal", color: "hsl(var(--chart-1))" },
  interest: { label: "Interest", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;


export default function LoanCalculator() {
  const [activeTab, setActiveTab] = useState("amortized");
  const [amortizedResult, setAmortizedResult] = useState<AmortizedResult | null>(null);
  const [deferredResult, setDeferredResult] = useState<DeferredResult | null>(null);
  const [bondResult, setBondResult] = useState<BondResult | null>(null);

  const amortizedForm = useForm<z.infer<typeof amortizedSchema>>({
    resolver: zodResolver(amortizedSchema),
    defaultValues: { loanAmount: 100000, loanTermYears: 10, loanTermMonths: 0, interestRate: 6 },
  });

  const deferredForm = useForm<z.infer<typeof deferredSchema>>({
    resolver: zodResolver(deferredSchema),
    defaultValues: { loanAmount: 100000, loanTermYears: 10, loanTermMonths: 0, interestRate: 6 },
  });

  const bondForm = useForm<z.infer<typeof bondSchema>>({
    resolver: zodResolver(bondSchema),
    defaultValues: { dueAmount: 100000, loanTermYears: 10, loanTermMonths: 0, interestRate: 6 },
  });

  function onAmortizedSubmit(values: z.infer<typeof amortizedSchema>) {
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
        amortizationData.push({ month: i, principal: principalPaid, interest: interestPaid, balance: balance < 0 ? 0 : balance });
    }
    
    setAmortizedResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      chartData: [
        { name: 'Principal', value: principal, fill: 'hsl(var(--chart-1))' },
        { name: 'Interest', value: totalInterest, fill: 'hsl(var(--chart-2))' },
      ],
      amortizationData,
    });
  }

  function onDeferredSubmit(values: z.infer<typeof deferredSchema>) {
    const principal = values.loanAmount;
    const annualInterestRate = values.interestRate / 100;
    const totalYears = values.loanTermYears + values.loanTermMonths / 12;

    const amountDue = principal * Math.pow(1 + annualInterestRate, totalYears);
    const totalInterest = amountDue - principal;
    
    let balance = principal;
    const scheduleData: { year: number; interest: number; balance: number }[] = [];
    for (let i = 1; i <= Math.ceil(totalYears); i++) {
        const interestAccrued = balance * annualInterestRate;
        balance += interestAccrued;
        scheduleData.push({ year: i, interest: interestAccrued, balance });
    }

    setDeferredResult({
      amountDue,
      totalInterest,
      chartData: [
        { name: 'Principal', value: principal, fill: 'hsl(var(--chart-1))' },
        { name: 'Interest', value: totalInterest, fill: 'hsl(var(--chart-2))' },
      ],
      scheduleData,
    });
  }

  function onBondSubmit(values: z.infer<typeof bondSchema>) {
    const faceValue = values.dueAmount;
    const annualInterestRate = values.interestRate / 100;
    const totalYears = values.loanTermYears + values.loanTermMonths / 12;

    const presentValue = faceValue / Math.pow(1 + annualInterestRate, totalYears);
    const totalInterest = faceValue - presentValue;

    const scheduleData: { year: number; value: number }[] = [];
    for (let i = 0; i <= Math.ceil(totalYears); i++) {
        scheduleData.push({ year: i, value: presentValue * Math.pow(1 + annualInterestRate, i) });
    }

    setBondResult({
      amountReceived: presentValue,
      totalInterest,
      chartData: [
        { name: 'Principal', value: presentValue, fill: 'hsl(var(--chart-1))' },
        { name: 'Interest', value: totalInterest, fill: 'hsl(var(--chart-2))' },
      ],
      scheduleData,
    });
  }
  
  const renderResults = (title: string, data: {label: string, value: string | number}[]) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.map(item => (
           <div key={item.label} className="flex justify-between items-center">
             <span className="text-muted-foreground">{item.label}</span>
             <strong className="text-lg">{typeof item.value === 'number' ? formatCurrency(item.value) : item.value}</strong>
           </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderChart = (data: any[], title: string) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {data.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.fill} />)}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="name"/>} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
    </Card>
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
        <TabsTrigger value="amortized">Amortized Loan</TabsTrigger>
        <TabsTrigger value="deferred">Deferred Payment Loan</TabsTrigger>
        <TabsTrigger value="bond">Bond-Based Loan</TabsTrigger>
      </TabsList>

      {/* Amortized Loan Tab */}
      <TabsContent value="amortized">
        <Card>
          <CardHeader>
            <CardTitle>Amortized Loan Calculator</CardTitle>
            <CardDescription>Use this for standard loans like mortgages, auto loans, student loans, or personal loans. Repayment is made via equal periodic payments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Form {...amortizedForm}>
                  <form onSubmit={amortizedForm.handleSubmit(onAmortizedSubmit)} className="space-y-4">
                    <FormField control={amortizedForm.control} name="loanAmount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Amount</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={amortizedForm.control} name="loanTermYears" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Term (Years)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                          </FormItem>
                        )} />
                         <FormField control={amortizedForm.control} name="loanTermMonths" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Term (Months)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                          </FormItem>
                        )} />
                    </div>
                     <FormField control={amortizedForm.control} name="interestRate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest Rate (% Annual)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={amortizedForm.control} name="loanTermYears" render={() => (
                      <FormItem>
                         <FormLabel>Compounding</FormLabel>
                         <FormControl><Input value="Monthly (APR)" readOnly disabled /></FormControl>
                      </FormItem>
                    )} />
                     <FormField control={amortizedForm.control} name="loanTermYears" render={() => (
                      <FormItem>
                         <FormLabel>Payback Frequency</FormLabel>
                         <FormControl><Input value="Monthly" readOnly disabled /></FormControl>
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full">Calculate</Button>
                  </form>
                </Form>
              </div>
              {amortizedResult && (
                <div className="space-y-4">
                  {renderResults("Payment Summary", [
                    { label: 'Monthly Payment', value: amortizedResult.monthlyPayment },
                    { label: `Total of ${amortizedResult.amortizationData.length} Payments`, value: amortizedResult.totalPayment },
                    { label: 'Total Interest', value: amortizedResult.totalInterest },
                  ])}
                  {renderChart(amortizedResult.chartData, 'Principal vs. Interest')}
                </div>
              )}
            </div>
             {amortizedResult && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-center">Amortization Table</h3>
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
                                {amortizedResult.amortizationData.map(row => (
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
                </div>
             )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Deferred Payment Loan Tab */}
      <TabsContent value="deferred">
         <Card>
          <CardHeader>
            <CardTitle>Deferred Payment Loan Calculator</CardTitle>
            <CardDescription>One-time repayment of the full amount plus interest at loan maturity.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Form {...deferredForm}>
                  <form onSubmit={deferredForm.handleSubmit(onDeferredSubmit)} className="space-y-4">
                    <FormField control={deferredForm.control} name="loanAmount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Amount</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={deferredForm.control} name="loanTermYears" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Term (Years)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                          </FormItem>
                        )} />
                         <FormField control={deferredForm.control} name="loanTermMonths" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Term (Months)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                          </FormItem>
                        )} />
                    </div>
                     <FormField control={deferredForm.control} name="interestRate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest Rate (% Annual)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={deferredForm.control} name="loanTermYears" render={() => (
                      <FormItem>
                         <FormLabel>Compounding</FormLabel>
                         <FormControl><Input value="Annually (APY)" readOnly disabled /></FormControl>
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full">Calculate</Button>
                  </form>
                </Form>
              </div>
              {deferredResult && (
                <div className="space-y-4">
                  {renderResults("Result", [
                    { label: 'Amount Due at Maturity', value: deferredResult.amountDue },
                    { label: 'Total Interest', value: deferredResult.totalInterest },
                  ])}
                  {renderChart(deferredResult.chartData, 'Principal vs. Interest')}
                </div>
              )}
            </div>
             {deferredResult && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-center">Schedule Table</h3>
                    <ScrollArea className="h-96">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Year</TableHead>
                                    <TableHead className="text-right">Interest Accrued</TableHead>
                                    <TableHead className="text-right">End of Year Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deferredResult.scheduleData.map(row => (
                                    <TableRow key={row.year}>
                                        <TableCell>{row.year}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(row.interest)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
             )}
          </CardContent>
        </Card>
      </TabsContent>

       {/* Bond-Based Loan Tab */}
      <TabsContent value="bond">
        <Card>
          <CardHeader>
            <CardTitle>Bond-Based Loan Calculator</CardTitle>
            <CardDescription>Calculate the present value of a loan or bond where a fixed amount is paid at the end (face value).</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Form {...bondForm}>
                  <form onSubmit={bondForm.handleSubmit(onBondSubmit)} className="space-y-4">
                    <FormField control={bondForm.control} name="dueAmount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Predetermined Due Amount</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={bondForm.control} name="loanTermYears" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Term (Years)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                          </FormItem>
                        )} />
                         <FormField control={bondForm.control} name="loanTermMonths" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Term (Months)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                          </FormItem>
                        )} />
                    </div>
                     <FormField control={bondForm.control} name="interestRate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest Rate (% Annual)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={bondForm.control} name="loanTermYears" render={() => (
                      <FormItem>
                         <FormLabel>Compounding</FormLabel>
                         <FormControl><Input value="Annually (APY)" readOnly disabled /></FormControl>
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full">Calculate</Button>
                  </form>
                </Form>
              </div>
              {bondResult && (
                <div className="space-y-4">
                  {renderResults("Result", [
                    { label: 'Amount Received Today', value: bondResult.amountReceived },
                    { label: 'Total Interest Earned', value: bondResult.totalInterest },
                  ])}
                  {renderChart(bondResult.chartData, 'Principal vs. Interest')}
                </div>
              )}
            </div>
            {bondResult && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-center">Schedule Table</h3>
                    <ScrollArea className="h-96">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Year</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bondResult.scheduleData.map(row => (
                                    <TableRow key={row.year}>
                                        <TableCell>{row.year}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(row.value)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
             )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
