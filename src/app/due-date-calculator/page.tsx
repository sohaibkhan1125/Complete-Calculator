import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import DueDateCalculator from '@/components/calculator/due-date-calculator';

export default function DueDateCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Due Date Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Estimate your expected delivery date based on your last menstrual period, conception date, or ultrasound results.</p>
        </div>
        <DueDateCalculator />
      </main>
      <Footer />
    </div>
  );
}
