import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import IpSubnetCalculator from '@/components/calculator/ip-subnet-calculator';

export default function IpSubnetCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">IP Subnet Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Calculate subnet details for both IPv4 and IPv6 addresses.</p>
        </div>
        <IpSubnetCalculator />
      </main>
      <Footer />
    </div>
  );
}
