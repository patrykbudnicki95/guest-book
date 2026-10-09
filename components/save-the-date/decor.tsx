"use client";

import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { initialsOf, splitNames } from "@/lib/save-the-date";
import { cn } from "@/lib/utils";
import { EASE } from "./parts";

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/** A faint paper grain over flat colour, so the page feels printed. */
export function Grain({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply", className)}
      style={{ backgroundImage: NOISE }}
    />
  );
}

/** Line, diamond, line: drawn from the centre outwards. */
export function Ornament({ className, delay = 0 }: { className?: string; delay?: number }) {
  const draw = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.2, ease: EASE, delay },
  };

  return (
    <svg viewBox="0 0 200 16" className={cn("h-4 w-40 text-(--std-accent)", className)} aria-hidden>
      <motion.path d="M88 8 H4" stroke="currentColor" strokeWidth="1" fill="none" {...draw} />
      <motion.path d="M112 8 H196" stroke="currentColor" strokeWidth="1" fill="none" {...draw} />
      <motion.path
        d="M100 1 L107 8 L100 15 L93 8 Z"
        fill="currentColor"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: delay + 0.4 }}
        style={{ transformOrigin: "100px 8px" }}
      />
    </svg>
  );
}

/** The names stacked with the joiner between them, each line rising in turn. */
export function StackedNames({
  names,
  className,
  joinerClassName,
  delay = 0,
}: {
  names: string;
  className?: string;
  joinerClassName?: string;
  delay?: number;
}) {
  const parts = splitNames(names);
  const lines = parts ? [parts.first, parts.joiner, parts.second] : [names];

  return (
    <h1 className={cn("flex flex-col items-center", className)}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden px-[0.15em] pb-[0.12em]">
          <motion.span
            className={cn("block", parts && index === 1 && joinerClassName)}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: delay + index * 0.18 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

export function ScrollCue({ className, delay = 2 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className={cn("absolute bottom-6 left-1/2 -translate-x-1/2", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6, y: [0, 8, 0] }}
      transition={{
        opacity: { delay, duration: 1 },
        y: { delay, duration: 2, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <ChevronDown className="size-5" />
    </motion.div>
  );
}

export function Monogram({ names, className }: { names: string; className?: string }) {
  const initials = initialsOf(names);

  return (
    <div
      className={cn(
        "flex size-16 items-center justify-center rounded-full border border-(--std-accent)/50 font-(family-name:--std-serif) text-lg tracking-widest text-(--std-accent)",
        className,
      )}
    >
      {initials.join("·")}
    </div>
  );
}

/**
 * A photo in a tall arch that wipes up into view, with a thin offset outline.
 * The wrapper is what's observed: the photo layer starts fully clipped, and a
 * fully clipped element never counts as "in view".
 */
export function ArchPhoto({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <motion.div
      className={cn("relative mx-auto aspect-[3/4] w-[min(76cqw,24rem)]", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      <motion.div
        aria-hidden
        className="absolute -inset-3 rounded-t-full border border-(--std-accent)/40"
        variants={{ hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1 } }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.5 }}
      />
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-t-full"
        variants={{
          hidden: { clipPath: "inset(100% 0% 0% 0%)" },
          visible: { clipPath: "inset(0% 0% 0% 0%)" },
        }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <motion.div
          className="absolute inset-0"
          variants={{ hidden: { scale: 1.25 }, visible: { scale: 1 } }}
          transition={{ duration: 2.4, ease: EASE }}
        >
          <MediaImage src={src} alt={alt} fill sizes="(max-width: 640px) 80vw, 384px" className="object-cover" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

type Point = { x: number; y: number };

function cubicPoint(p: Point[], t: number): Point {
  const u = 1 - t;
  return {
    x: u ** 3 * p[0].x + 3 * u ** 2 * t * p[1].x + 3 * u * t ** 2 * p[2].x + t ** 3 * p[3].x,
    y: u ** 3 * p[0].y + 3 * u ** 2 * t * p[1].y + 3 * u * t ** 2 * p[2].y + t ** 3 * p[3].y,
  };
}

function cubicAngle(p: Point[], t: number): number {
  const u = 1 - t;
  const dx = 3 * u ** 2 * (p[1].x - p[0].x) + 6 * u * t * (p[2].x - p[1].x) + 3 * t ** 2 * (p[3].x - p[2].x);
  const dy = 3 * u ** 2 * (p[1].y - p[0].y) + 6 * u * t * (p[2].y - p[1].y) + 3 * t ** 2 * (p[3].y - p[2].y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

const STEM: Point[] = [
  { x: 12, y: 196 },
  { x: 50, y: 150 },
  { x: 70, y: 70 },
  { x: 168, y: 18 },
];
const LEAF = "M0 0 C 7 -9, 20 -9, 28 0 C 20 9, 7 9, 0 0 Z";
const LEAF_STEPS = [0.12, 0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.82, 0.92];

/** A line-art branch: the stem draws itself, then the leaves unfurl along it. */
export function Branch({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 200 210" className={cn("text-(--std-accent)", className)} aria-hidden>
      <motion.path
        d={`M${STEM[0].x} ${STEM[0].y} C ${STEM[1].x} ${STEM[1].y}, ${STEM[2].x} ${STEM[2].y}, ${STEM[3].x} ${STEM[3].y}`}
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: EASE, delay }}
      />
      {LEAF_STEPS.map((t, index) => {
        const point = cubicPoint(STEM, t);
        const angle = cubicAngle(STEM, t) + (index % 2 === 0 ? -42 : 42);
        const size = 0.7 + t * 0.35;
        return (
          <g key={t} transform={`translate(${point.x} ${point.y}) rotate(${angle}) scale(${size})`}>
            <motion.path
              d={LEAF}
              fill="currentColor"
              fillOpacity={0.18}
              stroke="currentColor"
              strokeWidth="0.9"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: delay + 0.4 + t * 1.6 }}
              style={{ transformOrigin: "0px 0px" }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Two arcs of leaves closing into a ring around the initials. */
export function Wreath({ names, className }: { names: string; className?: string }) {
  const initials = initialsOf(names);
  const leaves = Array.from({ length: 22 }, (_, index) => {
    const side = index < 11 ? -1 : 1;
    const step = index % 11;
    // Each half runs from the bottom (90°) up its side to near the top.
    const degrees = 90 + side * (14 + step * 14.5);
    const radians = (degrees * Math.PI) / 180;
    return {
      x: 100 + 74 * Math.cos(radians),
      y: 100 + 74 * Math.sin(radians),
      rotate: degrees + side * 90 + (step % 2 === 0 ? -30 : 30),
      delay: 0.3 + step * 0.12,
    };
  });

  return (
    <svg viewBox="0 0 200 200" className={cn("text-(--std-accent)", className)} aria-hidden>
      {/* Starts just right of the top so the 14% gap sits centred above the initials. */}
      <g transform="rotate(-64.8 100 100)">
        <motion.circle
          cx="100"
          cy="100"
          r="74"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 0.86 }}
          transition={{ duration: 2.2, ease: EASE }}
        />
      </g>
      {leaves.map((leaf, index) => (
        <g key={index} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate}) scale(0.62)`}>
          <motion.path
            d={LEAF}
            fill="currentColor"
            fillOpacity={0.2}
            stroke="currentColor"
            strokeWidth="1"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: leaf.delay }}
            style={{ transformOrigin: "0px 0px" }}
          />
        </g>
      ))}
      <motion.text
        x="100"
        y="108"
        textAnchor="middle"
        className="fill-(--std-text) font-(family-name:--std-serif) text-[26px] tracking-[0.2em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.2 }}
      >
        {initials.join(" ")}
      </motion.text>
    </svg>
  );
}
