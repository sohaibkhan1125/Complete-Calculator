import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import PasswordGenerator from '@/components/calculator/password-generator';

export default function PasswordGeneratorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Password Generator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">Create secure, random passwords with customizable settings for length and character types.</p>
        </div>
        <PasswordGenerator />
      </main>
      <Footer />
    </div>
  );
}
