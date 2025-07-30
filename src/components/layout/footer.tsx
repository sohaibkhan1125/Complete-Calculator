import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 p-6 mt-16">
      <div className="container mx-auto text-center">
        <div className="flex justify-center items-center space-x-6 mb-4">
          <Link href="#" className="text-sm hover:text-white transition-colors">About</Link>
          <Link href="#" className="text-sm hover:text-white transition-colors">Contact</Link>
          <Link href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</Link>
        </div>
        <p className="text-xs text-slate-400">© 2025 Complete Calculator. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
