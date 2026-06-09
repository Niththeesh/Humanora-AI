import React, { useState } from 'react'

interface TextInputAreaProps {
  value: string
  onChange: (value: string) => void
  isDark: boolean
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({ value, onChange, isDark }) => {
  const [wordCount, setWordCount] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    onChange(text)
    setWordCount(text.trim().split(/\s+/).filter(w => w.length > 0).length)
  }

  return (
    <div className={`flex flex-col gap-3 p-6 rounded-2xl transition-dark ${
      isDark 
        ? 'bg-gray-800/60 border border-gray-700/50' 
        : 'bg-white/60 border border-gray-100/50'
    }`}
    style={{
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      <div className="flex justify-between items-center">
        <label className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Your Content
        </label>
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {wordCount} words
        </span>
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Paste your AI-generated or robotic text here... Support up to 10,000+ words"
        maxLength={50000}
        className={`w-full h-64 p-4 rounded-xl border-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm ${
          isDark
            ? 'bg-gray-900/50 border-gray-700/50 text-gray-100 placeholder-gray-500'
            : 'bg-white/50 border-gray-200/50 text-gray-900 placeholder-gray-400'
        }`}
      />
      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {value.length.toLocaleString()} / 50,000 characters
      </div>
    </div>
  )
}
