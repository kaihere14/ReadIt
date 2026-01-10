import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Lock, Unlock, Loader2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const RepoCard = ({ repo, showToggle = true }) => {
  const [isActive, setIsActive] = useState(repo.activated);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!isActive) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/github/addRepoActivity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            repoId: repo.id,
            repoName: repo.name,
            repoFullName: repo.full_name,
            repoOwner: repo.owner,
            defaultBranch: repo.default_branch,
          }),
        });
        if (response.ok) {
          setIsActive(true);
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to activate repository');
        }
      } catch (error) {
        console.error('Error activating repo:', error);
        alert('Failed to activate repository');
      }
    } else {
      try {
        const response = await fetch(`${BACKEND_URL}/api/github/deactivateRepoActivity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            repoId: repo.id,
          }),
        });
        if (response.ok) {
          setIsActive(false);
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to deactivate repository');
        }
      } catch (error) {
        console.error('Error deactivating repo:', error);
        alert('Failed to deactivate repository');
      }
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className="bg-white border border-slate-200 rounded-xl p-6 transition-all duration-50 hover:border-slate-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch size={16} className="text-slate-400 shrink-0" />
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {repo.name}
            </h3>
          </div>
          <p className="text-xs text-slate-500 truncate">{repo.full_name}</p>
        </div>
        
        {showToggle && (
          <div className="flex items-center gap-2 ml-4">
            {loading ? (
              <Loader2 size={20} className="text-slate-400 animate-spin" />
            ) : (
              <button
                onClick={handleToggle}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
                  isActive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-600 mb-3">
        {repo.private ? (
          <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
            <Lock size={12} />
            Private
          </span>
        ) : (
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
            <Unlock size={12} />
            Public
          </span>
        )}
        <span className="text-slate-400">•</span>
        <span className="text-slate-500">{repo.default_branch}</span>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 pt-3 border-t border-slate-100"
        >
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-emerald-500 rounded-full"
            />
            AI README updates enabled
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RepoCard;
