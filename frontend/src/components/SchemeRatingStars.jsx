// frontend/src/components/SchemeRatingStars.jsx
import { useState } from 'react'

export default function SchemeRatingStars({
  rating = 5,
  totalReviews,
  interactive = false,
  onChange,
  size = 'md', // 'sm' | 'md' | 'lg'
  showCount = true,
  className = '',
}) {
  const [hoverRating, setHoverRating] = useState(0)

  const activeRating = interactive && hoverRating > 0 ? hoverRating : rating

  const sizeClasses = {
    sm: { icon: 'text-[14px]', text: 'text-[11px]' },
    md: { icon: 'text-[18px]', text: 'text-xs' },
    lg: { icon: 'text-[24px]', text: 'text-base font-extrabold' },
  }[size] || { icon: 'text-[18px]', text: 'text-xs' }

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <div className="flex items-center text-[#F59E0B]">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = activeRating >= starIndex
          const isHalf = !isFilled && activeRating >= starIndex - 0.5

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onMouseEnter={() => interactive && setHoverRating(starIndex)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => interactive && onChange && onChange(starIndex)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform p-0.5' : 'cursor-default pointer-events-none'}`}
            >
              <span
                className={`material-symbols-outlined ${sizeClasses.icon} ${isFilled || isHalf ? 'text-[#F59E0B]' : 'text-slate-300'}`}
                style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
              >
                {isFilled ? 'star' : isHalf ? 'star_half' : 'star'}
              </span>
            </button>
          )
        })}
      </div>

      {!interactive && (
        <span className={`font-bold text-[#0D2240] ${sizeClasses.text}`}>
          {Number(rating).toFixed(1)}
          {showCount && totalReviews !== undefined && (
            <span className="text-[#44474E] font-medium ml-1">
              ({totalReviews})
            </span>
          )}
        </span>
      )}
    </div>
  )
}
