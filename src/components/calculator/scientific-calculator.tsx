"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ScientificCalculator = () => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [isResult, setIsResult] = useState(false);

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = n; i > 1; i--) {
      result *= i;
    }
    return result;
  };

  const handleButtonClick = (value: string) => {
    if (isResult) {
      setExpression("");
      setDisplay("0");
      setIsResult(false);
    }
    
    if (value === "C") {
      setDisplay("0");
      setExpression("");
    } else if (value === "CE") {
      setDisplay("0");
    } else if (value === "=") {
      if (expression === "") return;
      try {
        let tempExpression = expression
            .replace(/\^/g, "**")
            .replace(/√/g, "Math.sqrt")
            .replace(/log/g, "Math.log10")
            .replace(/ln/g, "Math.log")
            .replace(/sin/g, "Math.sin")
            .replace(/cos/g, "Math.cos")
            .replace(/tan/g, "Math.tan");
        
        // This is a simplification and has known limitations with complex expressions
        const result = new Function('return ' + tempExpression)();
        
        setDisplay(result.toString());
        setExpression(result.toString());
        setIsResult(true);
      } catch (error) {
        setDisplay("Error");
        setExpression("");
        setIsResult(true);
      }
    } else if (["sin", "cos", "tan", "log", "ln", "√"].includes(value)) {
        setExpression(prev => `${value}(${prev})`);
        setDisplay(prev => `${value}(${prev})`);
    } else if (value === "!") {
        try {
            const num = parseFloat(expression);
            if(isNaN(num)) throw new Error("Invalid number for factorial");
            const result = factorial(num);
            setDisplay(result.toString());
            setExpression(result.toString());
        } catch(e) {
            setDisplay("Error");
            setExpression("");
        }
        setIsResult(true);
    }
    else {
      if (display === "0" && value !== ".") {
        setDisplay(value);
      } else {
        setDisplay(prev => prev + value);
      }
      if(isResult){
        setExpression(value);
        setIsResult(false);
      } else {
        setExpression(prev => prev + value);
      }
    }
  };

  const buttons = [
    "sin", "cos", "tan", "log", "ln",
    "(", ")", "√", "^", "!",
    "7", "8", "9", "/", "CE",
    "4", "5", "6", "*", "C",
    "1", "2", "3", "-", "=",
    "0", ".",
  ];

  return (
    <Card className="shadow-2xl">
      <CardContent className="p-4">
        <div className="bg-muted rounded-lg p-4 mb-4 text-right overflow-x-auto">
          <p className="text-sm text-muted-foreground h-6">{isResult ? "" : expression || " "}</p>
          <p className="text-4xl font-headline font-bold">{display}</p>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {buttons.slice(0, 18).map((btn) => (
            <Button
              key={btn}
              onClick={() => handleButtonClick(btn)}
              variant={/[0-9.]/.test(btn) ? "secondary" : "default"}
              className="h-16 text-xl"
            >
              {btn}
            </Button>
          ))}
           <Button
              key="C"
              onClick={() => handleButtonClick("C")}
              variant="destructive"
              className="h-16 text-xl"
            >
              C
            </Button>
            <Button
              key="="
              onClick={() => handleButtonClick("=")}
              variant="default"
              className="h-16 text-xl bg-accent hover:bg-accent/90 col-span-1"
            >
              =
            </Button>
             <Button
              key="0"
              onClick={() => handleButtonClick("0")}
              variant="secondary"
              className="h-16 text-xl col-span-2"
            >
              0
            </Button>
            <Button
              key="."
              onClick={() => handleButtonClick(".")}
              variant="secondary"
              className="h-16 text-xl"
            >
              .
            </Button>
             <Button
              key="+"
              onClick={() => handleButtonClick("+")}
              variant="default"
              className="h-16 text-xl"
            >
              +
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScientificCalculator;
