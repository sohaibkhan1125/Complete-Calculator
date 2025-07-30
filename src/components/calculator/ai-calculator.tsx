"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  naturalLanguageCalculator,
  type NaturalLanguageCalculatorOutput,
} from "@/ai/flows/natural-language-calculator";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  calculationDescription: z.string().min(1, {
    message: "Please describe the calculation you want to perform.",
  }),
});

export default function AiCalculator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NaturalLanguageCalculatorOutput | null>(
    null
  );
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calculationDescription: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await naturalLanguageCalculator(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to perform AI calculation. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">AI-Powered Calculation</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="calculationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'What is 25% of 150 plus the square root of 16?'"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the calculation in plain English.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Calculate
            </Button>
          </form>
        </Form>
        {loading && (
          <div className="mt-4 text-center">
            <p>Calculating with AI...</p>
          </div>
        )}
        {result && (
          <div className="mt-6 rounded-lg bg-secondary p-4 text-center">
            <p className="text-sm text-muted-foreground">Result</p>
            <p className="text-3xl font-bold font-headline">
              {result.result}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
