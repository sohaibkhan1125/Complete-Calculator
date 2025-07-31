import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import TimeCalculator from '@/components/calculator/time-calculator';

export default function TimeCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Time Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">A versatile tool to perform time-based calculations, including adding/subtracting durations, calculating future dates, and parsing time expressions.</p>
        </div>
        <TimeCalculator />
      </main>
      <Footer />
    </div>
  );
}
