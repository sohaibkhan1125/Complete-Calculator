import CategoryDisplay from "@/components/calculator/category-display";
import { AppWindow, Cake, CalendarDays, Clock, GraduationCap, HardHat, Network, Lock, Ruler } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const otherCalculators = {
    title: "Other Calculators",
    icon: <AppWindow className="h-10 w-10 text-primary" />,
    calculators: [
        {
            title: "Age Calculator",
            description: "Calculate age in various time units.",
            href: "/age-calculator",
            icon: <Cake className="h-8 w-8 text-primary" />,
        },
        {
            title: "Date Calculator",
            description: "Find duration between dates or add/subtract dates.",
            href: "/date-calculator",
            icon: <CalendarDays className="h-8 w-8 text-primary" />,
        },
        {
            title: "Time Calculator",
            description: "Add, subtract, and calculate durations.",
            href: "/time-calculator",
            icon: <Clock className="h-8 w-8 text-primary" />,
        },
        {
            title: "Hours Calculator",
            description: "Calculate duration between times or dates.",
            href: "/hours-calculator",
            icon: <Clock className="h-8 w-8 text-primary" />,
        },
        {
            title: "GPA Calculator",
            description: "Calculate your Grade Point Average.",
            href: "/gpa-calculator",
            icon: <GraduationCap className="h-8 w-8 text-primary" />,
        },
        {
            title: "Grade Calculator",
            description: "Calculate your course grade.",
            href: "/grade-calculator",
            icon: <GraduationCap className="h-8 w-8 text-primary" />,
        },
        {
            title: "Concrete Calculator",
            description: "Estimate concrete for slabs, footings, and stairs.",
            href: "/concrete-calculator",
            icon: <HardHat className="h-8 w-8 text-primary" />,
        },
        {
            title: "IP Subnet Calculator",
            description: "Calculate subnet details for IPv4 and IPv6.",
            href: "/ip-subnet-calculator",
            icon: <Network className="h-8 w-8 text-primary" />,
        },
        {
            title: "Password Generator",
            description: "Create secure, random passwords.",
            href: "/password-generator",
            icon: <Lock className="h-8 w-8 text-primary" />,
        },
        {
            title: "Unit Converter",
            description: "Convert between various units of measurement.",
            href: "/unit-converter",
            icon: <Ruler className="h-8 w-8 text-primary" />,
        }
    ],
};

export default function OtherCalculatorsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <CategoryDisplay category={otherCalculators} />
            </main>
            <Footer />
        </div>
    );
}
