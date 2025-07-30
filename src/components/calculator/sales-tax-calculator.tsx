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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formSchema = z.object({
  beforeTax: z.coerce.number().optional(),
  taxRate: z.coerce.number().optional(),
  afterTax: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;
type ResultType = { label: string; value: string; description?: string };

const SalesTaxCalculator = () => {
    const [solveFor, setSolveFor] = useState("afterTax");
    const [result, setResult] = useState<ResultType | null>(null);
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            beforeTax: 100,
            taxRate: 6.5,
            afterTax: undefined,
        },
    });

    const onSubmit = (values: FormData) => {
        let { beforeTax, taxRate, afterTax } = values;
        let calculatedValue: number | null = null;
        let resultLabel = "";
        let resultDesc = "";

        try {
            switch(solveFor) {
                case 'afterTax':
                    if (beforeTax === undefined || taxRate === undefined) throw new Error("Missing required fields");
                    calculatedValue = beforeTax * (1 + (taxRate / 100));
                    resultLabel = "After-Tax Price";
                    resultDesc = `${formatCurrency(beforeTax)} + ${taxRate}% tax = ${formatCurrency(calculatedValue)}`;
                    break;
                case 'taxRate':
                    if (beforeTax === undefined || afterTax === undefined) throw new Error("Missing required fields");
                    if (beforeTax === 0) throw new Error("Before-tax price cannot be zero.");
                    calculatedValue = ((afterTax / beforeTax) - 1) * 100;
                    resultLabel = "Sales Tax Rate";
                    resultDesc = `The sales tax rate is ${calculatedValue.toFixed(3)}%`;
                    break;
                case 'beforeTax':
                    if (afterTax === undefined || taxRate === undefined) throw new Error("Missing required fields");
                    if (taxRate <= -100) throw new Error("Tax rate must be greater than -100%.");
                    calculatedValue = afterTax / (1 + (taxRate / 100));
                    resultLabel = "Before-Tax Price";
                    resultDesc = `${formatCurrency(afterTax)} with a ${taxRate}% tax included is ${formatCurrency(calculatedValue)}`;
                    break;
            }
            
            if (calculatedValue === null) throw new Error("Calculation failed");
            
            const value = solveFor === 'taxRate' ? `${calculatedValue.toFixed(3)}%` : formatCurrency(calculatedValue);
            setResult({ label: resultLabel, value, description: resultDesc });

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "An unexpected error occurred.",
            });
            setResult(null);
        }
    };
    
    const handleTabChange = (value: string) => {
        setSolveFor(value);
        setResult(null);
        form.reset({
            beforeTax: value === 'beforeTax' ? undefined : 100,
            taxRate: value === 'taxRate' ? undefined : 6.5,
            afterTax: value === 'afterTax' ? undefined : 106.50,
        });
    }

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
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Sales Tax Details</CardTitle>
            </CardHeader>
            <CardContent>
                 <Tabs value={solveFor} onValueChange={handleTabChange} className="w-full mb-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="afterTax">After-Tax</TabsTrigger>
                        <TabsTrigger value="taxRate">Tax Rate</TabsTrigger>
                        <TabsTrigger value="beforeTax">Before-Tax</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {renderInputField("beforeTax", "Before-Tax Price")}
                        {renderInputField("taxRate", "Sales Tax Rate (%)")}
                        {renderInputField("afterTax", "After-Tax Price")}
                        <Button type="submit" className="w-full">Calculate</Button>
                    </form>
                </Form>

                {result && (
                    <Card className="text-center mt-8 bg-secondary">
                        <CardHeader>
                            <CardTitle className="text-lg text-muted-foreground">{result.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-primary">{result.value}</p>
                            {result.description && <p className="text-sm text-muted-foreground mt-2">{result.description}</p>}
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    );
}

export default SalesTaxCalculator;
