"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { add, sub, format, set } from "date-fns";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Schemas
const timeAddSubtractSchema = z.object({
  op: z.enum(["add", "subtract"]).default("add"),
  days1: z.coerce.number().default(0),
  hours1: z.coerce.number().default(0),
  minutes1: z.coerce.number().default(0),
  seconds1: z.coerce.number().default(0),
  days2: z.coerce.number().default(0),
  hours2: z.coerce.number().default(0),
  minutes2: z.coerce.number().default(0),
  seconds2: z.coerce.number().default(0),
});

const dateMathSchema = z.object({
  op: z.enum(["add", "subtract"]).default("add"),
  startDate: z.date(),
  startHours: z.coerce.number().min(0).max(23).default(0),
  startMinutes: z.coerce.number().min(0).max(59).default(0),
  startSeconds: z.coerce.number().min(0).max(59).default(0),
  diffDays: z.coerce.number().default(0),
  diffHours: z.coerce.number().default(0),
  diffMinutes: z.coerce.number().default(0),
  diffSeconds: z.coerce.number().default(0),
});

const expressionSchema = z.object({
  expression: z.string().min(1, "Expression cannot be empty."),
});

// Helper functions
const timeToSeconds = (d: number, h: number, m: number, s: number) => d * 86400 + h * 3600 + m * 60 + s;
const secondsToTime = (totalSeconds: number) => {
    let sign = totalSeconds < 0 ? "-" : "";
    totalSeconds = Math.abs(totalSeconds);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${sign}${d}d ${h}h ${m}m ${s}s`;
};

// Main Component
export default function TimeCalculator() {
  const [addSubtractResult, setAddSubtractResult] = useState<string | null>(null);
  const [dateMathResult, setDateMathResult] = useState<string | null>(null);
  const [expressionResult, setExpressionResult] = useState<string | null>(null);

  const addSubtractForm = useForm<z.infer<typeof timeAddSubtractSchema>>({ 
    resolver: zodResolver(timeAddSubtractSchema), 
    defaultValues: {
      op: "add", days1: 0, hours1: 0, minutes1: 0, seconds1: 0,
      days2: 0, hours2: 0, minutes2: 0, seconds2: 0,
    } 
  });
  const dateMathForm = useForm<z.infer<typeof dateMathSchema>>({ 
      resolver: zodResolver(dateMathSchema), 
      defaultValues: {
        op: "add",
        startDate: new Date(),
        startHours: 0,
        startMinutes: 0,
        startSeconds: 0,
        diffDays: 0,
        diffHours: 0,
        diffMinutes: 0,
        diffSeconds: 0,
      }
  });
  const expressionForm = useForm<z.infer<typeof expressionSchema>>({ resolver: zodResolver(expressionSchema), defaultValues: { expression: "" }});
  
  const onAddSubtractSubmit = (data: z.infer<typeof timeAddSubtractSchema>) => {
    const time1 = timeToSeconds(data.days1, data.hours1, data.minutes1, data.seconds1);
    const time2 = timeToSeconds(data.days2, data.hours2, data.minutes2, data.seconds2);
    const resultSeconds = data.op === "add" ? time1 + time2 : time1 - time2;
    setAddSubtractResult(secondsToTime(resultSeconds));
  };
  
  const onDateMathSubmit = (data: z.infer<typeof dateMathSchema>) => {
    let baseDate = set(data.startDate, {
        hours: data.startHours,
        minutes: data.startMinutes,
        seconds: data.startSeconds,
    });
    const duration = { days: data.diffDays, hours: data.diffHours, minutes: data.diffMinutes, seconds: data.diffSeconds };
    const resultDate = data.op === "add" ? add(baseDate, duration) : sub(baseDate, duration);
    setDateMathResult(format(resultDate, "PPP 'at' hh:mm:ss a"));
  };
  
  const onExpressionSubmit = (data: z.infer<typeof expressionSchema>) => {
      try {
          const expression = data.expression.toLowerCase().replace(/\s+/g, '');
          const tokens = expression.match(/([+-]?)(\d+)([dhms])/g);
          if (!tokens) throw new Error("Invalid expression format.");

          let totalSeconds = 0;
          tokens.forEach(token => {
              const op = token.startsWith('-') ? -1 : 1;
              const value = parseInt(token.match(/\d+/)![0]);
              const unit = token.match(/[dhms]/)![0];
              
              switch (unit) {
                  case 'd': totalSeconds += op * value * 86400; break;
                  case 'h': totalSeconds += op * value * 3600; break;
                  case 'm': totalSeconds += op * value * 60; break;
                  case 's': totalSeconds += op * value; break;
              }
          });
          setExpressionResult(secondsToTime(totalSeconds));
      } catch (e) {
          setExpressionResult("Invalid Expression");
      }
  };

  const ResultCard = ({ title, value }: { title: string; value: string | null }) => value && (
    <Card className="mt-6 text-center bg-secondary">
      <CardHeader><CardTitle className="text-lg text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent><p className="text-3xl font-bold text-primary">{value}</p></CardContent>
    </Card>
  );

  const TimeInputGroup = ({ control, prefix }: { control: any, prefix: string }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <FormField name={`${prefix}Days`} control={control} render={({ field }) => (<FormItem><FormLabel>Days</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
      <FormField name={`${prefix}Hours`} control={control} render={({ field }) => (<FormItem><FormLabel>Hours</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
      <FormField name={`${prefix}Minutes`} control={control} render={({ field }) => (<FormItem><FormLabel>Minutes</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
      <FormField name={`${prefix}Seconds`} control={control} render={({ field }) => (<FormItem><FormLabel>Seconds</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="pt-6">
        <Tabs defaultValue="add-subtract">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="add-subtract">Add/Subtract Time</TabsTrigger>
            <TabsTrigger value="date-math">Date & Time Math</TabsTrigger>
            <TabsTrigger value="expression">Expression Calculator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add-subtract">
            <Form {...addSubtractForm}>
              <form onSubmit={addSubtractForm.handleSubmit(onAddSubtractSubmit)} className="space-y-4 pt-4">
                <TimeInputGroup control={addSubtractForm.control} prefix="days1" />
                <FormField name="op" control={addSubtractForm.control} render={({ field }) => (
                  <FormItem className="flex justify-center">
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-2">
                      <FormItem><FormControl><RadioGroupItem value="add" className="hidden" /><FormLabel><Button type="button" variant={field.value === 'add' ? 'default' : 'outline'} size="icon"><Plus /></Button></FormLabel></FormControl></FormItem>
                      <FormItem><FormControl><RadioGroupItem value="subtract" className="hidden" /><FormLabel><Button type="button" variant={field.value === 'subtract' ? 'default' : 'outline'} size="icon"><Minus/></Button></FormLabel></FormControl></FormItem>
                    </RadioGroup>
                  </FormItem>
                )} />
                <TimeInputGroup control={addSubtractForm.control} prefix="days2" />
                <Button type="submit" className="w-full">Calculate</Button>
                <ResultCard title="Result" value={addSubtractResult} />
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="date-math">
            <Form {...dateMathForm}>
              <form onSubmit={dateMathForm.handleSubmit(onDateMathSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="startDate" control={dateMathForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Start Date</FormLabel>
                      <Popover><PopoverTrigger asChild>
                        <FormControl>
                            <Button variant="outline" className={cn(!field.value && "text-muted-foreground", "w-full justify-start text-left font-normal")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </FormControl>
                      </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                    </FormItem>
                  )} />
                   <div className="grid grid-cols-3 gap-2">
                       <FormField name="startHours" control={dateMathForm.control} render={({ field }) => (<FormItem><FormLabel>HH</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                       <FormField name="startMinutes" control={dateMathForm.control} render={({ field }) => (<FormItem><FormLabel>MM</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                       <FormField name="startSeconds" control={dateMathForm.control} render={({ field }) => (<FormItem><FormLabel>SS</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                   </div>
                </div>
                 <FormField name="op" control={dateMathForm.control} render={({ field }) => (
                  <FormItem className="flex justify-center">
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-2">
                      <FormItem><FormControl><RadioGroupItem value="add" className="hidden" /><FormLabel><Button type="button" variant={field.value === 'add' ? 'default' : 'outline'} size="icon"><Plus /></Button></FormLabel></FormControl></FormItem>
                      <FormItem><FormControl><RadioGroupItem value="subtract" className="hidden" /><FormLabel><Button type="button" variant={field.value === 'subtract' ? 'default' : 'outline'} size="icon"><Minus/></Button></FormLabel></FormControl></FormItem>
                    </RadioGroup>
                  </FormItem>
                )} />
                <div>
                    <FormLabel>Time to Add/Subtract</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <FormField name="diffDays" control={dateMathForm.control} render={({ field }) => (<FormItem><FormLabel>Days</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField name="diffHours" control={dateMathForm.control} render={({ field }) => (<FormItem><FormLabel>Hours</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField name="diffMinutes" control={dateMathForm.control} render={({ field }) => (<FormItem><FormLabel>Minutes</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField name="diffSeconds" control={dateMathForm.control} render={({ field }) => (<FormItem><FormLabel>Seconds</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                    </div>
                </div>
                <Button type="submit" className="w-full">Calculate</Button>
                <ResultCard title="Resulting Date & Time" value={dateMathResult} />
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="expression">
             <Form {...expressionForm}>
              <form onSubmit={expressionForm.handleSubmit(onExpressionSubmit)} className="space-y-4 pt-4">
                 <FormField name="expression" control={expressionForm.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Time Expression</FormLabel>
                        <FormControl><Input placeholder="e.g., 1d 2h + 5m 30s - 12h" {...field} /></FormControl>
                        <FormDescription>Use 'd', 'h', 'm', 's'. Only + and - are supported.</FormDescription>
                        <FormMessage />
                    </FormItem>
                 )} />
                <Button type="submit" className="w-full">Calculate</Button>
                <ResultCard title="Result" value={expressionResult} />
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
    