import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import PaceCalculator from '@/components/calculator/pace-calculator';

export default function PaceCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Pace Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Use this calculator to estimate pace for various physical activities such as running, walking, or cycling. It also allows users to calculate pace, time, or distance.</p>
        </div>
        <PaceCalculator />
      </main>
      <Footer />
    </div>
  );
}
