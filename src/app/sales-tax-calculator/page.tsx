import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import SalesTaxCalculator from '@/components/calculator/sales-tax-calculator';

export default function SalesTaxCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Sales Tax Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">This Sales Tax Calculator can compute any one of the following, given inputs for the remaining two: before-tax price, sales tax rate, or after-tax price. This tool is helpful for quick sales tax calculations on goods or services.</p>
        </div>
        <SalesTaxCalculator />
      </main>
      <Footer />
    </div>
  );
}
