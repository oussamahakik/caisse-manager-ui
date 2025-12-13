import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Tag } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { t } from '../i18n';

const PromotionsManager = memo(({ token, snackId }) => {
    const [promotions, setPromotions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        typePromotion: 'POURCENTAGE',
        valeur: '',
        dateDebut: '',
        dateFin: '',
        codePromo: '',
        actif: true,
        produitId: '',
        categorie: '',
        nombreUtilisationsMax: ''
    });

    const fetchPromotions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/promotions', {
                headers: { 'X-Snack-ID': snackId?.toString() }
            });
            setPromotions(response.data || []);
        } catch (error) {
            toast.error('Erreur lors du chargement des promotions');
        } finally {
            setIsLoading(false);
        }
    }, [snackId]);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const handleCreate = () => {
        setIsEditMode(false);
        setSelectedPromotion(null);
        setFormData({
            nom: '',
            description: '',
            typePromotion: 'POURCENTAGE',
            valeur: '',
            dateDebut: '',
            dateFin: '',
            codePromo: '',
            actif: true,
            produitId: '',
            categorie: '',
            nombreUtilisationsMax: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (promotion) => {
        setIsEditMode(true);
        setSelectedPromotion(promotion);
        setFormData({
            nom: promotion.nom || '',
            description: promotion.description || '',
            typePromotion: promotion.typePromotion || 'POURCENTAGE',
            valeur: promotion.valeur || '',
            dateDebut: promotion.dateDebut || '',
            dateFin: promotion.dateFin || '',
            codePromo: promotion.codePromo || '',
            actif: promotion.actif !== undefined ? promotion.actif : true,
            produitId: promotion.produitId || '',
            categorie: promotion.categorie || '',
            nombreUtilisationsMax: promotion.nombreUtilisationsMax || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                valeur: parseFloat(formData.valeur) || 0,
                produitId: formData.produitId ? parseInt(formData.produitId) : null,
                nombreUtilisationsMax: formData.nombreUtilisationsMax ? parseInt(formData.nombreUtilisationsMax) : null,
                snackId: snackId
            };

            if (isEditMode) {
                await api.put(`/api/promotions/${selectedPromotion.id}`, payload);
                toast.success('Promotion modifiée avec succès');
            } else {
                await api.post('/api/promotions', payload, {
                    headers: { 'X-Snack-ID': snackId?.toString() }
                });
                toast.success('Promotion créée avec succès');
            }
            setIsModalOpen(false);
            fetchPromotions();
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement de la promotion');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) return;
        try {
            await api.delete(`/api/promotions/${id}`);
            toast.success('Promotion supprimée avec succès');
            fetchPromotions();
        } catch (error) {
            toast.error('Erreur lors de la suppression de la promotion');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold gradient-text">{t('promotions.title')}</h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    {t('promotions.create')}
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promotions.map((promotion) => (
                    <motion.div
                        key={promotion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-strong rounded-2xl p-6 border border-blue-200/50 dark:border-blue-500/30"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <Tag className="w-5 h-5 text-purple-600" />
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{promotion.nom}</h3>
                            </div>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleEdit(promotion)}
                                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg"
                                >
                                    <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDelete(promotion.id)}
                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </motion.button>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                            {promotion.typePromotion === 'POURCENTAGE' 
                                ? `${promotion.valeur}%` 
                                : `${promotion.valeur}€`}
                        </p>
                        {promotion.description && (
                            <p className="text-slate-600 dark:text-slate-400 mb-4">{promotion.description}</p>
                        )}
                        <div className="space-y-2 text-sm">
                            <p className="text-slate-600 dark:text-slate-400">
                                Du {promotion.dateDebut ? new Date(promotion.dateDebut).toLocaleDateString('fr-FR') : 'N/A'} au {promotion.dateFin ? new Date(promotion.dateFin).toLocaleDateString('fr-FR') : 'N/A'}
                            </p>
                            {promotion.codePromo && (
                                <p className="font-semibold text-blue-600 dark:text-blue-400">
                                    Code: {promotion.codePromo}
                                </p>
                            )}
                            <p className={`font-semibold ${promotion.actif ? 'text-green-600' : 'text-red-600'}`}>
                                {promotion.actif ? 'Actif' : 'Inactif'}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-strong rounded-3xl p-6 max-w-2xl w-full border border-blue-200/50 dark:border-blue-500/30 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold gradient-text">
                                    {isEditMode ? t('promotions.edit') : t('promotions.create')}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('promotions.name')}</label>
                                        <input
                                            type="text"
                                            value={formData.nom}
                                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('promotions.type')}</label>
                                        <select
                                            value={formData.typePromotion}
                                            onChange={(e) => setFormData({ ...formData, typePromotion: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        >
                                            <option value="POURCENTAGE">Pourcentage</option>
                                            <option value="MONTANT_FIXE">Montant fixe</option>
                                            <option value="CODE_PROMO">Code promo</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t('promotions.description')}</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        rows="3"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('promotions.value')}</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.valeur}
                                            onChange={(e) => setFormData({ ...formData, valeur: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('promotions.code')}</label>
                                        <input
                                            type="text"
                                            value={formData.codePromo}
                                            onChange={(e) => setFormData({ ...formData, codePromo: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('promotions.startDate')}</label>
                                        <input
                                            type="date"
                                            value={formData.dateDebut}
                                            onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('promotions.endDate')}</label>
                                        <input
                                            type="date"
                                            value={formData.dateFin}
                                            onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('promotions.product')} ID</label>
                                        <input
                                            type="number"
                                            value={formData.produitId}
                                            onChange={(e) => setFormData({ ...formData, produitId: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                            placeholder="Laisser vide pour promotion globale"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('promotions.category')}</label>
                                        <input
                                            type="text"
                                            value={formData.categorie}
                                            onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                            placeholder="Ex: BURGER, TACOS"
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
                                    <label className="text-sm font-medium">{t('promotions.active')}</label>
                                </div>
                                <div className="flex gap-2">
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg"
                                    >
                                        <Save className="w-4 h-4" />
                                        {t('common.save')}
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                                    >
                                        {t('common.cancel')}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

PromotionsManager.displayName = 'PromotionsManager';

export default PromotionsManager;

