import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import PregnancyConceptionCalculator from '@/components/calculator/pregnancy-conception-calculator';

export default function PregnancyConceptionCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Pregnancy Conception Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">The Pregnancy Conception Calculator estimates the likely date of conception based on your expected due date, last menstrual period, or an ultrasound date. It also calculates the possible range of days during which conception might have occurred.</p>
        </div>
        <PregnancyConceptionCalculator />
      </main>
      <Footer />
    </div>
  );
}
