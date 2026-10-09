"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { SeatingShape, SeatingTable } from "@/lib/schemas/database";
import { cn } from "@/lib/utils";

type SeatPosition = {
  /** Centre of the seat, in % of the diagram's width and height. */
  left: number;
  top: number;
};

/** Seats never shrink below this; long tables scroll sideways instead. */
const MIN_SEAT_PX = 28;

type Layout = {
  /** Width / height. Long tables get wider rather than taller. */
  aspectRatio: number;
  tableStyle: CSSProperties;
  tableClass: string;
  /** Seat diameter in % of the diagram width. */
  seatSize: number;
  seats: SeatPosition[];
};

/**
 * Seats are numbered clockwise from the top-left (or the top, for a round
 * table), which is how couples usually number a printed seating chart.
 */
function layoutFor(shape: SeatingShape, count: number): Layout {
  if (shape === "round") {
    const radius = 40;
    return {
      aspectRatio: 1,
      tableStyle: { inset: "22%" },
      tableClass: "rounded-full",
      seatSize: Math.min(13, ((2 * Math.PI * radius) / count) * 0.75),
      seats: Array.from({ length: count }, (_, index) => {
        const angle = ((-90 + (360 * index) / count) * Math.PI) / 180;
        return {
          left: 50 + radius * Math.cos(angle),
          top: 50 + radius * Math.sin(angle),
        };
      }),
    };
  }

  if (shape === "head") {
    const pitch = 84 / count;
    return {
      aspectRatio: Math.max(2, count / 2.5),
      tableStyle: { left: "8%", right: "8%", top: "48%", bottom: "22%" },
      tableClass: "rounded-md",
      seatSize: Math.min(10, pitch * 0.8),
      seats: Array.from({ length: count }, (_, index) => ({
        left: 8 + pitch * (index + 0.5),
        top: 30,
      })),
    };
  }

  const top = Math.ceil(count / 2);
  const bottom = count - top;
  const pitch = 84 / top;
  return {
    aspectRatio: Math.max(2, top / 2.5),
    tableStyle: { left: "8%", right: "8%", top: "32%", bottom: "32%" },
    tableClass: "rounded-md",
    seatSize: Math.min(10, pitch * 0.8),
    seats: [
      ...Array.from({ length: top }, (_, index) => ({
        left: 8 + pitch * (index + 0.5),
        top: 16,
      })),
      // Bottom row runs right to left so numbering continues clockwise, and is
      // centred when it has one seat fewer than the top row.
      ...Array.from({ length: bottom }, (_, index) => ({
        left: 8 + pitch * ((top + bottom) / 2 - 0.5 - index),
        top: 84,
      })),
    ],
  };
}

export function SeatingTableDiagram({
  table,
  highlightedSeats = [],
  className,
}: {
  table: SeatingTable;
  /** Zero-based seat indexes to emphasise, e.g. the guests found by search. */
  highlightedSeats?: number[];
  className?: string;
}) {
  const layout = layoutFor(table.shape, table.seats.length);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const firstHighlighted = highlightedSeats[0];

  // On a long table the found seat may be off screen. Scroll only this strip
  // sideways; scrollIntoView would also move the page.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const seat =
      firstHighlighted === undefined
        ? null
        : scroller?.querySelector<HTMLElement>(
            `[data-seat="${firstHighlighted}"]`,
          );
    if (!scroller || !seat) return;

    scroller.scrollTo({
      left: seat.offsetLeft - scroller.clientWidth / 2,
      behavior: "smooth",
    });
  }, [table.id, firstHighlighted]);

  return (
    <div
      ref={scrollerRef}
      className={cn("w-full overflow-x-auto py-2", className)}
    >
      <div
        className="@container relative w-full"
        style={{
          aspectRatio: layout.aspectRatio,
          minWidth: (MIN_SEAT_PX * 100) / layout.seatSize,
        }}
        role="img"
        aria-label={table.name}
      >
        <div
          className={cn(
            "absolute flex items-center justify-center border-2 border-primary/30 bg-primary/5 px-2",
            layout.tableClass,
          )}
          style={layout.tableStyle}
        >
          <span
            className="truncate text-center font-semibold leading-tight"
            style={{ fontSize: `${Math.min(4.5, layout.seatSize * 0.5)}cqw` }}
          >
            {table.name}
          </span>
        </div>
        {layout.seats.map((position, index) => {
          const isHighlighted = highlightedSeats.includes(index);
          const isTaken = table.seats[index]?.trim() !== "";

          return (
            <div
              key={index}
              data-seat={index}
              title={table.seats[index] || undefined}
              className={cn(
                "absolute flex aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-medium transition-transform",
                isHighlighted
                  ? "z-10 scale-125 border-primary bg-primary text-primary-foreground ring-4 ring-primary/25"
                  : isTaken
                    ? "border-primary/40 bg-white text-foreground"
                    : "border-dashed border-muted-foreground/40 bg-muted text-muted-foreground",
              )}
              style={{
                left: `${position.left}%`,
                top: `${position.top}%`,
                width: `${layout.seatSize}%`,
                fontSize: `${layout.seatSize * 0.42}cqw`,
              }}
            >
              {index + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
