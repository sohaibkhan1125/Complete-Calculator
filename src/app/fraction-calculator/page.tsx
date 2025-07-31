import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import FractionCalculator from '@/components/calculator/fraction-calculator';

export default function FractionCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Fraction Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Perform operations on fractions, mixed numbers, and decimals. This tool can add, subtract, multiply, divide, simplify, and convert fractions.</p>
        </div>
        <FractionCalculator />
      </main>
      <Footer />
    </div>
  );
}
