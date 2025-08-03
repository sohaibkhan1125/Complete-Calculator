import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import Link from 'next/link';
import React from 'react';

interface Calculator {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
}

interface Category {
    title: string;
    icon: React.ReactNode;
    calculators: Calculator[];
}

interface CategoryDisplayProps {
    category: Category;
}

const CategoryDisplay = ({ category }: CategoryDisplayProps) => {
  return (
    <section>
        <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
              {category.icon}
            </div>
            <h2 className="text-3xl font-bold font-headline">
                {category.title}
            </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {category.calculators.map((calc) => (
             <Link href={calc.href} key={calc.title} className="block hover:shadow-lg transition-shadow duration-300 rounded-lg">
               <Card className="text-left h-full">
                 <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                   {calc.icon}
                   <CardTitle className="text-lg">{calc.title}</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p className="text-sm text-muted-foreground">{calc.description}</p>
                 </CardContent>
               </Card>
             </Link>
          ))}
      </div>
    </section>
  );
};

export default CategoryDisplay;
