"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '../ui/scroll-area';

// Helper function to check if a string can be a BigInt
const isBigIntString = (value: string) => {
    try {
        BigInt(value);
        return true;
    } catch (e) {
        return false;
    }
};

// Generate a random BigInt in a given range
function randomBigInt(min: bigint, max: bigint): bigint {
    const range = max - min;
    if (range <= 0n) return min;

    const bits = range.toString(2).length;
    let random;
    do {
        const buffer = new Uint8Array(Math.ceil(bits / 8));
        crypto.getRandomValues(buffer);
        let hex = '0x';
        buffer.forEach(byte => hex += byte.toString(16).padStart(2, '0'));
        random = BigInt(hex) & ((1n << BigInt(bits)) - 1n);
    } while (random > range);

    return min + random;
}


// Zod Schemas
const basicSchema = z.object({
    lowerLimit: z.string().refine(isBigIntString, { message: "Invalid integer" }),
    upperLimit: z.string().refine(isBigIntString, { message: "Invalid integer" }),
}).refine(data => BigInt(data.lowerLimit) <= BigInt(data.upperLimit), {
    message: "Upper limit must be greater than or equal to the lower limit.",
    path: ["upperLimit"],
});

const comprehensiveSchema = z.object({
    lowerLimit: z.coerce.number(),
    upperLimit: z.coerce.number(),
    count: z.coerce.number().int().min(1).max(1000),
    type: z.enum(['integer', 'decimal']),
    precision: z.coerce.number().int().min(0).max(100).optional(),
}).refine(data => data.lowerLimit <= data.upperLimit, {
    message: "Upper limit must be greater than or equal to the lower limit.",
    path: ["upperLimit"],
});

const RandomNumberGenerator = () => {
    const { toast } = useToast();
    const [basicResult, setBasicResult] = useState<string | null>(null);
    const [comprehensiveResult, setComprehensiveResult] = useState<string[] | null>(null);
    
    const basicForm = useForm<z.infer<typeof basicSchema>>({
        resolver: zodResolver(basicSchema),
        defaultValues: { lowerLimit: '1', upperLimit: '100' },
    });

    const comprehensiveForm = useForm<z.infer<typeof comprehensiveSchema>>({
        resolver: zodResolver(comprehensiveSchema),
        defaultValues: { lowerLimit: 0.2, upperLimit: 112.5, count: 10, type: 'decimal', precision: 50 },
    });

    const onBasicSubmit = (data: z.infer<typeof basicSchema>) => {
        try {
            const lower = BigInt(data.lowerLimit);
            const upper = BigInt(data.upperLimit);
            const result = randomBigInt(lower, upper);
            setBasicResult(result.toString());
        } catch (e: any) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        }
    };

    const onComprehensiveSubmit = (data: z.infer<typeof comprehensiveSchema>) => {
        const { lowerLimit, upperLimit, count, type, precision } = data;
        const results = [];
        for (let i = 0; i < count; i++) {
            const randomNumber = Math.random() * (upperLimit - lowerLimit) + lowerLimit;
            if (type === 'integer') {
                results.push(String(Math.floor(randomNumber)));
            } else {
                results.push(randomNumber.toFixed(precision || 20));
            }
        }
        setComprehensiveResult(results);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Basic Random Integer Generator</CardTitle>
                    <CardDescription>Generate a single random integer within a specified range. Supports very large numbers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...basicForm}>
                        <form onSubmit={basicForm.handleSubmit(onBasicSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField name="lowerLimit" control={basicForm.control} render={({ field }) => (
                                    <FormItem><FormLabel>Lower Limit</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="upperLimit" control={basicForm.control} render={({ field }) => (
                                    <FormItem><FormLabel>Upper Limit</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <Button type="submit" className="w-full">Generate</Button>
                        </form>
                    </Form>
                    {basicResult && (
                        <Card className="mt-6 bg-secondary">
                            <CardHeader><CardTitle className="text-center text-muted-foreground">Result</CardTitle></CardHeader>
                            <CardContent className="text-3xl font-bold text-center text-primary break-all">{basicResult}</CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Comprehensive Random Number Generator</CardTitle>
                    <CardDescription>Generate multiple random integers or decimals with custom precision.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...comprehensiveForm}>
                        <form onSubmit={comprehensiveForm.handleSubmit(onComprehensiveSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField name="lowerLimit" control={comprehensiveForm.control} render={({ field }) => (
                                    <FormItem><FormLabel>Lower Limit</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="upperLimit" control={comprehensiveForm.control} render={({ field }) => (
                                    <FormItem><FormLabel>Upper Limit</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField name="count" control={comprehensiveForm.control} render={({ field }) => (
                                    <FormItem><FormLabel>How many numbers?</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="type" control={comprehensiveForm.control} render={({ field }) => (
                                    <FormItem><FormLabel>Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 space-x-4">
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="integer" /></FormControl><FormLabel className="font-normal">Integer</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="decimal" /></FormControl><FormLabel className="font-normal">Decimal</FormLabel></FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    </FormItem>
                                )}/>
                                <FormField name="precision" control={comprehensiveForm.control} render={({ field }) => (
                                    <FormItem><FormLabel>Decimal Precision</FormLabel><FormControl><Input type="number" {...field} disabled={comprehensiveForm.watch('type') === 'integer'} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                             <Button type="submit" className="w-full">Generate</Button>
                        </form>
                    </Form>
                     {comprehensiveResult && (
                        <Card className="mt-6 bg-secondary">
                             <CardHeader><CardTitle className="text-center text-muted-foreground">Results</CardTitle></CardHeader>
                             <CardContent>
                                 <ScrollArea className="h-64 p-4 border rounded-md bg-background">
                                     <div className="font-mono text-sm break-all">
                                         {comprehensiveResult.map((num, index) => <div key={index}>{num}</div>)}
                                     </div>
                                 </ScrollArea>
                             </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RandomNumberGenerator;
