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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const conversionFactors: Record<string, Record<string, number>> = {
  length: {
    meters: 1,
    kilometers: 0.001,
    centimeters: 100,
    millimeters: 1000,
    miles: 0.000621371,
    yards: 1.09361,
    feet: 3.28084,
    inches: 39.3701,
  },
  weight: {
    kilograms: 1,
    grams: 1000,
    milligrams: 1000000,
    pounds: 2.20462,
    ounces: 35.274,
  },
  temperature: { // Not direct factors, handled separately
    celsius: 1,
    fahrenheit: 1,
    kelvin: 1,
  },
};

const unitLabels: Record<string, string> = {
  meters: "Meters",
  kilometers: "Kilometers",
  centimeters: "Centimeters",
  millimeters: "Millimeters",
  miles: "Miles",
  yards: "Yards",
  feet: "Feet",
  inches: "Inches",
  kilograms: "Kilograms",
  grams: "Grams",
  milligrams: "Milligrams",
  pounds: "Pounds",
  ounces: "Ounces",
  celsius: "Celsius",
  fahrenheit: "Fahrenheit",
  kelvin: "Kelvin",
};


const formSchema = z.object({
  category: z.string().default("length"),
  fromUnit: z.string(),
  toUnit: z.string(),
  value: z.coerce.number(),
});

type FormData = z.infer<typeof formSchema>;

const UnitConverter = () => {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "length",
      fromUnit: "meters",
      toUnit: "feet",
      value: 1,
    },
  });

  const category = form.watch("category");

  const onSubmit = (values: FormData) => {
    let convertedValue: number;

    if (values.category === 'temperature') {
        const value = values.value;
        if (values.fromUnit === values.toUnit) {
            convertedValue = value;
        } else if (values.fromUnit === 'celsius') {
            convertedValue = values.toUnit === 'fahrenheit' ? (value * 9/5) + 32 : value + 273.15;
        } else if (values.fromUnit === 'fahrenheit') {
            convertedValue = values.toUnit === 'celsius' ? (value - 32) * 5/9 : ((value - 32) * 5/9) + 273.15;
        } else { // Kelvin
            convertedValue = values.toUnit === 'celsius' ? value - 273.15 : ((value - 273.15) * 9/5) + 32;
        }
    } else {
        const factors = conversionFactors[values.category];
        const valueInBaseUnit = values.value / factors[values.fromUnit];
        convertedValue = valueInBaseUnit * factors[values.toUnit];
    }
    setResult(convertedValue);
  };
  
  const handleCategoryChange = (cat: string) => {
      form.setValue('category', cat);
      const units = Object.keys(conversionFactors[cat]);
      form.setValue('fromUnit', units[0]);
      form.setValue('toUnit', units[1] || units[0]);
      setResult(null);
  }

  const unitsForCategory = Object.keys(conversionFactors[category]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Unit Converter</CardTitle>
        <CardDescription>Select a category and convert between units.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <FormField
                name="category"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={handleCategoryChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="length">Length</SelectItem>
                                <SelectItem value="weight">Weight</SelectItem>
                                <SelectItem value="temperature">Temperature</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
               <FormField
                    name="value"
                    control={form.control}
                    render={({ field }) => (
                    <FormItem className="w-full">
                        <FormLabel>Value</FormLabel>
                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              <FormField
                name="fromUnit"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>From</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {unitsForCategory.map(unit => <SelectItem key={unit} value={unit}>{unitLabels[unit]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <div className="pt-6 hidden sm:block">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
              <FormField
                name="toUnit"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                         {unitsForCategory.map(unit => <SelectItem key={unit} value={unit}>{unitLabels[unit]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full">Convert</Button>
          </form>
        </Form>
        {result !== null && (
          <Card className="text-center mt-8 bg-secondary">
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground">Result</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{result.toLocaleString(undefined, { maximumFractionDigits: 5 })}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default UnitConverter;
