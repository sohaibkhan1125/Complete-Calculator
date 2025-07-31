"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Minus, X, Divide, Equal } from 'lucide-react';

// Helper functions for fraction math
const gcd = (a: bigint, b: bigint): bigint => {
    return b === 0n ? a : gcd(b, a % b);
};

const simplify = (num: bigint, den: bigint): { num: bigint, den: bigint } => {
    if (den === 0n) throw new Error("Denominator cannot be zero.");
    const commonDivisor = gcd(BigInt(Math.abs(Number(num))), BigInt(Math.abs(Number(den))));
    let newNum = num / commonDivisor;
    let newDen = den / commonDivisor;
    if (newDen < 0n) {
        newNum = -newNum;
        newDen = -newDen;
    }
    return { num: newNum, den: newDen };
};

const toMixed = (num: bigint, den: bigint): { whole: bigint, num: bigint, den: bigint } => {
    const whole = num / den;
    const newNum = num % den;
    return { whole, num: newNum, den };
};

// Zod Schemas
const basicSchema = z.object({
    num1: z.string().refine(val => !isNaN(BigInt(val)), { message: "Invalid number" }),
    den1: z.string().refine(val => !isNaN(BigInt(val)) && BigInt(val) !== 0n, { message: "Non-zero number required" }),
    op: z.enum(['+', '-', '*', '/']),
    num2: z.string().refine(val => !isNaN(BigInt(val)), { message: "Invalid number" }),
    den2: z.string().refine(val => !isNaN(BigInt(val)) && BigInt(val) !== 0n, { message: "Non-zero number required" }),
});

const simplifySchema = z.object({
    num: z.string().refine(val => !isNaN(BigInt(val)), { message: "Invalid number" }),
    den: z.string().refine(val => !isNaN(BigInt(val)) && BigInt(val) !== 0n, { message: "Non-zero number required" }),
});

const decimalToFractionSchema = z.object({
    decimal: z.string().refine(val => !isNaN(parseFloat(val)), { message: "Invalid decimal" }),
});

const fractionToDecimalSchema = z.object({
    num: z.string().refine(val => !isNaN(BigInt(val)), { message: "Invalid number" }),
    den: z.string().refine(val => !isNaN(BigInt(val)) && BigInt(val) !== 0n, { message: "Non-zero number required" }),
});


const ResultDisplay = ({ result }: { result: string }) => (
    <Card className="mt-6 bg-secondary">
        <CardHeader>
            <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-3xl font-bold text-center text-primary break-all">{result}</p>
        </CardContent>
    </Card>
);

const FractionInput = ({ control, nameNum, nameDen }: { control: any, nameNum: string, nameDen: string }) => (
    <div className="flex flex-col items-center space-y-2">
        <FormField
            control={control}
            name={nameNum}
            render={({ field }) => (
                <FormItem className="w-full">
                    <FormControl><Input {...field} placeholder="Numerator" className="text-center" /></FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <div className="w-full h-px bg-foreground" />
        <FormField
            control={control}
            name={nameDen}
            render={({ field }) => (
                <FormItem className="w-full">
                    <FormControl><Input {...field} placeholder="Denominator" className="text-center" /></FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    </div>
);

const FractionCalculator = () => {
    const [result, setResult] = useState<string | null>(null);

    const basicForm = useForm<z.infer<typeof basicSchema>>({ resolver: zodResolver(basicSchema), defaultValues: { op: '+' } });
    const simplifyForm = useForm<z.infer<typeof simplifySchema>>({ resolver: zodResolver(simplifySchema) });
    const decToFracForm = useForm<z.infer<typeof decimalToFractionSchema>>({ resolver: zodResolver(decimalToFractionSchema) });
    const fracToDecForm = useForm<z.infer<typeof fractionToDecimalSchema>>({ resolver: zodResolver(fractionToDecimalSchema) });

    const onBasicSubmit = (data: z.infer<typeof basicSchema>) => {
        try {
            const n1 = BigInt(data.num1);
            const d1 = BigInt(data.den1);
            const n2 = BigInt(data.num2);
            const d2 = BigInt(data.den2);
            let resN, resD;
            switch (data.op) {
                case '+': resN = n1 * d2 + n2 * d1; resD = d1 * d2; break;
                case '-': resN = n1 * d2 - n2 * d1; resD = d1 * d2; break;
                case '*': resN = n1 * n2; resD = d1 * d2; break;
                case '/': resN = n1 * d2; resD = d1 * n2; break;
            }
            if(resD === 0n) throw new Error("Resulting denominator is zero.");
            const { num, den } = simplify(resN, resD);
            const { whole, num: mixedNum, den: mixedDen } = toMixed(num, den);
            let resultString = `${num}/${den}`;
            if (whole !== 0n && mixedNum !== 0n) {
                resultString += `  or  ${whole} ${BigInt(Math.abs(Number(mixedNum)))}/${mixedDen}`;
            } else if (whole !== 0n && mixedNum === 0n) {
                resultString = `${whole}`;
            }
            setResult(resultString);
        } catch (e: any) {
            setResult(`Error: ${e.message}`);
        }
    };

    const onSimplifySubmit = (data: z.infer<typeof simplifySchema>) => {
        try {
            const { num, den } = simplify(BigInt(data.num), BigInt(data.den));
            setResult(`${num}/${den}`);
        } catch (e: any) {
            setResult(`Error: ${e.message}`);
        }
    };

    const onDecToFracSubmit = (data: z.infer<typeof decimalToFractionSchema>) => {
        try {
            const decimalValue = data.decimal;
            const parts = decimalValue.split('.');
            if (parts.length > 2) throw new Error("Invalid decimal format");

            let numStr = decimalValue.replace('.', '');
            let denStr = '1' + '0'.repeat(parts[1]?.length || 0);
            
            const { num, den } = simplify(BigInt(numStr), BigInt(denStr));
            setResult(`${num}/${den}`);
        } catch (e: any) {
            setResult(`Error: ${e.message}`);
        }
    };

    const onFracToDecSubmit = (data: z.infer<typeof fractionToDecimalSchema>) => {
        try {
            const num = BigInt(data.num);
            const den = BigInt(data.den);
            // For BigInt, we must convert to Number for division, which can lose precision for huge numbers.
            // This is a limitation without a full BigNumber library.
            if (den === 0n) throw new Error("Denominator cannot be zero.");
            const res = Number(num) / Number(den);
            setResult(res.toString());
        } catch (e: any) {
            setResult(`Error: ${e.message}`);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardContent className="pt-6">
                <Tabs defaultValue="basic">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="basic">Operations</TabsTrigger>
                        <TabsTrigger value="simplify">Simplify</TabsTrigger>
                        <TabsTrigger value="dec-to-frac">Decimal to Fraction</TabsTrigger>
                        <TabsTrigger value="frac-to-dec">Fraction to Decimal</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic">
                        <Card>
                            <CardHeader><CardTitle>Basic Fraction Operations</CardTitle></CardHeader>
                            <CardContent>
                                <Form {...basicForm}>
                                    <form onSubmit={basicForm.handleSubmit(onBasicSubmit)} className="flex items-start gap-4">
                                        <FractionInput control={basicForm.control} nameNum="num1" nameDen="den1" />
                                        <div className="pt-10">
                                            <FormField control={basicForm.control} name="op" render={({ field }) => (
                                                <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-20"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="+"><Plus className="h-4 w-4"/></SelectItem><SelectItem value="-"><Minus className="h-4 w-4"/></SelectItem><SelectItem value="*"><X className="h-4 w-4"/></SelectItem><SelectItem value="/"><Divide className="h-4 w-4"/></SelectItem></SelectContent></Select></FormItem>
                                            )} />
                                        </div>
                                        <FractionInput control={basicForm.control} nameNum="num2" nameDen="den2" />
                                        <div className="pt-10"> <Button type="submit" size="icon"><Equal className="h-4 w-4"/></Button> </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="simplify">
                        <Card>
                            <CardHeader><CardTitle>Simplify Fraction</CardTitle></CardHeader>
                            <CardContent>
                                <Form {...simplifyForm}>
                                    <form onSubmit={simplifyForm.handleSubmit(onSimplifySubmit)} className="flex items-start gap-4">
                                        <FractionInput control={simplifyForm.control} nameNum="num" nameDen="den" />
                                        <div className="pt-10"> <Button type="submit" className="w-full">Simplify</Button> </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="dec-to-frac">
                        <Card>
                            <CardHeader><CardTitle>Decimal to Fraction</CardTitle></CardHeader>
                            <CardContent>
                                <Form {...decToFracForm}>
                                    <form onSubmit={decToFracForm.handleSubmit(onDecToFracSubmit)} className="flex items-end gap-4">
                                        <FormField control={decToFracForm.control} name="decimal" render={({ field }) => (
                                            <FormItem className="flex-grow"><FormLabel>Decimal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <Button type="submit">Convert</Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="frac-to-dec">
                        <Card>
                            <CardHeader><CardTitle>Fraction to Decimal</CardTitle></CardHeader>
                            <CardContent>
                                <Form {...fracToDecForm}>
                                    <form onSubmit={fracToDecForm.handleSubmit(onFracToDecSubmit)} className="flex items-start gap-4">
                                         <FractionInput control={fracToDecForm.control} nameNum="num" nameDen="den" />
                                         <div className="pt-10"> <Button type="submit" className="w-full">Convert</Button> </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
                {result && <ResultDisplay result={result} />}
            </CardContent>
        </Card>
    );
};

export default FractionCalculator;
