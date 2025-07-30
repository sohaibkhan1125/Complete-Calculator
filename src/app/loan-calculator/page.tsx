import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import LoanCalculator from '@/components/calculator/loan-calculator';

export default function LoanCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Loan Calculator</h1>
            <p className="text-muted-foreground mt-2">Select a loan type and modify the values to calculate your loan details.</p>
        </div>
        <LoanCalculator />
      </main>
      <Footer />
    </div>
  );
}
