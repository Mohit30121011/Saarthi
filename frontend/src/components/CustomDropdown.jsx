// frontend/src/components/CustomDropdown.jsx
// Menu rendered via React Portal at document.body — immune to z-index / stacking context issues
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  icon,
  variant = 'compact', // 'compact' (explorer toolbar) | 'form' (profile / inputs)
  disabled = false,
  clearable = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  id,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [menuStyle, setMenuStyle] = useState({})
  const [openUpwards, setOpenUpwards] = useState(false)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  // Normalize options into { value, label, icon }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value, label: opt.label || opt.value, icon: opt.icon }
    }
    return { value: opt, label: opt }
  })

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value))
  const displayLabel = selectedOption ? selectedOption.label : placeholder

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  const isCompact = variant === 'compact'

  // Calculate and set portal menu position from the button's bounding rect
  const calculateMenuPosition = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const goUp = spaceBelow < 260 && spaceAbove > spaceBelow

    setOpenUpwards(goUp)

    if (goUp) {
      setMenuStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        bottom: window.innerHeight - rect.top + 6,
        top: 'auto',
        zIndex: 9999,
      })
    } else {
      setMenuStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        top: rect.bottom + 6,
        bottom: 'auto',
        zIndex: 9999,
      })
    }
  }, [])

  const openMenu = () => {
    if (disabled) return
    calculateMenuPosition()
    setOpen(true)
    setSearch('')
  }

  // Outside click: close if clicking outside both button and menu
  useEffect(() => {
    if (!open) return
    function handleMouseDown(e) {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // Recalculate on scroll/resize while open
  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', calculateMenuPosition)
    window.addEventListener('scroll', calculateMenuPosition, true)
    return () => {
      window.removeEventListener('resize', calculateMenuPosition)
      window.removeEventListener('scroll', calculateMenuPosition, true)
    }
  }, [open, calculateMenuPosition])

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`w-full flex items-center justify-between transition-all text-left select-none cursor-pointer ${
          isCompact
            ? `h-10 px-3 rounded-lg border text-xs font-bold ${
                open
                  ? 'bg-white border-[#0D2240] ring-2 ring-[#0D2240]/15 text-[#0D2240] shadow-sm'
                  : 'bg-white border-[#E2E8F0] hover:border-[#0D2240]/50 text-[#111C2D] shadow-2xs'
              }`
            : `h-11 px-3.5 rounded-xl border text-xs sm:text-sm font-medium ${
                open
                  ? 'bg-white border-[#0D2240] ring-2 ring-[#0D2240]/15 text-[#111C2D]'
                  : 'bg-[#F0F3FF] border-[#DEE8FF] hover:border-[#0D2240]/40 text-[#111C2D]'
              }`
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-1 flex-1">
          {icon && (
            <span
              className={`material-symbols-outlined shrink-0 ${
                isCompact ? 'text-[18px] text-[#44474E]' : 'text-[18px] text-slate-400'
              } ${open ? 'text-[#0D2240]' : ''}`}
            >
              {icon}
            </span>
          )}
          <span
            className={`truncate ${
              value
                ? isCompact ? 'text-[#111C2D] font-bold' : 'text-[#111C2D] font-medium'
                : 'text-[#44474E]'
            }`}
          >
            {displayLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear selection"
              onClick={(e) => { e.stopPropagation(); onChange('') }}
              className="p-0.5 rounded-full hover:bg-slate-200/60 text-[#44474E] hover:text-[#0D2240] transition-colors cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </span>
          )}
          <span
            className={`material-symbols-outlined text-[18px] text-[#44474E] shrink-0 transition-transform duration-200 ${
              open ? (openUpwards ? 'text-[#0D2240]' : 'rotate-180 text-[#0D2240]') : ''
            }`}
          >
            {open && openUpwards ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </button>

      {/* Portal Menu — rendered at document.body to escape all stacking contexts */}
      {open && !disabled && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={menuStyle}
          className={`bg-white rounded-xl border border-[#CBD5E1] p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
            openUpwards
              ? 'shadow-[0_-10px_25px_-5px_rgba(13,34,64,0.18)]'
              : 'shadow-[0_12px_28px_-6px_rgba(13,34,64,0.18)]'
          } ${menuClassName}`}
        >
          {/* Search bar for long lists */}
          {normalizedOptions.length > 6 && (
            <div className="px-1 pb-1.5 border-b border-[#E2E8F0] mb-1">
              <div className="relative flex items-center bg-[#F8FAFC] rounded-lg px-2.5 h-8 border border-[#E2E8F0]">
                <span className="material-symbols-outlined text-slate-400 text-[16px] mr-1.5 shrink-0">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search options..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-none outline-none text-xs text-[#0D2240] placeholder:text-slate-400 p-0 focus:ring-0 font-medium"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-slate-400 hover:text-[#0D2240] p-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 text-xs">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-[#44474E] text-center font-medium text-xs">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(value) === String(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => { onChange(opt.value); setOpen(false) }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#EBF3FC] text-[#0D2240] font-bold shadow-2xs'
                        : 'text-[#111C2D] hover:bg-[#F0F3FF] hover:text-[#0D2240] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {opt.icon && (
                        <span className="material-symbols-outlined text-[16px] shrink-0 text-[#44474E]">
                          {opt.icon}
                        </span>
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[#0D2240] text-[16px] shrink-0 font-bold">
                        check
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
