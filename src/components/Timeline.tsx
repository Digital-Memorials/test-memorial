import React from 'react';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

const Timeline: React.FC = () => {
  const events: TimelineEvent[] = [
    {
      year: '1950',
      title: 'Born in Tramore',
      description: 'Born on March 15th in Tramore, Co. Waterford, to Patrick and Siobhan Smith.',
    },
    {
      year: '1968',
      title: 'Academic Excellence',
      description: 'Graduated as top student from Mount Sion Secondary School, earning a scholarship to University College Dublin.',
    },
    {
      year: '1972',
      title: 'University Success',
      description: 'Earned First Class Honours degree in Engineering from UCD, setting the foundation for his future in education.',
    },
    {
      year: '1975',
      title: 'Marriage to Mary',
      description: 'Met and married Mary O\'Brien in a beautiful ceremony at the Holy Cross Church in Tramore.',
    },
    {
      year: '1978',
      title: 'Career Beginnings',
      description: 'Joined Waterford Regional Technical College (now SETU) as a lecturer in Engineering.',
    },
    {
      year: '1980',
      title: 'Growing Family',
      description: 'Welcomed son John Jr., followed by daughter Niamh in 1982, completing their family.',
    },
    {
      year: '1995',
      title: 'Academic Achievement',
      description: 'Appointed Head of Engineering Department at SETU, pioneering new teaching methodologies.',
    },
    {
      year: '2010',
      title: 'New Chapter',
      description: 'Welcomed first grandchild, beginning a cherished role as grandfather to eventually five grandchildren.',
    },
    {
      year: '2015',
      title: 'Legacy of Learning',
      description: 'Established the Smith Engineering Scholarship at SETU for promising local students.',
    },
    {
      year: '2024',
      title: 'Final Chapter',
      description: 'Passed peacefully at home in Tramore, leaving behind a legacy of education, family values, and community spirit.',
    },
  ];

  return (
    <section className="max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="mb-24 text-center">
        <h2 className="font-display text-5xl text-charcoal-800 mb-6">Life Journey</h2>
        <div className="flex items-center justify-center space-x-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-sepia-300/50 to-transparent"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-sepia-300/50"></div>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-sepia-300/50 to-transparent"></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[7.5rem] top-0 bottom-0 w-[1px] bg-gradient-to-b from-sepia-200 via-sepia-200/50 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sepia-300/30 to-transparent animate-pulse"></div>
        </div>

        {/* Events */}
        <div className="space-y-24">
          {events.map((event, index) => (
            <div 
              key={index}
              className="relative flex group items-start"
            >
              {/* Year Label - Moved before the point */}
              <div className="w-24 pt-1 pr-4 text-right">
                <span className="font-display text-lg text-sepia-700 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  {event.year}
                </span>
              </div>

              {/* Timeline Point */}
              <div className="relative flex items-center justify-center w-12">
                <div className="absolute w-8 h-8 rounded-full border border-sepia-200/30 group-hover:border-sepia-300/50 transition-all duration-500 group-hover:scale-110"></div>
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-sepia-400 to-sepia-500 shadow-sm transform transition-all duration-500 group-hover:scale-125 group-hover:shadow-md"></div>
              </div>

              {/* Content Card */}
              <div className="flex-1 pt-0 pl-8">
                <div className="relative transform transition-all duration-500 group-hover:-translate-y-1">
                  {/* Connector Line */}
                  <div className="absolute left-[-1.75rem] top-[0.6rem] w-6 h-[1px] bg-sepia-200/30 group-hover:bg-sepia-300/50 transition-colors duration-300"></div>
                  
                  <div className="bg-cream-50/20 backdrop-blur-sm rounded-xl p-6 border border-sepia-200/10 shadow-elegant group-hover:shadow-elegant-lg">
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden opacity-30">
                      <div className="absolute top-0 right-0 w-[1px] h-8 bg-gradient-to-b from-sepia-200/30 to-transparent transform rotate-45 translate-x-4"></div>
                    </div>
                    
                    <h3 className="font-display text-xl text-charcoal-800 mb-3 group-hover:text-sepia-800 transition-colors duration-300">
                      {event.title}
                    </h3>
                    <p className="text-charcoal-600 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline end decoration */}
        <div className="absolute left-[7.5rem] bottom-0 w-[1px] h-16 bg-gradient-to-b from-sepia-200/30 to-transparent"></div>
      </div>
    </section>
  );
}

export default Timeline; 