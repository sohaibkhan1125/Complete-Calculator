import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import DateCalculator from '@/components/calculator/date-calculator';

export default function DateCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Date Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Calculate the duration between two dates or add/subtract from a specific date.</p>
        </div>
        <DateCalculator />
      </main>
      <Footer />
    </div>
  );
}
