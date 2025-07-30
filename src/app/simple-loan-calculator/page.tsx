import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import SimpleLoanCalculator from '@/components/calculator/simple-loan-calculator';

export default function SimpleLoanCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Simple Loan Calculator</h1>
            <p className="text-muted-foreground mt-2">Calculate your monthly loan payments and see a full amortization schedule.</p>
        </div>
        <SimpleLoanCalculator />
      </main>
      <Footer />
    </div>
  );
}
