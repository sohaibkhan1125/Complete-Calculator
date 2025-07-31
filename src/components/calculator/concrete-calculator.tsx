"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type UnitSystem = "metric" | "imperial";

// --- Helper Functions ---
const CONVERSION_FACTORS = {
  in_to_m: 0.0254,
  ft_to_m: 0.3048,
  m3_to_ft3: 35.3147,
  m3_to_yd3: 1.30795,
  kg_per_m3: 2400, // Avg density of concrete
  lb_per_ft3: 150,
};

const formatNumber = (num: number) => parseFloat(num.toFixed(3)).toLocaleString();

// --- Zod Schemas ---
const slabSchema = z.object({
  length: z.coerce.number().min(0),
  width: z.coerce.number().min(0),
  thickness: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(1),
});

const columnSchema = z.object({
  diameter: z.coerce.number().min(0),
  height: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(1),
});

const tubeSchema = z.object({
    outerDiameter: z.coerce.number().min(0),
    innerDiameter: z.coerce.number().min(0),
    height: z.coerce.number().min(0),
    quantity: z.coerce.number().int().min(1),
}).refine(data => data.outerDiameter > data.innerDiameter, {
    message: "Outer diameter must be larger than inner diameter.",
    path: ["outerDiameter"],
});

const curbSchema = z.object({
    curbDepth: z.coerce.number().min(0),
    gutterWidth: z.coerce.number().min(0),
    curbHeight: z.coerce.number().min(0),
    flagThickness: z.coerce.number().min(0),
    length: z.coerce.number().min(0),
    quantity: z.coerce.number().int().min(1),
});

const stairsSchema = z.object({
    run: z.coerce.number().min(0),
    rise: z.coerce.number().min(0),
    width: z.coerce.number().min(0),
    steps: z.coerce.number().int().min(1),
    thickness: z.coerce.number().min(0), // For landing pad
});


// --- Result Display Component ---
const ResultDisplay = ({ result, unit }: { result: { volume: number; weight: number } | null, unit: UnitSystem }) => {
  if (!result) return null;
  return (
    <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <Card className="text-center">
                <CardHeader className="p-4"><CardTitle className="text-base font-normal text-muted-foreground">Volume</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold text-primary">{formatNumber(result.volume)}</p>
                    <p className="text-sm text-muted-foreground">{unit === "metric" ? "m³" : "ft³"}</p>
                </CardContent>
            </Card>
            <Card className="text-center">
                <CardHeader className="p-4"><CardTitle className="text-base font-normal text-muted-foreground">Weight</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold text-primary">{formatNumber(result.weight)}</p>
                    <p className="text-sm text-muted-foreground">{unit === "metric" ? "kg" : "lbs"}</p>
                </CardContent>
            </Card>
        </div>
         <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tip</AlertTitle>
            <AlertDescription>
                Consider ordering 5-10% extra concrete to account for spillage and uneven ground.
            </AlertDescription>
        </Alert>
    </div>
  );
};


// --- Calculator Sections ---
const SlabCalculator = ({ unitSystem, setResult }: { unitSystem: UnitSystem; setResult: (r: any) => void }) => {
  const form = useForm({ resolver: zodResolver(slabSchema), defaultValues: { length: 10, width: 10, thickness: 6, quantity: 1 } });
  const onSubmit = (data: z.infer<typeof slabSchema>) => {
    const l = unitSystem === "metric" ? data.length : data.length * CONVERSION_FACTORS.ft_to_m;
    const w = unitSystem === "metric" ? data.width : data.width * CONVERSION_FACTORS.ft_to_m;
    const t = unitSystem === "metric" ? data.thickness / 100 : data.thickness * CONVERSION_FACTORS.in_to_m;
    
    const volumeM3 = l * w * t * data.quantity;
    const volume = unitSystem === "metric" ? volumeM3 : volumeM3 * CONVERSION_FACTORS.m3_to_ft3;
    const weight = unitSystem === "metric" ? volumeM3 * CONVERSION_FACTORS.kg_per_m3 : volume * CONVERSION_FACTORS.lb_per_ft3;

    setResult({ volume, weight });
  };
  const units = unitSystem === "metric" ? { large: "m", small: "cm" } : { large: "ft", small: "in" };

  return (
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField name="length" control={form.control} render={({ field }) => (<FormItem><FormLabel>Length ({units.large})</FormLabel><FormControl><Input {...field} type="number" step="any" /></FormControl><FormMessage /></FormItem>)} />
      <FormField name="width" control={form.control} render={({ field }) => (<FormItem><FormLabel>Width ({units.large})</FormLabel><FormControl><Input {...field} type="number" step="any" /></FormControl><FormMessage /></FormItem>)} />
      <FormField name="thickness" control={form.control} render={({ field }) => (<FormItem><FormLabel>Thickness ({units.small})</FormLabel><FormControl><Input {...field} type="number" step="any" /></FormControl><FormMessage /></FormItem>)} />
      <FormField name="quantity" control={form.control} render={({ field }) => (<FormItem><FormLabel>Quantity</FormLabel><FormControl><Input {...field} type="number" /></FormControl><FormMessage /></FormItem>)} />
      <Button type="submit" className="w-full">Calculate</Button>
    </form></Form>
  );
};

const ColumnCalculator = ({ unitSystem, setResult }: { unitSystem: UnitSystem; setResult: (r: any) => void }) => {
  const form = useForm({ resolver: zodResolver(columnSchema), defaultValues: { diameter: 12, height: 10, quantity: 1 } });
  const onSubmit = (data: z.infer<typeof columnSchema>) => {
    const d = unitSystem === "metric" ? data.diameter / 100 : data.diameter * CONVERSION_FACTORS.in_to_m;
    const h = unitSystem === "metric" ? data.height : data.height * CONVERSION_FACTORS.ft_to_m;
    
    const radius = d / 2;
    const volumeM3 = Math.PI * radius * radius * h * data.quantity;
    const volume = unitSystem === "metric" ? volumeM3 : volumeM3 * CONVERSION_FACTORS.m3_to_ft3;
    const weight = unitSystem === "metric" ? volumeM3 * CONVERSION_FACTORS.kg_per_m3 : volume * CONVERSION_FACTORS.lb_per_ft3;

    setResult({ volume, weight });
  };
   const units = unitSystem === "metric" ? { large: "m", small: "cm" } : { large: "ft", small: "in" };

  return (
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField name="diameter" control={form.control} render={({ field }) => (<FormItem><FormLabel>Diameter ({units.small})</FormLabel><FormControl><Input {...field} type="number" step="any" /></FormControl><FormMessage /></FormItem>)} />
      <FormField name="height" control={form.control} render={({ field }) => (<FormItem><FormLabel>Height ({units.large})</FormLabel><FormControl><Input {...field} type="number" step="any" /></FormControl><FormMessage /></FormItem>)} />
      <FormField name="quantity" control={form.control} render={({ field }) => (<FormItem><FormLabel>Quantity</FormLabel><FormControl><Input {...field} type="number" /></FormControl><FormMessage /></FormItem>)} />
      <Button type="submit" className="w-full">Calculate</Button>
    </form></Form>
  );
};

const TubeCalculator = ({ unitSystem, setResult }: { unitSystem: UnitSystem; setResult: (r: any) => void }) => {
  const form = useForm({ resolver: zodResolver(tubeSchema), defaultValues: { outerDiameter: 12, innerDiameter: 8, height: 10, quantity: 1 } });
  const onSubmit = (data: z.infer<typeof tubeSchema>) => {
    const od = unitSystem === "metric" ? data.outerDiameter / 100 : data.outerDiameter * CONVERSION_FACTORS.in_to_m;
    const id = unitSystem === "metric" ? data.innerDiameter / 100 : data.innerDiameter * CONVERSION_FACTORS.in_to_m;
    const h = unitSystem === "metric" ? data.height : data.height * CONVERSION_FACTORS.ft_to_m;
    
    const outerRadius = od / 2;
    const innerRadius = id / 2;
    const volumeM3 = (Math.PI * outerRadius * outerRadius * h) - (Math.PI * innerRadius * innerRadius * h);
    const totalVolumeM3 = volumeM3 * data.quantity;

    const volume = unitSystem === "metric" ? totalVolumeM3 : totalVolumeM3 * CONVERSION_FACTORS.m3_to_ft3;
    const weight = unitSystem === "metric" ? totalVolumeM3 * CONVERSION_FACTORS.kg_per_m3 : volume * CONVERSION_FACTORS.lb_per_ft3;

    setResult({ volume, weight });
  };
  const units = unitSystem === "metric" ? { large: "m", small: "cm" } : { large: "ft", small: "in" };

  return (
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField name="outerDiameter" control={form.control} render={({ field }) => (<FormItem><FormLabel>Outer Diameter ({units.small})</FormLabel><FormControl><Input {...field} type="number" step="any" /></FormControl><FormMessage /></FormItem>)} />
      <FormField name="innerDiameter" control={form.control} render={({ field }) => (<FormItem><FormLabel>Inner Diameter ({units.small})</FormLabel><FormControl><Input {...field} type="number" step="any" /></FormControl><FormMessage /></FormItem>)} />
      <FormField name="height" control={form.control} render={({ field }) => (<FormItem><FormLabel>Height ({units.large})</FormLabel><FormControl><Input {...field} type="number" step="any" /></FormControl><FormMessage /></FormItem>)} />
      <FormField name="quantity" control={form.control} render={({ field }) => (<FormItem><FormLabel>Quantity</FormLabel><FormControl><Input {...field} type="number" /></FormControl><FormMessage /></FormItem>)} />
      <Button type="submit" className="w-full">Calculate</Button>
    </form></Form>
  );
};


const StairsCalculator = ({ unitSystem, setResult }: { unitSystem: UnitSystem; setResult: (r: any) => void }) => {
  const form = useForm({ resolver: zodResolver(stairsSchema), defaultValues: { run: 11, rise: 7, width: 36, steps: 5, thickness: 4 } });
  const onSubmit = (data: z.infer<typeof stairsSchema>) => {
    const run = unitSystem === "metric" ? data.run / 100 : data.run * CONVERSION_FACTORS.in_to_m;
    const rise = unitSystem === "metric" ? data.rise / 100 : data.rise * CONVERSION_FACTORS.in_to_m;
    const width = unitSystem === "metric" ? data.width / 100 : data.width * CONVERSION_FACTORS.in_to_m;
    const thickness = unitSystem === "metric" ? data.thickness / 100 : data.thickness * CONVERSION_FACTORS.in_to_m;
    
    // Volume of triangular part of stairs
    const totalRise = rise * data.steps;
    const totalRun = run * data.steps;
    const triangleVolume = 0.5 * totalRise * totalRun * width;
    
    // Volume of rectangular part below stairs
    const rectangleVolume = totalRun * thickness * width;

    const volumeM3 = triangleVolume + rectangleVolume;
    const volume = unitSystem === "metric" ? volumeM3 : volumeM3 * CONVERSION_FACTORS.m3_to_ft3;
    const weight = unitSystem === "metric" ? volumeM3 * CONVERSION_FACTORS.kg_per_m3 : volume * CONVERSION_FACTORS.lb_per_ft3;

    setResult({ volume, weight });
  };
  const units = unitSystem === "metric" ? "cm" : "in";

  return (
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="steps" control={form.control} render={({ field }) => (<FormItem><FormLabel>Number of Steps</FormLabel><FormControl><Input {...field} type="number" /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-2 gap-4">
            <FormField name="rise" control={form.control} render={({ field }) => (<FormItem><FormLabel>Rise per Step ({units})</FormLabel><FormControl><Input {...field} type="number" step="any" /></FormControl><FormMessage /></FormItem>)} />
            <FormField name="run" control={form.control} render={({ field }) => (<FormItem><FormLabel>Run per Step ({units})</FormLabel><FormControl><Input {...field} type="number" step="any" /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField name="width" control={form.control} render={({ field }) => (<FormItem><FormLabel>Stair Width ({units})</FormLabel><FormControl><Input {...field} type="number" step="any" /></FormControl><FormMessage /></FormItem>)} />
        <FormField name="thickness" control={form.control} render={({ field }) => (<FormItem><FormLabel>Slab Thickness ({units})</FormLabel><FormControl><Input {...field} type="number" step="any" /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" className="w-full">Calculate</Button>
    </form></Form>
  );
};


// --- Main Component ---
const ConcreteCalculator = () => {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [slabResult, setSlabResult] = useState(null);
  const [columnResult, setColumnResult] = useState(null);
  const [tubeResult, setTubeResult] = useState(null);
  const [stairsResult, setStairsResult] = useState(null);

  const handleUnitChange = (value: string) => {
    setUnitSystem(value as UnitSystem);
    setSlabResult(null);
    setColumnResult(null);
    setTubeResult(null);
    setStairsResult(null);
  };
  
  return (
    <Card className="max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Concrete Calculator</CardTitle>
            <div className="flex justify-between items-center">
                <CardDescription>Estimate concrete needed for various shapes.</CardDescription>
                 <RadioGroup defaultValue={unitSystem} onValueChange={handleUnitChange} className="flex space-x-4">
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="imperial" /></FormControl><FormLabel className="font-normal">Imperial</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="metric" /></FormControl><FormLabel className="font-normal">Metric</FormLabel></FormItem>
                 </RadioGroup>
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="slabs">
                <AccordionItem value="slabs">
                    <AccordionTrigger>Slabs, Footings, or Walls</AccordionTrigger>
                    <AccordionContent className="grid md:grid-cols-2 gap-8 pt-4">
                        <SlabCalculator unitSystem={unitSystem} setResult={setSlabResult} />
                        <ResultDisplay result={slabResult} unit={unitSystem} />
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="columns">
                    <AccordionTrigger>Hole, Column, or Round Footings</AccordionTrigger>
                    <AccordionContent className="grid md:grid-cols-2 gap-8 pt-4">
                        <ColumnCalculator unitSystem={unitSystem} setResult={setColumnResult} />
                        <ResultDisplay result={columnResult} unit={unitSystem} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tubes">
                    <AccordionTrigger>Circular Slab or Tube</AccordionTrigger>
                    <AccordionContent className="grid md:grid-cols-2 gap-8 pt-4">
                        <TubeCalculator unitSystem={unitSystem} setResult={setTubeResult} />
                        <ResultDisplay result={tubeResult} unit={unitSystem} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="stairs">
                    <AccordionTrigger>Stairs</AccordionTrigger>
                    <AccordionContent className="grid md:grid-cols-2 gap-8 pt-4">
                        <StairsCalculator unitSystem={unitSystem} setResult={setStairsResult} />
                        <ResultDisplay result={stairsResult} unit={unitSystem} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
  );
};

export default ConcreteCalculator;
