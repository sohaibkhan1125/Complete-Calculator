import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import AdvancedScientificCalculator from '@/components/calculator/advanced-scientific-calculator';

export default function ScientificCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Scientific Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">An advanced online scientific calculator with support for various mathematical functions, constants, and memory operations.</p>
        </div>
        <div className="flex justify-center">
            <AdvancedScientificCalculator />
        </div>
      </main>
      <Footer />
    </div>
  );
}
