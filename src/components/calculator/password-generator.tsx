"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw } from "lucide-react";
import Link from 'next/link';

const formSchema = z.object({
  length: z.number().min(4).max(64),
  uppercase: z.boolean(),
  lowercase: z.boolean(),
  numbers: z.boolean(),
  symbols: z.boolean(),
  excludeSimilar: z.boolean(),
  excludeAmbiguous: z.boolean(),
}).refine(data => data.uppercase || data.lowercase || data.numbers || data.symbols, {
  message: "At least one character set must be selected.",
  path: ["uppercase"],
});

type FormData = z.infer<typeof formSchema>;

const charsets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>/?',
    similar: 'Il1O0',
    ambiguous: '{}[]()/\\\'"`~,;:.<>',
};

const PasswordGenerator = () => {
    const [password, setPassword] = useState("");
    const [entropy, setEntropy] = useState(0);
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            length: 16,
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true,
            excludeSimilar: false,
            excludeAmbiguous: false,
        },
    });

    const generatePassword = useCallback((values: FormData) => {
        let charset = "";
        if (values.uppercase) charset += charsets.uppercase;
        if (values.lowercase) charset += charsets.lowercase;
        if (values.numbers) charset += charsets.numbers;
        if (values.symbols) charset += charsets.symbols;

        if (values.excludeSimilar) {
            charset = charset.split('').filter(c => !charsets.similar.includes(c)).join('');
        }
        if (values.excludeAmbiguous) {
            charset = charset.split('').filter(c => !charsets.ambiguous.includes(c)).join('');
        }
        
        if (charset.length === 0) {
            setPassword("");
            setEntropy(0);
            return;
        }

        let newPassword = "";
        for (let i = 0; i < values.length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            newPassword += charset[randomIndex];
        }
        
        setPassword(newPassword);

        const poolSize = charset.length;
        const passwordEntropy = values.length * Math.log2(poolSize);
        setEntropy(passwordEntropy);
    }, []);

    const watchedSettings = useWatch({ control: form.control });
    
    useEffect(() => {
        generatePassword(watchedSettings);
    }, [watchedSettings, generatePassword]);


    const copyPassword = () => {
        if (password) {
            navigator.clipboard.writeText(password);
            toast({ title: "Copied!", description: "Password copied to clipboard." });
        }
    };

    const getStrength = () => {
        if (entropy < 40) return { text: "Weak", color: "text-red-500" };
        if (entropy < 60) return { text: "Medium", color: "text-yellow-500" };
        if (entropy < 80) return { text: "Strong", color: "text-green-500" };
        return { text: "Very Strong", color: "text-green-700" };
    };
    
    const strength = getStrength();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Password Generator</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form className="space-y-6">
                                <div className="space-y-2">
                                     <div className="flex justify-between items-center mb-4">
                                        <FormLabel>Password Length: {form.getValues('length')}</FormLabel>
                                         <FormField name="length" control={form.control} render={({ field }) => (
                                             <FormControl>
                                                 <Slider
                                                     min={4} max={64} step={1}
                                                     value={[field.value]}
                                                     onValueChange={(value) => field.onChange(value[0])}
                                                     className="w-3/4"
                                                 />
                                             </FormControl>
                                         )} />
                                    </div>
                                    <div className="flex items-center justify-between"><FormLabel>Include Uppercase Letters</FormLabel><FormField name="uppercase" control={form.control} render={({ field }) => (<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>)} /></div>
                                    <div className="flex items-center justify-between"><FormLabel>Include Lowercase Letters</FormLabel><FormField name="lowercase" control={form.control} render={({ field }) => (<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>)} /></div>
                                    <div className="flex items-center justify-between"><FormLabel>Include Numbers</FormLabel><FormField name="numbers" control={form.control} render={({ field }) => (<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>)} /></div>
                                    <div className="flex items-center justify-between"><FormLabel>Include Symbols</FormLabel><FormField name="symbols" control={form.control} render={({ field }) => (<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>)} /></div>
                                    <div className="flex items-center justify-between"><FormLabel>Exclude Similar Characters (I, l, 1, O, 0)</FormLabel><FormField name="excludeSimilar" control={form.control} render={({ field }) => (<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>)} /></div>
                                    <div className="flex items-center justify-between"><FormLabel>Exclude Ambiguous Characters ({'{}[]()/\\\'"`~,;:.<>'})</FormLabel><FormField name="excludeAmbiguous" control={form.control} render={({ field }) => (<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>)} /></div>
                                </div>
                                <FormMessage>{form.formState.errors.uppercase?.message}</FormMessage>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Your New Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Input
                                readOnly
                                value={password}
                                className="pr-20 text-lg font-mono tracking-wider h-12"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <Button variant="ghost" size="icon" onClick={copyPassword} aria-label="Copy Password"><Copy className="h-5 w-5"/></Button>
                                <Button variant="ghost" size="icon" onClick={() => generatePassword(form.getValues())} aria-label="Regenerate Password"><RefreshCw className="h-5 w-5"/></Button>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between text-sm">
                            <span className="text-muted-foreground">Strength: <strong className={strength.color}>{strength.text}</strong></span>
                            <span className="text-muted-foreground">Entropy: <strong>{entropy.toFixed(1)} bits</strong></span>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Related Tools</CardTitle></CardHeader>
                    <CardContent className="flex flex-col space-y-2">
                         <Link href="/gpa-calculator" className="text-primary hover:underline">GPA Calculator</Link>
                         <Link href="/ip-subnet-calculator" className="text-primary hover:underline">IP Subnet Calculator</Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PasswordGenerator;
