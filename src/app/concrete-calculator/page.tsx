import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import ConcreteCalculator from '@/components/calculator/concrete-calculator';

export default function ConcreteCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Concrete Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Estimate the volume of concrete required for slabs, footings, columns, and stairs.</p>
        </div>
        <ConcreteCalculator />
      </main>
      <Footer />
    </div>
  );
}
