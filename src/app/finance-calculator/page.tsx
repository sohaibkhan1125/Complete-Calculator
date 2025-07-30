import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import FinanceCalculator from '@/components/calculator/finance-calculator';

export default function FinanceCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Finance Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">The finance calculator can be used to calculate any of the following key values in time value of money calculations. The tabs represent the desired parameter to be found.</p>
        </div>
        <FinanceCalculator />
      </main>
      <Footer />
    </div>
  );
}
