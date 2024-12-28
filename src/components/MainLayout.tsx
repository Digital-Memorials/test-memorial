import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Obituary from './Obituary';
import Gallery from './Gallery';
import Timeline from './Timeline';
import MemoryWall from './MemoryWall';
import Condolences from './Condolences';
import Footer from './Footer';
import JohnSmith from '../images/JohnSmith.jpg';

type Tab = {
  id: string;
  label: string;
  requiresAuth?: boolean;
};

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('obituary');
  const navigate = useNavigate();

  const tabs: Tab[] = [
    { id: 'obituary', label: 'Life Story' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'memory-wall', label: 'Memories' }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'obituary':
        return <Obituary />;
      case 'gallery':
        return <Gallery />;
      case 'timeline':
        return <Timeline />;
      case 'memory-wall':
        return <MemoryWall />;
      default:
        return <Obituary />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm from-cream-50 via-cream-100 to-sepia-50">
      {/* Subtle texture overlay */}
      <div className="fixed inset-0 bg-noise-pattern opacity-[0.015] pointer-events-none"></div>

      {/* Hero Header */}
      <header className="relative bg-gradient-radial from-charcoal-800 to-charcoal-900 text-cream-50 pt-24 pb-38 px-4 sm:px-0">
        {/* Texture and gradient overlays */}
        <div className="absolute inset-0 bg-texture-light opacity-[0.02]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent"></div>

        <div className="relative section-container">
          {/* User profile area */}
          {user && (
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
              <div className="flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-2 bg-charcoal-900/80 backdrop-blur-sm rounded-lg border border-cream-200/10 shadow-elegant">
                <span className="text-xs md:text-sm text-cream-50/80 font-serif truncate max-w-[100px] md:max-w-none">
                  {user.name}
                </span>
                <div className="h-3 md:h-4 w-px bg-cream-200/20"></div>
                <button
                  onClick={logout}
                  className="text-xs md:text-sm text-cream-50/60 hover:text-cream-50 transition-colors duration-300"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-16 md:space-y-0 md:space-x-24 pt-8 md:pt-0">
            {/* Portrait */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px] flex-shrink-0">
              <div className="relative w-full h-full">
                <div className="absolute -inset-6 rounded-full border border-cream-200/10"></div>
                <div className="absolute -inset-3 rounded-full border border-cream-200/20"></div>
                <div className="decorative-border rounded-full">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-sepia-100/10 to-transparent backdrop-blur-sm">
                    <img
                      src={JohnSmith}
                      alt="John David Smith"
                      className="w-full h-full object-cover transition-all duration-700 hover:scale-105 filter saturate-[0.95]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="text-center md:text-left space-y-10 flex-grow max-w-3xl">
              <div className="space-y-6">
                <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-cream-50">
                  John David Smith
                </h1>
                <p className="font-display text-xl sm:text-2xl md:text-3xl text-cream-200/90 tracking-wide">
                  1950 — 2024
                </p>
              </div>
              <div className="w-24 h-px bg-gradient-subtle from-cream-200/40 md:ml-1"></div>
              <div className="editorial-quote border-cream-200/30 text-cream-100/90">
                <p className="font-serif text-lg sm:text-xl md:text-2xl font-light leading-relaxed">
                  "A beautiful soul who touched countless lives with kindness, wisdom, and love.
                  Their legacy lives on in the hearts of all who knew them."
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-subtle from-cream-200/20"></div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-10 bg-cream-100/80 backdrop-blur-sm border-b border-sepia-200/10 overflow-x-auto">
        <div className="section-container py-0">
          <div className="flex justify-start md:justify-start min-w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 sm:px-8 py-4 sm:py-6 text-sm sm:text-base tracking-wide transition-all duration-300 whitespace-nowrap flex-1 md:flex-none text-center ${
                  activeTab === tab.id
                    ? 'text-sepia-800 border-b-2 border-sepia-500 bg-cream-50/50'
                    : 'text-charcoal-600 hover:text-sepia-700 hover:bg-cream-50/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="section-container relative px-4 sm:px-6">
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl bg-gradient-to-b from-sepia-50/30 to-transparent opacity-50 pointer-events-none"></div>
        <div className="relative space-y-48">
          <div className="animate-fade-in">
            {renderContent()}
          </div>
          <div className="animate-fade-in pt-24">
            <Condolences />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout; 