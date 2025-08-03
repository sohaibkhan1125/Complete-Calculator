import CategoryDisplay from "@/components/calculator/category-display";
import { HeartPulse, Scale, Utensils, PersonStanding, BrainCircuit, Weight, Footprints, Baby } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const fitnessHealthCalculators = {
    title: "Fitness & Health Calculators",
    icon: <HeartPulse className="h-10 w-10 text-primary" />,
    calculators: [
        {
            title: "BMI Calculator",
            description: "Calculate your Body Mass Index.",
            href: "/bmi-calculator",
            icon: <Scale className="h-8 w-8 text-primary" />,
        },
        {
            title: "Calorie Calculator",
            description: "Estimate your daily calorie needs.",
            href: "/calorie-calculator",
            icon: <Utensils className="h-8 w-8 text-primary" />,
        },
        {
          title: "Body Fat Calculator",
          description: "Estimate your total body fat.",
          href: "/body-fat-calculator",
          icon: <PersonStanding className="h-8 w-8 text-primary" />,
        },
        {
          title: "BMR Calculator",
          description: "Estimate your Basal Metabolic Rate.",
          href: "/bmr-calculator",
          icon: <BrainCircuit className="h-8 w-8 text-primary" />,
        },
        {
          title: "Ideal Weight Calculator",
          description: "Calculate your ideal weight range.",
          href: "/ideal-weight-calculator",
          icon: <Weight className="h-8 w-8 text-primary" />,
        },
        {
          title: "Pace Calculator",
          description: "Calculate your running, walking, or cycling pace.",
          href: "/pace-calculator",
          icon: <Footprints className="h-8 w-8 text-primary" />,
        },
        {
          title: "Pregnancy Calculator",
          description: "Estimate your pregnancy timeline.",
          href: "/pregnancy-calculator",
          icon: <Baby className="h-8 w-8 text-primary" />,
        },
        {
          title: "Pregnancy Conception Calculator",
          description: "Estimate your date of conception.",
          href: "/pregnancy-conception-calculator",
          icon: <Baby className="h-8 w-8 text-primary" />,
        },
        {
          title: "Due Date Calculator",
          description: "Estimate your baby's due date.",
          href: "/due-date-calculator",
          icon: <Baby className="h-8 w-8 text-primary" />,
        }
    ],
};

export default function FitnessHealthCalculatorsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <CategoryDisplay category={fitnessHealthCalculators} />
            </main>
            <Footer />
        </div>
    );
}
