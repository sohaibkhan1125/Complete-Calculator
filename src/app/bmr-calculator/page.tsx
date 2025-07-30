import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import BmrCalculator from '@/components/calculator/bmr-calculator';

export default function BmrCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">BMR Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">The Basal Metabolic Rate (BMR) Calculator estimates your BMR — the number of calories your body burns while at rest in a neutral temperature environment and after fasting for about 12 hours. It also provides calorie needs based on different levels of physical activity.</p>
        </div>
        <BmrCalculator />
      </main>
      <Footer />
    </div>
  );
}
