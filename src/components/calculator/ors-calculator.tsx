"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  differenceInMinutes,
  differenceInSeconds,
  set,
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, SwapHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// Schemas
const sameDaySchema = z.object({
  startHour: z.coerce.number().min(1).max(12),
  startMinute: z.coerce.number().min(0).max(59),
  startPeriod: z.enum(["AM", "PM"]),
  endHour: z.coerce.number().min(1).max(12),
  endMinute: z.coerce.number().min(0).max(59),
  endPeriod: z.enum(["AM", "PM"]),
});

const twoDatesSchema = z.object({
  startDate: z.date(),
  startHour: z.coerce.number().min(1).max(12),
  startMinute: z.coerce.number().min(0).max(59),
  startPeriod: z.enum(["AM", "PM"]),
  endDate: z.date(),
  endHour: z.coerce.number().min(1).max(12),
  endMinute: z.coerce.number().min(0).max(59),
  endPeriod: z.enum(["AM", "PM"]),
}).refine(data => {
    const startDateTime = set(data.startDate, {
        hours: data.startPeriod === "PM" && data.startHour !== 12 ? data.startHour + 12 : (data.startPeriod === "AM" && data.startHour === 12 ? 0 : data.startHour),
        minutes: data.startMinute,
    });
    const endDateTime = set(data.endDate, {
        hours: data.endPeriod === "PM" && data.endHour !== 12 ? data.endHour + 12 : (data.endPeriod === "AM" && data.endHour === 12 ? 0 : data.endHour),
        minutes: data.endMinute,
    });
    return endDateTime >= startDateTime;
}, {
    message: "End date and time must be after start date and time.",
    path: ["endDate"],
});


// Helper function to convert 12-hour format to 24-hour
const to24Hour = (hour: number, period: "AM" | "PM") => {
    if (period === "PM" && hour < 12) return hour + 12;
    if (period === "AM" && hour === 12) return 0; // Midnight case
    return hour;
};

// Result Card Component
const ResultCard = ({ title, value, unit }: { title: string; value: string; unit: string }) => (
  <div className="p-4 bg-secondary rounded-lg text-center">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="text-2xl font-bold text-primary">{value} <span className="text-lg font-normal">{unit}</span></p>
  </div>
);

// Main Component
export default function OrsCalculator() {
  const [sameDayResult, setSameDayResult] = useState<{ hours: number; minutes: number; decimal: number } | null>(null);
  const [twoDatesResult, setTwoDatesResult] = useState<{ days: number; hours: number; minutes: number; decimal: number } | null>(null);

  const sameDayForm = useForm<z.infer<typeof sameDaySchema>>({
    resolver: zodResolver(sameDaySchema),
    defaultValues: { startHour: 9, startMinute: 0, startPeriod: "AM", endHour: 5, endMinute: 0, endPeriod: "PM" },
  });

  const twoDatesForm = useForm<z.infer<typeof twoDatesSchema>>({
    resolver: zodResolver(twoDatesSchema),
    defaultValues: {
      startDate: new Date(),
      startHour: 9, startMinute: 0, startPeriod: "AM",
      endDate: new Date(),
      endHour: 5, endMinute: 0, endPeriod: "PM",
    },
  });

  const onSameDaySubmit = (values: z.infer<typeof sameDaySchema>) => {
    const startHour24 = to24Hour(values.startHour, values.startPeriod);
    const endHour24 = to24Hour(values.endHour, values.endPeriod);

    const startTime = set(new Date(), { hours: startHour24, minutes: values.startMinute, seconds: 0, milliseconds: 0 });
    let endTime = set(new Date(), { hours: endHour24, minutes: values.endMinute, seconds: 0, milliseconds: 0 });

    if (endTime < startTime) {
      endTime = set(endTime, { date: endTime.getDate() + 1 });
    }

    const totalMinutes = differenceInMinutes(endTime, startTime);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const decimal = totalMinutes / 60;

    setSameDayResult({ hours, minutes, decimal });
  };
  
  const onTwoDatesSubmit = (values: z.infer<typeof twoDatesSchema>) => {
      const startDateTime = set(values.startDate, {
          hours: to24Hour(values.startHour, values.startPeriod),
          minutes: values.startMinute,
          seconds: 0, milliseconds: 0
      });
      const endDateTime = set(values.endDate, {
          hours: to24Hour(values.endHour, values.endPeriod),
          minutes: values.endMinute,
          seconds: 0, milliseconds: 0
      });
      
      const totalMinutes = differenceInMinutes(endDateTime, startDateTime);
      const days = Math.floor(totalMinutes / 1440);
      const remainingMinutes = totalMinutes % 1440;
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      const decimal = totalMinutes / 60;

      setTwoDatesResult({ days, hours, minutes, decimal });
  };

  const setTimeToNow = (form: any) => {
      const now = new Date();
      let hour = now.getHours();
      const period = hour >= 12 ? "PM" : "AM";
      hour = hour % 12;
      hour = hour ? hour : 12; // the hour '0' should be '12'
      
      form.setValue('startHour', hour);
      form.setValue('startMinute', now.getMinutes());
      form.setValue('startPeriod', period);
  };
  
   const swapTimes = (form: any) => {
    const startH = form.getValues('startHour');
    const startM = form.getValues('startMinute');
    const startP = form.getValues('startPeriod');
    const endH = form.getValues('endHour');
    const endM = form.getValues('endMinute');
    const endP = form.getValues('endPeriod');

    form.setValue('startHour', endH);
    form.setValue('startMinute', endM);
    form.setValue('startPeriod', endP);
    form.setValue('endHour', startH);
    form.setValue('endMinute', startM);
    form.setValue('endPeriod', startP);
  };

  const TimeInput = ({ form, type }: { form: any; type: "start" | "end" }) => (
    <div className="space-y-2">
      <FormLabel>{type === "start" ? "Start Time" : "End Time"}</FormLabel>
      <div className="grid grid-cols-3 gap-2">
        <FormField name={`${type}Hour`} control={form.control} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="HH" {...field} /></FormControl><FormMessage/></FormItem>)} />
        <FormField name={`${type}Minute`} control={form.control} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="MM" {...field} /></FormControl><FormMessage/></FormItem>)} />
        <FormField name={`${type}Period`} control={form.control} render={({ field }) => (<FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="AM">AM</SelectItem><SelectItem value="PM">PM</SelectItem></SelectContent></Select></FormItem>)} />
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="pt-6">
        <Tabs defaultValue="same-day">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="same-day">Between Two Times</TabsTrigger>
            <TabsTrigger value="two-dates">Between Two Dates</TabsTrigger>
          </TabsList>

          <TabsContent value="same-day">
            <CardHeader><CardTitle>Hours Between Two Times</CardTitle></CardHeader>
            <CardContent>
              <Form {...sameDayForm}>
                <form onSubmit={sameDayForm.handleSubmit(onSameDaySubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <TimeInput form={sameDayForm} type="start" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => swapTimes(sameDayForm)} className="self-end"><SwapHorizontal/></Button>
                    <TimeInput form={sameDayForm} type="end" />
                  </div>
                   <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" className="w-full">Calculate</Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => setTimeToNow(sameDayForm)}>Set Start to Now</Button>
                   </div>
                </form>
              </Form>
              {sameDayResult && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ResultCard title="Total Hours" value={String(sameDayResult.hours)} unit="hours" />
                    <ResultCard title="Total Minutes" value={String(sameDayResult.minutes)} unit="minutes" />
                    <ResultCard title="In Decimal" value={sameDayResult.decimal.toFixed(2)} unit="hours" />
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="two-dates">
             <CardHeader><CardTitle>Hours Between Two Dates</CardTitle></CardHeader>
             <CardContent>
                <Form {...twoDatesForm}>
                    <form onSubmit={twoDatesForm.handleSubmit(onTwoDatesSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                               <FormLabel>Start Date & Time</FormLabel>
                               <FormField name="startDate" control={twoDatesForm.control} render={({ field }) => (
                                    <FormItem>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}/>
                                <TimeInput form={twoDatesForm} type="start" />
                            </div>
                            <div className="space-y-4">
                                <FormLabel>End Date & Time</FormLabel>
                                <FormField name="endDate" control={twoDatesForm.control} render={({ field }) => (
                                    <FormItem>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}/>
                                <TimeInput form={twoDatesForm} type="end" />
                            </div>
                        </div>
                        <Button type="submit" className="w-full">Calculate</Button>
                    </form>
                </Form>
                 {twoDatesResult && (
                    <div className="mt-6">
                        <Card className="text-center bg-secondary">
                            <CardHeader><CardTitle className="text-lg text-muted-foreground">Total Duration</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-primary">{twoDatesResult.days} days, {twoDatesResult.hours} hours, {twoDatesResult.minutes} minutes</p>
                                <p className="text-lg text-muted-foreground mt-2">({twoDatesResult.decimal.toFixed(2)} total hours)</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
             </CardContent>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
