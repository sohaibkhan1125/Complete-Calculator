import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import PaymentCalculator from '@/components/calculator/payment-calculator';

export default function PaymentCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Payment Calculator</h1>
            <p className="text-muted-foreground mt-2">Calculate your monthly loan payments or how long it will take to pay off a loan.</p>
        </div>
        <PaymentCalculator />
      </main>
      <Footer />
    </div>
  );
}
