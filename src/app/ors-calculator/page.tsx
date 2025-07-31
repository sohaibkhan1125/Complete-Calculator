import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import OrsCalculator from '@/components/calculator/ors-calculator';

export default function OrsCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">ORS / Hours Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Calculate the duration between two times or two dates with precision.</p>
        </div>
        <OrsCalculator />
      </main>
      <Footer />
    </div>
  );
}
