"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  differenceInWeeks,
  add,
  sub,
  format,
} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Schema for "Days Between Dates"
const daysBetweenSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(data => data.startDate <= data.endDate, {
  message: "End date must be after start date.",
  path: ["endDate"],
});

// Schema for "Add/Subtract from Date"
const addSubtractSchema = z.object({
  startDate: z.date(),
  operation: z.enum(["add", "subtract"]),
  years: z.coerce.number().default(0),
  months: z.coerce.number().default(0),
  weeks: z.coerce.number().default(0),
  days: z.coerce.number().default(0),
});

type DaysBetweenFormData = z.infer<typeof daysBetweenSchema>;
type AddSubtractFormData = z.infer<typeof addSubtractSchema>;

const ResultDisplay = ({ title, value }: { title: string; value: string }) => (
  <div className="p-4 bg-secondary rounded-lg text-center">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="text-2xl font-bold text-primary">{value}</p>
  </div>
);

export default function DateCalculator() {
  const [daysBetweenResult, setDaysBetweenResult] = useState<{ years: number, months: number, weeks: number, days: number } | null>(null);
  const [addSubtractResult, setAddSubtractResult] = useState<Date | null>(null);

  const daysBetweenForm = useForm<DaysBetweenFormData>({
    resolver: zodResolver(daysBetweenSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: add(new Date(), { years: 1 }),
    },
  });

  const addSubtractForm = useForm<AddSubtractFormData>({
    resolver: zodResolver(addSubtractSchema),
    defaultValues: {
      startDate: new Date(),
      operation: "add",
      years: 1,
      months: 0,
      weeks: 0,
      days: 0,
    },
  });

  const onDaysBetweenSubmit = (values: DaysBetweenFormData) => {
    const { startDate, endDate } = values;
    const years = differenceInYears(endDate, startDate);
    const months = differenceInMonths(endDate, startDate) % 12;
    const weeks = differenceInWeeks(endDate, startDate);
    const days = differenceInDays(endDate, startDate);

    setDaysBetweenResult({ years, months, weeks, days });
  };

  const onAddSubtractSubmit = (values: AddSubtractFormData) => {
    const { startDate, operation, years, months, weeks, days } = values;
    const duration = { years, months, weeks, days };
    const resultDate = operation === "add" ? add(startDate, duration) : sub(startDate, duration);
    setAddSubtractResult(resultDate);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="pt-6">
        <Tabs defaultValue="between" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="between">Days Between Dates</TabsTrigger>
            <TabsTrigger value="add-subtract">Add/Subtract from Date</TabsTrigger>
          </TabsList>
          
          <TabsContent value="between">
            <Card>
              <CardHeader><CardTitle>Calculate Duration Between Two Dates</CardTitle></CardHeader>
              <CardContent>
                <Form {...daysBetweenForm}>
                  <form onSubmit={daysBetweenForm.handleSubmit(onDaysBetweenSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField name="startDate" control={daysBetweenForm.control} render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel>
                          <Popover><PopoverTrigger asChild><FormControl>
                            <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl></PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                          </Popover><FormMessage />
                        </FormItem>
                      )} />
                      <FormField name="endDate" control={daysBetweenForm.control} render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>End Date</FormLabel>
                          <Popover><PopoverTrigger asChild><FormControl>
                            <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl></PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                          </Popover><FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" className="w-full">Calculate Duration</Button>
                  </form>
                </Form>
                {daysBetweenResult && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-center mb-4">Resulting Duration</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <ResultDisplay title="Years" value={daysBetweenResult.years.toLocaleString()} />
                      <ResultDisplay title="Months" value={(daysBetweenResult.years * 12 + daysBetweenResult.months).toLocaleString()} />
                      <ResultDisplay title="Weeks" value={daysBetweenResult.weeks.toLocaleString()} />
                      <ResultDisplay title="Days" value={daysBetweenResult.days.toLocaleString()} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="add-subtract">
            <Card>
              <CardHeader><CardTitle>Add or Subtract from a Date</CardTitle></CardHeader>
              <CardContent>
                <Form {...addSubtractForm}>
                  <form onSubmit={addSubtractForm.handleSubmit(onAddSubtractSubmit)} className="space-y-6">
                    <FormField name="startDate" control={addSubtractForm.control} render={({ field }) => (
                      <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel>
                        <Popover><PopoverTrigger asChild><FormControl>
                          <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                        </Popover><FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="operation" control={addSubtractForm.control} render={({ field }) => (
                      <FormItem className="space-y-3"><FormLabel>Operation</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="add" /></FormControl><FormLabel className="font-normal">Add</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="subtract" /></FormControl><FormLabel className="font-normal">Subtract</FormLabel></FormItem>
                          </RadioGroup>
                        </FormControl><FormMessage />
                      </FormItem>
                    )}/>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField name="years" control={addSubtractForm.control} render={({ field }) => (<FormItem><FormLabel>Years</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="months" control={addSubtractForm.control} render={({ field }) => (<FormItem><FormLabel>Months</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="weeks" control={addSubtractForm.control} render={({ field }) => (<FormItem><FormLabel>Weeks</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="days" control={addSubtractForm.control} render={({ field }) => (<FormItem><FormLabel>Days</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <Button type="submit" className="w-full">Calculate Date</Button>
                  </form>
                </Form>
                 {addSubtractResult && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-center mb-4">Calculated Date</h3>
                    <div className="p-6 bg-primary text-primary-foreground rounded-lg text-center">
                        <p className="text-3xl font-bold">{format(addSubtractResult, "PPPP")}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
