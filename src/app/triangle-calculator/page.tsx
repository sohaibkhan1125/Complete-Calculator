import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import TriangleCalculator from '@/components/calculator/triangle-calculator';

export default function TriangleCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Triangle Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Enter any 3 values for a triangle (at least one side) to calculate the remaining values.</p>
        </div>
        <TriangleCalculator />
      </main>
      <Footer />
    </div>
  );
}
