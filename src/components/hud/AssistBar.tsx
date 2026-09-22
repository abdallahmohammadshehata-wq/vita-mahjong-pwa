import React from 'react';
import { Lightbulb, Shuffle, Undo2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface AssistBarProps {
  hintsLeft: number;
  shufflesLeft: number;
  undosLeft: number;
  canUndo: boolean;
  scale: number;
  onHint: () => void;
  onShuffle: () => void;
  onUndo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const AssistBar: React.FC<AssistBarProps> = ({
  hintsLeft,
  shufflesLeft,
  undosLeft,
  canUndo,
  scale,
  onHint,
  onShuffle,
  onUndo,
  onZoomIn,
  onZoomOut,
  onResetZoom
}) => {
  return (
    <footer className="w-full bg-white/95 backdrop-blur-md border-t border-[#E8E1D5] px-4 py-2.5 shadow-lg sticky bottom-0 z-30 select-none pb-safe">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`
            flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-2xl border transition-all active:scale-95
            ${canUndo 
              ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900 shadow-sm' 
              : 'bg-gray-50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'}
          `}
          title="Undo last move"
        >
          <Undo2 className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">Undo</span>
        </button>

        {/* Hint Button */}
        <button
          onClick={onHint}
          disabled={hintsLeft <= 0}
          className={`
            flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-2xl border transition-all active:scale-95 relative
            ${hintsLeft > 0 
              ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900 shadow-sm' 
              : 'bg-gray-50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'}
          `}
          title="Highlight a matching pair"
        >
          <Lightbulb className="w-5 h-5 mb-0.5 text-emerald-600" />
          <span className="text-[11px] font-bold">Hint</span>
          <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
            {hintsLeft}
          </span>
        </button>

        {/* Shuffle Button */}
        <button
          onClick={onShuffle}
          disabled={shufflesLeft <= 0}
          className={`
            flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-2xl border transition-all active:scale-95 relative
            ${shufflesLeft > 0 
              ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900 shadow-sm' 
              : 'bg-gray-50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'}
          `}
          title="Shuffle remaining tiles into solvable layout"
        >
          <Shuffle className="w-5 h-5 mb-0.5 text-blue-600" />
          <span className="text-[11px] font-bold">Shuffle</span>
          <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
            {shufflesLeft}
          </span>
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-vita-sage/40 p-1 rounded-2xl border border-vita-sage">
          <button
            onClick={onZoomOut}
            disabled={scale <= 0.6}
            className="p-1.5 rounded-xl bg-white hover:bg-vita-sage/60 text-vita-wood disabled:opacity-40 transition-colors shadow-xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            onClick={onResetZoom}
            className="px-2 py-1 text-[11px] font-mono font-bold text-vita-wood hover:text-emerald-700"
            title="Reset Zoom"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            onClick={onZoomIn}
            disabled={scale >= 1.5}
            className="p-1.5 rounded-xl bg-white hover:bg-vita-sage/60 text-vita-wood disabled:opacity-40 transition-colors shadow-xs"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
