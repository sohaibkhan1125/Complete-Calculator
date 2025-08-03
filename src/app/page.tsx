"use client";

import { useState } from 'react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import ScientificCalculator from '@/components/calculator/scientific-calculator';
import AiCalculator from '@/components/calculator/ai-calculator';
import SearchCalculators from '@/components/calculator/search-calculators';
import CategorySection from '@/components/calculator/category-section';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <ScientificCalculator />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <AiCalculator />
            <SearchCalculators searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
        </div>
        <CategorySection searchQuery={searchQuery} />
      </main>
      <Footer />
    </div>
  );
}
