import React from 'react'

interface PointsToastProps {
  emoji: string
  title: string
  message: string
}

export const PointsToast: React.FC<PointsToastProps> = ({ emoji, title, message }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="font-bold text-base">
        {emoji} {title}
      </div>
      <div className="text-sm opacity-90">
        {message}
      </div>
    </div>
  )
}
