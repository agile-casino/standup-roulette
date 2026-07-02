import { useEffect, useRef, useState } from "react";

export interface WheelDataType {
  option: string;
  style?: {
    backgroundColor?: string;
    textColor?: string;
  };
}

interface WheelProps {
  mustStartSpinning: boolean;
  prizeNumber: number;
  data: WheelDataType[];
  onStopSpinning?: () => void;
  spinDuration?: number; // Duration multiplier (e.g. 0.15)
}

function getRotationAngle(el: HTMLElement): number {
  const st = window.getComputedStyle(el, null);
  const tr = st.getPropertyValue("transform") || st.transform;
  if (!tr || tr === "none") return 0;

  if (tr.startsWith("matrix3d")) {
    const values = tr.split("(")[1].split(")")[0].split(",");
    const a = parseFloat(values[0]);
    const b = parseFloat(values[1]);
    let angle = Math.atan2(b, a) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  } else if (tr.startsWith("matrix")) {
    const values = tr.split("(")[1].split(")")[0].split(",");
    const a = parseFloat(values[0]);
    const b = parseFloat(values[1]);
    let angle = Math.atan2(b, a) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  }
  return 0;
}

export function Wheel({ mustStartSpinning, prizeNumber, data, onStopSpinning, spinDuration = 1.0 }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<HTMLDivElement | null>(null);

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const prevSpinning = useRef(mustStartSpinning);

  const lastSliceIndexRef = useRef<number>(-1);
  const snapTriggerRef = useRef<{ time: number; direction: number }>({ time: 0, direction: 1 });

  // Redraw the canvas when data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const N = data.length;
    if (N === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 445; // Matches css max-width of original component

    // Scale for high DPI
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;

    // Outer boundary of the entire wheel
    const outerRadius = size / 2 - 10;

    // Bezel dimensions
    const bezelInnerRadius = outerRadius - 3;
    const bezelOuterRadius = outerRadius + 8;
    const bezelCenterRadius = (bezelInnerRadius + bezelOuterRadius) / 2;
    const bezelWidth = bezelOuterRadius - bezelInnerRadius;

    // Wedges occupy everything inside the bezel
    const wedgeOuterRadius = bezelInnerRadius;
    const innerRadius = 0; // standard full pie wedges
    const sliceAngle = (2 * Math.PI) / N;

    ctx.clearRect(0, 0, size, size);

    // 1. Draw wedges and slice content
    for (let i = 0; i < N; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(cx, cy, wedgeOuterRadius, startAngle, endAngle);
      ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      // Base color
      const baseColor = data[i].style?.backgroundColor || "#ccc";
      ctx.fillStyle = baseColor;
      ctx.fill();

      // Overlay 3D shading (lighter towards center, darker towards bezel)
      const overlayGrad = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, wedgeOuterRadius);
      overlayGrad.addColorStop(0, "rgba(255, 255, 255, 0.18)");
      overlayGrad.addColorStop(0.5, "rgba(255, 255, 255, 0)");
      overlayGrad.addColorStop(0.8, "rgba(0, 0, 0, 0.02)");
      overlayGrad.addColorStop(1, "rgba(0, 0, 0, 0.12)");

      ctx.fillStyle = overlayGrad;
      ctx.fill();

      // Slice boundary stroke (subtle semi-transparent white)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      const textAngle = startAngle + sliceAngle / 2;
      ctx.translate(cx, cy);
      ctx.rotate(textAngle);

      // Auto-scale font size based on text length and slice count
      const optionText = data[i].option;
      let fontSize = 18;
      if (optionText.length > 8) {
        fontSize = Math.max(10, 18 - (optionText.length - 8) * 0.8);
      }
      if (N > 10) {
        fontSize = Math.max(8, fontSize * (10 / N));
      }

      const textColor = data[i].style?.textColor;
      ctx.fillStyle = textColor || "#2c3e50";
      ctx.font = `bold ${fontSize}px Inter, Roboto, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Subtle shadow/glow for text contrast
      const isDarkText =
        !textColor ||
        !["#fff", "#ffffff", "white"].includes(textColor.toLowerCase());
      if (isDarkText) {
        ctx.shadowColor = "rgba(255, 255, 255, 0.65)";
        ctx.shadowBlur = 3;
      } else {
        ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
        ctx.shadowBlur = 3;
      }

      const textRadius = innerRadius + (wedgeOuterRadius - innerRadius) * 0.55;
      ctx.fillText(optionText, textRadius, 0);
      ctx.restore();
    }

    // 2. Draw outer bezel (ring)
    const bezelGradient = ctx.createLinearGradient(
      cx - bezelOuterRadius,
      cy - bezelOuterRadius,
      cx + bezelOuterRadius,
      cy + bezelOuterRadius
    );
    bezelGradient.addColorStop(0, "#2c3e50"); // Premium slate dark
    bezelGradient.addColorStop(0.5, "#1a252f");
    bezelGradient.addColorStop(1, "#111827"); // Rich black

    ctx.beginPath();
    ctx.arc(cx, cy, bezelCenterRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = bezelGradient;
    ctx.lineWidth = bezelWidth;
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    // Bezel inner/outer edge metallic highlights
    ctx.beginPath();
    ctx.arc(cx, cy, bezelInnerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, bezelOuterRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. Draw glowing lights (dots) on bezel
    const dotCount = Math.max(24, N * 2);
    for (let d = 0; d < dotCount; d++) {
      const angle = (d * 2 * Math.PI) / dotCount;
      const dotX = cx + bezelCenterRadius * Math.cos(angle);
      const dotY = cy + bezelCenterRadius * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.2, 0, 2 * Math.PI);
      ctx.fillStyle = d % 2 === 0 ? "#ffffff" : "#f59e0b"; // alternating white / warm amber
      ctx.shadowColor = d % 2 === 0 ? "rgba(255, 255, 255, 0.8)" : "rgba(245, 158, 11, 0.8)";
      ctx.shadowBlur = 4;
      ctx.fill();
    }
    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    // 4. Draw central hub (pin)
    const hubRadius = 24;

    // Hub drop shadow
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius + 3, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.fill();

    // Hub body metallic silver gradient
    const hubBezelGrad = ctx.createLinearGradient(cx - hubRadius, cy - hubRadius, cx + hubRadius, cy + hubRadius);
    hubBezelGrad.addColorStop(0, "#ffffff");
    hubBezelGrad.addColorStop(1, "#94a3b8");

    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = hubBezelGrad;
    ctx.fill();

    // Hub dark glass core
    const coreRadius = hubRadius - 4;
    const hubCoreGrad = ctx.createLinearGradient(cx - coreRadius, cy - coreRadius, cx + coreRadius, cy + coreRadius);
    hubCoreGrad.addColorStop(0, "#1e293b");
    hubCoreGrad.addColorStop(1, "#0f172a");

    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, 2 * Math.PI);
    ctx.fillStyle = hubCoreGrad;
    ctx.fill();

    // Hub core glossy highlight
    ctx.beginPath();
    ctx.ellipse(cx - 3, cy - 3, 6, 3, Math.PI / 4, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.fill();
  }, [data]);

  // Pointer tick wobble micro-animation
  useEffect(() => {
    let animationFrameId: number;
    let isActive = true;

    const tick = () => {
      if (!isActive) return;

      const container = containerRef.current;
      const pointer = pointerRef.current;
      const N = data.length;

      if (container && pointer && N > 0) {
        const sliceWidth = 360 / N;
        const currentAngle = getRotationAngle(container);
        // Pointer is offset at about -43 degrees
        const relAngle = (currentAngle + 43) % 360;
        const normalizedAngle = relAngle < 0 ? relAngle + 360 : relAngle;
        const currentSliceIndex = Math.floor(normalizedAngle / sliceWidth);

        // Check if slice boundary is crossed
        if (lastSliceIndexRef.current !== -1 && currentSliceIndex !== lastSliceIndexRef.current) {
          snapTriggerRef.current = {
            time: performance.now(),
            direction: 1
          };
        }
        lastSliceIndexRef.current = currentSliceIndex;

        // Calculate spring-like deflection decay
        const timePassed = (performance.now() - snapTriggerRef.current.time) / 1000;
        const decay = 12; // Decay rate
        const frequency = 35; // Oscillation rate
        const maxDeflection = 14; // Maximum deflection in degrees

        let deflection = 0;
        if (timePassed < 0.6) {
          deflection = maxDeflection * Math.exp(-decay * timePassed) * Math.cos(frequency * timePassed);
        }

        // Apply rotation with center pivot at the round top-right base of the pointer SVG (~65% 35%)
        pointer.style.transform = `rotate(${deflection}deg)`;
        pointer.style.transformOrigin = "65% 35%";
      }

      const timeSinceSnap = (performance.now() - snapTriggerRef.current.time) / 1000;
      if (isSpinning || timeSinceSnap < 0.6) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        if (pointer) {
          pointer.style.transform = "rotate(0deg)";
        }
      }
    };

    if (isSpinning) {
      const container = containerRef.current;
      if (container && data.length > 0) {
        const sliceWidth = 360 / data.length;
        const currentAngle = getRotationAngle(container);
        const relAngle = (currentAngle + 43) % 360;
        const normalizedAngle = relAngle < 0 ? relAngle + 360 : relAngle;
        lastSliceIndexRef.current = Math.floor(normalizedAngle / sliceWidth);
      }
      animationFrameId = requestAnimationFrame(tick);
    } else {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpinning, data]);

  // Handle spin triggers
  useEffect(() => {
    if (mustStartSpinning && !prevSpinning.current && !isSpinning) {
      setIsSpinning(true);
      const N = data.length;
      if (N === 0) return;

      const degreesPerPrize = 360 / N;
      // 43 degrees is the pointer offset matching the original library's default
      const initialRotation = 43 + degreesPerPrize / 2;
      const perfectRotation = degreesPerPrize * (N - prizeNumber) - initialRotation;

      // Natural random variance inside the slice (+/- 35% of slice size)
      const randomDifference = (Math.random() - 0.5) * degreesPerPrize * 0.7;
      const targetAngle = perfectRotation + randomDifference;

      // Add 5 full spins (1800 degrees) to ensure a smooth, fast spin
      const extraSpins = 1800;

      // Calculate continuous forward spin
      const currentRotMod = rotation % 360;
      const targetRot = rotation - currentRotMod + extraSpins + targetAngle;

      setRotation(targetRot);
    }
    prevSpinning.current = mustStartSpinning;
  }, [mustStartSpinning, prizeNumber, data.length, isSpinning, rotation]);

  const handleTransitionEnd = () => {
    setIsSpinning(false);
    if (onStopSpinning) {
      onStopSpinning();
    }
  };

  // 11.35 multiplier matches the speed of the original library with spinDuration=0.15
  const duration = spinDuration * 11.35;

  return (
    <div
      style={{
        position: "relative",
        width: "80vw",
        maxWidth: "445px",
        height: "80vw",
        maxHeight: "445px",
        margin: "0 auto"
      }}
    >
      {/* Spinning Wheel Wrapper with elegant shadow */}
      <div
        ref={containerRef}
        onTransitionEnd={handleTransitionEnd}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? `transform ${duration}s cubic-bezier(0.2, 0.8, 0.25, 1)` : "none",
          boxShadow: "0 12px 35px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0, 0, 0, 0.06)",
          borderRadius: "50%"
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%"
          }}
        />
      </div>

      {/* Custom Vector Pointer (Styled with premium materials and subtle wobble interaction) */}
      <div
        ref={pointerRef}
        style={{
          position: "absolute",
          width: "17%",
          right: "18px",
          top: "22px",
          zIndex: 10,
          pointerEvents: "none"
        }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0px 5px 8px rgba(0,0,0,0.22))" }}
        >
          <title>Wheel Pointer</title>
          {/* Traditional map pin pointer but styled with gradient/premium stroke */}
          <path
            d="M 25 75 L 47 17 A 25 25 0 1 1 83 53 Z"
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Central hub of the pointer */}
          <circle cx="65" cy="35" r="7" fill="#ffffff" />
        </svg>
      </div>
    </div>
  );
}
