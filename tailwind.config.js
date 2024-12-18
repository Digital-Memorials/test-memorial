/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Refined neutral palette
        cream: {
          50: '#FDFCFA',  // Lightest background
          100: '#FAF8F5', // Light background
          200: '#F5F2EC', // Subtle borders
          300: '#EBE5DB', // Muted accents
          400: '#E0D6C8', // Medium accents
          500: '#D4C5B4', // Strong accents
        },
        charcoal: {
          50: '#F8F7F7',
          100: '#E8E6E4',
          200: '#D3D0CC',
          300: '#B8B4AE',
          400: '#9C968E',
          500: '#827C73',
          600: '#666059', // Primary text
          700: '#4D4841',
          800: '#332F2B', // Headings
          900: '#1A1816', // Display text
        },
        sepia: {
          50: '#FCF9F5',
          100: '#F5EDE1',
          200: '#EBD9C4',
          300: '#DFC2A4',
          400: '#CDA77D',
          500: '#B68D5E', // Primary accent
          600: '#96714B',
          700: '#755738',
          800: '#533E28',
          900: '#2B1F14',
        },
        sage: {
          50: '#F6F8F6',
          100: '#E9EEE9',
          200: '#D4DED4',
          300: '#B9C7B9',
          400: '#9BAA9B',
          500: '#7E8F7E', // Secondary accent
          600: '#647264',
          700: '#4B554B',
          800: '#323932',
          900: '#1A1D1A',
        }
      },
      boxShadow: {
        'elegant': '0 4px 6px -1px rgba(169, 146, 125, 0.05), 0 2px 4px -1px rgba(169, 146, 125, 0.03)',
        'elegant-lg': '0 10px 15px -3px rgba(169, 146, 125, 0.08), 0 4px 6px -2px rgba(169, 146, 125, 0.05)',
        'image': '0 3px 12px -2px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'soft': '0 10px 50px -12px rgba(0, 0, 0, 0.05)',
        'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
      backgroundImage: {
        'texture-light': "url('data:image/png;base64,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')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(to right, transparent, var(--tw-gradient-stops), transparent)',
        'gradient-warm': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
        'noise-pattern': "url('data:image/png;base64,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')",
      },
      gridTemplateColumns: {
        'gallery': 'repeat(auto-fit, minmax(300px, 1fr))',
        'gallery-wide': 'repeat(auto-fit, minmax(400px, 1fr))',
      },
      transitionTimingFunction: {
        'elegant': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fade-in 1.2s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

