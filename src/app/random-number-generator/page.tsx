import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import RandomNumberGenerator from '@/components/calculator/random-number-generator';

export default function RandomNumberGeneratorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Random Number Generator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Generate random numbers, integers, or decimals with customizable settings, including support for very large numbers and high precision.</p>
        </div>
        <RandomNumberGenerator />
      </main>
      <Footer />
    </div>
  );
}
