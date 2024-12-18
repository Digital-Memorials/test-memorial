import React from 'react';

function Obituary() {
  return (
    <section className="max-w-prose mx-auto">
      {/* Section Header */}
      <div className="mb-16 text-center">
        <h2 className="font-display text-5xl text-charcoal-800 mb-6">Obituary</h2>
        <div className="flex items-center justify-center space-x-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-sepia-300/50 to-transparent"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-sepia-300/50"></div>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-sepia-300/50 to-transparent"></div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8 text-charcoal-700">
        <p className="font-serif text-xl leading-relaxed">
          John David Smith lived a life marked by his deep love for education, family, and his Irish heritage. 
          Born in Tramore, Co. Waterford, on March 15, 1950, he brought warmth and wisdom to all who knew him 
          during his 74 remarkable years.
        </p>

        <p className="leading-relaxed">
          As a distinguished lecturer at South East Technological University (SETU), John inspired countless 
          students with his passionate teaching and mentorship in the field of Engineering. His dedication to 
          education and his unique ability to make complex subjects accessible endeared him to both students 
          and colleagues alike.
        </p>

        <div className="py-6">
          <blockquote className="font-serif text-xl italic text-sepia-700 border-l-2 border-sepia-200 pl-6">
            "Education is not just about teaching; it's about inspiring the next generation to believe in themselves."
            <footer className="text-base text-charcoal-600 mt-2">
              — One of John's favorite sayings to his students
            </footer>
          </blockquote>
        </div>

        <p className="leading-relaxed">
          Beyond the lecture hall, John was a devoted husband to Mary for 45 years, a loving father to John Jr. 
          and Niamh, and a doting grandfather to his five grandchildren. His family was the center of his universe, 
          and he took immense pride in their accomplishments and shared moments together.
        </p>

        <p className="leading-relaxed">
          A proud Tramore native, John never lost touch with his roots. He was known for his storytelling at local 
          gatherings, sharing tales of growing up by the sea and his adventures along the Waterford coast. His annual 
          summer barbecues in his Tramore home became a cherished tradition, bringing together family, friends, and 
          colleagues for afternoons filled with laughter, music, and his famous homemade brown bread.
        </p>

        <div className="border-t border-sepia-100 pt-8 mt-12">
          <p className="font-serif text-lg text-charcoal-600 italic">
            John passed peacefully at home in Tramore, surrounded by his loving family. He is survived by his wife Mary, 
            children John Jr. and Niamh, their spouses, and five grandchildren who will carry forward his legacy of love, 
            learning, and Irish wit.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Obituary; 