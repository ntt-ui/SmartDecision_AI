import React, { useState } from 'react';
import { ProjectCriteria, ProjectOption } from '../../types';

interface Props {
  criteria: ProjectCriteria[];
  options: ProjectOption[];
  scores: Record<string, Record<string, number>>;
  lang?: 'vi' | 'en';
}

export const RadarChart: React.FC<Props> = ({ criteria, options, scores, lang = 'vi' }) => {
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);

  if (criteria.length < 3 || options.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        {lang === 'vi'
          ? 'Cần tối thiểu 3 tiêu chí để vẽ biểu đồ Radar năng lực đa chiều.'
          : 'Minimum 3 criteria required to render multi-dimensional Radar chart.'}
      </div>
    );
  }

  const size = 380;
  const center = size / 2;
  const radius = center - 55;
  const totalAxes = criteria.length;
  const angleStep = (2 * Math.PI) / totalAxes;

  // Grid levels (1 to 5)
  const levels = [1, 2, 3, 4, 5];

  // Helper to compute (x, y) for an axis index and score value (1 - 5)
  const getCoordinates = (axisIndex: number, value: number) => {
    const normalizedVal = Math.min(5, Math.max(0, value)) / 5;
    const angle = axisIndex * angleStep - Math.PI / 2;
    const r = radius * normalizedVal;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* SVG Radar */}
      <div className="relative w-full max-w-[380px] aspect-square mx-auto">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible font-sans select-none"
        >
          {/* Concentric Grid Rings */}
          {levels.map((lvl) => {
            const points = criteria
              .map((_, i) => {
                const { x, y } = getCoordinates(i, lvl);
                return `${x},${y}`;
              })
              .join(' ');

            return (
              <g key={lvl}>
                <polygon
                  points={points}
                  fill={lvl % 2 === 0 ? 'rgba(241, 245, 249, 0.4)' : 'transparent'}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                {/* Level score label on top axis */}
                <text
                  x={center + 4}
                  y={center - (radius * (lvl / 5)) + 4}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {lvl}
                </text>
              </g>
            );
          })}

          {/* Radial Spokes / Axes */}
          {criteria.map((c, i) => {
            const { x, y } = getCoordinates(i, 5);
            // Label offset
            const angle = i * angleStep - Math.PI / 2;
            const labelR = radius + 22;
            const lx = center + labelR * Math.cos(angle);
            const ly = center + labelR * Math.sin(angle);

            // Anchor determination based on cosine
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (Math.cos(angle) > 0.3) textAnchor = 'start';
            else if (Math.cos(angle) < -0.3) textAnchor = 'end';

            return (
              <g key={c.id}>
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={textAnchor}
                  fill="#334155"
                  fontSize="10"
                  fontWeight="600"
                  className="transition-colors"
                >
                  {c.name.length > 20 ? `${c.name.slice(0, 18)}...` : c.name}
                </text>
                <text
                  x={lx}
                  y={ly + 11}
                  textAnchor={textAnchor}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  ({c.weight}%)
                </text>
              </g>
            );
          })}

          {/* Option Polygons */}
          {options.map((opt) => {
            const isHovered = activeOptionId === opt.id;
            const isDimmed = activeOptionId !== null && !isHovered;
            const color = opt.color || '#2563eb';

            const points = criteria
              .map((c, i) => {
                const rawScore = scores?.[opt.id]?.[c.id] || 0;
                // If Cost criterion, normalize inverted
                const effectiveScore = c.type === 'cost' ? Math.max(1, 6 - rawScore) : rawScore;
                const { x, y } = getCoordinates(i, effectiveScore);
                return `${x},${y}`;
              })
              .join(' ');

            return (
              <g
                key={opt.id}
                className="transition-opacity duration-200 cursor-pointer"
                style={{ opacity: isDimmed ? 0.15 : 1 }}
                onMouseEnter={() => setActiveOptionId(opt.id)}
                onMouseLeave={() => setActiveOptionId(null)}
              >
                <polygon
                  points={points}
                  fill={color}
                  fillOpacity={isHovered ? 0.38 : 0.2}
                  stroke={color}
                  strokeWidth={isHovered ? 2.8 : 2}
                  className="transition-all"
                />
                {/* Vertex dots */}
                {criteria.map((c, i) => {
                  const rawScore = scores?.[opt.id]?.[c.id] || 0;
                  const effectiveScore = c.type === 'cost' ? Math.max(1, 6 - rawScore) : rawScore;
                  const { x, y } = getCoordinates(i, effectiveScore);
                  return (
                    <circle
                      key={c.id}
                      cx={x}
                      cy={y}
                      r={isHovered ? 4.5 : 3}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Legend & Details */}
      <div className="w-full md:w-64 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
          {lang === 'vi' ? 'Hồ sơ năng lực phương án' : 'Alternatives Profile'}
        </span>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {lang === 'vi'
            ? 'Rê chuột qua từng phương án để làm nổi bật diện tích phủ năng lực. Tiêu chí chi phí đã được đảo chiều tự động để càng rộng càng tốt.'
            : 'Hover over an option to highlight its capability polygon. Cost criteria are inverted so wider is universally better.'}
        </p>

        <div className="space-y-2 pt-1">
          {options.map((opt) => {
            const isHovered = activeOptionId === opt.id;
            const color = opt.color || '#2563eb';

            return (
              <div
                key={opt.id}
                onMouseEnter={() => setActiveOptionId(opt.id)}
                onMouseLeave={() => setActiveOptionId(null)}
                className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                  isHovered
                    ? 'bg-slate-100 border-slate-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-semibold text-slate-800 truncate">{opt.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {lang === 'vi' ? 'Xem radar' : 'Inspect'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
