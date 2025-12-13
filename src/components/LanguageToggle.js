import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { setLanguage, getLanguage } from '../i18n';

const LanguageToggle = memo(() => {
    const [currentLang, setCurrentLang] = useState(getLanguage());
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
    ];

    const handleLanguageChange = (langCode) => {
        setLanguage(langCode);
        setCurrentLang(langCode);
        setIsOpen(false);
        window.location.reload(); // Recharger pour appliquer les traductions
    };

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3.5 rounded-2xl transition-all duration-500 shadow-2xl glow-hover overflow-hidden group bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white"
                aria-label="Changer la langue"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Globe className="w-5 h-5 relative z-10" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[180px]"
                        >
                            {languages.map((lang) => (
                                <motion.button
                                    key={lang.code}
                                    whileHover={{ x: 5 }}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                                        currentLang === lang.code
                                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    <span className="text-2xl">{lang.flag}</span>
                                    <span className="font-medium">{lang.name}</span>
                                    {currentLang === lang.code && (
                                        <motion.div
                                            layoutId="activeLang"
                                            className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
});

LanguageToggle.displayName = 'LanguageToggle';

export default LanguageToggle;

