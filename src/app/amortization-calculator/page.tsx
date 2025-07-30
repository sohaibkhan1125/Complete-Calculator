import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import AmortizationCalculator from '@/components/calculator/amortization-calculator';

export default function AmortizationCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Amortization Calculator</h1>
            <p className="text-muted-foreground mt-2">Enter your loan details to see a full amortization schedule.</p>
        </div>
        <AmortizationCalculator />
      </main>
      <Footer />
    </div>
  );
}
