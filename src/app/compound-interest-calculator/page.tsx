import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import CompoundInterestCalculator from '@/components/calculator/compound-interest-calculator';

export default function CompoundInterestCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Compound Interest Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">This Compound Interest Calculator can be used to compare or convert interest rates across different compounding periods. It is ideal for converting between nominal (APR) and effective (APY) rates.</p>
        </div>
        <CompoundInterestCalculator />
      </main>
      <Footer />
    </div>
  );
}
