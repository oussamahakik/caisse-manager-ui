import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Crown, Building2, Plus, Edit2, Trash2, Key, CreditCard, 
    Power, PowerOff, Copy, X, MapPin, Calendar, Package, Search, Users,
    BarChart3, TrendingUp, DollarSign, 
    Download, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { KPICardSkeleton, Spinner } from './LoadingSkeleton';
import PlansManagement from './PlansManagement';

const SuperAdminDashboard = memo(({ token, onLogout }) => {
    const [snacks, setSnacks] = useState([]);
    const [plans, setPlans] = useState([]);
    const [users, setUsers] = useState([]);
    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'restaurants', 'users', 'plans', 'analytics', 'finance', 'logs'
    
    // États pour Analytics
    const [analytics, setAnalytics] = useState(null);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
    
    // États pour Finance
    const [financeData, setFinanceData] = useState(null);
    const [isLoadingFinance, setIsLoadingFinance] = useState(false);
    
    // États pour Logs
    const [logs, setLogs] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    
    // États pour le formulaire de création (Modal)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        nomRestaurant: '',
        adresse: '',
        usernameManager: '',
        passwordManager: ''
    });

    // États pour les autres modales
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSnack, setSelectedSnack] = useState(null);
    const [editFormData, setEditFormData] = useState({ nom: '', adresse: '' });

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [tempPassword, setTempPassword] = useState('');

    const [isAbonnementModalOpen, setIsAbonnementModalOpen] = useState(false);
    const [selectedSnackForAbonnement, setSelectedSnackForAbonnement] = useState(null);
    const [abonnementFormData, setAbonnementFormData] = useState({ planId: '', dateFinAbonnement: '' });

    // KPI Calculations
    const kpis = useMemo(() => ({
        total: snacks.length,
        actifs: snacks.filter(s => s.actif).length,
        suspendus: snacks.filter(s => !s.actif).length,
        avecAbonnement: snacks.filter(s => s.dateFinAbonnement && new Date(s.dateFinAbonnement) > new Date()).length
    }), [snacks]);

    // Filtrage
    const filteredSnacks = useMemo(() => {
        return snacks.filter(snack => 
            snack.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (snack.adresse && snack.adresse.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [snacks, searchTerm]);

    useEffect(() => {
        fetchSnacks();
        fetchPlans();
        fetchUsersCount();
        if (activeTab === 'users') {
            fetchAllUsers();
        }
        if (activeTab === 'finance') {
            fetchFinanceData();
        }
        if (activeTab === 'logs') {
            fetchLogs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'analytics' || activeTab === 'overview') {
            fetchAnalytics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [snacks, totalUsersCount, activeTab]);

    const fetchPlans = async () => {
        try {
            const response = await api.get('/api/plans');
            setPlans(response.data || []);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Erreur chargement plans", error);
            }
        }
    };

    const fetchSnacks = async () => {
        setIsLoadingData(true);
        try {
            const response = await api.get('/api/super-admin/snacks');
            setSnacks(response.data || []);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Erreur chargement snacks", error);
            }
        } finally {
            setIsLoadingData(false);
        }
    };

    const fetchUsersCount = async () => {
        try {
            const response = await api.get('/api/super-admin/users/count');
            const count = Number(response?.data?.count || 0);
            setTotalUsersCount(Number.isNaN(count) ? 0 : count);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Erreur chargement compteur utilisateurs", error);
            }
        }
    };

    const fetchAllUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const response = await api.get('/api/super-admin/users');
            const usersData = response.data || [];
            setUsers(usersData);
            setTotalUsersCount(usersData.length);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Erreur chargement utilisateurs", error);
            }
            toast.error('Erreur lors du chargement des utilisateurs.');
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const deleteUser = async (userId, username) => {
        const confirmDelete = window.confirm(
            `⚠️ SUPPRESSION DÉFINITIVE !\n\n` +
            `Voulez-vous vraiment supprimer l'utilisateur "${username}" ?\n\n` +
            `Cette action est IRRÉVERSIBLE !`
        );
        if (!confirmDelete) return;

        try {
            await api.delete(`/api/super-admin/users/${userId}`);
            toast.success('Utilisateur supprimé avec succès.');
            fetchAllUsers();
            fetchUsersCount();
        } catch (error) {
            toast.error('Erreur lors de la suppression de l\'utilisateur.');
        }
    };
    
    // Fetch Analytics
    const fetchAnalytics = async () => {
        setIsLoadingAnalytics(true);
        try {
            // Calculer les statistiques depuis les données existantes
            const totalRevenue = snacks.reduce((sum, snack) => {
                if (snack.plan && snack.dateFinAbonnement && new Date(snack.dateFinAbonnement) > new Date()) {
                    return sum + (snack.plan.prixMensuel || 0);
                }
                return sum;
            }, 0);
            
            const activeSubscriptions = snacks.filter(s => 
                s.dateFinAbonnement && new Date(s.dateFinAbonnement) > new Date()
            ).length;
            
            const newRestaurantsThisMonth = snacks.filter(s => {
                // Approximation - vous pouvez ajouter une date de création dans le modèle
                return true; // Pour l'instant, on retourne tous
            }).length;
            
            setAnalytics({
                totalRevenue,
                activeSubscriptions,
                newRestaurantsThisMonth,
                totalUsers: totalUsersCount,
                totalRestaurants: snacks.length,
                growthRate: snacks.length > 0 ? ((newRestaurantsThisMonth / snacks.length) * 100).toFixed(1) : '0'
            });
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Erreur chargement analytics", error);
            }
        } finally {
            setIsLoadingAnalytics(false);
        }
    };
    
    // Fetch Finance Data
    const fetchFinanceData = async () => {
        setIsLoadingFinance(true);
        try {
            // Calculer les données financières
            const monthlyRevenue = snacks
                .filter(s => s.plan && s.dateFinAbonnement && new Date(s.dateFinAbonnement) > new Date())
                .reduce((sum, snack) => sum + (snack.plan.prixMensuel || 0), 0);
            
            const revenueByPlan = plans.map(plan => {
                const count = snacks.filter(s => 
                    s.plan?.id === plan.id && 
                    s.dateFinAbonnement && 
                    new Date(s.dateFinAbonnement) > new Date()
                ).length;
                return {
                    plan: plan.nom,
                    count,
                    revenue: count * (plan.prixMensuel || 0)
                };
            });
            
            setFinanceData({
                monthlyRevenue,
                revenueByPlan,
                totalSubscriptions: snacks.filter(s => 
                    s.dateFinAbonnement && new Date(s.dateFinAbonnement) > new Date()
                ).length
            });
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Erreur chargement finance", error);
            }
        } finally {
            setIsLoadingFinance(false);
        }
    };
    
    // Fetch Logs
    const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
            const response = await api.get('/api/logs');
            setLogs(response.data || []);
        } catch (error) {
            // Gérer les erreurs HTML (500 Tomcat)
            if (error.response) {
                const contentType = error.response.headers['content-type'] || '';
                if (contentType.includes('text/html')) {
                    toast.error('Erreur serveur : La table "log_entries" n\'existe peut-être pas. Contactez l\'administrateur.');
                }
            }
            if (process.env.NODE_ENV === 'development') {
                console.error("Erreur chargement logs", error);
            }
            setLogs([]); // Initialiser avec un tableau vide en cas d'erreur
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const handleExportLogs = async () => {
        try {
            const response = await api.get('/api/logs/export', {
                responseType: 'blob'
            });
            
            // Vérifier si la réponse est du HTML (erreur)
            if (response.data.type && response.data.type.includes('text/html')) {
                toast.error('Erreur serveur : Impossible d\'exporter les logs. La table "log_entries" n\'existe peut-être pas.');
                return;
            }
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `logs_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Logs exportés avec succès');
        } catch (error) {
            if (error.response) {
                const contentType = error.response.headers['content-type'] || '';
                if (contentType.includes('text/html')) {
                    toast.error('Erreur serveur : La table "log_entries" n\'existe peut-être pas. Contactez l\'administrateur.');
                } else {
                    toast.error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'export des logs');
                }
            } else {
                toast.error('Erreur lors de l\'export des logs');
            }
        }
    };

    // Filtrage des utilisateurs
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const term = searchTerm.toLowerCase();
        return users.filter(user => 
            user.username?.toLowerCase().includes(term) ||
            user.role?.toLowerCase().includes(term) ||
            user.snackNom?.toLowerCase().includes(term)
        );
    }, [users, searchTerm]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/api/super-admin/snacks', formData);
            toast.success(`Restaurant "${formData.nomRestaurant}" créé avec succès !`);
            fetchSnacks();
            setFormData({ nomRestaurant: '', adresse: '', usernameManager: '', passwordManager: '' });
            setIsCreateModalOpen(false);
        } catch (error) {
            // Erreur gérée par l'intercepteur
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (snackId) => {
        if (!window.confirm("Voulez-vous vraiment changer le statut (Actif/Suspendu) de ce restaurant ?")) return;
        
        try {
            await api.put(`/api/super-admin/snacks/${snackId}/status`);
            toast.success('Statut modifié avec succès');
            fetchSnacks();
        } catch (error) {
            // Erreur gérée par l'intercepteur
        }
    };

    const handleEdit = (snack) => {
        setSelectedSnack(snack);
        setEditFormData({ nom: snack.nom, adresse: snack.adresse || '' });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.put(`/api/super-admin/snacks/${selectedSnack.id}`, editFormData);
            toast.success('Restaurant modifié avec succès !');
            setIsEditModalOpen(false);
            setSelectedSnack(null);
            await fetchSnacks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la modification du restaurant.');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteSnack = async (snackId) => {
        const confirmDelete = window.confirm(
            "⚠️ SUPPRESSION DÉFINITIVE !\n\n" +
            "Voulez-vous vraiment effacer ce restaurant ET toutes ses données ?\n\n" +
            "Cette action est IRRÉVERSIBLE !"
        );
        if (!confirmDelete) return;

        try {
            await api.delete(`/api/super-admin/snacks/${snackId}`);
            toast.success('Restaurant supprimé définitivement.');
            fetchSnacks();
        } catch (error) {
            // Erreur gérée par l'intercepteur
        }
    };

    const resetManagerPassword = async (snackId) => {
        if (!window.confirm("Voulez-vous réinitialiser le mot de passe du manager de ce restaurant ?")) return;

        setIsLoading(true);
        try {
            const response = await api.post(`/api/super-admin/snacks/${snackId}/reset-manager-password`);
            setTempPassword(response.data);
            setIsPasswordModalOpen(true);
            toast.success('Mot de passe réinitialisé avec succès !');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Mot de passe copié dans le presse-papier !');
        } catch (error) {
            toast.error('Erreur lors de la copie.');
        }
    };

    const handleGérerAbonnement = (snack) => {
        setSelectedSnackForAbonnement(snack);
        setAbonnementFormData({
            planId: snack.plan?.id || '',
            dateFinAbonnement: snack.dateFinAbonnement || ''
        });
        setIsAbonnementModalOpen(true);
    };

    const handleAbonnementSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                planId: abonnementFormData.planId ? Number(abonnementFormData.planId) : null,
                dateFinAbonnement: abonnementFormData.dateFinAbonnement || null
            };
            await api.put(`/api/super-admin/snacks/${selectedSnackForAbonnement.id}/abonnement`, payload);
            toast.success('Abonnement mis à jour avec succès !');
            setIsAbonnementModalOpen(false);
            setSelectedSnackForAbonnement(null);
            fetchSnacks();
        } catch (error) {
            // Erreur gérée par l'intercepteur
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 lg:p-8 transition-all duration-500 relative">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold gradient-text tracking-tight mb-2">Vue d'ensemble</h1>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Gérez vos restaurants, utilisateurs et abonnements</p>
                    </div>
                    {activeTab === 'restaurants' && (
                        <motion.button
                            whileHover={{ scale: 1.08, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:shadow-purple-500/50 glow-hover transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="tracking-wide">Nouveau Restaurant</span>
                        </motion.button>
                    )}
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-2 border-b-2 border-slate-200/50 dark:border-slate-700/50 pb-1 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                        { id: 'restaurants', label: 'Restaurants', icon: Building2 },
                        { id: 'users', label: 'Utilisateurs', icon: Users, badge: totalUsersCount },
                        { id: 'plans', label: 'Plans', icon: Package },
                        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                        { id: 'finance', label: 'Finance', icon: DollarSign },
                        { id: 'logs', label: 'Logs', icon: Activity }
                    ].map((tab) => (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id === 'users' && users.length === 0) {
                                    fetchAllUsers();
                                }
                                if (tab.id === 'finance') {
                                    fetchFinanceData();
                                }
                                if (tab.id === 'logs') {
                                    fetchLogs();
                                }
                            }}
                            className={`px-6 py-3 font-bold transition-all duration-300 relative rounded-t-2xl whitespace-nowrap flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            {tab.badge !== undefined && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                                    {tab.badge}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-t-full"
                                    transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                                />
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* KPI CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KPICard 
                                title="Revenus Mensuels" 
                                value={`${analytics?.totalRevenue?.toFixed(2) || '0.00'} €`}
                                icon={DollarSign} 
                                color="bg-emerald-500" 
                            />
                            <KPICard 
                                title="Abonnements Actifs" 
                                value={analytics?.activeSubscriptions || 0}
                                icon={CreditCard} 
                                color="bg-blue-500" 
                            />
                            <KPICard 
                                title="Taux de Croissance" 
                                value={`${analytics?.growthRate || '0'}%`}
                                icon={TrendingUp} 
                                color="bg-purple-500" 
                            />
                            <KPICard 
                                title="Total Utilisateurs" 
                                value={analytics?.totalUsers || 0}
                                icon={Users} 
                                color="bg-orange-500" 
                            />
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="glass-strong rounded-3xl shadow-2xl p-6 border border-blue-200/60 dark:border-blue-500/30">
                            <h3 className="text-xl font-extrabold gradient-text mb-4">Actions Rapides</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab('restaurants')}
                                    className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Building2 className="w-6 h-6 mx-auto mb-2" />
                                    <span className="text-sm font-semibold">Nouveau Restaurant</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab('plans')}
                                    className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Package className="w-6 h-6 mx-auto mb-2" />
                                    <span className="text-sm font-semibold">Gérer Plans</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab('analytics')}
                                    className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                                >
                                    <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                                    <span className="text-sm font-semibold">Analytics</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab('logs')}
                                    className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Activity className="w-6 h-6 mx-auto mb-2" />
                                    <span className="text-sm font-semibold">Logs</span>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                )}

                {/* RESTAURANTS TAB */}
                {activeTab === 'restaurants' && (
                <div className="space-y-6">
                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {isLoadingData ? (
                        <>
                            {[...Array(4)].map((_, i) => (
                                <KPICardSkeleton key={i} />
                            ))}
                        </>
                    ) : (
                        <>
                            <KPICard 
                                title="Total Restaurants" 
                                value={kpis.total} 
                                icon={Building2} 
                                color="bg-blue-500" 
                            />
                            <KPICard 
                                title="Actifs" 
                                value={kpis.actifs} 
                                icon={Power} 
                                color="bg-emerald-500" 
                            />
                            <KPICard 
                                title="Suspendus" 
                                value={kpis.suspendus} 
                                icon={PowerOff} 
                                color="bg-rose-500" 
                            />
                            <KPICard 
                                title="Avec Abonnement" 
                                value={kpis.avecAbonnement} 
                                icon={CreditCard} 
                                color="bg-purple-500" 
                            />
                        </>
                    )}
                </div>

                {/* TABLE SECTION - Restaurants */}
                <div className="glass-strong rounded-3xl shadow-2xl border border-blue-200/60 dark:border-blue-500/30 overflow-hidden transition-all duration-500 hover:shadow-3xl">
                    {/* Table Header / Filters */}
                    <div className="p-6 border-b-2 border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-700/50">
                        <h2 className="text-2xl font-extrabold gradient-text tracking-tight">Liste des Restaurants</h2>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <input 
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Restaurant</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4">Plan & Abonnement</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {isLoadingData ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center">
                                            <div className="flex justify-center"><Spinner size="lg" /></div>
                                        </td>
                                    </tr>
                                ) : filteredSnacks.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                            Aucun restaurant trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSnacks.map((snack, index) => (
                                        <motion.tr 
                                            key={snack.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">{snack.nom}</div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {snack.adresse || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    snack.actif 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                        : 'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${snack.actif ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    {snack.actif ? 'Actif' : 'Suspendu'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    {snack.plan ? (
                                                        <div className="flex items-center gap-2 text-slate-900">
                                                            <Package className="w-4 h-4 text-slate-400" />
                                                            <span className="font-medium">{snack.plan.nom}</span>
                                                            <span className="text-slate-400">({snack.plan.prixMensuel}€)</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Aucun plan</span>
                                                    )}
                                                    {snack.dateFinAbonnement && (
                                                        <div className={`flex items-center gap-2 text-xs ${
                                                            new Date(snack.dateFinAbonnement) < new Date() ? 'text-rose-600' : 'text-emerald-600'
                                                        }`}>
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(snack.dateFinAbonnement).toLocaleDateString('fr-FR')}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <ActionButton 
                                                        icon={Edit2} 
                                                        label="Modifier" 
                                                        onClick={() => handleEdit(snack)} 
                                                        variant="ghost"
                                                    />
                                                    <ActionButton 
                                                        icon={Key} 
                                                        label="MDP" 
                                                        onClick={() => resetManagerPassword(snack.id)} 
                                                        variant="ghost"
                                                    />
                                                    <ActionButton 
                                                        icon={CreditCard} 
                                                        label="Abonnement" 
                                                        onClick={() => handleGérerAbonnement(snack)} 
                                                        variant="ghost"
                                                    />
                                                    <div className="w-px h-4 bg-slate-200 mx-1" />
                                                    <ActionButton 
                                                        icon={snack.actif ? PowerOff : Power} 
                                                        label={snack.actif ? 'Suspendre' : 'Activer'}
                                                        onClick={() => toggleStatus(snack.id)} 
                                                        variant={snack.actif ? 'warning' : 'success'}
                                                    />
                                                    <ActionButton 
                                                        icon={Trash2} 
                                                        label="Supprimer" 
                                                        onClick={() => deleteSnack(snack.id)} 
                                                        variant="danger"
                                                    />
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>
                )}

                {/* TABLE SECTION - Users */}
                {activeTab === 'users' && (
                <div className="glass-strong rounded-3xl shadow-2xl border border-blue-200/60 dark:border-blue-500/30 overflow-hidden transition-all duration-500 hover:shadow-3xl">
                    {/* Table Header / Filters */}
                    <div className="p-6 border-b-2 border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-700/50">
                        <h2 className="text-2xl font-extrabold gradient-text tracking-tight flex items-center gap-3">
                            <Users className="w-6 h-6" />
                            Liste des Utilisateurs ({totalUsersCount})
                        </h2>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <input 
                                type="text"
                                placeholder="Rechercher un utilisateur..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Utilisateur</th>
                                    <th className="px-6 py-4">Rôle</th>
                                    <th className="px-6 py-4">Restaurant</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {isLoadingUsers ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center">
                                            <div className="flex justify-center"><Spinner size="lg" /></div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                            <p>Aucun utilisateur trouvé</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <motion.tr 
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                        {user.username?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white">{user.username || 'N/A'}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">ID: {user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    user.role === 'ROLE_MANAGER' || user.role === 'MANAGER' || user.role === 'ROLE_SUPER_ADMIN' || user.role === 'SUPER_ADMIN'
                                                        ? user.role === 'ROLE_SUPER_ADMIN' || user.role === 'SUPER_ADMIN'
                                                            ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800'
                                                            : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800'
                                                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        user.role === 'ROLE_SUPER_ADMIN' || user.role === 'SUPER_ADMIN'
                                                            ? 'bg-yellow-500'
                                                            : user.role === 'ROLE_MANAGER' || user.role === 'MANAGER'
                                                            ? 'bg-purple-500'
                                                            : 'bg-blue-500'
                                                    }`} />
                                                    {user.role === 'ROLE_SUPER_ADMIN' || user.role === 'SUPER_ADMIN' 
                                                        ? 'Super Admin' 
                                                        : user.role === 'ROLE_MANAGER' || user.role === 'MANAGER'
                                                        ? 'Manager'
                                                        : 'Caissier'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                                    <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                                    <span className="font-medium">{user.snackNom || user.snack?.nom || 'N/A'}</span>
                                                </div>
                                                {user.snackId && (
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        ID: {user.snackId}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    user.actif !== false
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' 
                                                        : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.actif !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    {user.actif !== false ? 'Actif' : 'Désactivé'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <ActionButton 
                                                        icon={Trash2} 
                                                        label="Supprimer" 
                                                        onClick={() => deleteUser(user.id, user.username)} 
                                                        variant="danger"
                                                    />
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}

                {/* PLANS TAB */}
                {activeTab === 'plans' && (
                    <div className="glass-strong rounded-3xl shadow-2xl p-8 border border-blue-200/60 dark:border-blue-500/30">
                        <PlansManagement token={token} />
                    </div>
                )}

                {/* ANALYTICS TAB */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="glass-strong rounded-3xl shadow-2xl p-8 border border-blue-200/60 dark:border-blue-500/30">
                            <h2 className="text-2xl font-extrabold gradient-text tracking-tight mb-6">Analytics & Statistiques</h2>
                            {isLoadingAnalytics ? (
                                <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6">
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Revenus</h3>
                                        <div className="text-4xl font-extrabold gradient-text mb-2">
                                            {analytics?.totalRevenue?.toFixed(2) || '0.00'} €
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Revenus mensuels totaux</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6">
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Croissance</h3>
                                        <div className="text-4xl font-extrabold gradient-text mb-2">
                                            {analytics?.growthRate || '0'}%
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Taux de croissance mensuel</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* FINANCE TAB */}
                {activeTab === 'finance' && (
                    <div className="glass-strong rounded-3xl shadow-2xl p-8 border border-blue-200/60 dark:border-blue-500/30">
                        <h2 className="text-2xl font-extrabold gradient-text tracking-tight mb-6">Finance & Revenus</h2>
                        {isLoadingFinance ? (
                            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-emerald-100 mb-2">Revenus Mensuels</p>
                                            <p className="text-4xl font-extrabold">{financeData?.monthlyRevenue?.toFixed(2) || '0.00'} €</p>
                                        </div>
                                        <DollarSign className="w-12 h-12 opacity-80" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Revenus par Plan</h3>
                                    <div className="space-y-3">
                                        {financeData?.revenueByPlan?.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{item.plan}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.count} abonnements</p>
                                                </div>
                                                <p className="text-xl font-bold gradient-text">{item.revenue.toFixed(2)} €</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* LOGS TAB */}
                {activeTab === 'logs' && (
                    <div className="glass-strong rounded-3xl shadow-2xl p-8 border border-blue-200/60 dark:border-blue-500/30">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-extrabold gradient-text tracking-tight">Logs & Audit Trail</h2>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleExportLogs}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl"
                            >
                                <Download className="w-4 h-4" />
                                Exporter les logs
                            </motion.button>
                        </div>
                        {isLoadingLogs ? (
                            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                        ) : (
                            <div className="space-y-3">
                                {logs.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                        <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <p>Aucun log disponible</p>
                                    </div>
                                ) : (
                                    logs.map((log) => (
                                        <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    log.level === 'ERROR' ? 'bg-red-100 dark:bg-red-900/30' :
                                                    log.level === 'WARN' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                                    'bg-blue-100 dark:bg-blue-900/30'
                                                }`}>
                                                    <Activity className={`w-5 h-5 ${
                                                        log.level === 'ERROR' ? 'text-red-600 dark:text-red-400' :
                                                        log.level === 'WARN' ? 'text-yellow-600 dark:text-yellow-400' :
                                                        'text-blue-600 dark:text-blue-400'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{log.message}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {log.category} • {log.username || 'System'} • {log.snackId ? `Snack #${log.snackId}` : 'Global'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">
                                                    {log.level}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {log.timestamp ? new Date(log.timestamp).toLocaleString('fr-FR') : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODALE DE CRÉATION */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <Modal title="Nouveau Client" onClose={() => setIsCreateModalOpen(false)}>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom du Restaurant</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Tacos King"
                                        value={formData.nomRestaurant}
                                        onChange={e => setFormData({...formData, nomRestaurant: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 12 Rue de la Paix"
                                        value={formData.adresse}
                                        onChange={e => setFormData({...formData, adresse: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-blue-600" />
                                    Compte Manager
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Identifiant</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: manager_tacos"
                                            value={formData.usernameManager}
                                            onChange={e => setFormData({...formData, usernameManager: e.target.value})}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Mot de passe</label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••"
                                            value={formData.passwordManager}
                                            onChange={e => setFormData({...formData, passwordManager: e.target.value})}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? 'Création...' : 'Créer le Restaurant'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            {/* AUTRES MODALES (Edit, Password, Abonnement) - Similaires à avant mais stylisées */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <Modal title="Modifier le Restaurant" onClose={() => setIsEditModalOpen(false)}>
                         <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                                <input
                                    type="text"
                                    required
                                    value={editFormData.nom}
                                    onChange={e => setEditFormData({...editFormData, nom: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                                <input
                                    type="text"
                                    value={editFormData.adresse}
                                    onChange={e => setEditFormData({...editFormData, adresse: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">Annuler</button>
                                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">Sauvegarder</button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isPasswordModalOpen && (
                    <Modal title="Mot de Passe Manager" onClose={() => setIsPasswordModalOpen(false)}>
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                                <code className="text-xl font-mono font-bold text-slate-900">{tempPassword}</code>
                            </div>
                            <button 
                                onClick={() => copyToClipboard(tempPassword)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <Copy className="w-4 h-4" /> Copier
                            </button>
                            <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
                                ⚠️ À communiquer immédiatement. Le manager devra le changer.
                            </p>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isAbonnementModalOpen && (
                    <Modal title="Gérer l'Abonnement" onClose={() => setIsAbonnementModalOpen(false)}>
                        <form onSubmit={handleAbonnementSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                                <select
                                    value={abonnementFormData.planId}
                                    onChange={e => setAbonnementFormData({...abonnementFormData, planId: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Sélectionner...</option>
                                    {plans.map(p => <option key={p.id} value={p.id}>{p.nom} - {p.prixMensuel}€</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date fin</label>
                                <input
                                    type="date"
                                    value={abonnementFormData.dateFinAbonnement}
                                    onChange={e => setAbonnementFormData({...abonnementFormData, dateFinAbonnement: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsAbonnementModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">Annuler</button>
                                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">Sauvegarder</button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
});

// --- Composants UI Réutilisables ---

const KPICard = ({ title, value, icon: Icon, color }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className="glass-strong p-6 rounded-3xl shadow-2xl border border-blue-200/60 dark:border-blue-500/30 flex items-center justify-between transition-all duration-500 hover:shadow-3xl glow-hover group relative overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">{title}</p>
            <p className="text-3xl font-extrabold gradient-text mt-1">{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-2xl relative z-10 group-hover:scale-110 transition-transform`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
            <Icon className="w-7 h-7 relative z-10 drop-shadow-lg" />
        </div>
    </motion.div>
);

const ActionButton = ({ icon: Icon, onClick, variant = 'ghost', label }) => {
    const variants = {
        ghost: "text-slate-400 hover:text-blue-600 hover:bg-blue-50",
        danger: "text-slate-400 hover:text-rose-600 hover:bg-rose-50",
        success: "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50",
        warning: "text-slate-400 hover:text-orange-600 hover:bg-orange-50",
    };

    return (
        <button 
            onClick={onClick} 
            className={`p-1.5 rounded-lg transition-colors ${variants[variant]}`}
            title={label}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
};

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
            className="glass-strong rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transition-all duration-500 border border-blue-200/60 dark:border-blue-500/30"
        >
            <div className="flex items-center justify-between p-6 border-b-2 border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-700/50">
                <h3 className="text-xl font-extrabold gradient-text tracking-tight">{title}</h3>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-4">
                {children}
            </div>
        </motion.div>
    </div>
);

SuperAdminDashboard.displayName = 'SuperAdminDashboard';

export default SuperAdminDashboard;
