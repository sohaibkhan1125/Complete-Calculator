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
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  unit: z.enum(["metric", "us"]),
  age: z.coerce.number().min(2).max(120),
  gender: z.enum(["male", "female"]),
  heightCm: z.coerce.number().optional(),
  weightKg: z.coerce.number().optional(),
  heightFt: z.coerce.number().optional(),
  heightIn: z.coerce.number().optional(),
  weightLb: z.coerce.number().optional(),
}).refine(data => {
    if (data.unit === 'metric') {
        return data.heightCm && data.heightCm > 0 && data.weightKg && data.weightKg > 0;
    }
    if (data.unit === 'us') {
        return data.heightFt && data.heightFt > 0 && data.weightLb && data.weightLb > 0;
    }
    return false;
}, {
    message: "Please fill in all required fields for the selected unit system.",
    path: ['unit'],
});


type FormData = z.infer<typeof formSchema>;
type BmiResult = {
    bmi: number;
    classification: string;
    healthyBmiRange: string;
    healthyWeightRange: string;
    bmiPrime: number;
    ponderalIndex: number;
};

const BmiRangeIndicator = ({ bmiValue }: { bmiValue: number }) => {
    const ranges = [
        { name: 'Underweight', min: 0, max: 18.5, color: 'bg-blue-400' },
        { name: 'Normal', min: 18.5, max: 24.9, color: 'bg-green-500' },
        { name: 'Overweight', min: 25, max: 29.9, color: 'bg-yellow-400' },
        { name: 'Obesity', min: 30, max: Infinity, color: 'bg-red-500' },
    ];
    
    const maxBmi = 40;
    const position = Math.min((bmiValue / maxBmi) * 100, 100);

    return (
        <div className="w-full">
            <div className="relative h-2 rounded-full flex overflow-hidden">
                {ranges.map(range => (
                    <div key={range.name} className={cn("h-full", range.color)} style={{ width: `${((range.max === Infinity ? maxBmi : range.max) - range.min) / maxBmi * 100}%` }} />
                ))}
                <div className="absolute top-0 h-full w-1 bg-black" style={{ left: `${position}%` }}>
                     <div className="absolute -top-5 -translate-x-1/2 text-xs font-bold">{bmiValue.toFixed(1)}</div>
                </div>
            </div>
            <div className="flex justify-between text-xs mt-1">
                {ranges.map(range => (
                    <div key={range.name} className="text-center" style={{ width: `${((range.max === Infinity ? maxBmi : range.max) - range.min) / maxBmi * 100}%` }}>{range.name}</div>
                ))}
            </div>
        </div>
    );
};


const BmiCalculator = () => {
    const [result, setResult] = useState<BmiResult | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            unit: "metric",
            age: 25,
            gender: "male",
            heightCm: 180,
            weightKg: 65,
            heightFt: 5,
            heightIn: 10,
            weightLb: 160,
        },
    });

    const unit = form.watch('unit');

    const onSubmit = (values: FormData) => {
        let heightM, weightKg;

        if (values.unit === 'metric') {
            heightM = (values.heightCm || 0) / 100;
            weightKg = values.weightKg || 0;
        } else { // US units
            const totalInches = ((values.heightFt || 0) * 12) + (values.heightIn || 0);
            heightM = totalInches * 0.0254;
            weightKg = (values.weightLb || 0) * 0.453592;
        }

        if (heightM <= 0 || weightKg <= 0) return;

        const bmi = weightKg / (heightM * heightM);
        const bmiPrime = bmi / 25;
        const ponderalIndex = weightKg / (heightM * heightM * heightM);
        
        let classification = '';
        if (bmi < 18.5) classification = 'Underweight';
        else if (bmi >= 18.5 && bmi <= 24.9) classification = 'Normal';
        else if (bmi >= 25 && bmi <= 29.9) classification = 'Overweight';
        else classification = 'Obesity';

        const healthyBmiRange = '18.5 kg/m² - 25 kg/m²';
        const lowerWeight = 18.5 * (heightM * heightM);
        const upperWeight = 25 * (heightM * heightM);

        const healthyWeightRange = values.unit === 'metric'
            ? `${lowerWeight.toFixed(1)} kg - ${upperWeight.toFixed(1)} kg`
            : `${(lowerWeight * 2.20462).toFixed(1)} lbs - ${(upperWeight * 2.20462).toFixed(1)} lbs`;

        setResult({
            bmi,
            classification,
            healthyBmiRange,
            healthyWeightRange,
            bmiPrime,
            ponderalIndex
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Enter Your Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                 <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                 <Tabs
                                                    value={field.value}
                                                    onValueChange={value => {
                                                        field.onChange(value);
                                                        setResult(null);
                                                    }}
                                                    className="w-full"
                                                >
                                                    <TabsList className="grid w-full grid-cols-2">
                                                        <TabsTrigger value="metric">Metric Units</TabsTrigger>
                                                        <TabsTrigger value="us">US Units</TabsTrigger>
                                                    </TabsList>
                                                </Tabs>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                               
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="age" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
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

                                {unit === 'metric' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField name="heightCm" control={form.control} render={({ field }) => (
                                            <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField name="weightKg" control={form.control} render={({ field }) => (
                                            <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                ) : (
                                     <>
                                        <FormLabel>Height</FormLabel>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField name="heightFt" control={form.control} render={({ field }) => (
                                                <FormItem><FormLabel>Feet</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField name="heightIn" control={form.control} render={({ field }) => (
                                                <FormItem><FormLabel>Inches</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                        </div>
                                        <FormField name="weightLb" control={form.control} render={({ field }) => (
                                            <FormItem><FormLabel>Weight (lbs)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                     </>
                                )}
                                
                                <Button type="submit" className="w-full">Calculate BMI</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3 space-y-8">
                {!result ? (
                     <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                         <CardHeader><CardTitle>Your BMI Result</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                         <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                     </Card>
                ) : (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Your BMI Result</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-5xl font-bold text-primary">{result.bmi.toFixed(1)}</p>
                                <p className="text-lg text-muted-foreground mt-1">kg/m²</p>
                                <p className="font-semibold text-xl mt-2">{result.classification}</p>
                            </div>
                             <div className="p-4 rounded-lg bg-secondary">
                                <h3 className="text-lg font-semibold mb-4 text-center">BMI Classification</h3>
                                <BmiRangeIndicator bmiValue={result.bmi} />
                            </div>
                            <div className="space-y-2 text-sm pt-6 border-t">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Healthy BMI Range</span>
                                    <strong>{result.healthyBmiRange}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Healthy Weight for Height</span>
                                    <strong>{result.healthyWeightRange}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">BMI Prime</span>
                                    <strong>{result.bmiPrime.toFixed(2)}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ponderal Index</span>
                                    <strong>{result.ponderalIndex.toFixed(2)} kg/m³</strong>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full mt-4" onClick={() => window.print()}>Save This Calculation</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default BmiCalculator;
