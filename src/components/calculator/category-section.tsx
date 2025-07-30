import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Landmark, HeartPulse, Sigma, AppWindow } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import React from 'react';

const categories = [
  {
    title: "Financial Calculators",
    icon: <Landmark className="h-10 w-10 text-primary" />,
    placeholders: 3,
  },
  {
    title: "Fitness & Health Calculators",
    icon: <HeartPulse className="h-10 w-10 text-primary" />,
    placeholders: 4,
  },
  {
    title: "Math Calculators",
    icon: <Sigma className="h-10 w-10 text-primary" />,
    placeholders: 2,
  },
  {
    title: "Other Calculators",
    icon: <AppWindow className="h-10 w-10 text-primary" />,
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
          <Card key={category.title} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 flex-grow">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
                  {category.icon}
                </div>
                <CardTitle className="font-headline text-lg mb-4">{category.title}</CardTitle>
                <div className="w-full space-y-3">
                  {Array.from({ length: category.placeholders }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
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
