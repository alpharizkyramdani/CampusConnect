import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  return (
    <>
      {/* Sleek Minimalist Top & Bottom Shutter Curtain Reveal */}
      <motion.div
        className="fixed inset-x-0 top-0 h-1/2 bg-slate-950 pointer-events-none z-[100] border-b border-cyan-500/30"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        style={{ originY: 0 }}
        transition={{
          duration: 0.35,
          ease: [0.76, 0, 0.24, 1],
        }}
      />
      <motion.div
        className="fixed inset-x-0 bottom-0 h-1/2 bg-slate-950 pointer-events-none z-[100] border-t border-cyan-500/30"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        style={{ originY: 1 }}
        transition={{
          duration: 0.35,
          ease: [0.76, 0, 0.24, 1],
        }}
      />

      {/* Page Content with Smooth De-blur Scale Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
        transition={{
          duration: 0.32,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.08,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </>
  );
};
