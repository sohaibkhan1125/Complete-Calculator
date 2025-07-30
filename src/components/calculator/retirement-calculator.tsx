"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronsUpDown, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const neededSchema = z.object({
  currentAge: z.coerce.number().min(0).default(35),
  retirementAge: z.coerce.number().min(0).default(67),
  lifeExpectancy: z.coerce.number().min(0).default(85),
  pretaxIncome: z.coerce.number().min(0).default(70000),
  incomeIncrease: z.coerce.number().min(0).default(3),
  incomeNeeded: z.coerce.number().min(0).default(75),
  investmentReturn: z.coerce.number().min(0).default(6),
  inflationRate: z.coerce.number().min(0).default(3),
  otherIncome: z.coerce.number().min(0).default(0),
  currentSavings: z.coerce.number().min(0).default(30000),
  futureSavingsPercent: z.coerce.number().min(0).default(10),
});

const saveSchema = z.object({
  currentAge: z.coerce.number().min(0).default(35),
  retirementAge: z.coerce.number().min(0).default(67),
  amountNeeded: z.coerce.number().min(0).default(600000),
  currentSavings: z.coerce.number().min(0).default(30000),
  investmentReturn: z.coerce.number().min(0).default(6),
});

const withdrawSchema = z.object({
  currentAge: z.coerce.number().min(0).default(35),
  retirementAge: z.coerce.number().min(0).default(67),
  lifeExpectancy: z.coerce.number().min(0).default(85),
  currentSavings: z.coerce.number().min(0).default(30000),
  annualContribution: z.coerce.number().min(0).default(0),
  monthlyContribution: z.coerce.number().min(0).default(500),
  investmentReturn: z.coerce.number().min(0).default(6),
  inflationRate: z.coerce.number().min(0).default(3),
});

const lastSchema = z.object({
  savingsAvailable: z.coerce.number().min(0).default(600000),
  monthlyWithdrawal: z.coerce.number().min(0).default(5000),
  investmentReturn: z.coerce.number().min(0).default(6),
});

const ResultCard = ({ title, value, description }: { title: string; value: string; description?: string }) => (
    <Card className="text-center">
        <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-4xl font-bold text-primary">{value}</p>
            {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
        </CardContent>
    </Card>
);

const RetirementCalculator = () => {
  const [activeTab, setActiveTab] = useState("needed");
  
  const [neededResult, setNeededResult] = useState<{ amountNeeded: number; monthlySavings: number } | null>(null);
  const [saveResult, setSaveResult] = useState<{ requiredMonthlySavings: number } | null>(null);
  const [withdrawResult, setWithdrawResult] = useState<{ monthlyWithdrawal: number } | null>(null);
  const [lastResult, setLastResult] = useState<{ years: number; months: number } | null>(null);

  const neededForm = useForm<z.infer<typeof neededSchema>>({ resolver: zodResolver(neededSchema), defaultValues: neededSchema.parse({}) });
  const saveForm = useForm<z.infer<typeof saveSchema>>({ resolver: zodResolver(saveSchema), defaultValues: saveSchema.parse({}) });
  const withdrawForm = useForm<z.infer<typeof withdrawSchema>>({ resolver: zodResolver(withdrawSchema), defaultValues: withdrawSchema.parse({}) });
  const lastForm = useForm<z.infer<typeof lastSchema>>({ resolver: zodResolver(lastSchema), defaultValues: lastSchema.parse({}) });

  const onNeededSubmit = (values: z.infer<typeof neededSchema>) => {
    const yearsToRetire = values.retirementAge - values.currentAge;
    const yearsInRetirement = values.lifeExpectancy - values.retirementAge;

    const retirementYearlyIncome = values.pretaxIncome * Math.pow(1 + values.incomeIncrease / 100, yearsToRetire);
    const yearlyIncomeNeeded = retirementYearlyIncome * (values.incomeNeeded / 100);
    const yearlyNeedAfterOther = yearlyIncomeNeeded - (values.otherIncome * 12);
    
    const realReturn = ((1 + values.investmentReturn / 100) / (1 + values.inflationRate / 100)) - 1;
    
    // Amount needed at retirement (PV of an annuity)
    const amountNeeded = (yearlyNeedAfterOther * (1 - Math.pow(1 + realReturn, -yearsInRetirement))) / realReturn;

    // Future value of current savings
    const fvCurrentSavings = values.currentSavings * Math.pow(1 + values.investmentReturn / 100, yearsToRetire);
    
    const shortfall = amountNeeded - fvCurrentSavings;
    
    // PMT formula to find required monthly savings
    const monthlyRate = (values.investmentReturn / 100) / 12;
    const totalPayments = yearsToRetire * 12;
    const monthlySavings = (shortfall * monthlyRate) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    setNeededResult({ amountNeeded, monthlySavings });
  };
  
  const onSaveSubmit = (values: z.infer<typeof saveSchema>) => {
      const yearsToRetire = values.retirementAge - values.currentAge;
      const monthlyRate = (values.investmentReturn / 100) / 12;
      const totalPayments = yearsToRetire * 12;

      const fvCurrentSavings = values.currentSavings * Math.pow(1 + monthlyRate, totalPayments);
      const shortfall = values.amountNeeded - fvCurrentSavings;

      const requiredMonthlySavings = (shortfall * monthlyRate) / (Math.pow(1 + monthlyRate, totalPayments) - 1);

      setSaveResult({ requiredMonthlySavings });
  };
  
  const onWithdrawSubmit = (values: z.infer<typeof withdrawSchema>) => {
      const yearsToRetire = values.retirementAge - values.currentAge;
      const yearsInRetirement = values.lifeExpectancy - values.retirementAge;
      const monthlyRate = (values.investmentReturn / 100) / 12;
      const totalPaymentsToRetire = yearsToRetire * 12;
      
      let balance = values.currentSavings;
      // FV of current savings and contributions
      balance = balance * Math.pow(1 + monthlyRate, totalPaymentsToRetire);
      const monthlyContribution = values.monthlyContribution + (values.annualContribution / 12);
      const fvAnnuity = monthlyContribution * ((Math.pow(1 + monthlyRate, totalPaymentsToRetire) - 1) / monthlyRate);
      
      const totalNestEgg = balance + fvAnnuity;
      
      // Calculate sustainable withdrawal
      const realMonthlyReturn = ((1 + values.investmentReturn / 100) / (1 + values.inflationRate / 100)) ** (1/12) - 1;
      const totalRetirementPayments = yearsInRetirement * 12;
      const monthlyWithdrawal = (totalNestEgg * realMonthlyReturn) / (1 - Math.pow(1 + realMonthlyReturn, -totalRetirementPayments));
      
      setWithdrawResult({ monthlyWithdrawal });
  };
  
  const onLastSubmit = (values: z.infer<typeof lastSchema>) => {
      const monthlyRate = (values.investmentReturn / 100) / 12;
      
      if(values.monthlyWithdrawal <= values.savingsAvailable * monthlyRate) {
          setLastResult({ years: Infinity, months: 0 });
          return;
      }

      const numMonths = -(Math.log(1 - (values.savingsAvailable * monthlyRate) / values.monthlyWithdrawal) / Math.log(1 + monthlyRate));

      const years = Math.floor(numMonths / 12);
      const months = Math.ceil(numMonths % 12);

      setLastResult({ years, months });
  };

  const renderResult = () => {
    switch (activeTab) {
        case 'needed':
            return neededResult && (
                <ResultCard 
                    title="Amount you'll need at retirement" 
                    value={formatCurrency(neededResult.amountNeeded)}
                    description={`You need to save ${formatCurrency(neededResult.monthlySavings)} per month to reach this goal.`}
                />
            );
        case 'save':
            return saveResult && (
                <ResultCard
                    title="You need to save this per month"
                    value={formatCurrency(saveResult.requiredMonthlySavings)}
                />
            );
        case 'withdraw':
            return withdrawResult && (
                <ResultCard
                    title="You can withdraw this amount monthly"
                    value={formatCurrency(withdrawResult.monthlyWithdrawal)}
                    description="This is your inflation-adjusted monthly income."
                />
            );
        case 'last':
            return lastResult && (
                 <ResultCard
                    title="Your money will last for"
                    value={lastResult.years === Infinity ? "Forever" : `${lastResult.years} years and ${lastResult.months} months`}
                    description={lastResult.years === Infinity ? "Your withdrawals are less than your investment gains." : ""}
                />
            );
        default: return null;
    }
  };

  return (
    <TooltipProvider>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="needed">How much is needed?</TabsTrigger>
            <TabsTrigger value="save">How to save?</TabsTrigger>
            <TabsTrigger value="withdraw">How much to withdraw?</TabsTrigger>
            <TabsTrigger value="last">How long it lasts?</TabsTrigger>
          </TabsList>
          
          <TabsContent value="needed">
            <Card><CardHeader><CardTitle>How much do you need to retire?</CardTitle></CardHeader>
              <CardContent>
                <Form {...neededForm}>
                  <form onSubmit={neededForm.handleSubmit(onNeededSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField name="currentAge" control={neededForm.control} render={({ field }) => (<FormItem><FormLabel>Current Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField name="retirementAge" control={neededForm.control} render={({ field }) => (<FormItem><FormLabel>Retirement Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField name="lifeExpectancy" control={neededForm.control} render={({ field }) => (<FormItem><FormLabel>Life Expectancy</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="pretaxIncome" control={neededForm.control} render={({ field }) => (<FormItem><FormLabel>Current pre-tax income (/year)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField name="incomeIncrease" control={neededForm.control} render={({ field }) => (<FormItem><FormLabel>Current income increase rate (%/year)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="incomeNeeded" control={neededForm.control} render={({ field }) => (<FormItem><FormLabel>Income needed after retirement (% of income)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField name="otherIncome" control={neededForm.control} render={({ field }) => (<FormItem><FormLabel>Other income after retirement (/month)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField name="investmentReturn" control={neededForm.control} render={({ field }) => (<FormItem><FormLabel>Average investment return (%/year)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                         <FormField name="inflationRate" control={neededForm.control} render={({ field }) => (<FormItem><FormLabel>Inflation rate (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="currentSavings" control={neededForm.control} render={({ field }) => (<FormItem><FormLabel>Current retirement savings</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField name="futureSavingsPercent" control={neededForm.control} render={({ field }) => (<FormItem><FormLabel>Future retirement savings (% of income)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <Button type="submit" className="w-full">Calculate</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="save">
            <Card><CardHeader><CardTitle>How can you save for retirement?</CardTitle></CardHeader>
              <CardContent>
                <Form {...saveForm}>
                  <form onSubmit={saveForm.handleSubmit(onSaveSubmit)} className="space-y-4">
                    <FormField name="currentAge" control={saveForm.control} render={({ field }) => (<FormItem><FormLabel>Current Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField name="retirementAge" control={saveForm.control} render={({ field }) => (<FormItem><FormLabel>Retirement Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField name="amountNeeded" control={saveForm.control} render={({ field }) => (<FormItem><FormLabel>Amount needed at retirement</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField name="currentSavings" control={saveForm.control} render={({ field }) => (<FormItem><FormLabel>Retirement savings now</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField name="investmentReturn" control={saveForm.control} render={({ field }) => (<FormItem><FormLabel>Average investment return (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <Button type="submit" className="w-full">Calculate</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw">
            <Card><CardHeader><CardTitle>How much can you withdraw after retirement?</CardTitle></CardHeader>
              <CardContent>
                <Form {...withdrawForm}>
                  <form onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField name="currentAge" control={withdrawForm.control} render={({ field }) => (<FormItem><FormLabel>Current Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField name="retirementAge" control={withdrawForm.control} render={({ field }) => (<FormItem><FormLabel>Retirement Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField name="lifeExpectancy" control={withdrawForm.control} render={({ field }) => (<FormItem><FormLabel>Life Expectancy</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                     <FormField name="currentSavings" control={withdrawForm.control} render={({ field }) => (<FormItem><FormLabel>Retirement savings today</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="annualContribution" control={withdrawForm.control} render={({ field }) => (<FormItem><FormLabel>Annual contribution</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField name="monthlyContribution" control={withdrawForm.control} render={({ field }) => (<FormItem><FormLabel>Monthly contribution</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="investmentReturn" control={withdrawForm.control} render={({ field }) => (<FormItem><FormLabel>Average investment return (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField name="inflationRate" control={withdrawForm.control} render={({ field }) => (<FormItem><FormLabel>Inflation rate (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <Button type="submit" className="w-full">Calculate</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="last">
            <Card><CardHeader><CardTitle>How long can your money last?</CardTitle></CardHeader>
              <CardContent>
                <Form {...lastForm}>
                  <form onSubmit={lastForm.handleSubmit(onLastSubmit)} className="space-y-4">
                     <FormField name="savingsAvailable" control={lastForm.control} render={({ field }) => (<FormItem><FormLabel>Savings available</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                     <FormField name="monthlyWithdrawal" control={lastForm.control} render={({ field }) => (<FormItem><FormLabel>Planned monthly withdrawal</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                     <FormField name="investmentReturn" control={lastForm.control} render={({ field }) => (<FormItem><FormLabel>Average investment return (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <Button type="submit" className="w-full">Calculate</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      <div className="lg:col-span-2 flex flex-col justify-center">
        {renderResult() || (
            <Card className="h-full flex flex-col justify-center items-center text-center p-6">
                <CardHeader>
                    <CardTitle>Your Retirement Summary</CardTitle>
                    <CardDescription>Results will appear here after calculation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChevronsUpDown className="h-16 w-16 text-muted-foreground animate-bounce" />
                </CardContent>
            </Card>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
};

export default RetirementCalculator;
