import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import InterestCalculator from '@/components/calculator/interest-calculator';

export default function InterestCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Compound Interest Calculator</h1>
            <p className="text-muted-foreground mt-2">Calculate the future value of your investment with the power of compound interest.</p>
        </div>
        <InterestCalculator />
      </main>
      <Footer />
    </div>
  );
}
