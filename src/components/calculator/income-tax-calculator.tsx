"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxBrackets } from "@/lib/tax-data";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronsUpDown } from "lucide-react";

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formSchema = z.object({
  filingStatus: z.enum(["single", "married_jointly", "head_of_household"]),
  youngDependents: z.coerce.number().min(0).default(0),
  otherDependents: z.coerce.number().min(0).default(0),
  taxYear: z.enum(["2024", "2025"]),
  wages: z.coerce.number().min(0).default(80000),
  federalWithheld: z.coerce.number().min(0).default(9000),
  isSelfEmployed: z.boolean().default(false),
  interestIncome: z.coerce.number().min(0).default(0),
  ordinaryDividends: z.coerce.number().min(0).default(0),
  qualifiedDividends: z.coerce.number().min(0).default(0),
  rentalIncome: z.coerce.number().min(0).default(0),
  shortTermGains: z.coerce.number().min(0).default(0),
  longTermGains: z.coerce.number().min(0).default(0),
  otherIncome: z.coerce.number().min(0).default(0),
  iraContributions: z.coerce.number().min(0).default(0),
  realEstateTax: z.coerce.number().min(0).default(0),
  mortgageInterest: z.coerce.number().min(0).default(0),
  charitableDonations: z.coerce.number().min(0).default(0),
  studentLoanInterest: z.coerce.number().min(0).default(0),
  childCareExpense: z.coerce.number().min(0).default(0),
  educationExpense: z.coerce.number().min(0).default(0),
  otherDeductibles: z.coerce.number().min(0).default(0),
});

type FormData = z.infer<typeof formSchema>;
type CalculationResult = {
  taxableIncome: number;
  federalTax: number;
  refundOrOwed: number;
};

const IncomeTaxCalculator = () => {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            filingStatus: "single",
            youngDependents: 0,
            otherDependents: 0,
            taxYear: "2024",
            wages: 80000,
            federalWithheld: 9000,
            isSelfEmployed: false,
            interestIncome: 0,
            ordinaryDividends: 0,
            qualifiedDividends: 0,
            rentalIncome: 0,
            shortTermGains: 0,
            longTermGains: 0,
            otherIncome: 0,
            iraContributions: 0,
            realEstateTax: 0,
            mortgageInterest: 0,
            charitableDonations: 0,
            studentLoanInterest: 0,
            childCareExpense: 0,
            educationExpense: 0,
            otherDeductibles: 0,
        },
    });

    const onSubmit = (values: FormData) => {
        const yearData = taxBrackets[values.taxYear];
        const status = values.filingStatus;
        
        // Calculate Gross Income
        const grossIncome = values.wages + values.interestIncome + values.ordinaryDividends + values.rentalIncome + values.shortTermGains + values.longTermGains + values.otherIncome;
        
        // Above-the-line deductions
        const agiDeductions = values.iraContributions + Math.min(values.studentLoanInterest, 2500);
        const adjustedGrossIncome = grossIncome - agiDeductions;
        
        // Standard vs Itemized Deduction
        const itemizedDeductions = values.realEstateTax + values.mortgageInterest + values.charitableDonations + values.otherDeductibles;
        const standardDeduction = yearData.standardDeduction[status];
        const finalDeduction = Math.max(standardDeduction, itemizedDeductions);
        
        const taxableIncome = Math.max(0, adjustedGrossIncome - finalDeduction);
        
        // Calculate Federal Tax
        let federalTax = 0;
        const brackets = yearData.brackets[status];
        let remainingIncome = taxableIncome;
        
        for (const bracket of brackets) {
            if (remainingIncome > bracket.limit) {
                federalTax += (bracket.limit - (brackets[brackets.indexOf(bracket) - 1]?.limit || 0)) * bracket.rate;
            } else {
                federalTax += (remainingIncome - (brackets[brackets.indexOf(bracket) - 1]?.limit || 0)) * bracket.rate;
                break;
            }
        }
        
        // Tax Credits
        const childTaxCredit = values.youngDependents * yearData.credits.childTaxCredit;
        const otherDependentCredit = values.otherDependents * yearData.credits.otherDependentCredit;
        const totalCredits = childTaxCredit + otherDependentCredit;
        
        const finalTax = Math.max(0, federalTax - totalCredits);
        
        const refundOrOwed = values.federalWithheld - finalTax;

        setResult({
            taxableIncome,
            federalTax: finalTax,
            refundOrOwed,
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Tax Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <Accordion type="multiple" defaultValue={["general", "income"]} className="w-full">
                                    <AccordionItem value="general">
                                        <AccordionTrigger className="text-lg font-semibold">General Info</AccordionTrigger>
                                        <AccordionContent className="pt-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField name="taxYear" control={form.control} render={({ field }) => (
                                                    <FormItem><FormLabel>Tax Year</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="2024">2024</SelectItem><SelectItem value="2025">2025</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                                )}/>
                                                <FormField name="filingStatus" control={form.control} render={({ field }) => (
                                                    <FormItem><FormLabel>Filing Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="married_jointly">Married Filing Jointly</SelectItem><SelectItem value="head_of_household">Head of Household</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                                )}/>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField name="youngDependents" control={form.control} render={({ field }) => (<FormItem><FormLabel>Dependents (Age 0-16)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="otherDependents" control={form.control} render={({ field }) => (<FormItem><FormLabel>Dependents (Age 17+)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="income">
                                        <AccordionTrigger className="text-lg font-semibold">Income</AccordionTrigger>
                                        <AccordionContent className="pt-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField name="wages" control={form.control} render={({ field }) => (<FormItem><FormLabel>Wages, Tips (W-2)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="federalWithheld" control={form.control} render={({ field }) => (<FormItem><FormLabel>Federal Tax Withheld</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                            </div>
                                            <FormField name="isSelfEmployed" control={form.control} render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I have business or self-employment income</FormLabel></div></FormItem>)}/>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField name="interestIncome" control={form.control} render={({ field }) => (<FormItem><FormLabel>Interest Income</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="ordinaryDividends" control={form.control} render={({ field }) => (<FormItem><FormLabel>Ordinary Dividends</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="qualifiedDividends" control={form.control} render={({ field }) => (<FormItem><FormLabel>Qualified Dividends</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="rentalIncome" control={form.control} render={({ field }) => (<FormItem><FormLabel>Rental/Royalty Income</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="shortTermGains" control={form.control} render={({ field }) => (<FormItem><FormLabel>Short-Term Capital Gains</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="longTermGains" control={form.control} render={({ field }) => (<FormItem><FormLabel>Long-Term Capital Gains</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="otherIncome" control={form.control} render={({ field }) => (<FormItem><FormLabel>Other Income</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                     <AccordionItem value="deductions">
                                        <AccordionTrigger className="text-lg font-semibold">Deductions & Credits</AccordionTrigger>
                                        <AccordionContent className="pt-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField name="iraContributions" control={form.control} render={({ field }) => (<FormItem><FormLabel>IRA Contributions</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="studentLoanInterest" control={form.control} render={({ field }) => (<FormItem><FormLabel>Student Loan Interest</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="realEstateTax" control={form.control} render={({ field }) => (<FormItem><FormLabel>Real Estate Tax</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="mortgageInterest" control={form.control} render={({ field }) => (<FormItem><FormLabel>Mortgage Interest</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="charitableDonations" control={form.control} render={({ field }) => (<FormItem><FormLabel>Charitable Donations</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="childCareExpense" control={form.control} render={({ field }) => (<FormItem><FormLabel>Child Care Expense</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="educationExpense" control={form.control} render={({ field }) => (<FormItem><FormLabel>College Education Expense</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField name="otherDeductibles" control={form.control} render={({ field }) => (<FormItem><FormLabel>Other Deductions</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Button type="submit" className="w-full">Calculate</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                 {!result ? (
                     <Card className="h-full flex flex-col justify-center items-center text-center p-6 sticky top-24">
                         <CardHeader><CardTitle>Your Tax Summary</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                         <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                     </Card>
                ) : (
                    <Card className="sticky top-24">
                        <CardHeader className="text-center">
                            <CardTitle>Estimated Tax Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-6">
                            <div>
                                <p className="text-lg text-muted-foreground">{result.refundOrOwed >= 0 ? 'Estimated Refund' : 'Estimated Amount Owed'}</p>
                                <p className={`text-5xl font-bold ${result.refundOrOwed >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                                    {formatCurrency(Math.abs(result.refundOrOwed))}
                                </p>
                            </div>
                            <div className="space-y-2 text-left pt-6 border-t">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Taxable Income</span>
                                    <strong>{formatCurrency(result.taxableIncome)}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Estimated Federal Tax</span>
                                    <strong>{formatCurrency(result.federalTax)}</strong>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Federal Tax Withheld</span>
                                    <strong>{formatCurrency(form.getValues('federalWithheld'))}</strong>
                                </div>
                            </div>
                             <Button onClick={() => window.print()} variant="outline" className="w-full mt-4">Print Results</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default IncomeTaxCalculator;
