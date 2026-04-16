import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { t } from '../i18n';
import Modal from './common/Modal/Modal';

const PlansManagement = memo(({ token }) => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        prixMensuel: '',
        description: '',
        nombreRestaurantsMax: '',
        nombreUtilisateursMax: '',
        actif: true
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/plans');
            setPlans(response.data || []);
        } catch (error) {
            toast.error('Erreur lors du chargement des plans');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setIsEditMode(false);
        setSelectedPlan(null);
        setFormData({
            nom: '',
            prixMensuel: '',
            description: '',
            nombreRestaurantsMax: '',
            nombreUtilisateursMax: '',
            actif: true
        });
        setIsModalOpen(true);
    };

    const handleEdit = (plan) => {
        setIsEditMode(true);
        setSelectedPlan(plan);
        setFormData({
            nom: plan.nom || '',
            prixMensuel: plan.prixMensuel || '',
            description: plan.description || '',
            nombreRestaurantsMax: plan.nombreRestaurantsMax || '',
            nombreUtilisateursMax: plan.nombreUtilisateursMax || '',
            actif: plan.actif !== undefined ? plan.actif : true
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nom: formData.nom.trim(),
                prixMensuel: parseFloat(formData.prixMensuel) || 0,
                description: formData.description || null,
                nombreRestaurantsMax: formData.nombreRestaurantsMax ? parseInt(formData.nombreRestaurantsMax) : null,
                nombreUtilisateursMax: formData.nombreUtilisateursMax ? parseInt(formData.nombreUtilisateursMax) : null,
                actif: formData.actif !== undefined ? formData.actif : true
            };

            if (isEditMode) {
                await api.put(`/api/plans/${selectedPlan.id}`, payload);
                toast.success('Plan modifié avec succès');
            } else {
                await api.post('/api/plans', payload);
                toast.success('Plan créé avec succès');
            }
            setIsModalOpen(false);
            fetchPlans();
        } catch (error) {
            // Gérer les erreurs HTML (500 Tomcat)
            if (error.response) {
                const contentType = error.response.headers['content-type'] || '';
                if (contentType.includes('text/html')) {
                    toast.error('Erreur serveur : La table "plans" n\'existe peut-être pas dans la base de données. Contactez l\'administrateur.');
                } else {
                    const errorData = error.response.data;
                    const errorMessage = errorData?.error || errorData?.message || 'Erreur lors de l\'enregistrement du plan';
                    toast.error(errorMessage);
                }
            } else if (error.request) {
                toast.error('Erreur de connexion au serveur. Vérifiez que le serveur est démarré.');
            } else {
                toast.error('Erreur lors de l\'enregistrement du plan');
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) return;
        try {
            await api.delete(`/api/plans/${id}`);
            toast.success('Plan supprimé avec succès');
            fetchPlans();
        } catch (error) {
            toast.error('Erreur lors de la suppression du plan');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-slate-600 dark:text-slate-400">Chargement des plans...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold gradient-text">{t('plans.title')}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Gérez vos plans d'abonnement
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                    <Plus className="w-5 h-5" />
                    {t('plans.create')}
                </motion.button>
            </div>

            {plans.length === 0 ? (
                <div className="glass-strong rounded-2xl p-12 border border-blue-200/50 dark:border-blue-500/30 text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        Aucun plan créé
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Commencez par créer votre premier plan d'abonnement
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreate}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg font-semibold"
                    >
                        Créer un plan
                    </motion.button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-strong rounded-2xl p-6 border border-blue-200/50 dark:border-blue-500/30"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{plan.nom}</h3>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleEdit(plan)}
                                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg"
                                >
                                    <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDelete(plan.id)}
                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </motion.button>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            {plan.prixMensuel?.toFixed(2)} €/mois
                        </p>
                        {plan.description && (
                            <p className="text-slate-600 dark:text-slate-400 mb-4">{plan.description}</p>
                        )}
                        <div className="space-y-2 text-sm">
                            {plan.nombreRestaurantsMax && (
                                <p className="text-slate-600 dark:text-slate-400">
                                    Max restaurants: {plan.nombreRestaurantsMax}
                                </p>
                            )}
                            {plan.nombreUtilisateursMax && (
                                <p className="text-slate-600 dark:text-slate-400">
                                    Max utilisateurs: {plan.nombreUtilisateursMax}
                                </p>
                            )}
                            <p className={`font-semibold ${plan.actif ? 'text-green-600' : 'text-red-600'}`}>
                                {plan.actif ? 'Actif' : 'Inactif'}
                            </p>
                        </div>
                    </motion.div>
                ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? t('plans.edit') : t('plans.create')}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">{t('plans.name')}</label>
                        <input
                            type="text"
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">{t('plans.price')}</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.prixMensuel}
                            onChange={(e) => setFormData({ ...formData, prixMensuel: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">{t('plans.description')}</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="form-textarea"
                            rows="3"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">{t('plans.maxRestaurants')}</label>
                            <input
                                type="number"
                                value={formData.nombreRestaurantsMax}
                                onChange={(e) => setFormData({ ...formData, nombreRestaurantsMax: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="form-label">{t('plans.maxUsers')}</label>
                            <input
                                type="number"
                                value={formData.nombreUtilisateursMax}
                                onChange={(e) => setFormData({ ...formData, nombreUtilisateursMax: e.target.value })}
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.actif}
                            onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <label className="text-sm font-medium">{t('plans.active')}</label>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {t('common.save')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn-secondary"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
});

PlansManagement.displayName = 'PlansManagement';

export default PlansManagement;
