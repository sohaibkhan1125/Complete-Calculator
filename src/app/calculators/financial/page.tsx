import CategoryDisplay from "@/components/calculator/category-display";
import { Landmark, Home, Percent, Car, BarChartBig, Banknote, UserRoundCheck, Calculator, Table, PiggyBank, CircleDollarSign, Receipt, Briefcase, TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const financialCalculators = {
    title: "Financial Calculators",
    icon: <Landmark className="h-10 w-10 text-primary" />,
    calculators: [
      {
        title: "Mortgage Calculator",
        description: "Estimate your monthly payments.",
        href: "/mortgage-calculator",
        icon: <Home className="h-8 w-8 text-primary" />,
      },
      {
        title: "Loan Calculator",
        description: "Calculate different types of loans.",
        href: "/loan-calculator",
        icon: <Percent className="h-8 w-8 text-primary" />,
      },
      {
        title: "Auto Loan Calculator",
        description: "Estimate your car payments.",
        href: "/auto-loan-calculator",
        icon: <Car className="h-8 w-8 text-primary" />,
      },
      {
        title: "Interest Calculator",
        description: "Compound interest growth.",
        href: "/interest-calculator",
        icon: <BarChartBig className="h-8 w-8 text-primary" />,
      },
      {
        title: "Interest Rate Calculator",
        description: "Solve for the interest rate (APR).",
        href: "/interest-rate-calculator",
        icon: <TrendingUp className="h-8 w-8 text-primary" />,
      },
      {
        title: "Compound Interest Calculator",
        description: "Convert interest rates.",
        href: "/compound-interest-calculator",
        icon: <Banknote className="h-8 w-8 text-primary" />,
      },
      {
        title: "Investment Calculator",
        description: "Calculate investment returns.",
        href: "/investment-calculator",
        icon: <PiggyBank className="h-8 w-8 text-primary" />,
      },
      {
        title: "Retirement Calculator",
        description: "Plan for your retirement.",
        href: "/retirement-calculator",
        icon: <UserRoundCheck className="h-8 w-8 text-primary" />,
      },
      {
        title: "Amortization Calculator",
        description: "View your loan schedule.",
        href: "/amortization-calculator",
        icon: <Table className="h-8 w-8 text-primary" />,
      },
      {
        title: "Inflation Calculator",
        description: "Calculate purchasing power over time.",
        href: "/inflation-calculator",
        icon: <CircleDollarSign className="h-8 w-8 text-primary" />,
      },
      {
        title: "Finance Calculator",
        description: "Solve for TVM variables.",
        href: "/finance-calculator",
        icon: <Calculator className="h-8 w-8 text-primary" />,
      },
      {
        title: "Income Tax Calculator",
        description: "Estimate your federal tax refund or due.",
        href: "/income-tax-calculator",
        icon: <Receipt className="h-8 w-8 text-primary" />,
      },
      {
        title: "Salary Calculator",
        description: "Convert salary between frequencies.",
        href: "/salary-calculator",
        icon: <Briefcase className="h-8 w-8 text-primary" />,
      },
       {
        title: "Sales Tax Calculator",
        description: "Compute tax-inclusive or exclusive prices.",
        href: "/sales-tax-calculator",
        icon: <Receipt className="h-8 w-8 text-primary" />,
      }
    ],
};

export default function FinancialCalculatorsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <CategoryDisplay category={financialCalculators} />
            </main>
            <Footer />
        </div>
    );
}
