import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import RetirementCalculator from '@/components/calculator/retirement-calculator';

export default function RetirementCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Retirement Calculator</h1>
            <p className="text-muted-foreground mt-2">Plan your retirement with our comprehensive calculator.</p>
        </div>
        <RetirementCalculator />
      </main>
      <Footer />
    </div>
  );
}
