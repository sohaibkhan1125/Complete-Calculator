import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import GradeCalculator from '@/components/calculator/grade-calculator';

export default function GradeCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Grade Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Calculate your course grade, determine what you need on your final, and more.</p>
        </div>
        <GradeCalculator />
      </main>
      <Footer />
    </div>
  );
}
