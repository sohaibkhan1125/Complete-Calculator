import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Landmark, HeartPulse, Sigma, AppWindow, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import React from 'react';

const categories = [
  {
    title: "Financial Calculators",
    icon: <Landmark className="h-10 w-10 text-primary" />,
    calculators: [
      {
        title: "Mortgage Calculator",
        description: "Estimate your monthly payments.",
        href: "/mortgage-calculator",
        icon: <Home className="h-8 w-8 text-primary" />,
      },
    ],
    placeholders: 2,
  },
  {
    title: "Fitness & Health Calculators",
    icon: <HeartPulse className="h-10 w-10 text-primary" />,
    calculators: [],
    placeholders: 4,
  },
  {
    title: "Math Calculators",
    icon: <Sigma className="h-10 w-10 text-primary" />,
    calculators: [],
    placeholders: 2,
  },
  {
    title: "Other Calculators",
    icon: <AppWindow className="h-10 w-10 text-primary" />,
    calculators: [],
    placeholders: 3,
  },
];

const CategorySection = () => {
  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold text-center mb-8 font-headline">
        Calculator Categories
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {categories.map((category) => (
          <Card key={category.title} className="flex flex-col">
            <CardContent className="p-6 flex-grow">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
                  {category.icon}
                </div>
                <CardTitle className="font-headline text-lg mb-4">{category.title}</CardTitle>
                <div className="w-full space-y-3">
                  {category.calculators.map((calc) => (
                     <Link href={calc.href} key={calc.title} className="block hover:shadow-lg transition-shadow duration-300 rounded-lg">
                       <Card className="text-left">
                         <CardContent className="p-4 flex items-center space-x-4">
                           {calc.icon}
                           <div>
                             <p className="font-semibold">{calc.title}</p>
                             <p className="text-sm text-muted-foreground">{calc.description}</p>
                           </div>
                         </CardContent>
                       </Card>
                     </Link>
                  ))}
                  {Array.from({ length: category.placeholders }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-2">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
