import React from "react";
import { motion } from "framer-motion";
import { Github } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-6 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 text-white p-2 rounded-lg">
              <span className="font-bold text-lg leading-none">R</span>
            </div>
            <span className="font-semibold text-xl tracking-tight text-slate-900">
              ReadmeAI
            </span>
          </div>

          {/* Copyright */}
          <div className="text-sm text-slate-500">
            © {currentYear} ReadmeAI. Built for developers.
          </div>

          {/* GitHub Link */}
          <motion.a
            href="https://github.com/kaihere14/readit"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Github size={18} />
            <span className="font-medium">View on GitHub</span>
          </motion.a>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

