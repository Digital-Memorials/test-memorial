import React from 'react';
import image1 from '../images/image1.jpg';
import image2 from '../images/image2.jpg';
import image3 from '../images/image3.jpg';
import image4 from '../images/image4.jpg';
import image5 from '../images/image5.jpg';
import image6 from '../images/image6.jpg';

interface GalleryImage {
  url: string;
  caption: string;
  year: string;
}

const Gallery: React.FC = () => {
  const images: GalleryImage[] = [
    {
      url: image1,
      caption: 'Family vacation in Italy, Summer 1985',
      year: '1985'
    },
    {
      url: image2,
      caption: 'Teaching John & Niamh to fish',
      year: '1975'
    },
    {
      url: image3,
      caption: 'Car Trouble on the Beach',
      year: '1980'
    },
    {
      url: image4,
      caption: 'Christmas party with family',
      year: '1987'
    },
    {
      url: image5,
      caption: 'Sking with Mary',
      year: '2011'
    },
    {
      url: image6,
      caption: 'John in the garden at home',
      year: '1956'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-16 text-center">
        <h2 className="font-display text-5xl text-charcoal-800 mb-6">Photo Gallery</h2>
        <div className="flex items-center justify-center space-x-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-sepia-300/50 to-transparent"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-sepia-300/50"></div>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-sepia-300/50 to-transparent"></div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="group relative overflow-hidden transition-all duration-300"
          >
            {/* Image Container */}
            <div className="aspect-w-4 aspect-h-3 relative overflow-hidden rounded-lg">
              <img
                src={image.url}
                alt={image.caption}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Caption */}
            <div className="mt-4 space-y-1">
              <p className="font-serif text-lg text-charcoal-800">{image.caption}</p>
              <p className="text-sm text-sepia-600">{image.year}</p>
            </div>

            {/* Decorative Border */}
            <div className="absolute -inset-px rounded-lg border border-sepia-200/20 pointer-events-none"></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Gallery; 