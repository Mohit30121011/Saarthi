const CATEGORIES = ['All', 'Education', 'Healthcare', 'Housing', 'Financial Aid', 'Agriculture', 'Employment']

export default function CategoryChips({ counts = {}, active, onChange }) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat
        const count = cat === 'All' ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[cat]
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              isActive
                ? 'bg-saarthi-green text-white border-saarthi-green'
                : 'bg-white text-saarthi-body border-saarthi-border hover:border-saarthi-green/50'
            }`}
          >
            {cat}
            {count > 0 && <span className={isActive ? 'text-white/80 ml-1' : 'text-saarthi-muted ml-1'}>({count})</span>}
          </button>
        )
      })}
    </div>
  )
}
