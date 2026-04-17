'use client'

import React from 'react'

interface PageHeaderProps {
  badge?: string
  title: string
  description: string
  variant?: 'default' | 'landing'
  showBadge?: boolean
  titleColor?: 'gradient' | 'indigo'
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  title,
  description,
  variant = 'default',
  showBadge = true,
  titleColor = 'gradient',
}) => {
  const isLanding = variant === 'landing'

  const titleClassName = titleColor === 'indigo'
    ? 'text-indigo-500'
    : 'bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600'

  return (
    <div className={isLanding ? 'text-center max-w-3xl mx-auto mb-20' : 'text-center max-w-2xl mx-auto mb-16'}>
      {showBadge && badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-indigo-500 text-xs font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          {badge}
        </div>
      )}
      <h1 className={`font-bold tracking-tight mb-4 ${titleClassName} ${
        isLanding
          ? 'text-3xl md:text-5xl lg:text-6xl'
          : 'text-5xl sm:text-6xl md:text-6xl lg:text-6xl'
      }`}>
        {title}
      </h1>
      <p className={`text-slate-600 leading-relaxed ${
        isLanding
          ? 'text-base md:text-lg'
          : 'text-base md:text-lg'
      }`}>
        {description}
      </p>
    </div>
  )
}
