import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard,
  FileCheck2,
  AlertTriangle,
  FlaskConical,
  BarChart3,
  Settings,
  PlusCircle,
  Zap,
  Moon,
  Sun,
  ShieldAlert,
  Menu,
  X,
  Search
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, IconButton } from '../ui/Button';
import { MagneticButton, MOTION_SPRINGS } from '../motion/MotionSystem';
import { useTheme } from '../../context/ThemeContext';
import { GoogleAuthButton } from '../auth/GoogleAuthButton';
import { cn } from '../../lib/cn';
import { useDismissableLayer } from '../../lib/useDismissableLayer';

export interface NavItemDef {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Short pill rendered after the label. */
  badge?: string;
}

/**
 * Single source of truth for primary navigation. `App.tsx` feeds the same list
 * into the command palette so the two can never drift apart.
 */
export const NAV_ITEMS: NavItemDef[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reconciliations', label: 'Reconciliations', icon: FileCheck2 },
  { id: 'exceptions', label: 'Exceptions', icon: AlertTriangle },
  { id: 'razorpay', label: 'Sentinel', icon: ShieldAlert, badge: 'PRO' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'evaluation', label: 'Benchmark', icon: FlaskConical },
  { id: 'settings', label: 'Settings', icon: Settings }
];

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNewRecon: () => void;
  onTryDemo: () => void;
  loadingDemo?: boolean;
  /** Opens the ⌘K palette. The trigger is hidden when not provided. */
  onOpenCommandPalette?: () => void;
}

const Brand: React.FC<{ onClick: () => void; compact?: boolean }> = ({ onClick, compact }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="ReconX home"
    className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-control text-left"
  >
    <img
      src="/logo.png"
      alt=""
      aria-hidden="true"
      className="size-7 rounded-tile object-contain shadow-e1 transition-transform duration-200 group-hover:scale-105"
    />
    <span className="flex items-center gap-1.5">
      <span className="text-sm font-extrabold tracking-tight text-fg">
        Recon<span className="text-accent-adaptive">X</span>
      </span>
      <span className="mono rounded bg-accent-soft px-1 py-0.2 text-[9px] font-bold text-accent-text">
        PRO
      </span>
    </span>
  </button>
);

/** Slide-over navigation for viewports too narrow for the inline nav row. */
const MobileNav: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNewRecon: () => void;
  onTryDemo: () => void;
  loadingDemo: boolean;
}> = ({ isOpen, onClose, currentTab, onSelectTab, onNewRecon, onTryDemo, loadingDemo }) => {
  const shouldReduceMotion = useReducedMotion();
  const panelRef = useDismissableLayer<HTMLDivElement>({ isOpen, onClose });

  const go = (tab: string) => {
    onClose();
    onSelectTab(tab);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-overlay backdrop-blur-[2px]"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={shouldReduceMotion ? { duration: 0.12 } : MOTION_SPRINGS.snappy}
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-xs flex-col border-l border-line bg-surface shadow-e4"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <Brand onClick={() => go('landing')} compact />
              <IconButton label="Close navigation" onClick={onClose} data-autofocus>
                <X className="size-4" />
              </IconButton>
            </div>
            <nav aria-label="Primary" className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => go(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-2.5 rounded-control px-3 py-2',
                          'text-xs font-semibold transition-colors duration-150',
                          isActive
                            ? 'border border-accent-soft-line bg-accent-soft text-accent-text'
                            : 'border border-transparent text-fg-secondary hover:bg-subtle'
                        )}
                      >
                        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="mono rounded bg-info-soft px-1.5 py-0.5 text-[9px] font-bold text-info-text">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="space-y-2 border-t border-line p-3">
              <Button
                variant="accent-soft"
                size="sm"
                fullWidth
                loading={loadingDemo}
                onClick={() => {
                  onClose();
                  onTryDemo();
                }}
                icon={<Zap className="size-3.5 fill-current" />}
              >
                Demo (2k txs)
              </Button>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => {
                  onClose();
                  onNewRecon();
                }}
                icon={<PlusCircle className="size-3.5" />}
              >
                + New Recon
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onNewRecon,
  onTryDemo,
  loadingDemo = false,
  onOpenCommandPalette
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="glass sticky top-0 z-40 border-b border-line">
        <div className="mx-auto flex h-13 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 xl:gap-6">
            <Brand onClick={() => onSelectTab('landing')} />

            {/* Compact inline primary nav links */}
            <nav aria-label="Primary" className="relative hidden items-center gap-0.5 lg:flex">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'relative z-10 flex cursor-pointer items-center gap-1.5 rounded-control px-2.5 py-1',
                      'text-[12px] font-semibold whitespace-nowrap transition-colors duration-150',
                      isActive ? 'text-accent-text font-bold' : 'text-fg-muted hover:text-fg'
                    )}
                  >
                    <Icon
                      className={cn('size-3.5 shrink-0', isActive ? 'text-accent' : 'text-fg-faint')}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="mono rounded bg-info-soft px-1 py-0.2 text-[8px] font-bold text-info-text">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="activeNavPill"
                        className="absolute inset-0 -z-10 rounded-control border border-accent-soft-line bg-accent-soft shadow-2xs"
                        transition={shouldReduceMotion ? { duration: 0 } : MOTION_SPRINGS.snappy}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Streamlined right-side actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenCommandPalette && (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className={cn(
                  'hidden cursor-pointer items-center gap-1.5 rounded-control border border-line bg-subtle',
                  'px-2 py-1 text-[11px] font-medium text-fg-muted transition-colors',
                  'hover:border-line-strong hover:text-fg sm:flex'
                )}
                aria-label="Open command palette"
                title="Search (⌘K)"
              >
                <Search className="size-3" aria-hidden="true" />
                <kbd className="mono rounded border border-line bg-surface px-1 text-[9px] font-semibold">
                  ⌘K
                </kbd>
              </button>
            )}

            <GoogleAuthButton />

            <IconButton
              label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              variant="outline"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="size-3.5 text-warn" />
              ) : (
                <Moon className="size-3.5" />
              )}
            </IconButton>

            <MagneticButton strength={4} className="hidden sm:block">
              <Button
                variant="accent-soft"
                size="sm"
                onClick={onTryDemo}
                loading={loadingDemo}
                icon={<Zap className="size-3 fill-current" />}
              >
                <span>Demo</span>
              </Button>
            </MagneticButton>

            <MagneticButton strength={4} className="hidden sm:block">
              <Button variant="primary" size="sm" onClick={onNewRecon} icon={<PlusCircle className="size-3" />}>
                <span>+ New Recon</span>
              </Button>
            </MagneticButton>

            <IconButton
              label="Open navigation"
              variant="outline"
              size="sm"
              className="lg:hidden"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-3.5" />
            </IconButton>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        onNewRecon={onNewRecon}
        onTryDemo={onTryDemo}
        loadingDemo={loadingDemo}
      />
    </>
  );
};

