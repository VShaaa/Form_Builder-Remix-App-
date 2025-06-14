import { Moon, Sun } from 'lucide-react';

const ThemeToggle = ({ darkMode, setDarkMode }) => (
  <button
    onClick={() => setDarkMode(!darkMode)}
    className={`p-2 rounded-lg transition-all duration-300 ${
      darkMode 
      ? 'bg-gray-800 text-primary-light hover:bg-gray-700 border border-gray-500/30' 
      : 'bg-gray-200 text-primary-dark hover:bg-gray-300 border border-red-300'
    }`}
  >
    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
  </button>
);

export default ThemeToggle;