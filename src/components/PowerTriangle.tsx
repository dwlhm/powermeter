import { motion } from 'framer-motion';

interface PowerTriangleProps {
  active: number;   // P (kW) — horizontal
  reactive: number; // Q (kVAR) — vertical
  apparent: number; // S (kVA) — hypotenuse
  powerFactor: number; // cos φ
  label: string;
  color?: string;
}

// Renders a right-triangle power-vector diagram (P horizontal, Q vertical,
// S as the hypotenuse) with labeled magnitudes and the phase angle φ.
export const PowerTriangle = ({ active, reactive, apparent, powerFactor, label, color = '#3b82f6' }: PowerTriangleProps) => {
  const size = 220;
  const padding = 44;
  const maxSide = Math.max(active, reactive, 1);
  const scale = (size - padding * 2) / (maxSide * 1.15);

  const pLen = active * scale;
  const qLen = reactive * scale;
  const ox = padding;
  const oy = size - padding;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {/* P (horizontal) */}
        <motion.line x1={ox} y1={oy} x2={ox + pLen} y2={oy} stroke={color} strokeWidth={3} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
        {/* Q (vertical) */}
        <motion.line x1={ox + pLen} y1={oy} x2={ox + pLen} y2={oy - qLen} stroke="#f59e0b" strokeWidth={3} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.1 }} />
        {/* S (hypotenuse) */}
        <motion.line x1={ox} y1={oy} x2={ox + pLen} y2={oy - qLen} stroke="#10b981" strokeWidth={3} strokeDasharray="6 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
        {/* Angle arc */}
        {pLen > 10 && (
          <path d={`M ${ox + 18} ${oy} A 18 18 0 0 0 ${ox + 18 * Math.cos(Math.atan2(qLen, pLen))} ${oy - 18 * Math.sin(Math.atan2(qLen, pLen))}`} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
        )}
        {/* Labels */}
        <text x={ox + pLen / 2} y={oy + 16} textAnchor="middle" className="fill-slate-600 dark:fill-slate-300" style={{ fontSize: 11, fontWeight: 600 }}>P {active.toFixed(1)} kW</text>
        <text x={ox + pLen + 8} y={oy - qLen / 2} className="fill-slate-600 dark:fill-slate-300" style={{ fontSize: 11, fontWeight: 600 }}>Q {reactive.toFixed(1)} kVAR</text>
        <text x={ox + pLen / 2 - 14} y={oy - qLen / 2 - 6} textAnchor="middle" className="fill-slate-600 dark:fill-slate-300" style={{ fontSize: 11, fontWeight: 600 }}>S {apparent.toFixed(1)} kVA</text>
        <text x={ox + 30} y={oy - 6} className="fill-slate-400" style={{ fontSize: 10 }}>φ</text>
      </svg>
      <div className="text-center -mt-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">cos φ = {powerFactor.toFixed(3)}</p>
      </div>
    </div>
  );
};
