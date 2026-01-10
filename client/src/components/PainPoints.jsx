import React from "react";
import { motion } from "framer-motion";

const PainPoints = () => {
  const painPoints = [
    "Writing READMEs is repetitive and time-consuming",
    "READMEs go out of sync as code evolves",
    "New repositories ship undocumented",
    "Documentation is important, but rarely prioritized",
  ];

  return (
    <section className="py-32 bg-slate-50/50 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {painPoints.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="flex items-start gap-4 py-6 border-b border-slate-200 last:border-b-0"
            >
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 mt-3" />
              <p className="text-xl md:text-2xl text-slate-600 font-light leading-relaxed">
                {text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PainPoints;
