"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";

const gradePoints: { [key: string]: number } = {
  'A+': 4.3, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

const ignoredGrades = ['P', 'NP', 'I', 'W'];

const courseSchema = z.object({
  name: z.string().optional(),
  credits: z.coerce.number().min(0, "Credits must be non-negative.").default(3),
  grade: z.string(),
});

const formSchema = z.object({
  courses: z.array(courseSchema),
});

type FormData = z.infer<typeof formSchema>;
type GpaResult = {
  totalCredits: number;
  totalPoints: number;
  gpa: number;
};

const GpaCalculator = () => {
    const [result, setResult] = useState<GpaResult | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            courses: [{ name: '', credits: 3, grade: 'A' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "courses",
    });
    
    const watchedCourses = useWatch({
        control: form.control,
        name: 'courses',
    });
    
    useEffect(() => {
        calculateGpa(watchedCourses);
    }, [watchedCourses]);

    const calculateGpa = (courses: any[]) => {
        let totalPoints = 0;
        let totalCredits = 0;
        
        courses.forEach(course => {
            if (course.credits > 0 && course.grade && !ignoredGrades.includes(course.grade)) {
                totalCredits += course.credits;
                totalPoints += (gradePoints[course.grade] || 0) * course.credits;
            }
        });
        
        const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
        
        setResult({
            totalCredits,
            totalPoints: parseFloat(totalPoints.toFixed(2)),
            gpa: parseFloat(gpa.toFixed(3)),
        });
    };
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Your Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-2/5">Course Name (Optional)</TableHead>
                        <TableHead className="w-1/5">Credits</TableHead>
                        <TableHead className="w-1/5">Grade</TableHead>
                        <TableHead className="w-1/5 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`courses.${index}.name`}
                              render={({ field }) => (
                                <FormItem><FormControl><Input placeholder="e.g., Biology 101" {...field} /></FormControl></FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`courses.${index}.credits`}
                              render={({ field }) => (
                                <FormItem><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                             <FormField
                              control={form.control}
                              name={`courses.${index}.grade`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                      {Object.keys(gradePoints).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                      <SelectItem value="P">P (Pass)</SelectItem>
                                      <SelectItem value="NP">NP (No Pass)</SelectItem>
                                      <SelectItem value="I">I (Incomplete)</SelectItem>
                                      <SelectItem value="W">W (Withdrawal)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                             <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                               <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => append({ name: "", credits: 3, grade: "A" })}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Course
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
            <Card className="sticky top-24">
                <CardHeader>
                    <CardTitle>Your GPA Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center p-6 bg-primary text-primary-foreground rounded-lg">
                        <p className="text-lg">Your GPA is</p>
                        <p className="text-6xl font-bold">{result?.gpa || '0.000'}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Credits</p>
                            <p className="text-2xl font-bold">{result?.totalCredits || 0}</p>
                        </div>
                         <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Points</p>
                            <p className="text-2xl font-bold">{result?.totalPoints || 0}</p>
                        </div>
                    </div>
                     <CardDescription className="text-xs text-center">
                        Note: GPA is calculated in real-time as you add or modify courses.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
      </div>
    );
};

export default GpaCalculator;
