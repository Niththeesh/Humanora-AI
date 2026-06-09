import React from 'react'

interface DisclaimerProps {
  isDark: boolean
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ isDark }) => {
  return (
    <div className={`mt-8 p-4 rounded-xl border-l-4 transition-all ${
      isDark
        ? 'bg-blue-900/30 border-blue-500/50 text-blue-300'
        : 'bg-blue-50/50 border-blue-500/50 text-blue-700'
    }`}>
      <p className="text-sm font-medium">
        ✨ Premium Writing Enhancement
      </p>
      <p className="text-xs mt-2 leading-relaxed">
        HumanWrite Pro transforms your content into natural, high-quality writing. 
        Our advanced algorithms improve clarity, tone, and flow while maintaining 
        your original meaning. Perfect for creating authentic, engaging content.
      </p>
    </div>
  )
}
