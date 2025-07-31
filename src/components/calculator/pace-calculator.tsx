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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

// Helper Functions
const timeToSeconds = (h: number, m: number, s: number): number => (h * 3600) + (m * 60) + s;
const secondsToTime = (secs: number): { h: number; m: number; s: number } => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.round(secs % 60);
  return { h, m, s };
};
const formatTime = (h: number, m: number, s: number): string => 
  `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
const formatPace = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

const racePresets = {
  '5k': 5, '10k': 10, 'half-marathon': 21.0975, 'marathon': 42.195
};

const paceSchema = z.object({
  timeH: z.coerce.number().default(0),
  timeM: z.coerce.number().default(0),
  timeS: z.coerce.number().default(0),
  distance: z.coerce.number().min(0.01),
  distanceUnit: z.enum(['km', 'miles']).default('km'),
  race: z.string().optional(),
});

const multiPointSchema = z.object({
  segments: z.array(z.object({
    distance: z.coerce.number(),
    timeH: z.coerce.number().default(0),
    timeM: z.coerce.number().default(0),
    timeS: z.coerce.number().default(0),
  }))
});

const converterSchema = z.object({
  paceM: z.coerce.number().default(0),
  paceS: z.coerce.number().default(0),
  unit: z.enum(['min/km', 'min/mi']).default('min/km'),
});

const finishTimeSchema = z.object({
  currentDistance: z.coerce.number().min(0),
  elapsedH: z.coerce.number().default(0),
  elapsedM: z.coerce.number().default(0),
  elapsedS: z.coerce.number().default(0),
  totalDistance: z.coerce.number().min(0),
  distanceUnit: z.enum(['km', 'miles']).default('km'),
});


const PaceCalculator = () => {
    const [paceResult, setPaceResult] = useState<{ pacePerKm: number; pacePerMi: number } | null>(null);
    const [multiPointResult, setMultiPointResult] = useState<{ segment: number; pace: number }[] | null>(null);
    const [converterResult, setConverterResult] = useState<number | null>(null);
    const [finishTimeResult, setFinishTimeResult] = useState<{ h: number; m: number; s: number } | null>(null);

    const paceForm = useForm<z.infer<typeof paceSchema>>({ resolver: zodResolver(paceSchema), defaultValues: { timeH: 0, timeM: 45, timeS: 0, distance: 10, distanceUnit: 'km' }});
    const multiPointForm = useForm<z.infer<typeof multiPointSchema>>({ resolver: zodResolver(multiPointSchema), defaultValues: { segments: [{ distance: 1, timeH: 0, timeM: 5, timeS: 0 }] }});
    const converterForm = useForm<z.infer<typeof converterSchema>>({ resolver: zodResolver(converterSchema), defaultValues: { paceM: 5, paceS: 0, unit: 'min/km' }});
    const finishTimeForm = useForm<z.infer<typeof finishTimeSchema>>({ resolver: zodResolver(finishTimeSchema), defaultValues: { currentDistance: 5, elapsedH: 0, elapsedM: 25, elapsedS: 0, totalDistance: 10, distanceUnit: 'km' }});
    
    const { fields, append, remove } = useFieldArray({ control: multiPointForm.control, name: "segments" });

    const onPaceSubmit = (values: z.infer<typeof paceSchema>) => {
        const totalSeconds = timeToSeconds(values.timeH, values.timeM, values.timeS);
        const distanceInKm = values.distanceUnit === 'km' ? values.distance : values.distance * 1.60934;
        const distanceInMi = values.distanceUnit === 'miles' ? values.distance : values.distance / 1.60934;

        const pacePerKm = totalSeconds / distanceInKm;
        const pacePerMi = totalSeconds / distanceInMi;

        setPaceResult({ pacePerKm, pacePerMi });
    };
    
    const onMultiPointSubmit = (values: z.infer<typeof multiPointSchema>) => {
        const results: { segment: number; pace: number }[] = [];
        let lastDistance = 0;
        let lastTime = 0;

        values.segments.forEach((segment, index) => {
            const currentDistance = segment.distance;
            const currentTime = timeToSeconds(segment.timeH, segment.timeM, segment.timeS);
            
            const segmentDistance = currentDistance - lastDistance;
            const segmentTime = currentTime - lastTime;
            
            if(segmentDistance > 0) {
                 results.push({ segment: index + 1, pace: segmentTime / segmentDistance });
            }

            lastDistance = currentDistance;
            lastTime = currentTime;
        });
        setMultiPointResult(results);
    };
    
    const onConverterSubmit = (values: z.infer<typeof converterSchema>) => {
        const paceInSeconds = values.paceM * 60 + values.paceS;
        const result = values.unit === 'min/km' ? paceInSeconds * 1.60934 : paceInSeconds / 1.60934;
        setConverterResult(result);
    };

    const onFinishTimeSubmit = (values: z.infer<typeof finishTimeSchema>) => {
        const elapsedSeconds = timeToSeconds(values.elapsedH, values.elapsedM, values.elapsedS);
        if (values.currentDistance === 0) return;
        const pace = elapsedSeconds / values.currentDistance;
        const totalTime = pace * values.totalDistance;
        setFinishTimeResult(secondsToTime(totalTime));
    };
    
    return (
        <Tabs defaultValue="pace" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="pace">Pace Calculator</TabsTrigger>
                <TabsTrigger value="multi">Multi-Point Pace</TabsTrigger>
                <TabsTrigger value="converter">Pace Converter</TabsTrigger>
                <TabsTrigger value="finish">Finish Time</TabsTrigger>
            </TabsList>
            <TabsContent value="pace">
                <Card>
                    <CardHeader><CardTitle>Pace Calculator</CardTitle></CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8">
                        <Form {...paceForm}>
                            <form onSubmit={paceForm.handleSubmit(onPaceSubmit)} className="space-y-4">
                                <FormLabel>Time</FormLabel>
                                <div className="grid grid-cols-3 gap-2">
                                    <FormField name="timeH" control={paceForm.control} render={({ field }) => (<FormItem><FormLabel className="text-xs">HH</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                    <FormField name="timeM" control={paceForm.control} render={({ field }) => (<FormItem><FormLabel className="text-xs">MM</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                    <FormField name="timeS" control={paceForm.control} render={({ field }) => (<FormItem><FormLabel className="text-xs">SS</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                </div>
                                <FormLabel>Distance</FormLabel>
                                <div className="grid grid-cols-2 gap-2">
                                     <FormField name="distance" control={paceForm.control} render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage/></FormItem>)} />
                                     <FormField name="distanceUnit" control={paceForm.control} render={({ field }) => (<FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="km">km</SelectItem><SelectItem value="miles">miles</SelectItem></SelectContent></Select></FormItem>)} />
                                </div>
                                <FormField name="race" control={paceForm.control} render={({ field }) => (<FormItem><FormLabel>Or pick a race distance</FormLabel><Select onValueChange={(v) => { paceForm.setValue('distance', racePresets[v as keyof typeof racePresets]); paceForm.setValue('distanceUnit', 'km'); }}><FormControl><SelectTrigger><SelectValue placeholder="Select a race"/></SelectTrigger></FormControl><SelectContent><SelectItem value="5k">5K</SelectItem><SelectItem value="10k">10K</SelectItem><SelectItem value="half-marathon">Half Marathon</SelectItem><SelectItem value="marathon">Marathon</SelectItem></SelectContent></Select></FormItem>)} />
                                <Button type="submit" className="w-full">Calculate Pace</Button>
                            </form>
                        </Form>
                        {paceResult && (
                            <div className="space-y-4">
                                <Card className="text-center"><CardHeader><CardTitle className="text-muted-foreground">Pace per Kilometer</CardTitle><CardContent className="text-4xl font-bold text-primary p-0 pt-2">{formatPace(paceResult.pacePerKm)}</CardContent></CardHeader></Card>
                                <Card className="text-center"><CardHeader><CardTitle className="text-muted-foreground">Pace per Mile</CardTitle><CardContent className="text-4xl font-bold text-primary p-0 pt-2">{formatPace(paceResult.pacePerMi)}</CardContent></CardHeader></Card>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="multi">
                <Card>
                    <CardHeader><CardTitle>Multi-Point Pace Calculator</CardTitle></CardHeader>
                    <CardContent>
                        <Form {...multiPointForm}>
                             <form onSubmit={multiPointForm.handleSubmit(onMultiPointSubmit)} className="space-y-4">
                                {fields.map((field, index) => (
                                     <div key={field.id} className="grid grid-cols-[1fr_3fr_auto] gap-2 items-end">
                                        <FormField name={`segments.${index}.distance`} control={multiPointForm.control} render={({ field }) => (<FormItem><FormLabel>Distance (km)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                        <div className="grid grid-cols-3 gap-2">
                                            <FormField name={`segments.${index}.timeH`} control={multiPointForm.control} render={({ field }) => (<FormItem><FormLabel className="text-xs">HH</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                            <FormField name={`segments.${index}.timeM`} control={multiPointForm.control} render={({ field }) => (<FormItem><FormLabel className="text-xs">MM</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                            <FormField name={`segments.${index}.timeS`} control={multiPointForm.control} render={({ field }) => (<FormItem><FormLabel className="text-xs">SS</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                        </div>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => append({ distance: 0, timeH: 0, timeM: 0, timeS: 0 })}>Add Segment</Button>
                                <Button type="submit" className="w-full">Calculate Segment Paces</Button>
                            </form>
                        </Form>
                         {multiPointResult && (
                             <Table className="mt-4">
                                <TableHeader><TableRow><TableHead>Segment</TableHead><TableHead className="text-right">Pace per km</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {multiPointResult.map(res => (
                                        <TableRow key={res.segment}>
                                            <TableCell>Segment {res.segment}</TableCell>
                                            <TableCell className="text-right">{formatPace(res.pace)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         )}
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="converter">
                <Card>
                    <CardHeader><CardTitle>Pace Converter</CardTitle></CardHeader>
                     <CardContent className="grid md:grid-cols-2 gap-8">
                        <Form {...converterForm}>
                             <form onSubmit={converterForm.handleSubmit(onConverterSubmit)} className="space-y-4">
                                <FormLabel>Pace</FormLabel>
                                <div className="grid grid-cols-2 gap-2">
                                    <FormField name="paceM" control={converterForm.control} render={({ field }) => (<FormItem><FormLabel className="text-xs">MM</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                    <FormField name="paceS" control={converterForm.control} render={({ field }) => (<FormItem><FormLabel className="text-xs">SS</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                </div>
                                <FormField name="unit" control={converterForm.control} render={({ field }) => (<FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="min/km">min/km</SelectItem><SelectItem value="min/mi">min/mi</SelectItem></SelectContent></Select></FormItem>)} />
                                <Button type="submit" className="w-full">Convert Pace</Button>
                            </form>
                        </Form>
                        {converterResult !== null && (
                            <Card className="text-center"><CardHeader><CardTitle className="text-muted-foreground">Equivalent Pace</CardTitle><CardContent className="text-4xl font-bold text-primary p-0 pt-2">{formatPace(converterResult)} <span className="text-lg text-muted-foreground">{converterForm.getValues('unit') === 'min/km' ? 'min/mi' : 'min/km'}</span></CardContent></CardHeader></Card>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="finish">
                <Card>
                    <CardHeader><CardTitle>Finish Time Calculator</CardTitle></CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8">
                         <Form {...finishTimeForm}>
                             <form onSubmit={finishTimeForm.handleSubmit(onFinishTimeSubmit)} className="space-y-4">
                                <FormLabel>Elapsed Time</FormLabel>
                                <div className="grid grid-cols-3 gap-2">
                                     <FormField name="elapsedH" control={finishTimeForm.control} render={({ field }) => (<FormItem><FormLabel className="text-xs">HH</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                     <FormField name="elapsedM" control={finishTimeForm.control} render={({ field }) => (<FormItem><FormLabel className="text-xs">MM</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                     <FormField name="elapsedS" control={finishTimeForm.control} render={({ field }) => (<FormItem><FormLabel className="text-xs">SS</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                </div>
                                 <FormLabel>Distance</FormLabel>
                                 <div className="grid grid-cols-2 gap-2">
                                     <FormField name="currentDistance" control={finishTimeForm.control} render={({ field }) => (<FormItem><FormLabel>Current</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>)} />
                                     <FormField name="totalDistance" control={finishTimeForm.control} render={({ field }) => (<FormItem><FormLabel>Total</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>)} />
                                 </div>
                                 <FormField name="distanceUnit" control={finishTimeForm.control} render={({ field }) => (<FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="km">km</SelectItem><SelectItem value="miles">miles</SelectItem></SelectContent></Select></FormItem>)} />
                                <Button type="submit" className="w-full">Estimate Finish Time</Button>
                            </form>
                        </Form>
                        {finishTimeResult && (
                             <Card className="text-center"><CardHeader><CardTitle className="text-muted-foreground">Estimated Finish Time</CardTitle><CardContent className="text-4xl font-bold text-primary p-0 pt-2">{formatTime(finishTimeResult.h, finishTimeResult.m, finishTimeResult.s)}</CardContent></CardHeader></Card>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <WorldRecordTable />
        </Tabs>
    );
};

const worldRecords = [
    { category: '100 meters', men: '1:36/km', women: '1:45/km' },
    { category: '200 meters', men: '1:36/km', women: '1:46/km' },
    { category: '400 meters', men: '1:41/km', women: '1:54/km' },
    { category: '800 meters', men: '1:41/km', women: '1:54/km' },
    { category: '1500 meters', men: '2:17/km', women: '2:30/km' },
    { category: '1 Mile', men: '2:19/km', women: '2:37/km' },
    { category: '5000 meters', men: '2:31/km', women: '2:47/km' },
    { category: '10,000 meters', men: '2:37/km', women: '2:53/km' },
    { category: 'Half Marathon', men: '2:44/km', women: '2:57/km' },
    { category: 'Marathon', men: '2:55/km', women: '3:07/km' }
];

const WorldRecordTable = () => (
    <Card className="mt-8">
        <CardHeader>
            <CardTitle>World Record Paces</CardTitle>
            <CardDescription>Official world record paces for various track and road races.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Men's Pace</TableHead>
                        <TableHead>Women's Pace</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {worldRecords.map(record => (
                        <TableRow key={record.category}>
                            <TableCell>{record.category}</TableCell>
                            <TableCell>{record.men}</TableCell>
                            <TableCell>{record.women}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);


export default PaceCalculator;
