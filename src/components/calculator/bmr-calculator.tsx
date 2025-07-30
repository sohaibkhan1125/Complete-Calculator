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
import { ChevronsUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formSchema = z.object({
  unit: z.enum(["metric", "us"]),
  age: z.coerce.number().min(15).max(80),
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
    message: "Please fill in all required height and weight fields.",
    path: ['unit'],
});

type FormData = z.infer<typeof formSchema>;
type BmrResult = {
  bmr: number;
  activityLevels: { level: string; calories: number }[];
};

const activityFactors = [
    { name: 'Sedentary: little or no exercise', value: 1.2 },
    { name: 'Exercise 1-3 times/week', value: 1.375 },
    { name: 'Exercise 4-5 times/week', value: 1.465 },
    { name: 'Daily exercise or intense exercise 3-4 times/week', value: 1.55 },
    { name: 'Intense exercise 6-7 times/week', value: 1.725 },
    { name: 'Very intense exercise daily, or physical job', value: 1.9 },
];


const BmrCalculator = () => {
    const [result, setResult] = useState<BmrResult | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            unit: "metric",
            age: 25,
            gender: "male",
            heightCm: 180,
            weightKg: 60,
            heightFt: 5,
            heightIn: 10,
            weightLb: 132,
        },
    });

    const unit = form.watch('unit');

    const onSubmit = (values: FormData) => {
        let heightCm, weightKg;

        if (values.unit === 'metric') {
            heightCm = values.heightCm || 0;
            weightKg = values.weightKg || 0;
        } else { // US units
            const totalInches = ((values.heightFt || 0) * 12) + (values.heightIn || 0);
            heightCm = totalInches * 2.54;
            weightKg = (values.weightLb || 0) * 0.453592;
        }

        if (heightCm <= 0 || weightKg <= 0) return;

        let bmr;
        if (values.gender === 'male') {
            // Mifflin-St Jeor Equation
            bmr = 10 * weightKg + 6.25 * heightCm - 5 * values.age + 5;
        } else {
            // Mifflin-St Jeor Equation
            bmr = 10 * weightKg + 6.25 * heightCm - 5 * values.age - 161;
        }
        
        const activityLevels = activityFactors.map(activity => ({
            level: activity.name,
            calories: Math.round(bmr * activity.value)
        }));

        setResult({
            bmr: Math.round(bmr),
            activityLevels
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
                                        <FormItem>
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
                                
                                <Button type="submit" className="w-full">Calculate BMR</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3 space-y-8">
                {!result ? (
                     <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                         <CardHeader><CardTitle>Your BMR Result</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                         <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                     </Card>
                ) : (
                    <>
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Your Basal Metabolic Rate (BMR)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-5xl text-center font-bold text-primary">{result.bmr} <span className="text-xl text-muted-foreground">Calories/day</span></p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Calorie Needs by Activity Level</CardTitle>
                            <CardDescription>This table shows your estimated daily calorie needs based on your activity level.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Activity Level</TableHead>
                                        <TableHead className="text-right">Calories per Day</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.activityLevels.map(activity => (
                                        <TableRow key={activity.level}>
                                            <TableCell>{activity.level}</TableCell>
                                            <TableCell className="text-right font-semibold">{activity.calories}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="text-xs text-muted-foreground mt-4 space-y-1">
                                <p><strong>Exercise:</strong> 15–30 minutes of elevated heart rate activity.</p>
                                <p><strong>Intense exercise:</strong> 45–120 minutes of elevated heart rate activity.</p>
                                <p><strong>Very intense exercise:</strong> 2+ hours of elevated heart rate activity.</p>
                            </div>
                        </CardContent>
                    </Card>
                     <div className="text-center">
                         <Button variant="outline" onClick={() => window.print()}>Save This Calculation</Button>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BmrCalculator;
