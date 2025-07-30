import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import MortgageCalculator from '@/components/calculator/mortgage-calculator';

export default function MortgageCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Mortgage Calculator</h1>
            <p className="text-muted-foreground mt-2">Modify the values and click the calculate button to use</p>
        </div>
        <MortgageCalculator />
      </main>
      <Footer />
    </div>
  );
}
