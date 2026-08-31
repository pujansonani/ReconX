import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

interface Options {
  isOpen: boolean;
  onClose: () => void;
  /** Set false for non-modal layers that should not lock page scroll. */
  lockScroll?: boolean;
  /** Set false to allow clicks/tabs to escape (e.g. inline popovers). */
  trapFocus?: boolean;
}

/**
 * Shared behaviour for modal-ish layers (dialogs, drawers, palettes):
 * Escape to close, focus moved in on open and restored on close, Tab cycled
 * inside the container, and page scroll locked without a layout shift.
 */
export function useDismissableLayer<T extends HTMLElement>({
  isOpen,
  onClose,
  lockScroll = true,
  trapFocus = true
}: Options) {
  const containerRef = useRef<T>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Move focus into the layer so screen readers and keyboards land inside.
    const focusFirst = () => {
      const node = containerRef.current;
      if (!node) return;
      const target =
        node.querySelector<HTMLElement>('[data-autofocus]') ??
        node.querySelector<HTMLElement>(FOCUSABLE) ??
        node;
      target.focus({ preventScroll: true });
    };
    const raf = requestAnimationFrame(focusFirst);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (!trapFocus || e.key !== 'Tab') return;
      const node = containerRef.current;
      if (!node) return;

      const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && (active === first || !node.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    let restoreOverflow: (() => void) | undefined;
    if (lockScroll) {
      const { overflow, paddingRight } = document.body.style;
      // `scrollbar-gutter: stable` on <html> keeps the gutter reserved, so no
      // compensation padding is needed — but guard for browsers without it.
      const supportsGutter = CSS.supports?.('scrollbar-gutter', 'stable');
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (!supportsGutter && scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      restoreOverflow = () => {
        document.body.style.overflow = overflow;
        document.body.style.paddingRight = paddingRight;
      };
    }

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown, true);
      restoreOverflow?.();
      previouslyFocused.current?.focus({ preventScroll: true });
    };
  }, [isOpen, onClose, lockScroll, trapFocus]);

  return containerRef;
}
