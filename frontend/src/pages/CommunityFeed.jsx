import { Filter, TrendingUp } from 'lucide-react'
import React, { useState } from 'react'

const CommunityFeed = () => {
  const [sort, setSort] = useState('recent')

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">

      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Community Feed</h1>
          <p className="text-sm text-on-surface-variant mt-1">Stay updated with reports and activity in your area.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSort("recent")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
              sort === "recent"
                ? "text-primary bg-primary/5 border-primary/20"
                : "text-on-surface-variant hover:bg-surface-container-high border-outline-variant/30"
            }`}
          >
            <Filter className="w-4 h-4" /> Recent
          </button>
          <button
            onClick={() => setSort("top")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
              sort === "top"
                ? "text-primary bg-primary/5 border-primary/20"
                : "text-on-surface-variant hover:bg-surface-container-high border-outline-variant/30"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Trending
          </button>
        </div>
      </div>
      </div>
  )
}

export default CommunityFeed
