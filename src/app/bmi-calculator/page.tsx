import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import BmiCalculator from '@/components/calculator/bmi-calculator';

export default function BmiCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">BMI Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">The Body Mass Index (BMI) Calculator calculates your BMI based on age, gender, height, and weight. It helps assess whether your weight falls within a healthy range and provides visual representation for better understanding.</p>
        </div>
        <BmiCalculator />
      </main>
      <Footer />
    </div>
  );
}
