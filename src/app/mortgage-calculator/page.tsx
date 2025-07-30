import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import MortgageCalculator from '@/components/calculator/mortgage-calculator';

export default function MortgageCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 font-headline">Mortgage Calculator</h1>
        <MortgageCalculator />
      </main>
      <Footer />
    </div>
  );
}
