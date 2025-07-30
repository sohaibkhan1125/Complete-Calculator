import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import InterestRateCalculator from '@/components/calculator/interest-rate-calculator';

export default function InterestRateCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Interest Rate Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">This Interest Rate Calculator determines real interest rates on loans with fixed terms and monthly payments. For example, it can calculate interest rates in cases where auto dealers provide only monthly payment and total price details, without disclosing the actual interest rate on the loan. To calculate interest on investments, use the Interest Calculator, or use the Compound Interest Calculator to compare different interest rates.</p>
        </div>
        <InterestRateCalculator />
      </main>
      <Footer />
    </div>
  );
}
