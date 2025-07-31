import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import AgeCalculator from '@/components/calculator/age-calculator';

export default function AgeCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Age Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Calculate your age in years, months, weeks, days, hours, minutes, and seconds.</p>
        </div>
        <AgeCalculator />
      </main>
      <Footer />
    </div>
  );
}
