import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import InflationCalculator from '@/components/calculator/inflation-calculator';

export default function InflationCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Inflation Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">The Inflation Calculator with U.S. CPI Data calculates the equivalent value of the U.S. dollar in any month from 1913 to 2025, based on average Consumer Price Index (CPI) for urban consumers in the U.S.</p>
        </div>
        <InflationCalculator />
      </main>
      <Footer />
    </div>
  );
}
