import { motion } from 'framer-motion';

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  color?: string;
  size?: number;
}

// A semicircular SVG gauge with an animated needle.
export const Gauge = ({ value, min, max, unit, label, color = '#3b82f6', size = 180 }: GaugeProps) => {
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const angle = -90 + pct * 180; // -90deg (left) to 90deg (right)

  const cx = size / 2;
  const cy = size * 0.7;
  const r = size * 0.38;

  // Arc path
  const start = { x: cx - r, y: cy };
  const end = { x: cx + r, y: cy };
  const arc = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;

  // Filled arc (using stroke-dasharray)
  const circumference = Math.PI * r;
  const filled = circumference * pct;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.85} viewBox={`0 0 ${size} ${size * 0.85}`}>
        <path d={arc} fill="none" stroke="#e2e8f0" strokeWidth={12} strokeLinecap="round" className="dark:stroke-slate-700" />
        <motion.path
          d={arc}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${filled} ${circumference}` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {/* Needle */}
        <motion.line
          x1={cx} y1={cy} x2={cx} y2={cy - r + 4}
          stroke={color} strokeWidth={3} strokeLinecap="round"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <circle cx={cx} cy={cy} r={5} fill={color} />
        <text x={cx} y={cy - r * 0.45} textAnchor="middle" className="fill-slate-800 dark:fill-white" style={{ fontSize: size * 0.16, fontWeight: 600 }}>
          {value.toFixed(value < 10 ? 2 : 1)}
        </text>
        <text x={cx} y={cy - r * 0.2} textAnchor="middle" className="fill-slate-400" style={{ fontSize: size * 0.07 }}>
          {unit}
        </text>
      </svg>
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide -mt-2">{label}</span>
    </div>
  );
};
