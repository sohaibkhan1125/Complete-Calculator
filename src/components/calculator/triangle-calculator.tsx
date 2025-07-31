"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useToast } from "@/hooks/use-toast";
import { ChevronsUpDown } from "lucide-react";

// Validation schema
const formSchema = z.object({
  sideA: z.string().optional(),
  sideB: z.string().optional(),
  sideC: z.string().optional(),
  angleA: z.string().optional(),
  angleB: z.string().optional(),
  angleC: z.string().optional(),
  unit: z.enum(["deg", "rad"]).default("deg"),
});

type FormData = z.infer<typeof formSchema>;
type TriangleResult = {
  sideA: number; sideB: number; sideC: number;
  angleA: number; angleB: number; angleC: number;
  area: number; perimeter: number; type: string;
};

const TriangleCalculator = () => {
    const [result, setResult] = useState<TriangleResult | null>(null);
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sideA: "", sideB: "", sideC: "",
            angleA: "60", angleB: "", angleC: "",
            unit: "deg",
        },
    });

    const toRad = (deg: number) => deg * (Math.PI / 180);
    const toDeg = (rad: number) => rad * (180 / Math.PI);
    
    const parseAngle = (angleStr: string, unit: "deg" | "rad") => {
        if (!angleStr) return NaN;
        const val = parseFloat(angleStr.replace(/pi/g, String(Math.PI)));
        return unit === "deg" ? toRad(val) : val;
    };
    
    const formatAngle = (angleRad: number, unit: "deg" | "rad") => {
        const val = unit === "deg" ? toDeg(angleRad) : angleRad;
        return parseFloat(val.toFixed(2));
    };

    const onSubmit = (data: FormData) => {
        let { sideA, sideB, sideC, angleA, angleB, angleC } = {
            sideA: parseFloat(data.sideA || "NaN"),
            sideB: parseFloat(data.sideB || "NaN"),
            sideC: parseFloat(data.sideC || "NaN"),
            angleA: parseAngle(data.angleA || "", data.unit),
            angleB: parseAngle(data.angleB || "", data.unit),
            angleC: parseAngle(data.angleC || "", data.unit),
        };

        const sides = [sideA, sideB, sideC].filter(v => !isNaN(v));
        const angles = [angleA, angleB, angleC].filter(v => !isNaN(v));

        if (sides.length + angles.length !== 3) {
            toast({ variant: "destructive", title: "Invalid Input", description: "Please provide exactly 3 values." });
            return;
        }
        if (sides.length === 0) {
            toast({ variant: "destructive", title: "Invalid Input", description: "Please provide at least one side length." });
            return;
        }

        try {
            // SSS
            if (sides.length === 3) {
                [sideA, sideB, sideC] = sides;
                if (sideA + sideB <= sideC || sideA + sideC <= sideB || sideB + sideC <= sideA) throw new Error("Invalid triangle sides (Triangle Inequality).");
                angleA = Math.acos((sideB * sideB + sideC * sideC - sideA * sideA) / (2 * sideB * sideC));
                angleB = Math.acos((sideA * sideA + sideC * sideC - sideB * sideB) / (2 * sideA * sideC));
                angleC = Math.PI - angleA - angleB;
            }
            // SAS
            else if (sides.length === 2 && angles.length === 1) {
                if (!isNaN(angleA) && !isNaN(sideB) && !isNaN(sideC)) { sideA = Math.sqrt(sideB*sideB + sideC*sideC - 2*sideB*sideC*Math.cos(angleA)); }
                else if (!isNaN(angleB) && !isNaN(sideA) && !isNaN(sideC)) { sideB = Math.sqrt(sideA*sideA + sideC*sideC - 2*sideA*sideC*Math.cos(angleB)); }
                else { sideC = Math.sqrt(sideA*sideA + sideB*sideB - 2*sideA*sideB*Math.cos(angleC)); }
            }

            // Law of Sines for other cases
            for(let i=0; i<5; i++){ // Iterate to solve
                if (isNaN(angleA)) {
                    if(!isNaN(angleB) && !isNaN(angleC)) angleA = Math.PI - angleB - angleC;
                    else if(!isNaN(sideA) && !isNaN(sideB) && !isNaN(angleB)) angleA = Math.asin(sideA * Math.sin(angleB) / sideB);
                    else if(!isNaN(sideA) && !isNaN(sideC) && !isNaN(angleC)) angleA = Math.asin(sideA * Math.sin(angleC) / sideC);
                }
                if (isNaN(angleB)) {
                    if(!isNaN(angleA) && !isNaN(angleC)) angleB = Math.PI - angleA - angleC;
                    else if(!isNaN(sideB) && !isNaN(sideA) && !isNaN(angleA)) angleB = Math.asin(sideB * Math.sin(angleA) / sideA);
                    else if(!isNaN(sideB) && !isNaN(sideC) && !isNaN(angleC)) angleB = Math.asin(sideB * Math.sin(angleC) / sideC);
                }
                 if (isNaN(angleC)) {
                    if(!isNaN(angleA) && !isNaN(angleB)) angleC = Math.PI - angleA - angleB;
                    else if(!isNaN(sideC) && !isNaN(sideA) && !isNaN(angleA)) angleC = Math.asin(sideC * Math.sin(angleA) / sideA);
                    else if(!isNaN(sideC) && !isNaN(sideB) && !isNaN(angleB)) angleC = Math.asin(sideC * Math.sin(angleB) / sideB);
                }

                if(isNaN(sideA)) {
                    if(!isNaN(sideB) && !isNaN(angleA) && !isNaN(angleB)) sideA = sideB * Math.sin(angleA) / Math.sin(angleB);
                    else if(!isNaN(sideC) && !isNaN(angleA) && !isNaN(angleC)) sideA = sideC * Math.sin(angleA) / Math.sin(angleC);
                }
                if(isNaN(sideB)) {
                    if(!isNaN(sideA) && !isNaN(angleB) && !isNaN(angleA)) sideB = sideA * Math.sin(angleB) / Math.sin(angleA);
                    else if(!isNaN(sideC) && !isNaN(angleB) && !isNaN(angleC)) sideB = sideC * Math.sin(angleB) / Math.sin(angleC);
                }
                if(isNaN(sideC)) {
                    if(!isNaN(sideA) && !isNaN(angleC) && !isNaN(angleA)) sideC = sideA * Math.sin(angleC) / Math.sin(angleA);
                    else if(!isNaN(sideB) && !isNaN(angleC) && !isNaN(angleB)) sideC = sideB * Math.sin(angleC) / Math.sin(angleB);
                }
            }

            if ([sideA, sideB, sideC, angleA, angleB, angleC].some(isNaN)) {
                throw new Error("Could not solve the triangle with the given inputs. Please check your values.");
            }

            const area = 0.5 * sideA * sideB * Math.sin(angleC);
            const perimeter = sideA + sideB + sideC;

            let type = "";
            const degA = toDeg(angleA), degB = toDeg(angleB), degC = toDeg(angleC);
            if (degA > 90 || degB > 90 || degC > 90) type = "Obtuse";
            else if (degA === 90 || degB === 90 || degC === 90) type = "Right";
            else type = "Acute";

            if (sideA === sideB && sideB === sideC) type += " Equilateral";
            else if (sideA === sideB || sideB === sideC || sideA === sideC) type += " Isosceles";
            else type += " Scalene";
            
            setResult({
                sideA: parseFloat(sideA.toFixed(2)), sideB: parseFloat(sideB.toFixed(2)), sideC: parseFloat(sideC.toFixed(2)),
                angleA: formatAngle(angleA, data.unit), angleB: formatAngle(angleB, data.unit), angleC: formatAngle(angleC, data.unit),
                area: parseFloat(area.toFixed(2)), perimeter: parseFloat(perimeter.toFixed(2)), type,
            });

        } catch (e: any) {
             toast({ variant: "destructive", title: "Calculation Error", description: e.message });
             setResult(null);
        }
    };
    
    const unitSymbol = form.watch('unit') === 'deg' ? '°' : 'rad';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader><CardTitle>Enter Triangle Values</CardTitle></CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField name="sideA" control={form.control} render={({ field }) => (<FormItem><FormLabel>Side a</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField name="angleA" control={form.control} render={({ field }) => (<FormItem><FormLabel>Angle A ({unitSymbol})</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField name="sideB" control={form.control} render={({ field }) => (<FormItem><FormLabel>Side b</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField name="angleB" control={form.control} render={({ field }) => (<FormItem><FormLabel>Angle B ({unitSymbol})</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField name="sideC" control={form.control} render={({ field }) => (<FormItem><FormLabel>Side c</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField name="angleC" control={form.control} render={({ field }) => (<FormItem><FormLabel>Angle C ({unitSymbol})</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                </div>
                                <FormField name="unit" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Angle Unit</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="deg" /></FormControl><FormLabel className="font-normal">Degrees (°)</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="rad" /></FormControl><FormLabel className="font-normal">Radians (rad)</FormLabel></FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}/>
                                <Button type="submit" className="w-full">Calculate</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                {!result ? (
                    <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                        <CardHeader><CardTitle>Triangle Results</CardTitle><CardDescription>Results will appear here after calculation.</CardDescription></CardHeader>
                        <CardContent><ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" /></CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader><CardTitle>Calculated Results</CardTitle><CardDescription>Triangle Type: <span className="font-semibold text-primary">{result.type}</span></CardDescription></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Side a</p><p className="text-xl font-bold">{result.sideA}</p></div>
                                <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Side b</p><p className="text-xl font-bold">{result.sideB}</p></div>
                                <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Side c</p><p className="text-xl font-bold">{result.sideC}</p></div>
                                <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Angle A</p><p className="text-xl font-bold">{result.angleA}{unitSymbol}</p></div>
                                <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Angle B</p><p className="text-xl font-bold">{result.angleB}{unitSymbol}</p></div>
                                <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Angle C</p><p className="text-xl font-bold">{result.angleC}{unitSymbol}</p></div>
                            </div>
                             <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t">
                                <div className="p-4"><p className="text-sm text-muted-foreground">Perimeter</p><p className="text-2xl font-bold text-primary">{result.perimeter}</p></div>
                                <div className="p-4"><p className="text-sm text-muted-foreground">Area</p><p className="text-2xl font-bold text-primary">{result.area}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default TriangleCalculator;
