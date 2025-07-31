import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import GpaCalculator from '@/components/calculator/gpa-calculator';

export default function GpaCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">GPA Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Calculate your Grade Point Average (GPA) based on your courses, credits, and grades. Add or remove courses as needed.</p>
        </div>
        <GpaCalculator />
      </main>
      <Footer />
    </div>
  );
}
