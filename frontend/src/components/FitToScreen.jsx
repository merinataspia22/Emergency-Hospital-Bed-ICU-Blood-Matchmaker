import React, { useState, useRef, useLayoutEffect } from "react";

/**
 * Wraps a page so the whole thing fits in ONE screen (no scroll) on desktop.
 * Below `breakpoint` px it does nothing and the page scrolls normally.
 */
export default function FitToScreen({
  children,
  minW = 1440,
  maxW = 2000,
  breakpoint = 1024,
}) {
  const ref = useRef(null);
  const [fit, setFit] = useState({ desktop: false, scale: 1, top: 0, w: minW });

  useLayoutEffect(() => {
    const el = ref.current;
    const calc = () => {
      if (window.innerWidth < breakpoint) {
        setFit({ desktop: false, scale: 1, top: 0, w: minW });
        return;
      }
      const nh = el.offsetHeight;
      const scale = Math.min(window.innerWidth / minW, window.innerHeight / nh);
      const w = Math.min(maxW, Math.max(minW, window.innerWidth / scale));
      const top = Math.max(0, (window.innerHeight - nh * scale) / 2);
      setFit((p) =>
        p.desktop && Math.abs(p.scale - scale) < 0.003 && Math.abs(p.w - w) < 4
          ? p
          : { desktop: true, scale, top, w }
      );
    };
    calc();
    window.addEventListener("resize", calc);
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => {
      window.removeEventListener("resize", calc);
      ro.disconnect();
    };
  }, [minW, maxW, breakpoint]);

  return (
    <div
      className={`bg-gradient-to-br from-[#dde5ee] to-[#cbd5e1] text-[#030503] ${
        fit.desktop ? "h-screen w-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      <div
        ref={ref}
        className="p-3 lg:p-5"
        style={
          fit.desktop
            ? {
                width: fit.w,
                marginLeft: `calc(50% - ${fit.w / 2}px)`,
                marginTop: fit.top,
                transform: `scale(${fit.scale})`,
                transformOrigin: "top center",
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}