"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const formSchema = z.object({
  loanAmount: z.coerce.number().min(1, { message: "Loan amount is required." }),
  interestRate: z.coerce.number().min(0, { message: "Interest rate is required." }),
  loanTerm: z.coerce.number().min(1, { message: "Loan term is required." }),
  downPayment: z.coerce.number().min(0).optional(),
});

type MortgageResult = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortizationData: { year: number; principal: number; interest: number; balance: number }[];
};

export default function MortgageCalculator() {
  const [result, setResult] = useState<MortgageResult | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: 100000,
      interestRate: 5,
      loanTerm: 30,
      downPayment: 20000,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const principal = values.loanAmount - (values.downPayment || 0);
    const monthlyInterestRate = values.interestRate / 100 / 12;
    const numberOfPayments = values.loanTerm * 12;

    if (principal <= 0 || monthlyInterestRate <= 0 || numberOfPayments <= 0) {
      setResult(null);
      return;
    }

    const monthlyPayment = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    let balance = principal;
    const amortizationData = [];
    let yearlyInterest = 0;
    let yearlyPrincipal = 0;

    for (let i = 1; i <= numberOfPayments; i++) {
        const interestForMonth = balance * monthlyInterestRate;
        const principalForMonth = monthlyPayment - interestForMonth;
        balance -= principalForMonth;
        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;

        if (i % 12 === 0 || i === numberOfPayments) {
            amortizationData.push({
                year: Math.ceil(i/12),
                principal: parseFloat(yearlyPrincipal.toFixed(2)),
                interest: parseFloat(yearlyInterest.toFixed(2)),
                balance: parseFloat(balance.toFixed(2)),
            });
            yearlyInterest = 0;
            yearlyPrincipal = 0;
        }
    }


    setResult({
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalPayment: parseFloat(totalPayment.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      amortizationData: amortizationData
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="loanAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="downPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Down Payment ($) (optional)</FormLabel>
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
                      <Input type="number" step="0.01" {...field} />
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
              <Button type="submit" className="w-full">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-secondary p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="text-2xl font-bold">${result.monthlyPayment.toLocaleString()}</p>
                    </div>
                    <div className="bg-secondary p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Payment</p>
                        <p className="text-2xl font-bold">${result.totalPayment.toLocaleString()}</p>
                    </div>
                    <div className="bg-secondary p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="text-2xl font-bold">${result.totalInterest.toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Amortization Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{
                        principal: { label: "Principal", color: "hsl(var(--chart-2))" },
                        interest: { label: "Interest", color: "hsl(var(--chart-1))" },
                    }} className="h-[300px] w-full">
                    <BarChart data={result.amortizationData} margin={{ top: 20, right: 20, bottom: 5, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tickFormatter={(tick) => `Year ${tick}`}/>
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="principal" stackId="a" fill="var(--color-principal)" />
                        <Bar dataKey="interest" stackId="a" fill="var(--color-interest)" />
                    </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
