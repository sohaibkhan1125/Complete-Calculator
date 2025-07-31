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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronsUpDown } from "lucide-react";

const formSchema = z.object({
  unit: z.enum(["metric", "us"]),
  age: z.coerce.number().min(2).max(80),
  gender: z.enum(["male", "female"]),
  heightCm: z.coerce.number().optional(),
  heightFt: z.coerce.number().optional(),
  heightIn: z.coerce.number().optional(),
}).refine(data => {
    if (data.unit === 'metric') return data.heightCm && data.heightCm > 0;
    if (data.unit === 'us') return data.heightFt && data.heightFt > 0;
    return false;
}, {
    message: "Please fill in all required height fields.",
    path: ['unit'],
});

type FormData = z.infer<typeof formSchema>;
type IdealWeightResult = {
    formula: string;
    weight: string;
};

const IdealWeightCalculator = () => {
    const [results, setResults] = useState<IdealWeightResult[] | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            unit: "metric",
            age: 25,
            gender: "male",
            heightCm: 180,
            heightFt: 5,
            heightIn: 10,
        },
    });

    const unit = form.watch('unit');

    const onSubmit = (values: FormData) => {
        let heightInches: number;
        let heightMeters: number;

        if (values.unit === 'metric') {
            heightInches = (values.heightCm || 0) * 0.393701;
            heightMeters = (values.heightCm || 0) / 100;
        } else { // US units
            heightInches = ((values.heightFt || 0) * 12) + (values.heightIn || 0);
            heightMeters = heightInches * 0.0254;
        }

        if (heightInches <= 60) {
            setResults([]); // Formulas are generally for heights > 5ft
            return;
        }

        const inchesOver5Ft = heightInches - 60;
        const isMale = values.gender === 'male';

        const formulas = {
            "Robinson (1983)": isMale ? 52 + 1.9 * inchesOver5Ft : 49 + 1.7 * inchesOver5Ft,
            "Miller (1983)": isMale ? 56.2 + 1.41 * inchesOver5Ft : 53.1 + 1.36 * inchesOver5Ft,
            "Devine (1974)": isMale ? 50.0 + 2.3 * inchesOver5Ft : 45.5 + 2.3 * inchesOver5Ft,
            "Hamwi (1964)": isMale ? 48.0 + 2.7 * inchesOver5Ft : 45.5 + 2.2 * inchesOver5Ft,
        };

        const calculatedResults: IdealWeightResult[] = Object.entries(formulas).map(([formula, weightKg]) => ({
            formula,
            weight: values.unit === 'metric' ? `${weightKg.toFixed(1)} kg` : `${(weightKg * 2.20462).toFixed(1)} lbs`,
        }));

        const lowerBmiWeight = 18.5 * (heightMeters * heightMeters);
        const upperBmiWeight = 25 * (heightMeters * heightMeters);

        const bmiRange = values.unit === 'metric'
            ? `${lowerBmiWeight.toFixed(1)} - ${upperBmiWeight.toFixed(1)} kg`
            : `${(lowerBmiWeight * 2.20462).toFixed(1)} - ${(upperBmiWeight * 2.20462).toFixed(1)} lbs`;

        calculatedResults.push({
            formula: "Healthy BMI Range",
            weight: bmiRange,
        });

        setResults(calculatedResults);
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
                                        <FormItem>
                                            <FormControl>
                                                 <Tabs
                                                    value={field.value}
                                                    onValueChange={value => {
                                                        field.onChange(value);
                                                        setResults(null);
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
                                    <FormField name="heightCm" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
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
                                     </>
                                )}
                                
                                <Button type="submit" className="w-full">Calculate Ideal Weight</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                {!results ? (
                     <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                         <CardHeader><CardTitle>Your Ideal Weight</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                         <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                     </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ideal Weight Results</CardTitle>
                            <CardDescription>Based on different scientific formulas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Formula</TableHead>
                                        <TableHead className="text-right">Ideal Weight</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map(result => (
                                        <TableRow key={result.formula} className={result.formula === "Healthy BMI Range" ? "font-bold bg-secondary" : ""}>
                                            <TableCell>{result.formula}</TableCell>
                                            <TableCell className="text-right">{result.weight}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="text-xs text-muted-foreground mt-4">
                                <p>Note: These formulas are based on population averages and may not be suitable for all individuals, such as athletes or the elderly. The "Healthy BMI Range" is often considered the most practical measure for most people.</p>
                            </div>
                            <Button variant="outline" className="w-full mt-6" onClick={() => window.print()}>Save This Calculation</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default IdealWeightCalculator;
