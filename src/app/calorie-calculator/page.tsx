import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import CalorieCalculator from '@/components/calculator/calorie-calculator';

export default function CalorieCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Calorie Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">The Calorie Calculator estimates the number of calories a person should consume daily to maintain, gain, or lose weight. It also includes guidelines based on activity level and allows for unit switching between US and Metric systems.</p>
        </div>
        <CalorieCalculator />
      </main>
      <Footer />
    </div>
  );
}
