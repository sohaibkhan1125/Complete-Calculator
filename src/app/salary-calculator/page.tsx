import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import SalaryCalculator from '@/components/calculator/salary-calculator';

export default function SalaryCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Salary Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">The Salary Calculator converts salary amounts to their corresponding values based on payment frequency. Results include both unadjusted figures and adjusted figures that account for vacation days and holidays per year.</p>
        </div>
        <SalaryCalculator />
      </main>
      <Footer />
    </div>
  );
}
