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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  activityLevel: z.coerce.number(),
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
type CalorieResult = {
  maintenance: number;
  loseWeight: number;
  gainWeight: number;
};
type MacroSplit = {
    name: string;
    protein: string;
    carbs: string;
    fats: string;
};

const activityLevels = [
    { value: 1.2, name: 'Sedentary', description: 'Little or no exercise' },
    { value: 1.375, name: 'Light', description: 'Exercise 1-3 times/week' },
    { value: 1.55, name: 'Moderate', description: 'Exercise 4-5 times/week' },
    { value: 1.725, name: 'Intense', description: '45–120 minutes of elevated heart rate activity' },
    { value: 1.9, name: 'Very Intense', description: '2+ hours of elevated heart rate activity daily' },
];

const macroRatios = {
    "Balanced": { protein: 0.30, carbs: 0.50, fats: 0.20 },
    "Low Carb": { protein: 0.40, carbs: 0.30, fats: 0.30 },
    "High Protein": { protein: 0.50, carbs: 0.30, fats: 0.20 },
};

const CalorieCalculator = () => {
    const [result, setResult] = useState<CalorieResult | null>(null);

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
            weightLb: 143,
            activityLevel: 1.2,
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
            bmr = 10 * weightKg + 6.25 * heightCm - 5 * values.age + 5;
        } else {
            bmr = 10 * weightKg + 6.25 * heightCm - 5 * values.age - 161;
        }

        const maintenance = Math.round(bmr * values.activityLevel);

        setResult({
            maintenance,
            loseWeight: maintenance - 500,
            gainWeight: maintenance + 500,
        });
    };
    
    const calculateMacros = (calories: number): MacroSplit[] => {
        return Object.entries(macroRatios).map(([name, ratios]) => ({
            name,
            protein: `${Math.round(calories * ratios.protein / 4)}g`,
            carbs: `${Math.round(calories * ratios.carbs / 4)}g`,
            fats: `${Math.round(calories * ratios.fats / 9)}g`,
        }));
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
                                
                                <FormField
                                    name="activityLevel"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Activity Level</FormLabel>
                                            <Select onValueChange={(v) => field.onChange(parseFloat(v))} defaultValue={String(field.value)}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {activityLevels.map(level => (
                                                        <SelectItem key={level.value} value={String(level.value)}>{level.name}: <span className="text-muted-foreground">{level.description}</span></SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <Button type="submit" className="w-full">Calculate</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3 space-y-8">
                {!result ? (
                     <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                         <CardHeader><CardTitle>Your Daily Calorie Needs</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                         <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                     </Card>
                ) : (
                    <>
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Daily Calorie Needs</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-secondary rounded-lg">
                                <p className="text-muted-foreground">Maintain Weight</p>
                                <p className="text-3xl font-bold text-primary">{result.maintenance} kcal</p>
                            </div>
                             <div className="p-4 bg-secondary rounded-lg">
                                <p className="text-muted-foreground">Lose Weight (~1lb/wk)</p>
                                <p className="text-3xl font-bold text-blue-500">{result.loseWeight} kcal</p>
                            </div>
                             <div className="p-4 bg-secondary rounded-lg">
                                <p className="text-muted-foreground">Gain Weight (~1lb/wk)</p>
                                <p className="text-3xl font-bold text-green-500">{result.gainWeight} kcal</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Example Macronutrient Split</CardTitle>
                            <CardDescription>Based on your maintenance calories. Protein/Carbs/Fats.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Diet Type</TableHead>
                                        <TableHead className="text-right">Protein</TableHead>
                                        <TableHead className="text-right">Carbs</TableHead>
                                        <TableHead className="text-right">Fats</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {calculateMacros(result.maintenance).map(macro => (
                                        <TableRow key={macro.name}>
                                            <TableCell className="font-medium">{macro.name}</TableCell>
                                            <TableCell className="text-right">{macro.protein}</TableCell>
                                            <TableCell className="text-right">{macro.carbs}</TableCell>
                                            <TableCell className="text-right">{macro.fats}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Food Energy Converter</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground">
                                1 Calorie (kcal) = 4.1868 Kilojoules (kJ)
                            </p>
                        </CardContent>
                    </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default CalorieCalculator;
