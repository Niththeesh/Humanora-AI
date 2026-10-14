import React from 'react'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
  className?: string
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  showTagline = true,
  className = '' 
}) => {
  const pixelSizes = {
    sm: 28,
    md: 40,
    lg: 52
  }

  const dim = pixelSizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Pictorial Identity: Feather with Integrated Human Profile */}
      <div className="relative flex-shrink-0 group">
        <svg 
          width={dim} 
          height={dim} 
          viewBox="0 0 120 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd066" />
              <stop offset="50%" stopColor="#e5a93c" />
              <stop offset="100%" stopColor="#b87b1c" />
            </linearGradient>
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1e26" />
              <stop offset="100%" stopColor="#0d0d12" />
            </linearGradient>
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Badge Background */}
          <rect width="120" height="120" rx="28" fill="url(#logoBgGrad)" stroke="rgba(229, 169, 60, 0.3)" strokeWidth="1.5" />
          
          <g transform="translate(10, 8)">
            {/* Feather Outer Plume */}
            <path 
              d="M 50 12 C 68 18, 80 32, 78 52 C 76 66, 68 76, 54 84 C 48 88, 42 94, 38 100 C 40 93, 44 87, 49 82 C 58 74, 66 65, 67 52 C 68 36, 58 24, 50 12 Z" 
              fill="url(#logoGoldGrad)" 
              opacity="0.95" 
            />

            {/* Subtle Vane Accents */}
            <path d="M 54 28 C 64 32, 72 38, 75 48" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
            <path d="M 52 42 C 60 48, 68 56, 69 66" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
            <path d="M 48 58 C 55 64, 60 72, 60 80" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />

            {/* Human Silhouette Profile Spine */}
            <path 
              d="M 50 12 C 44 20, 39 26, 38 34 C 37 38, 38 41, 40 43 C 38 44, 36 46, 38 49 C 39 50, 42 51, 41 53 C 39 54, 37 55, 38 57 C 39 60, 43 61, 43 64 C 43 68, 39 74, 36 80 C 34 85, 33 93, 34 100 L 38 100 C 39 91, 42 84, 46 78 C 50 71, 52 64, 50 56 C 48 48, 51 36, 52 28 Z"
              fill="#ffffff"
              filter="url(#logoGlow)" 
            />

            {/* Quill Tip Nib */}
            <polygon points="34,100 38,100 36,105" fill="url(#logoGoldGrad)" />
            {/* Spark Crown */}
            <circle cx="50" cy="12" r="2.5" fill="#ffd066" />
          </g>
        </svg>
        <div className="absolute inset-0 rounded-2xl bg-gold-500/10 blur-sm pointer-events-none -z-10 group-hover:bg-gold-500/20 transition-all" />
      </div>

      {/* Brand Typography */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-display font-bold tracking-tight text-white text-xl sm:text-2xl">
            Human<span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">ora</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gold-500/15 text-gold-400 border border-gold-500/30">
            AI
          </span>
        </div>
        {showTagline && (
          <p className="text-[11px] font-medium text-slate-400 tracking-wide">
            Write Naturally. Express Authentically.
          </p>
        )}
      </div>
    </div>
  )
}
