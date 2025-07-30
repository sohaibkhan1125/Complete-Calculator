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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronsUpDown, Printer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Link from "next/link";

const formSchema = z.object({
  unit: z.enum(["metric", "us"]),
  gender: z.enum(["male", "female"]),
  age: z.coerce.number().min(18).max(100),
  weight: z.coerce.number().min(0),
  height: z.coerce.number().min(0),
  neck: z.coerce.number().min(0),
  waist: z.coerce.number().min(0),
  hip: z.coerce.number().optional(), // For females
}).refine(data => {
    if (data.gender === 'female') {
        return data.hip !== undefined && data.hip > 0;
    }
    return true;
}, {
    message: "Hip measurement is required for females.",
    path: ['hip'],
});

type FormData = z.infer<typeof formSchema>;

type ResultType = {
    navyBfp: number;
    bmiBfp: number;
    fatMass: number;
    leanMass: number;
    fatCategory: string;
    idealBfp: number;
    fatToLose: number;
};

const idealFatPercentages = {
    male: [
        { age: "20-39", ideal: 19 },
        { age: "40-59", ideal: 22 },
        { age: "60-79", ideal: 25 },
    ],
    female: [
        { age: "20-39", ideal: 26 },
        { age: "40-59", ideal: 28 },
        { age: "60-79", ideal: 31 },
    ]
};

const aceCategories = {
    male: [
        { category: "Essential Fat", range: "2-5%" },
        { category: "Athletes", range: "6-13%" },
        { category: "Fitness", range: "14-17%" },
        { category: "Average", range: "18-24%" },
        { category: "Obese", range: "25%+" },
    ],
    female: [
        { category: "Essential Fat", range: "10-13%" },
        { category: "Athletes", range: "14-20%" },
        { category: "Fitness", range: "21-24%" },
        { category: "Average", range: "25-31%" },
        { category: "Obese", range: "32%+" },
    ]
};

const pieChartConfig = {
  leanMass: { label: "Lean Mass", color: "hsl(var(--chart-1))" },
  fatMass: { label: "Fat Mass", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const BodyFatCalculator = () => {
    const [result, setResult] = useState<ResultType | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            unit: "metric",
            gender: "male",
            age: 25,
            weight: 70,
            height: 178,
            neck: 50,
            waist: 96,
            hip: undefined
        },
    });
    
    const unit = form.watch('unit');
    const gender = form.watch('gender');
    const age = form.watch('age');

    const convertToCm = (val: number) => unit === 'us' ? val * 2.54 : val;
    const convertToKg = (val: number) => unit === 'us' ? val * 0.453592 : val;

    const onSubmit = (values: FormData) => {
        const heightCm = convertToCm(values.height);
        const neckCm = convertToCm(values.neck);
        const waistCm = convertToCm(values.waist);
        const weightKg = convertToKg(values.weight);

        let navyBfp: number;

        if (values.gender === 'male') {
            navyBfp = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
        } else {
            const hipCm = convertToCm(values.hip || 0);
            navyBfp = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
        }
        
        const bmi = weightKg / ((heightCm/100) * (heightCm/100));
        let bmiBfp: number;
        if(values.gender === 'male'){
            bmiBfp = 1.20 * bmi + 0.23 * values.age - 16.2;
        } else {
            bmiBfp = 1.20 * bmi + 0.23 * values.age - 5.4;
        }


        const fatMass = (navyBfp / 100) * weightKg;
        const leanMass = weightKg - fatMass;

        let fatCategory = "N/A";
        const categories = aceCategories[values.gender];
        for (const cat of categories) {
            const range = cat.range.replace('%', '').replace('+', '').split('-');
            const min = parseFloat(range[0]);
            const max = range.length > 1 ? parseFloat(range[1]) : Infinity;
            if (navyBfp >= min && navyBfp <= max) {
                fatCategory = cat.category;
                break;
            }
        }
        
        let idealBfp = 0;
        const idealRanges = idealFatPercentages[values.gender];
        if(values.age >= 20 && values.age <= 39) idealBfp = idealRanges[0].ideal;
        else if(values.age >= 40 && values.age <= 59) idealBfp = idealRanges[1].ideal;
        else if(values.age >= 60 && values.age <= 79) idealBfp = idealRanges[2].ideal;

        const fatToLose = Math.max(0, weightKg * (navyBfp - idealBfp) / 100);

        setResult({
            navyBfp,
            bmiBfp,
            fatMass,
            leanMass,
            fatCategory,
            idealBfp,
            fatToLose
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Enter Your Measurements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="unit" render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                                <Tabs value={field.value} onValueChange={value => { field.onChange(value); setResult(null); }} className="w-full">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="metric">Metric Units</TabsTrigger>
                                                    <TabsTrigger value="us">US Units</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                               
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="age" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField name="gender" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Gender</FormLabel>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 space-x-4">
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>

                                <FormField name="height" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField name="weight" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="neck" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Neck ({unit === 'metric' ? 'cm' : 'in'})</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField name="waist" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Waist ({unit === 'metric' ? 'cm' : 'in'})</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                </div>
                                {gender === 'female' && (
                                     <FormField name="hip" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Hip ({unit === 'metric' ? 'cm' : 'in'})</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                )}
                                
                                <Button type="submit" className="w-full">Calculate Body Fat</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3 space-y-8">
                {!result ? (
                     <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                         <CardHeader><CardTitle>Your Body Fat Analysis</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                         <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                     </Card>
                ) : (
                    <>
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Body Fat Results</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 text-center p-4 rounded-lg bg-secondary">
                                <p className="text-muted-foreground">U.S. Navy Method</p>
                                <p className="text-5xl font-bold text-primary">{result.navyBfp.toFixed(1)}%</p>
                                <p className="text-lg font-semibold">{result.fatCategory}</p>
                            </div>
                            <div className="space-y-4 text-center p-4 rounded-lg bg-secondary">
                                <p className="text-muted-foreground">BMI Method (Estimate)</p>
                                <p className="text-5xl font-bold text-primary">{result.bmiBfp.toFixed(1)}%</p>
                                <p className="text-lg font-semibold">BMI-Based Result</p>
                            </div>
                        </CardContent>
                        <CardContent>
                            <div className="space-y-2 text-sm pt-6 border-t">
                                <div className="flex justify-between"><span>Body Fat Mass:</span> <strong>{result.fatMass.toFixed(2)} {unit === 'metric' ? 'kg' : 'lbs'}</strong></div>
                                <div className="flex justify-between"><span>Lean Body Mass:</span> <strong>{result.leanMass.toFixed(2)} {unit === 'metric' ? 'kg' : 'lbs'}</strong></div>
                                <div className="flex justify-between"><span>Ideal Body Fat % for Age {age}:</span> <strong>{result.idealBfp}%</strong></div>
                                <div className="flex justify-between font-bold"><span>Fat to Lose for Ideal %:</span> <strong>{result.fatToLose.toFixed(2)} {unit === 'metric' ? 'kg' : 'lbs'}</strong></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Mass Breakdown</CardTitle></CardHeader>
                        <CardContent>
                             <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                        <Pie data={[{ name: 'Lean Mass', value: result.leanMass }, { name: 'Fat Mass', value: result.fatMass }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                             <Cell key="cell-0" fill="hsl(var(--chart-1))" />
                                             <Cell key="cell-1" fill="hsl(var(--chart-2))" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Reference Tables</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">ACE Body Fat Categories ({gender})</h3>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Percentage</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {aceCategories[gender].map(item => (
                                            <TableRow key={item.category} className={item.category === result.fatCategory ? 'bg-secondary' : ''}>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell>{item.range}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                             <div>
                                <h3 className="font-semibold mb-2">Ideal Body Fat % (Jackson & Pollock)</h3>
                                <Table>
                                     <TableHeader><TableRow><TableHead>Age</TableHead><TableHead>Male</TableHead><TableHead>Female</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {idealFatPercentages.male.map((item, index) => (
                                            <TableRow key={item.age}>
                                                <TableCell>{item.age}</TableCell>
                                                <TableCell>{idealFatPercentages.male[index].ideal}%</TableCell>
                                                <TableCell>{idealFatPercentages.female[index].ideal}%</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Related Calculators</CardTitle></CardHeader>
                        <CardContent className="flex flex-col space-y-2">
                             <Link href="/bmi-calculator" className="text-primary hover:underline">BMI Calculator</Link>
                             <Link href="/calorie-calculator" className="text-primary hover:underline">Calorie Calculator</Link>
                        </CardContent>
                    </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default BodyFatCalculator;
