"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AdvancedScientificCalculator = () => {
    const [display, setDisplay] = useState("0");
    const [expression, setExpression] = useState("");
    const [isDeg, setIsDeg] = useState(true);
    const [memory, setMemory] = useState(0);
    const { toast } = useToast();

    const factorial = (n: number): number => {
        if (n < 0 || n % 1 !== 0) return NaN;
        if (n > 170) return Infinity;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = n; i > 1; i--) {
            result *= i;
        }
        return result;
    };

    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    const toDegrees = (radians: number) => radians * (180 / Math.PI);

    const handleInput = (value: string) => {
        setExpression(prev => prev + value);
        if (display === "0" && !("+-*/^".includes(value))) {
            setDisplay(value);
        } else {
            setDisplay(prev => prev + value);
        }
    };
    
    const calculate = () => {
        try {
            let evalExpression = expression
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/\^/g, '**')
                // Handle trig functions with deg/rad
                .replace(/sin\(([^)]+)\)/g, (match, p1) => `Math.sin(${isDeg ? toRadians(parseFloat(p1)) : p1})`)
                .replace(/cos\(([^)]+)\)/g, (match, p1) => `Math.cos(${isDeg ? toRadians(parseFloat(p1)) : p1})`)
                .replace(/tan\(([^)]+)\)/g, (match, p1) => `Math.tan(${isDeg ? toRadians(parseFloat(p1)) : p1})`)
                .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
                .replace(/log\(([^)]+)\)/g, 'Math.log10($1)')
                .replace(/ln\(([^)]+)\)/g, 'Math.log($1)');

            const result = new Function('return ' + evalExpression)();
            if (isNaN(result) || !isFinite(result)) {
                throw new Error("Invalid calculation");
            }
            setDisplay(String(result));
            setExpression(String(result));
        } catch (e) {
            setDisplay("Error");
            setExpression("");
        }
    };
    
    const handleFunction = (func: string) => {
        let currentVal = parseFloat(display);
        if (isNaN(currentVal)) {
            setDisplay("Error");
            setExpression("");
            return;
        }
        
        let result;
        switch(func) {
            case 'sin': result = Math.sin(isDeg ? toRadians(currentVal) : currentVal); break;
            case 'cos': result = Math.cos(isDeg ? toRadians(currentVal) : currentVal); break;
            case 'tan': result = Math.tan(isDeg ? toRadians(currentVal) : currentVal); break;
            case 'sin⁻¹': result = isDeg ? toDegrees(Math.asin(currentVal)) : Math.asin(currentVal); break;
            case 'cos⁻¹': result = isDeg ? toDegrees(Math.acos(currentVal)) : Math.acos(currentVal); break;
            case 'tan⁻¹': result = isDeg ? toDegrees(Math.atan(currentVal)) : Math.atan(currentVal); break;
            case 'ln': result = Math.log(currentVal); break;
            case 'log': result = Math.log10(currentVal); break;
            case '√': result = Math.sqrt(currentVal); break;
            case '∛': result = Math.cbrt(currentVal); break;
            case 'x²': result = Math.pow(currentVal, 2); break;
            case 'x³': result = Math.pow(currentVal, 3); break;
            case '1/x': result = 1 / currentVal; break;
            case 'n!': result = factorial(currentVal); break;
            case '±': result = -currentVal; break;
            case 'eˣ': result = Math.exp(currentVal); break;
            case '10ˣ': result = Math.pow(10, currentVal); break;
            default: return;
        }

        if (isNaN(result) || !isFinite(result)) {
            setDisplay("Error");
            setExpression("");
        } else {
            setDisplay(String(result));
            setExpression(String(result));
        }
    }

    const clear = () => {
        setDisplay("0");
        setExpression("");
    }
    
    const handleMemory = (op: string) => {
        const currentVal = parseFloat(display);
        if (isNaN(currentVal)) return;

        switch(op) {
            case 'M+': setMemory(prev => prev + currentVal); break;
            case 'M-': setMemory(prev => prev - currentVal); break;
            case 'MR':
                setDisplay(String(memory));
                setExpression(prev => prev + String(memory));
                break;
        }
         toast({ title: `Memory: ${op === 'MR' ? 'Recalled' : 'Updated'}`, description: `New Memory Value: ${op === 'M+' ? memory + currentVal : op === 'M-' ? memory - currentVal : memory}` });
    };

    const buttons = [
        { label: "Rad", action: () => setIsDeg(false), active: !isDeg }, { label: "Deg", action: () => setIsDeg(true), active: isDeg }, { label: "x!", action: () => handleFunction('n!') }, { label: "(", action: () => handleInput('(') }, { label: ")", action: () => handleInput(')') }, { label: "%", action: () => handleInput('%') }, { label: "AC", action: clear, variant: "destructive" as const },
        { label: "sin⁻¹", action: () => handleFunction('sin⁻¹') }, { label: "cos⁻¹", action: () => handleFunction('cos⁻¹') }, { label: "tan⁻¹", action: () => handleFunction('tan⁻¹') }, { label: "1/x", action: () => handleFunction('1/x') }, { label: "ln", action: () => handleFunction('ln') }, { label: "log", action: () => handleFunction('log') }, { label: "÷", action: () => handleInput('/'), variant: "default" as const },
        { label: "sin", action: () => handleFunction('sin') }, { label: "cos", action: () => handleFunction('cos') }, { label: "tan", action: () => handleFunction('tan') }, { label: "√", action: () => handleFunction('√') }, { label: "∛", action: () => handleFunction('∛') }, { label: "x^y", action: () => handleInput('^') }, { label: "×", action: () => handleInput('*'), variant: "default" as const },
        { label: "eˣ", action: () => handleFunction('eˣ') }, { label: "10ˣ", action: () => handleFunction('10ˣ') }, { label: "Ans", action: () => {} /* Placeholder */ }, { label: "7", action: () => handleInput('7'), variant: "secondary" as const }, { label: "8", action: () => handleInput('8'), variant: "secondary" as const }, { label: "9", action: () => handleInput('9'), variant: "secondary" as const }, { label: "−", action: () => handleInput('-'), variant: "default" as const },
        { label: "M+", action: () => handleMemory('M+') }, { label: "M-", action: () => handleMemory('M-') }, { label: "MR", action: () => handleMemory('MR') }, { label: "4", action: () => handleInput('4'), variant: "secondary" as const }, { label: "5", action: () => handleInput('5'), variant: "secondary" as const }, { label: "6", action: () => handleInput('6'), variant: "secondary" as const }, { label: "+", action: () => handleInput('+'), variant: "default" as const },
        { label: "π", action: () => handleInput('π') }, { label: "e", action: () => handleInput('e') }, { label: "±", action: () => handleFunction('±') }, { label: "1", action: () => handleInput('1'), variant: "secondary" as const }, { label: "2", action: () => handleInput('2'), variant: "secondary" as const }, { label: "3", action: () => handleInput('3'), variant: "secondary" as const }, { label: "=", action: calculate, className: "row-span-2 bg-accent hover:bg-accent/90", variant: "default" as const },
        { label: "RND", action: () => handleInput(Math.random().toString()) }, { label: "x²", action: () => handleFunction('x²') }, { label: "x³", action: () => handleFunction('x³') }, { label: "0", action: () => handleInput('0'), className: "col-span-2", variant: "secondary" as const }, { label: ".", action: () => handleInput('.'), variant: "secondary" as const },
    ];

    return (
        <Card className="shadow-2xl max-w-2xl w-full">
            <CardContent className="p-4">
                <div className="bg-muted rounded-lg p-4 mb-4 text-right overflow-x-auto break-words">
                    <p className="text-sm text-muted-foreground h-6">{expression || " "}</p>
                    <p className="text-4xl font-headline font-bold h-12">{display}</p>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {buttons.map((btn) => (
                        <Button
                            key={btn.label}
                            onClick={btn.action}
                            variant={btn.active ? "default" : (btn.variant || 'outline')}
                            className={cn("h-14 text-md md:h-16 md:text-xl", btn.className)}
                        >
                            {btn.label}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AdvancedScientificCalculator;
