import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import PregnancyCalculator from '@/components/calculator/pregnancy-calculator';

export default function PregnancyCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Pregnancy Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">The Pregnancy Calculator allows users to estimate a personalized pregnancy timeline. It provides an estimated schedule based on various known starting points. The tool is useful for expecting parents to track progress and important milestones.</p>
        </div>
        <PregnancyCalculator />
      </main>
      <Footer />
    </div>
  );
}
