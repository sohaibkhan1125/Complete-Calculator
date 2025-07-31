import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import PercentageCalculator from '@/components/calculator/percentage-calculator';

export default function PercentageCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Percentage Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">A versatile tool to calculate percentages in various common scenarios, including percentage of a number, percentage change, and percentage difference.</p>
        </div>
        <PercentageCalculator />
      </main>
      <Footer />
    </div>
  );
}
