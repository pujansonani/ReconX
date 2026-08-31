import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useDismissableLayer } from '../../lib/useDismissableLayer';

export interface CommandItem {
  id: string;
  label: string;
  /** Grouping header, e.g. "Navigate" / "Actions" / "Recent runs". */
  group: string;
  hint?: string;
  icon?: React.ReactNode;
  /** Extra terms matched by the filter but not displayed. */
  keywords?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
}

/** Case-insensitive subsequence match, so "exhb" finds "Exceptions Hub". */
function fuzzyScore(haystack: string, needle: string): number {
  if (!needle) return 1;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (h.includes(n)) return 100 - h.indexOf(n);

  let hi = 0;
  let matched = 0;
  for (const char of n) {
    const found = h.indexOf(char, hi);
    if (found === -1) return 0;
    matched += 1;
    hi = found + 1;
  }
  return matched === n.length ? 10 : 0;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, items }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const panelRef = useDismissableLayer<HTMLDivElement>({ isOpen, onClose });
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const scored = items
      .map((item) => ({
        item,
        score: Math.max(
          fuzzyScore(item.label, query),
          fuzzyScore(`${item.group} ${item.keywords ?? ''}`, query) * 0.5
        )
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.map((r) => r.item);
  }, [items, query]);

  // Flatten into render order while keeping group headers.
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    results.forEach((item) => {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    });
    return Array.from(map.entries());
  }, [results]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  // Keep the highlighted row inside the scroll viewport.
  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const run = (item: CommandItem) => {
    onClose();
    item.onSelect();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? 0 : (i + 1) % results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) run(item);
    }
  };

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            onClick={onClose}
            className="fixed inset-0 bg-overlay backdrop-blur-[3px]"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={handleKeyDown}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-card border border-line bg-surface shadow-e4"
          >
            <div className="flex items-center gap-2.5 border-b border-line px-4">
              <Search className="size-4 shrink-0 text-fg-faint" aria-hidden="true" />
              <input
                data-autofocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a page, run, or action…"
                aria-label="Search commands"
                aria-controls="command-results"
                className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
              />
              <kbd className="hidden shrink-0 rounded border border-line bg-subtle px-1.5 py-0.5 text-[10px] font-semibold text-fg-muted sm:block">
                ESC
              </kbd>
            </div>

            <div
              ref={listRef}
              id="command-results"
              role="listbox"
              aria-label="Commands"
              className="max-h-80 overflow-y-auto p-2"
            >
              {results.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs text-fg-muted">
                  No matches for “{query}”.
                </p>
              ) : (
                grouped.map(([group, groupItems]) => (
                  <div key={group} className="mb-1 last:mb-0">
                    <div className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-fg-faint uppercase">
                      {group}
                    </div>
                    {groupItems.map((item) => {
                      flatIndex += 1;
                      const isActive = flatIndex === activeIndex;
                      const myIndex = flatIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          data-active={isActive}
                          onMouseMove={() => setActiveIndex(myIndex)}
                          onClick={() => run(item)}
                          className={cn(
                            'flex w-full cursor-pointer items-center gap-2.5 rounded-control px-2.5 py-2 text-left',
                            'transition-colors duration-75',
                            isActive ? 'bg-accent-soft text-accent-text' : 'text-fg-secondary'
                          )}
                        >
                          {item.icon && (
                            <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
                              {item.icon}
                            </span>
                          )}
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.label}</span>
                          {item.hint && (
                            <span className="shrink-0 text-[10px] text-fg-faint">{item.hint}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-line bg-subtle/60 px-4 py-2 text-[10px] font-medium text-fg-muted">
              <span className="flex items-center gap-1">
                <ArrowUp className="size-3" />
                <ArrowDown className="size-3" />
                navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="size-3" />
                select
              </span>
              <span className="ml-auto">{results.length} result{results.length === 1 ? '' : 's'}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/** Registers the ⌘K / Ctrl+K shortcut and returns palette open state. */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  };
}
