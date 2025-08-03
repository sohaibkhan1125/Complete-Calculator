import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
            <h1 className="text-2xl font-bold font-headline">Complete Calculator</h1>
        </Link>
        <nav className="hidden md:flex space-x-6">
            <Link href="/calculators/financial" className="hover:text-primary transition-colors">Financial</Link>
            <Link href="/calculators/fitness-health" className="hover:text-primary transition-colors">Fitness & Health</Link>
            <Link href="/calculators/math" className="hover:text-primary transition-colors">Math</Link>
            <Link href="/calculators/other" className="hover:text-primary transition-colors">Other</Link>
        </nav>
        <div className="md:hidden">
            {/* Mobile menu can be added here */}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
