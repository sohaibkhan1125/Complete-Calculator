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
import { Trash2, Plus, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const gradeScale: { [key: string]: number } = {
  'A+': 98.5, 'A': 95, 'A-': 91.5,
  'B+': 88.5, 'B': 85, 'B-': 81.5,
  'C+': 78.5, 'C': 75, 'C-': 71.5,
  'D+': 68.5, 'D': 65, 'D-': 61.5,
  'F': 50,
};

const assignmentSchema = z.object({
  name: z.string().optional(),
  grade: z.string().min(1, "Grade required"),
  weight: z.coerce.number().min(0, "Weight must be non-negative").max(100),
});

const courseSchema = z.object({
  assignments: z.array(assignmentSchema),
});

const finalGradeSchema = z.object({
    currentGrade: z.coerce.number(),
    desiredGrade: z.coerce.number(),
    finalWeight: z.coerce.number().min(0).max(100),
});

const GradeCalculator = () => {
    const { toast } = useToast();
    const [courseResult, setCourseResult] = useState<{ grade: number, totalWeight: number } | null>(null);
    const [finalGradeResult, setFinalGradeResult] = useState<number | null>(null);

    const courseForm = useForm<z.infer<typeof courseSchema>>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            assignments: [{ name: 'Homework', grade: '88', weight: 20 }],
        },
    });

    const finalGradeForm = useForm<z.infer<typeof finalGradeSchema>>({
        resolver: zodResolver(finalGradeSchema),
        defaultValues: {
            currentGrade: 88,
            desiredGrade: 90,
            finalWeight: 40,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: courseForm.control,
        name: "assignments",
    });

    const watchedAssignments = useWatch({
        control: courseForm.control,
        name: 'assignments',
    });

    useEffect(() => {
        calculateCourseGrade(watchedAssignments);
    }, [watchedAssignments]);

    const calculateCourseGrade = (assignments: any[]) => {
        let totalWeight = 0;
        let weightedGradeSum = 0;

        assignments.forEach(assignment => {
            if (assignment.grade && assignment.weight > 0) {
                const gradeValue = isNaN(Number(assignment.grade)) ? gradeScale[assignment.grade.toUpperCase()] : Number(assignment.grade);
                if (gradeValue !== undefined) {
                    weightedGradeSum += gradeValue * (assignment.weight / 100);
                    totalWeight += assignment.weight;
                }
            }
        });

        const finalGrade = totalWeight > 0 ? (weightedGradeSum / totalWeight) * 100 : 0;
        setCourseResult({ grade: finalGrade, totalWeight });
    };

    const onFinalGradeSubmit = (values: z.infer<typeof finalGradeSchema>) => {
        const { currentGrade, desiredGrade, finalWeight } = values;
        const currentWeight = 100 - finalWeight;
        const requiredGrade = (desiredGrade - (currentGrade * (currentWeight / 100))) / (finalWeight / 100);
        setFinalGradeResult(requiredGrade);
    };

    return (
      <Tabs defaultValue="course" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="course">Course Grade Calculator</TabsTrigger>
            <TabsTrigger value="final">Final Grade Calculator</TabsTrigger>
        </TabsList>
        <TabsContent value="course">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-4">
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader><CardTitle>Course Assignments</CardTitle></CardHeader>
                        <CardContent>
                            <Form {...courseForm}>
                                <form className="space-y-4">
                                    <Table>
                                        <TableHeader><TableRow>
                                            <TableHead className="w-2/5">Name (Optional)</TableHead>
                                            <TableHead className="w-1/5">Grade (%)</TableHead>
                                            <TableHead className="w-1/5">Weight (%)</TableHead>
                                            <TableHead className="w-1/5 text-right">Action</TableHead>
                                        </TableRow></TableHeader>
                                        <TableBody>
                                            {fields.map((field, index) => (
                                                <TableRow key={field.id}>
                                                    <TableCell><FormField control={courseForm.control} name={`assignments.${index}.name`} render={({ field }) => (<FormItem><FormControl><Input placeholder="e.g., Midterm" {...field} /></FormControl></FormItem>)}/></TableCell>
                                                    <TableCell><FormField control={courseForm.control} name={`assignments.${index}.grade`} render={({ field }) => (<FormItem><FormControl><Input placeholder="e.g., 88 or B+" {...field} /></FormControl></FormItem>)}/></TableCell>
                                                    <TableCell><FormField control={courseForm.control} name={`assignments.${index}.weight`} render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/></TableCell>
                                                    <TableCell className="text-right"><Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Button type="button" variant="outline" className="w-full" onClick={() => append({ name: '', grade: '90', weight: 10 })}><Plus className="mr-2 h-4 w-4" /> Add Assignment</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="sticky top-24">
                        <CardHeader><CardTitle>Your Course Grade</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center p-6 bg-primary text-primary-foreground rounded-lg">
                                <p className="text-lg">Your grade is</p>
                                <p className="text-6xl font-bold">{courseResult?.grade.toFixed(2) || '0.00'}<span className="text-4xl">%</span></p>
                            </div>
                            {courseResult && courseResult.totalWeight !== 100 && (
                                <div className="flex items-center gap-2 text-sm text-destructive p-2 bg-destructive/10 rounded-md">
                                    <AlertCircle className="h-5 w-5"/>
                                    <span>Total weight is {courseResult.totalWeight}%. It should be 100%.</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
        <TabsContent value="final">
            <Card className="max-w-xl mx-auto mt-4">
                <CardHeader><CardTitle>Final Grade Calculator</CardTitle><CardDescription>Find out what you need on your final exam to get a desired grade.</CardDescription></CardHeader>
                <CardContent>
                    <Form {...finalGradeForm}>
                        <form onSubmit={finalGradeForm.handleSubmit(onFinalGradeSubmit)} className="space-y-4">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField name="currentGrade" control={finalGradeForm.control} render={({ field }) => (<FormItem><FormLabel>Current Grade (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField name="desiredGrade" control={finalGradeForm.control} render={({ field }) => (<FormItem><FormLabel>Desired Grade (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            </div>
                            <FormField name="finalWeight" control={finalGradeForm.control} render={({ field }) => (<FormItem><FormLabel>Final Exam is Worth (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <Button type="submit" className="w-full">Calculate Required Grade</Button>
                        </form>
                    </Form>
                     {finalGradeResult !== null && (
                        <Card className="text-center mt-6 bg-secondary">
                            <CardHeader>
                                <CardTitle className="text-lg text-muted-foreground">You need to score at least</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-5xl font-bold text-primary">{finalGradeResult.toFixed(2)}%</p>
                                <p className="text-sm text-muted-foreground mt-1">on your final exam.</p>
                            </CardContent>
                        </Card>
                     )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    );
};

export default GradeCalculator;
