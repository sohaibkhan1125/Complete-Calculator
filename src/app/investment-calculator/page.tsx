import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import InvestmentCalculator from '@/components/calculator/investment-calculator';

export default function InvestmentCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Investment Calculator</h1>
            <p className="text-muted-foreground mt-2">Calculate a specific parameter for an investment plan. The tabs represent the desired parameter to be found.</p>
        </div>
        <InvestmentCalculator />
      </main>
      <Footer />
    </div>
  );
}
