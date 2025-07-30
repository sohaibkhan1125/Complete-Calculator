import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import AutoLoanCalculator from '@/components/calculator/auto-loan-calculator';

export default function AutoLoanCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Auto Loan Calculator</h1>
            <p className="text-muted-foreground mt-2">Estimate your monthly car payment and total loan cost.</p>
        </div>
        <AutoLoanCalculator />
      </main>
      <Footer />
    </div>
  );
}