import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, CheckCircle2, Calendar, DollarSign, Timer } from 'lucide-react';
import { toast } from 'sonner';
import api, { setSnackId } from '../services/api';

const KitchenDisplay = memo(({ token, snackId }) => {
    const [commandes, setCommandes] = useState([]);
    const [view, setView] = useState('EN_ATTENTE');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (snackId) {
            setSnackId(snackId);
        }
    }, [snackId]);

    const fetchCommandes = useCallback(async (currentView) => {
        const endpoint = currentView === 'EN_ATTENTE' ? 'actives' : 'history';
        setIsLoading(true);
        try {
            const params = currentView === 'HISTORIQUE' ? { date: selectedDate } : {};
            const response = await api.get(`/api/commandes/${endpoint}`, {
                params,
                headers: { 'X-Snack-ID': snackId.toString() }
            });
            setCommandes(response.data || []);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error(error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [snackId, selectedDate]);

    // Mettre à jour l'heure actuelle chaque seconde pour le timer
    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timeInterval);
    }, []);

    useEffect(() => {
        fetchCommandes(view);

        if (view === 'EN_ATTENTE') {
            const interval = setInterval(() => fetchCommandes('EN_ATTENTE'), 5000);
            return () => clearInterval(interval);
        }
    }, [view, fetchCommandes, selectedDate]);

    // Fonction pour calculer le temps d'attente
    const calculateWaitTime = useCallback((commandeDate) => {
        if (!commandeDate) return { minutes: 0, seconds: 0, totalSeconds: 0 };
        
        const dateCommande = new Date(commandeDate);
        const diffMs = currentTime - dateCommande;
        const totalSeconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return { minutes, seconds, totalSeconds };
    }, [currentTime]);

    // Formater le temps d'attente pour l'affichage
    const formatWaitTime = useCallback((commandeDate) => {
        const { minutes, seconds } = calculateWaitTime(commandeDate);
        if (minutes === 0 && seconds === 0) return '0s';
        if (minutes === 0) return `${seconds}s`;
        return `${minutes}m ${seconds}s`;
    }, [calculateWaitTime]);

    const marquerCommePrete = async (id) => {
        try {
            await api.put(`/api/commandes/${id}/statut?nouveauStatut=PRETE`, {}, {
                headers: { 'X-Snack-ID': snackId.toString() }
            });
            toast.success('Commande marquée comme prête !');
            fetchCommandes(view);
        } catch (error) {
            // Erreur gérée par l'intercepteur
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black text-white p-6 transition-all duration-500 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl glow"
                        >
                            <ChefHat className="w-10 h-10 text-white drop-shadow-2xl" />
                        </motion.div>
                        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent tracking-tight">
                            Écran Cuisine
                        </h2>
                    </div>
                    <p className="text-slate-300 text-lg font-semibold">
                        {commandes.length} {view === 'EN_ATTENTE' ? 'en attente' : 'prêtes'}
                    </p>
                </motion.div>

                {/* FILTRES */}
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="flex justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView('EN_ATTENTE')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                view === 'EN_ATTENTE'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            <Clock className="w-5 h-5 inline mr-2" />
                            En Attente
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView('HISTORIQUE')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                view === 'HISTORIQUE'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            <CheckCircle2 className="w-5 h-5 inline mr-2" />
                            Historique (Prêtes)
                        </motion.button>
                    </div>

                    {/* Filtre de date pour l'historique */}
                    {view === 'HISTORIQUE' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 bg-slate-800 p-4 rounded-xl"
                        >
                            <Calendar className="w-5 h-5 text-slate-300" />
                            <label className="text-sm font-medium text-slate-300">Date :</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Aujourd'hui
                            </motion.button>
                        </motion.div>
                    )}
                </div>

                {/* GRILLE DE COMMANDES */}
                {isLoading && commandes.length === 0 ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                    </div>
                ) : commandes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 text-slate-400"
                    >
                        <ChefHat className="w-24 h-24 mx-auto mb-4 opacity-30" />
                        <p className="text-xl">Aucune commande {view === 'EN_ATTENTE' ? 'en attente' : 'prête'}.</p>
                        <p className="text-sm mt-2">Pause café ? ☕</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {commandes.map((c, index) => (
                                <motion.div
                                    key={c.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                    transition={{ delay: index * 0.1, duration: 0.3 }}
                                    className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-50 border-2 border-yellow-400 dark:border-yellow-500 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:border-yellow-500 dark:hover:border-yellow-400 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    
                                    {/* HEADER DU TICKET */}
                                    <div className="flex justify-between items-start mb-5 pb-4 border-b-2 border-yellow-500 dark:border-yellow-400 relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-3xl font-extrabold text-slate-900 dark:text-white drop-shadow-lg">#{c.id}</span>
                                            <span className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-semibold">
                                                {new Date(c.date).toLocaleTimeString('fr-FR', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </span>
                                        </div>
                                        {view === 'EN_ATTENTE' && (() => {
                                            const waitTime = calculateWaitTime(c.date);
                                            const isLongWait = waitTime.totalSeconds > 600; // Plus de 10 minutes
                                            return (
                                                <motion.div 
                                                    animate={{ scale: isLongWait ? [1, 1.1] : 1 }}
                                                    transition={{ duration: 2, repeat: isLongWait ? Infinity : 0, repeatType: "reverse" }}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl ${
                                                        isLongWait 
                                                            ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white glow' 
                                                            : 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white'
                                                    }`}
                                                >
                                                    <Timer className="w-5 h-5 drop-shadow-lg" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold opacity-90">Temps d'attente</span>
                                                        <span className="text-base font-extrabold drop-shadow-lg">
                                                            {formatWaitTime(c.date)}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })()}
                                    </div>

                                    {/* LISTE DES ARTICLES */}
                                    <ul className="space-y-2 mb-4">
                                        {c.lignes.map((ligne, idx) => (
                                            <motion.li
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="text-slate-900 border-b border-yellow-200 pb-2 last:border-0"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <span className="font-bold text-orange-600 text-lg">
                                                        {ligne.quantite}x
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className="font-semibold">{ligne.nomProduit}</p>
                                                        {ligne.details && (
                                                            <p className="text-xs text-slate-600 italic mt-1 bg-yellow-100 px-2 py-1 rounded">
                                                                {ligne.details}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </ul>

                                    {/* TOTAL ET TYPE DE PAIEMENT (pour historique) */}
                                    {view === 'HISTORIQUE' && (
                                        <div className="mt-3 pt-3 border-t-2 border-yellow-400 mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-slate-700">Total :</span>
                                                <span className="text-xl font-bold text-emerald-600">
                                                    {c.total ? c.total.toFixed(2) : '0.00'} €
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <DollarSign className="w-4 h-4" />
                                                <span>Paiement: {c.typePaiement || 'N/A'}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* BOUTON PRÊT */}
                                    {view === 'EN_ATTENTE' && (
                                        <motion.button
                                            whileHover={{ scale: 1.03, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            transition={{ duration: 0.15 }}
                                            onClick={() => marquerCommePrete(c.id)}
                                            className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 hover:from-emerald-700 hover:via-emerald-800 hover:to-teal-700 text-white font-extrabold py-5 px-6 rounded-2xl shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 transform hover:shadow-3xl glow-hover group relative overflow-hidden relative z-10"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <CheckCircle2 className="w-6 h-6 relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform" />
                                            <span className="relative z-10 tracking-wide text-lg">C'EST PRÊT</span>
                                        </motion.button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
});

KitchenDisplay.displayName = 'KitchenDisplay';

export default KitchenDisplay;
