import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import UnitConverter from '@/components/calculator/unit-converter';

export default function UnitConverterPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Unit Converter</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">A versatile tool for converting between various units of measurement.</p>
        </div>
        <UnitConverter />
      </main>
      <Footer />
    </div>
  );
}
