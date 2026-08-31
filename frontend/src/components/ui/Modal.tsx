import React, { useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useDismissableLayer } from '../../lib/useDismissableLayer';
import { IconButton } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

const widthStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl'
} as const;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = '2xl'
}) => {
  const shouldReduceMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useDismissableLayer<HTMLDivElement>({ isOpen, onClose });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-0 bg-overlay backdrop-blur-[2px]"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative z-10 my-8 w-full overflow-hidden rounded-card border border-line',
              'bg-surface text-fg shadow-e4',
              widthStyles[maxWidth]
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line bg-subtle/60 px-5 py-4">
              <div className="min-w-0">
                <h2 id={titleId} className="text-sm font-semibold text-fg">
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="mt-1 text-xs text-fg-muted">
                    {description}
                  </p>
                )}
              </div>
              <IconButton label="Close dialog" size="sm" onClick={onClose} className="-mr-1">
                <X className="size-4" />
              </IconButton>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>

            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-line bg-subtle/60 px-5 py-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
