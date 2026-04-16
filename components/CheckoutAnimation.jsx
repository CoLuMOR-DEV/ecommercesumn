import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function CheckoutAnimation({ active, onDone, processingLabel = 'Processing payment...' }) {
  const [stage, setStage] = useState('idle');

  useEffect(() => {
    if (!active) {
      setStage('idle');
      return;
    }

    setStage('processing');

    const toSuccess = setTimeout(() => setStage('success'), 2000);
    const toDone = setTimeout(() => onDone?.(), 3200);

    return () => {
      clearTimeout(toSuccess);
      clearTimeout(toDone);
    };
  }, [active, onDone]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="w-[360px] rounded bg-[#0f1923] p-8 text-center"
          >
            {stage === 'processing' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
                  className="mx-auto h-12 w-12 rounded-full border-4 border-[#32455c] border-t-[#ff4655]"
                />
                <p className="mt-5 text-sm uppercase tracking-[0.2em] text-[#ece8e1]">{processingLabel}</p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 15 }}
                  className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#2eae77]"
                >
                  <span className="text-2xl font-black text-white">✓</span>
                </motion.div>
                <p className="mt-5 text-sm uppercase tracking-[0.2em] text-[#ece8e1]">Payment Successful</p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
