import React from 'react'

interface HeaderProps {
  isDark: boolean
  onToggleDarkMode: () => void
}

export const Header: React.FC<HeaderProps> = ({ isDark, onToggleDarkMode }) => {
  return (
    <header className={`sticky top-0 z-50 transition-dark ${
      isDark 
        ? 'bg-gray-900/80 border-b border-gray-700/50' 
        : 'bg-white/80 border-b border-gray-200/50'
    }`}
    style={{
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`}>
            ✨ HumanWrite Pro
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Transform AI text into natural human writing
          </p>
        </div>

        <button
          onClick={onToggleDarkMode}
          className={`p-2 rounded-lg transition-all ${
            isDark
              ? 'bg-gray-800/80 text-yellow-400 hover:bg-gray-700/80'
              : 'bg-gray-200/80 text-gray-800 hover:bg-gray-300/80'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
