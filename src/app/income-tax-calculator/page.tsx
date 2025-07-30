import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import IncomeTaxCalculator from '@/components/calculator/income-tax-calculator';

export default function IncomeTaxCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Income Tax Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">This Income Tax Calculator estimates the refund or potential amount owed on a U.S. federal tax return. It is designed for U.S. residents and is based on the official IRS tax brackets for 2024 and 2025.</p>
        </div>
        <IncomeTaxCalculator />
      </main>
      <Footer />
    </div>
  );
}
