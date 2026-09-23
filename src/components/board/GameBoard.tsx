import React, { useMemo, useRef, useState, useEffect } from 'react';
import { BoardTile } from '../../types/mahjong';
import { MahjongTile } from './MahjongTile';
import { Maximize2, ZoomIn, ZoomOut, Layers, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface GameBoardProps {
  board: BoardTile[];
  onTileClick: (tile: BoardTile) => void;
  scale?: number;
  is3DView?: boolean;
  isDarkMode?: boolean;
  dimBlocked?: boolean;
  onToggle3DView?: () => void;
  onToggleDimBlocked?: () => void;
  onResetZoom?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onTileClick,
  scale = 1,
  is3DView = true,
  isDarkMode = false,
  dimBlocked = true,
  onToggle3DView,
  onToggleDimBlocked,
  onResetZoom,
  onZoomIn,
  onZoomOut
}) => {
  // Physical Mahjong Tile base dimensions (px)
  const tileSize = { width: 56, height: 72 };

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Pan / drag state for mobile & zoomed view
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Measure real-time container dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateSize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => updateSize());
      ro.observe(containerRef.current);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Calculate layout bounding box & normalize coordinate origins
  const bounds = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let maxLayer = 0;

    board.forEach(tile => {
      if (tile.isMatched || tile.isStored) return;
      if (tile.x < minX) minX = tile.x;
      if (tile.x > maxX) maxX = tile.x;
      if (tile.y < minY) minY = tile.y;
      if (tile.y > maxY) maxY = tile.y;
      if (tile.layer > maxLayer) maxLayer = tile.layer;
    });

    if (minX === Infinity) {
      return { width: 400, height: 400, minX: 0, minY: 0, maxLayer: 0, paddingLeft: 32, paddingTop: 32 };
    }

    // Generous safe padding for 3D extrusion and elevated layers stepping up/left
    const paddingLeft = Math.max(30, maxLayer * 5 + 26);
    const paddingTop = Math.max(30, maxLayer * 6 + 26);
    const paddingRight = 30;
    const paddingBottom = 30;

    const width = (maxX - minX + 2) * (tileSize.width / 2) + paddingLeft + paddingRight;
    const height = (maxY - minY + 2) * (tileSize.height / 2) + paddingTop + paddingBottom;

    return { width, height, minX, minY, maxLayer, paddingLeft, paddingTop };
  }, [board]);

  // Calculate dynamic autoFit scale to guarantee 100% of tiles are visible on all screen sizes
  const autoFitScale = useMemo(() => {
    if (!containerSize.width || !containerSize.height || !bounds.width || !bounds.height) {
      return 1;
    }

    // Safety margins around edges
    const marginX = 24;
    const marginY = 24;
    const availW = Math.max(200, containerSize.width - marginX);
    const availH = Math.max(200, containerSize.height - marginY);

    // In 3D angled view, slight perspective tilt requires vertical breathing room
    const effectiveH = is3DView ? bounds.height * 1.05 : bounds.height;
    const fitX = availW / bounds.width;
    const fitY = availH / effectiveH;

    const base = Math.min(fitX, fitY);
    // Clamp between 0.35 (small phones with 144 tiles) and 1.3 (large tablets/desktops)
    return Math.min(Math.max(base, 0.35), 1.3);
  }, [containerSize, bounds, is3DView]);

  const finalScale = autoFitScale * scale;

  // Pointer drag events for panning
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag when clicking empty space
    if ((e.target as HTMLElement).closest('[title]')) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy
    });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleReset = () => {
    setPan({ x: 0, y: 0 });
    if (onResetZoom) onResetZoom();
  };

  const activeTiles = board.filter(t => !t.isMatched && !t.isStored);

  if (activeTiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <div className={`text-center p-8 rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-white/90 border-[#E8E1D5] text-vita-wood'}`}>
          <span className="text-6xl animate-bounce-short inline-block">🀄</span>
          <h3 className="text-3xl font-black mt-3">Board Cleared!</h3>
          <p className="text-sm opacity-70 mt-1">Magnificent Mahjong mastery.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden touch-none select-none perspective-board cursor-grab active:cursor-grabbing"
    >
      {/* On-Board Floating Quick Controls Pill */}
      <div className="absolute top-2.5 right-2.5 z-40 flex items-center gap-1.5 p-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg text-white">
        {/* Auto-Fit / Recenter */}
        <button
          onClick={handleReset}
          className="p-1.5 hover:bg-white/20 rounded-xl transition-all active:scale-90"
          title="Auto-Fit & Recenter Board"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* 3D / 2D Toggle */}
        {onToggle3DView && (
          <button
            onClick={onToggle3DView}
            className={`p-1.5 rounded-xl transition-all active:scale-90 ${is3DView ? 'bg-amber-500 text-white font-bold' : 'hover:bg-white/20'}`}
            title={is3DView ? 'Switch to Top 2D View' : 'Switch to 3D View'}
          >
            <Layers className="w-4 h-4" />
          </button>
        )}

        {/* Dim Blocked Toggle */}
        {onToggleDimBlocked && (
          <button
            onClick={onToggleDimBlocked}
            className={`p-1.5 rounded-xl transition-all active:scale-90 ${dimBlocked ? 'bg-emerald-600 text-white' : 'hover:bg-white/20 opacity-70'}`}
            title={dimBlocked ? 'Dim Blocked Tiles: Enabled (Tap to disable)' : 'Dim Blocked Tiles: Disabled (Tap to enable)'}
          >
            {dimBlocked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        )}

        {/* Zoom Out */}
        {onZoomOut && (
          <button
            onClick={onZoomOut}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-all active:scale-90"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        )}

        {/* Zoom In */}
        {onZoomIn && (
          <button
            onClick={onZoomIn}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-all active:scale-90"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3D Mahjong Board Surface */}
      <div 
        className={`relative transition-transform duration-300 ease-out origin-center pointer-events-auto ${is3DView ? 'board-surface-3d' : 'board-surface-2d'}`}
        style={{
          width: `${bounds.width}px`,
          height: `${bounds.height}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) ${is3DView ? 'rotateX(22deg) rotateZ(0deg)' : 'rotateX(0deg)'} scale(${finalScale})`,
        }}
      >
        {board.map((tile) => (
          <MahjongTile
            key={tile.id}
            tile={tile}
            onTileClick={onTileClick}
            tileSize={tileSize}
            isDarkMode={isDarkMode}
            minX={bounds.minX}
            minY={bounds.minY}
            paddingLeft={bounds.paddingLeft}
            paddingTop={bounds.paddingTop}
            dimBlocked={dimBlocked}
          />
        ))}
      </div>
    </div>
  );
};
