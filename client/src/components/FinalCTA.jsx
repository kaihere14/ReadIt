import React from "react";
import { motion } from "framer-motion";
import { Github, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinalCTA = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-32 px-6 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8">
          Ready to automate
          <br />
          your documentation?
        </h2>
        
        <motion.button
          onClick={() => navigate("/login")}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-slate-900 text-white px-10 py-5 rounded-xl font-semibold text-lg flex items-center gap-3 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl mx-auto group"
        >
          <Github size={22} />
          Get Started for Free
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </motion.button>
      </motion.div>
    </section>
  );
};

export default FinalCTA;
