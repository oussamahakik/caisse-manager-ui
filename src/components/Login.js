import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { isRequired } from '../utils/validators';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!isRequired(username)) {
            newErrors.username = 'Le pseudo est requis';
        }
        if (!isRequired(password)) {
            newErrors.password = 'Le mot de passe est requis';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/api/auth/login', { username, password });
            const data = response.data;
            toast.success('Connexion réussie');
            onLogin(data.token, data.snackId, data.role);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Pseudo ou mot de passe incorrect";
            setErrors({ submit: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
            {/* Split Screen Design - Enterprise SaaS */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-6xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row"
            >
                {/* Left Side - Branding (Desktop only) */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 p-12 flex-col justify-center items-center text-white relative overflow-hidden"
                >
                    {/* Overlay avec pattern */}
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}
                    ></div>
                    
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm shadow-lg relative z-10"
                    >
                        <LayoutDashboard className="w-12 h-12" />
                    </motion.div>
                    <h1 className="text-4xl font-bold mb-4 relative z-10 text-center">
                        CaisseManager
                    </h1>
                    <p className="text-indigo-100 text-lg text-center max-w-sm font-medium relative z-10 mb-8">
                        Solution de gestion de caisse moderne pour restaurants et snacks
                    </p>
                    <div className="mt-4 space-y-3 text-indigo-100 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="font-medium">Gestion de commandes en temps réel</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="font-medium">Interface intuitive et rapide</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="font-medium">Rapports et statistiques détaillés</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Login Form */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-slate-800"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <LayoutDashboard className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Connexion</h2>
                        <p className="text-slate-600 dark:text-slate-400">Connectez-vous à votre compte</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Pseudo
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        if (errors.username) {
                                            setErrors({ ...errors, username: '' });
                                        }
                                    }}
                                    placeholder="Ex: admin"
                                    disabled={isLoading}
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
                                />
                            </div>
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) {
                                            setErrors({ ...errors, password: '' });
                                        }
                                    }}
                                    placeholder="Ex: 1234"
                                    disabled={isLoading}
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-slate-300 dark:border-slate-600 rounded"
                                disabled={isLoading}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                                Se souvenir de moi
                            </label>
                        </div>

                        {/* Error Message */}
                        {errors.submit && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm" role="alert">
                                {errors.submit}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Connexion...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    <span>Se Connecter</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        <p>© 2024 CaisseManager. Tous droits réservés.</p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;