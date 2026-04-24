/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}', './popup/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        status: {
          urgent: '#DC2626',
          upcoming: '#3B82F6',
          overdue: '#991B1B',
          completed: '#059669',
          needsReview: '#D97706'
        }
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};

