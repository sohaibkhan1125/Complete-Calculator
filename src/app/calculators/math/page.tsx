import CategoryDisplay from "@/components/calculator/category-display";
import { Sigma, Calculator, Divide, Percent, Shuffle, Triangle, BarChartHorizontal } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const mathCalculators = {
    title: "Math Calculators",
    icon: <Sigma className="h-10 w-10 text-primary" />,
    calculators: [
        {
            title: "Scientific Calculator",
            description: "Perform advanced mathematical calculations.",
            href: "/scientific-calculator",
            icon: <Calculator className="h-8 w-8 text-primary" />,
        },
        {
            title: "Fraction Calculator",
            description: "Add, subtract, multiply, and divide fractions.",
            href: "/fraction-calculator",
            icon: <Divide className="h-8 w-8 text-primary" />,
        },
        {
            title: "Percentage Calculator",
            description: "Calculate percentages, changes, and differences.",
            href: "/percentage-calculator",
            icon: <Percent className="h-8 w-8 text-primary" />,
        },
        {
            title: "Random Number Generator",
            description: "Generate random integers or decimals.",
            href: "/random-number-generator",
            icon: <Shuffle className="h-8 w-8 text-primary" />,
        },
        {
            title: "Triangle Calculator",
            description: "Solve for triangle angles and sides.",
            href: "/triangle-calculator",
            icon: <Triangle className="h-8 w-8 text-primary" />,
        },
        {
            title: "Standard Deviation Calculator",
            description: "Calculate standard deviation and variance.",
            href: "/standard-deviation-calculator",
            icon: <BarChartHorizontal className="h-8 w-8 text-primary" />,
        }
    ],
};

export default function MathCalculatorsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <CategoryDisplay category={mathCalculators} />
            </main>
            <Footer />
        </div>
    );
}
