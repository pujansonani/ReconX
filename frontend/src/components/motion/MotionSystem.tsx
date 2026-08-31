import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  animate,
  AnimatePresence
} from 'framer-motion';

// ==========================================
// 1. GLOBAL MOTION CONSTANTS & SPRINGS
// ==========================================
export const MOTION_SPRINGS = {
  snappy: { type: 'spring' as const, stiffness: 350, damping: 28, mass: 0.6 },
  normal: { type: 'spring' as const, stiffness: 220, damping: 22, mass: 0.8 },
  smooth: { type: 'spring' as const, stiffness: 140, damping: 20, mass: 0.9 },
  gentle: { type: 'spring' as const, stiffness: 90, damping: 18, mass: 1 }
};

export const MOTION_DURATIONS = {
  fast: 0.18,
  normal: 0.32,
  smooth: 0.52,
  emphasis: 0.75
};

export const MOTION_EASE = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  outCubic: [0.33, 1, 0.68, 1] as const,
  inOutCubic: [0.65, 0, 0.35, 1] as const
};

// ==========================================
// 2. VIEWPORT REVEAL COMPONENT
// ==========================================
interface RevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  blur?: boolean;
  distance?: number;
  className?: string;
  once?: boolean;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = MOTION_DURATIONS.smooth,
  blur = true,
  distance = 24,
  className = '',
  once = true
}) => {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-40px 0px' });

  const getInitialOffset = () => {
    if (shouldReduceMotion) return { x: 0, y: 0 };
    switch (direction) {
      case 'up': return { x: 0, y: distance };
      case 'down': return { x: 0, y: -distance };
      case 'left': return { x: distance, y: 0 };
      case 'right': return { x: -distance, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const initial = {
    opacity: 0,
    ...getInitialOffset(),
    filter: blur && !shouldReduceMotion ? 'blur(6px)' : 'none'
  };

  const animateState = isInView
    ? {
        opacity: 1,
        x: 0,
        y: 0,
        filter: 'blur(0px)'
      }
    : initial;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animateState}
      transition={{
        duration,
        delay,
        ease: MOTION_EASE.outExpo
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 3. STAGGER CONTAINER & ITEM
// ==========================================
interface StaggerContainerProps {
  children: React.ReactNode;
  delayChildren?: number;
  staggerChildren?: number;
  className?: string;
  once?: boolean;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  delayChildren = 0.05,
  staggerChildren = 0.08,
  className = '',
  once = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-40px 0px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren,
        staggerChildren
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
}> = ({ children, className = '', yOffset = 18 }) => {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : yOffset,
      filter: shouldReduceMotion ? 'none' : 'blur(4px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: MOTION_DURATIONS.smooth,
        ease: MOTION_EASE.outExpo
      }
    }
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};

// ==========================================
// 4. ANIMATED NUMBER ROLLER
// ==========================================
interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.2,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px 0px' });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    if (isInView) {
      const controls = animate(0, value, {
        duration,
        ease: MOTION_EASE.outExpo,
        onUpdate: (latest) => {
          setDisplayValue(latest);
        }
      });
      return () => controls.stop();
    }
  }, [value, isInView, duration, shouldReduceMotion]);

  const formatted = decimals > 0
    ? displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(displayValue).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
};

// ==========================================
// 5. ANIMATED INTERACTIVE CARD
// ==========================================
export const AnimatedCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverLift?: number;
}> = ({ children, className = '', onClick, hoverLift = 4 }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      onClick={onClick}
      whileHover={shouldReduceMotion ? {} : { y: -hoverLift, transition: MOTION_SPRINGS.snappy }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.985, transition: { duration: 0.1 } }}
      className={`rounded-card border border-line bg-surface shadow-e1 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 6. MAGNETIC BUTTON WRAPPER
// ==========================================
export const MagneticButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}> = ({ children, className = '', onClick, strength = 12 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({
      x: (middleX / width) * strength,
      y: (middleY / height) * strength
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={MOTION_SPRINGS.snappy}
      className={`inline-block ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 7. SCROLL PROGRESS TRACKER
// ==========================================
export const ScrollProgressTracker: React.FC<{
  sections: { id: string; label: string }[];
  activeSection: string;
  onSelectSection: (id: string) => void;
}> = ({ sections, activeSection, onSelectSection }) => {
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col items-end gap-3 pointer-events-auto">
      {sections.map((sec, idx) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => onSelectSection(sec.id)}
            className="group flex items-center gap-2 text-right transition-all py-1 focus:outline-none"
            title={sec.label}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-wider transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                isActive ? 'text-[#0077B6] dark:text-[#48CAE4] font-extrabold !opacity-100' : 'text-[var(--text-muted)]'
              }`}
            >
              {sec.label}
            </span>
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-[#0077B6] dark:bg-[#48CAE4] ring-4 ring-[#0077B6]/25 dark:ring-[#48CAE4]/25 scale-125'
                  : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400 dark:group-hover:bg-slate-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
