import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import BodyFatCalculator from '@/components/calculator/body-fat-calculator';

export default function BodyFatCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Body Fat Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">The Body Fat Calculator estimates your total body fat using specific body measurements. This tool supports both the U.S. Navy Method and BMI-based body fat calculations. Results include fat percentage, fat category, lean mass, ideal fat percentage, and more.</p>
        </div>
        <BodyFatCalculator />
      </main>
      <Footer />
    </div>
  );
}
