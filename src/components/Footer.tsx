import React from 'react';

function Footer() {
  return (
    <footer className="bg-charcoal-900 text-cream-50">
      <div className="relative overflow-hidden">
        {/* Texture and gradient overlays */}
        <div className="absolute inset-0 bg-texture-light opacity-[0.02]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent"></div>
        
        <div className="relative section-container">
          {/* Top decorative border */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-subtle from-cream-200/20"></div>
          
          <div className="py-24">
            <div className="text-center space-y-16">
              {/* Main quote section */}
              <div className="space-y-8">
                <div className="inline-flex flex-col items-center">
                  {/* Decorative quote marks */}
                  <div className="text-sepia-300/20 font-display text-6xl leading-none mb-4">"</div>
                  
                  {/* Quote */}
                  <blockquote className="max-w-2xl">
                    <p className="font-display text-3xl md:text-4xl text-cream-200/90 italic tracking-wide leading-relaxed">
                      To live in hearts we leave behind is not to die.
                    </p>
                  </blockquote>
                  
                  {/* Attribution */}
                  <div className="mt-8 flex items-center space-x-4">
                    <div className="w-8 h-px bg-cream-200/20"></div>
                    <cite className="font-serif text-sm text-cream-300/60 tracking-widest not-italic">
                      THOMAS CAMPBELL
                    </cite>
                    <div className="w-8 h-px bg-cream-200/20"></div>
                  </div>
                </div>
              </div>

              {/* Mission statement */}
              <div className="max-w-2xl mx-auto">
                <p className="font-serif text-base text-cream-300/80 leading-relaxed">
                  This digital memorial is dedicated to preserving and honoring cherished memories,
                  ensuring that stories of love and legacy endure through time.
                </p>
              </div>

              {/* Footer content */}
              <div className="pt-16 border-t border-cream-100/10">
                <div className="flex flex-col items-center space-y-6">
                  {/* Logo or brand name */}
                  <div className="font-display text-lg tracking-[0.3em] text-cream-200/70">
                    DIGITAL MEMORIALS
                  </div>
                  
                  {/* Navigation links */}
                  <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-cream-300/60">
                    <a href="#privacy" className="hover:text-cream-200 transition-colors duration-200">Privacy Policy</a>
                    <a href="#terms" className="hover:text-cream-200 transition-colors duration-200">Terms of Use</a>
                    <a href="#contact" className="hover:text-cream-200 transition-colors duration-200">Contact</a>
                  </nav>
                  
                  {/* Copyright */}
                  <p className="text-sm text-cream-300/40">
                    © {new Date().getFullYear()} Digital Memorials. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 