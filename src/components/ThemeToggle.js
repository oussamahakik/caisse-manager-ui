import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = memo(() => {
    const { toggleTheme, isDark } = useTheme();

    return (
        <motion.button
            whileHover={{ scale: 1.2, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`
                relative p-3.5 rounded-2xl transition-all duration-500 shadow-2xl glow-hover overflow-hidden group
                ${isDark 
                    ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 hover:from-yellow-300 hover:via-yellow-400 hover:to-orange-400 text-slate-900 shadow-yellow-500/60' 
                    : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 hover:from-slate-600 hover:via-slate-700 hover:to-slate-800 text-yellow-400 shadow-slate-500/60'
                }
            `}
            aria-label={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}
            title={`Mode ${isDark ? 'sombre' : 'clair'} - Cliquez pour changer`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <motion.div
                initial={false}
                animate={{ rotate: isDark ? 0 : 360 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative z-10"
            >
                {isDark ? (
                    <Sun className="w-5 h-5 drop-shadow-2xl" />
                ) : (
                    <Moon className="w-5 h-5 drop-shadow-2xl" />
                )}
            </motion.div>
        </motion.button>
    );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;

