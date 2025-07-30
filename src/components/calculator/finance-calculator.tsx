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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronsUpDown, HelpCircle } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";


const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formSchema = z.object({
  n: z.coerce.number().optional(),
  iy: z.coerce.number().optional(),
  pv: z.coerce.number().optional(),
  pmt: z.coerce.number().optional(),
  fv: z.coerce.number().optional(),
  compound: z.coerce.number().default(1),
  timing: z.enum(["end", "start"]).default("end"),
});

type FormData = z.infer<typeof formSchema>;
type ResultType = { 
    value: number; 
    totalPmt: number; 
    totalInterest: number; 
    schedule: { period: number, pv: number, pmt: number, interest: number, fv: number }[] 
};

const FinanceCalculator = () => {
    const [solveFor, setSolveFor] = useState("fv");
    const [result, setResult] = useState<ResultType | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            n: 10,
            iy: 6,
            pv: 20000,
            pmt: -2000,
            fv: undefined,
            compound: 1, // Annually
            timing: "end",
        },
    });

    const onSubmit = (values: FormData) => {
        let { n, iy, pv, pmt, fv, compound, timing } = values;
        iy = (iy ?? 0) / 100;
        const ratePerPeriod = iy / compound;
        let calculatedValue: number | null = null;

        const schedule: { period: number, pv: number, pmt: number, interest: number, fv: number }[] = [];
        let currentPV = pv ?? 0;
        const payment = pmt ?? 0;
        let totalInterest = 0;
        let totalPmt = 0;

        try {
            switch(solveFor) {
                case 'fv':
                    n = n ?? 0;
                    pv = pv ?? 0;
                    pmt = pmt ?? 0;
                    const fvCalc = pv * Math.pow(1 + ratePerPeriod, n) + pmt * ((Math.pow(1 + ratePerPeriod, n) - 1) / ratePerPeriod) * (1 + (timing === 'start' ? ratePerPeriod : 0));
                    calculatedValue = -fvCalc;
                    break;
                case 'pv':
                     n = n ?? 0;
                     pmt = pmt ?? 0;
                     fv = fv ?? 0;
                     const pvCalc = -fv / Math.pow(1 + ratePerPeriod, n) - pmt * ((1 - Math.pow(1 + ratePerPeriod, -n)) / ratePerPeriod) * (1 + (timing === 'start' ? ratePerPeriod : 0));
                     calculatedValue = pvCalc;
                     break;
                case 'pmt':
                     n = n ?? 0;
                     pv = pv ?? 0;
                     fv = fv ?? 0;
                     const pmtCalc = (-fv - pv * Math.pow(1 + ratePerPeriod, n)) / (( (Math.pow(1 + ratePerPeriod, n) - 1) / ratePerPeriod) * (1 + (timing === 'start' ? ratePerPeriod : 0)));
                     calculatedValue = pmtCalc;
                     break;
                 case 'n':
                     pv = pv ?? 0;
                     pmt = pmt ?? 0;
                     fv = fv ?? 0;
                     if (ratePerPeriod * pv + pmt <= 0) throw new Error("Invalid inputs for N");
                     const nCalc = Math.log((-fv * ratePerPeriod + pmt) / (pv * ratePerPeriod + pmt)) / Math.log(1 + ratePerPeriod);
                     calculatedValue = nCalc;
                     break;
                 case 'iy': // Note: This is a simplified estimation, a proper solve requires iteration (e.g. Newton's method)
                     n = n ?? 0;
                     pv = pv ?? 0;
                     pmt = pmt ?? 0;
                     fv = fv ?? 0;
                     const iyCalc = Math.pow((-fv / pv), 1/n) - 1; // Simplified rate of return formula
                     calculatedValue = iyCalc * 100 * compound;
                     break;
            }
            
            // Build schedule for FV, PV, PMT calculations
            if (['fv', 'pv', 'pmt'].includes(solveFor) && n) {
                const pmtVal = solveFor === 'pmt' ? (calculatedValue ?? 0) : (pmt ?? 0);
                for(let i=1; i <= n; i++) {
                    const interest = currentPV * ratePerPeriod;
                    let currentFV = currentPV + interest + (timing === 'start' ? pmtVal : 0);
                    if (timing === 'end') currentFV += pmtVal;

                    schedule.push({ period: i, pv: currentPV, pmt: pmtVal, interest, fv: -currentFV });
                    currentPV = currentFV;
                    totalInterest += interest;
                    totalPmt += pmtVal;
                }
            }


            if (calculatedValue === null) throw new Error("Calculation failed");
            setResult({ value: calculatedValue, schedule, totalInterest, totalPmt });

        } catch (error) {
            console.error(error);
            setResult(null); // Or set an error state
        }
    };
    
    const handleTabChange = (value: string) => {
        setSolveFor(value);
        setResult(null);
        form.reset({
            n: value === 'n' ? undefined : 10,
            iy: value === 'iy' ? undefined : 6,
            pv: value === 'pv' ? undefined : 20000,
            pmt: value === 'pmt' ? undefined : -2000,
            fv: value === 'fv' ? undefined : 0,
            compound: 1,
            timing: "end",
        });
    }

    const chartData = useMemo(() => {
        if (!result || !result.schedule.length) return [];
        return result.schedule.map(s => ({
            name: `Period ${s.period}`,
            Value: -s.fv,
            "Total Interest": result.schedule.slice(0, s.period).reduce((acc, curr) => acc + curr.interest, 0),
        }));
    }, [result]);

    const renderInputField = (name: keyof FormData, label: string) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input 
                            type="number" 
                            step="any"
                            {...field} 
                            disabled={solveFor === name} 
                            value={field.value === undefined ? '' : field.value}
                            onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
    
    return (
        <TooltipProvider>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Time Value of Money</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Tabs value={solveFor} onValueChange={handleTabChange} className="w-full mb-6">
                                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
                                    <TabsTrigger value="n">N</TabsTrigger>
                                    <TabsTrigger value="iy">I/Y</TabsTrigger>
                                    <TabsTrigger value="pv">PV</TabsTrigger>
                                    <TabsTrigger value="pmt">PMT</TabsTrigger>
                                    <TabsTrigger value="fv">FV</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {renderInputField("n", "Periods (N)")}
                                        {renderInputField("iy", "Interest/Year (I/Y)")}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {renderInputField("pv", "Present Value (PV)")}
                                        {renderInputField("pmt", "Payment (PMT)")}
                                    </div>
                                    {renderInputField("fv", "Future Value (FV)")}
                                    <FormField name="compound" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Compounding</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="timing" control={form.control} render={({ field }) => (
                                        <FormItem className="space-y-3"><FormLabel>Payment Timing</FormLabel>
                                            <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="end" /></FormControl><FormLabel className="font-normal">End</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="start" /></FormControl><FormLabel className="font-normal">Beginning</FormLabel></FormItem>
                                            </RadioGroup>
                                            </FormControl><FormMessage />
                                        </FormItem>
                                    )}/>

                                    <Button type="submit" className="w-full">Calculate {solveFor.toUpperCase()}</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-3 space-y-8">
                    {!result ? (
                        <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                            <CardHeader><CardTitle>Your Results</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                            <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                        </Card>
                    ) : (
                        <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Calculated Result for <span className="text-primary">{solveFor.toUpperCase()}</span></CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-5xl font-bold text-primary">
                                    {['pv', 'fv', 'pmt'].includes(solveFor) ? formatCurrency(result.value) : result.value.toFixed(2)}
                                </p>
                                {['fv', 'pv', 'pmt'].includes(solveFor) && (
                                     <div className="text-sm text-muted-foreground mt-4 grid grid-cols-2 gap-2 text-left">
                                         <div>
                                            <p>Sum of Payments:</p>
                                            <p className="font-semibold text-foreground">{formatCurrency(result.totalPmt)}</p>
                                         </div>
                                          <div>
                                            <p>Total Interest:</p>
                                            <p className="font-semibold text-foreground">{formatCurrency(result.totalInterest)}</p>
                                         </div>
                                     </div>
                                )}
                            </CardContent>
                        </Card>
                        {chartData.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle>Value Over Time</CardTitle></CardHeader>
                                <CardContent>
                                    <ChartContainer config={{}} className="w-full h-80">
                                        <ResponsiveContainer>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis tickFormatter={(value) => formatCurrency(value as number)}/>
                                                <RechartsTooltip content={<ChartTooltipContent />} />
                                                <Legend />
                                                <Line type="monotone" dataKey="Value" stroke="hsl(var(--chart-1))" />
                                                <Line type="monotone" dataKey="Total Interest" stroke="hsl(var(--chart-2))" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        )}
                        {result.schedule.length > 0 && (
                             <Card>
                                <CardHeader><CardTitle>Amortization Schedule</CardTitle></CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-96">
                                        <Table>
                                            <TableHeader><TableRow>
                                                <TableHead>Period</TableHead>
                                                <TableHead className="text-right">PV</TableHead>
                                                <TableHead className="text-right">PMT</TableHead>
                                                <TableHead className="text-right">Interest</TableHead>
                                                <TableHead className="text-right">FV</TableHead>
                                            </TableRow></TableHeader>
                                            <TableBody>
                                                {result.schedule.map(row => (
                                                    <TableRow key={row.period}>
                                                        <TableCell>{row.period}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(row.pv)}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(row.pmt)}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(row.interest)}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(row.fv)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        )}
                        </>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}

export default FinanceCalculator;
