import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import IdealWeightCalculator from '@/components/calculator/ideal-weight-calculator';

export default function IdealWeightCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Ideal Weight Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">The Ideal Weight Calculator computes ideal body weight (IBW) ranges based on height, gender, and age. It uses multiple expert-recommended formulas and displays a side-by-side comparison of results.</p>
        </div>
        <IdealWeightCalculator />
      </main>
      <Footer />
    </div>
  );
}
