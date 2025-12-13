import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import Input from './common/Input/Input';
import Button from './common/Button/Button';
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 via-purple-900 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black flex items-center justify-center p-4 transition-all duration-500 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            {/* Split Screen Design */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-6xl glass-strong rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-500 relative z-10 border border-white/20 dark:border-slate-700/50"
            >
                {/* Left Side - Branding */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 flex-col justify-center items-center text-white relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.1),transparent_50%)]"></div>
                    
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-xl shadow-2xl border border-white/30 relative z-10"
                    >
                        <LayoutDashboard className="w-14 h-14 drop-shadow-2xl" />
                    </motion.div>
                    <h1 className="text-5xl font-extrabold mb-4 relative z-10 tracking-tight drop-shadow-lg">
                        CaisseManager
                    </h1>
                    <p className="text-blue-50 text-lg text-center max-w-md font-medium relative z-10 mb-8">
                        Solution de gestion de caisse moderne pour restaurants et snacks
                    </p>
                    <div className="mt-4 space-y-4 text-blue-50 relative z-10">
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                            <span className="font-medium">Gestion de commandes en temps réel</span>
                        </motion.div>
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                            <span className="font-medium">Interface intuitive et rapide</span>
                        </motion.div>
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                            <span className="font-medium">Rapports et statistiques détaillés</span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right Side - Login Form */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 relative"
                >
                    {/* Mobile Logo */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
                        className="md:hidden flex items-center justify-center mb-8"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl glow">
                            <LayoutDashboard className="w-12 h-12 text-white drop-shadow-2xl" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-8"
                    >
                        <h2 className="text-4xl font-extrabold gradient-text mb-3 tracking-tight">Connexion</h2>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Connectez-vous à votre compte CaisseManager</p>
                    </motion.div>

                    <motion.form
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Username Field */}
                        <Input
                            id="username"
                            label="Pseudo"
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (errors.username) {
                                    setErrors({ ...errors, username: '' });
                                }
                            }}
                            placeholder="Ex: admin"
                            icon={<User className="h-5 w-5" />}
                            error={errors.username}
                            disabled={isLoading}
                            required
                        />

                        {/* Password Field */}
                        <Input
                            id="password"
                            label="Mot de passe"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) {
                                    setErrors({ ...errors, password: '' });
                                }
                            }}
                            placeholder="Ex: 1234"
                            icon={<Lock className="h-5 w-5" />}
                            error={errors.password}
                            disabled={isLoading}
                            required
                        />

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                                disabled={isLoading}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                                Se souvenir de moi
                            </label>
                        </div>

                        {/* Error Message */}
                        {errors.submit && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-error-50 border border-error-200 text-error-700 dark:bg-error-900/20 dark:border-error-800 dark:text-error-400 px-4 py-3 rounded-lg text-sm"
                                role="alert"
                            >
                                {errors.submit}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={isLoading}
                            loading={isLoading}
                            className="w-full"
                        >
                            <Lock className="w-5 h-5 mr-2" />
                            Se Connecter
                        </Button>
                    </motion.form>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 text-center text-sm text-slate-500"
                    >
                        <p>© 2024 CaisseManager. Tous droits réservés.</p>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;