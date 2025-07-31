"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { ArrowRight, Percent } from "lucide-react";

// Schemas
const basicSchema = z.object({
  val1: z.coerce.number(),
  val2: z.coerce.number(),
});

const commonPhraseSchema1 = z.object({ val1: z.coerce.number(), val2: z.coerce.number() });
const commonPhraseSchema2 = z.object({ val1: z.coerce.number(), val2: z.coerce.number().min(1, 'Cannot be zero') });
const commonPhraseSchema3 = z.object({ val1: z.coerce.number(), val2: z.coerce.number() });

const diffSchema = z.object({ val1: z.coerce.number(), val2: z.coerce.number() });
const changeSchema = z.object({ val1: z.coerce.number(), val2: z.coerce.number().min(1, 'Cannot be zero') });

const ResultDisplay = ({ result }: { result: string | null }) => {
    if (result === null) return null;
    return (
        <Card className="mt-4 bg-secondary">
            <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{result}</p>
            </CardContent>
        </Card>
    );
};

const PercentageCalculator = () => {
    // State for results
    const [basicResult, setBasicResult] = useState<string | null>(null);
    const [phrase1Result, setPhrase1Result] = useState<string | null>(null);
    const [phrase2Result, setPhrase2Result] = useState<string | null>(null);
    const [phrase3Result, setPhrase3Result] = useState<string | null>(null);
    const [diffResult, setDiffResult] = useState<string | null>(null);
    const [changeResult, setChangeResult] = useState<string | null>(null);

    // Form Hooks
    const basicForm = useForm<z.infer<typeof basicSchema>>({ resolver: zodResolver(basicSchema), defaultValues: { val1: 25, val2: 400 } });
    const phrase1Form = useForm<z.infer<typeof commonPhraseSchema1>>({ resolver: zodResolver(commonPhraseSchema1), defaultValues: { val1: 25, val2: 400 } });
    const phrase2Form = useForm<z.infer<typeof commonPhraseSchema2>>({ resolver: zodResolver(commonPhraseSchema2), defaultValues: { val1: 100, val2: 400 } });
    const phrase3Form = useForm<z.infer<typeof commonPhraseSchema3>>({ resolver: zodResolver(commonPhraseSchema3), defaultValues: { val1: 100, val2: 25 } });
    const diffForm = useForm<z.infer<typeof diffSchema>>({ resolver: zodResolver(diffSchema), defaultValues: { val1: 150, val2: 200 } });
    const changeForm = useForm<z.infer<typeof changeSchema>>({ resolver: zodResolver(changeSchema), defaultValues: { val1: 120, val2: 180 } });
    
    // Watchers for real-time calculation
    const watchBasic = useWatch({ control: basicForm.control });
    const watchPhrase1 = useWatch({ control: phrase1Form.control });
    const watchPhrase2 = useWatch({ control: phrase2Form.control });
    const watchPhrase3 = useWatch({ control: phrase3Form.control });
    const watchDiff = useWatch({ control: diffForm.control });
    const watchChange = useWatch({ control: changeForm.control });

    useEffect(() => {
        const { val1, val2 } = watchBasic;
        if (!isNaN(val1) && !isNaN(val2)) {
            setBasicResult(((val1 / 100) * val2).toLocaleString());
        }
    }, [watchBasic]);

    useEffect(() => {
        const { val1, val2 } = watchPhrase1;
        if (!isNaN(val1) && !isNaN(val2)) {
            setPhrase1Result(((val1 / 100) * val2).toLocaleString());
        }
    }, [watchPhrase1]);

    useEffect(() => {
        const { val1, val2 } = watchPhrase2;
        if (!isNaN(val1) && !isNaN(val2) && val2 !== 0) {
            setPhrase2Result(`${((val1 / val2) * 100).toLocaleString()}%`);
        }
    }, [watchPhrase2]);

     useEffect(() => {
        const { val1, val2 } = watchPhrase3;
        if (!isNaN(val1) && !isNaN(val2) && val2 !== 0) {
            setPhrase3Result(((val1 / val2) * 100).toLocaleString());
        }
    }, [watchPhrase3]);

    useEffect(() => {
        const { val1, val2 } = watchDiff;
        if (!isNaN(val1) && !isNaN(val2) && (val1 + val2) !== 0) {
             const diff = (Math.abs(val1 - val2) / ((val1 + val2) / 2)) * 100;
            setDiffResult(`${diff.toFixed(2)}%`);
        }
    }, [watchDiff]);

    useEffect(() => {
        const { val1, val2 } = watchChange;
        if (!isNaN(val1) && !isNaN(val2) && val1 !== 0) {
            const change = ((val2 - val1) / val1) * 100;
            const prefix = change >= 0 ? 'Increase' : 'Decrease';
            setChangeResult(`${Math.abs(change).toFixed(2)}% ${prefix}`);
        }
    }, [watchChange]);

    return (
        <Tabs defaultValue="common" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                <TabsTrigger value="common">Common Phrases</TabsTrigger>
                <TabsTrigger value="basic">Basic Calculator</TabsTrigger>
                <TabsTrigger value="change">Change & Difference</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
                 <Card>
                    <CardHeader><CardTitle>Basic Percentage</CardTitle></CardHeader>
                    <CardContent>
                        <Form {...basicForm}>
                            <form className="flex flex-col sm:flex-row items-center gap-2">
                                <FormField control={basicForm.control} name="val1" render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <span className="font-semibold text-muted-foreground">% of</span>
                                <FormField control={basicForm.control} name="val2" render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <span className="font-semibold text-2xl text-muted-foreground">=</span>
                                 <div className="font-bold text-2xl text-primary w-full sm:w-auto p-2 border rounded-md text-center bg-muted min-h-[40px]">
                                     {basicResult}
                                 </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="common">
                <div className="space-y-4">
                    <Card>
                        <CardHeader><CardDescription>What is [X]% of [Y]?</CardDescription></CardHeader>
                        <CardContent>
                            <Form {...phrase1Form}>
                                <form className="flex flex-col sm:flex-row items-center gap-2">
                                    <span className="font-semibold text-muted-foreground">What is</span>
                                    <FormField control={phrase1Form.control} name="val1" render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                    <span className="font-semibold text-muted-foreground">% of</span>
                                    <FormField control={phrase1Form.control} name="val2" render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                    <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />
                                    <div className="font-bold text-xl text-primary w-full sm:w-auto p-2 border rounded-md text-center bg-muted min-h-[40px] flex-grow">{phrase1Result}</div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardDescription>[X] is what % of [Y]?</CardDescription></CardHeader>
                        <CardContent>
                            <Form {...phrase2Form}>
                                <form className="flex flex-col sm:flex-row items-center gap-2">
                                    <FormField control={phrase2Form.control} name="val1" render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                    <span className="font-semibold text-muted-foreground">is what % of</span>
                                    <FormField control={phrase2Form.control} name="val2" render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                    <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />
                                    <div className="font-bold text-xl text-primary w-full sm:w-auto p-2 border rounded-md text-center bg-muted min-h-[40px] flex-grow">{phrase2Result}</div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardDescription>[X] is [Y]% of what?</CardDescription></CardHeader>
                        <CardContent>
                            <Form {...phrase3Form}>
                                <form className="flex flex-col sm:flex-row items-center gap-2">
                                    <FormField control={phrase3Form.control} name="val1" render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                    <span className="font-semibold text-muted-foreground">is</span>
                                     <FormField control={phrase3Form.control} name="val2" render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                    <span className="font-semibold text-muted-foreground">% of what?</span>
                                    <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />
                                    <div className="font-bold text-xl text-primary w-full sm:w-auto p-2 border rounded-md text-center bg-muted min-h-[40px] flex-grow">{phrase3Result}</div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="change">
                 <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader><CardTitle>Percentage Difference</CardTitle></CardHeader>
                        <CardContent>
                             <Form {...diffForm}>
                                <form className="space-y-4">
                                     <FormField control={diffForm.control} name="val1" render={({ field }) => (<FormItem><FormLabel>Value 1</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                     <FormField control={diffForm.control} name="val2" render={({ field }) => (<FormItem><FormLabel>Value 2</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                     <ResultDisplay result={diffResult} />
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Percentage Change</CardTitle></CardHeader>
                        <CardContent>
                             <Form {...changeForm}>
                                <form className="space-y-4">
                                     <FormField control={changeForm.control} name="val1" render={({ field }) => (<FormItem><FormLabel>Original Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                     <FormField control={changeForm.control} name="val2" render={({ field }) => (<FormItem><FormLabel>New Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                     <ResultDisplay result={changeResult} />
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                 </div>
            </TabsContent>
        </Tabs>
    );
};

export default PercentageCalculator;
