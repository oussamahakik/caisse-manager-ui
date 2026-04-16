import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Salad, CheckCircle2, XCircle, Coins } from 'lucide-react';
import { toast } from 'sonner';
import api, { setSnackId } from '../services/api';
import Input from './common/Input/Input';
import Button from './common/Button/Button';

const IngredientsAdmin = memo(({ ingredients, token, snackId, onRefresh }) => {
    const [formData, setFormData] = useState({ nom: '', type: 'VIANDE', prixSupplement: 0.0 });
    const [isLoading, setIsLoading] = useState(false);
    
    const typesList = ["VIANDE", "SAUCE", "SUPPLEMENT"];

    useEffect(() => {
        if (snackId) {
            setSnackId(snackId);
        }
    }, [snackId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Normaliser le nom pour la vérification (trim et lowercase)
        const nomNormalise = formData.nom.trim().toLowerCase();
        
        if (!nomNormalise) {
            toast.error("Le nom de l'ingrédient ne peut pas être vide");
            return;
        }
        
        // Vérifier les doublons (comparaison insensible à la casse)
        const doublon = ingredients.find(ing => 
            ing.nom.trim().toLowerCase() === nomNormalise
        );
        
        if (doublon) {
            toast.error(`Un ingrédient avec le nom "${doublon.nom}" existe déjà. Veuillez choisir un autre nom.`);
            return;
        }
        
        if (formData.type === 'SUPPLEMENT' && formData.prixSupplement < 0) {
            toast.error("Le prix ne peut pas être négatif");
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/api/ingredients', formData, {
                headers: { 'X-Snack-ID': snackId.toString() }
            });
            toast.success('Ingrédient ajouté avec succès');
            onRefresh();
            setFormData({ nom: '', type: 'VIANDE', prixSupplement: 0.0 });
        } catch (error) {
            // Erreur gérée par l'intercepteur
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDispo = async (ing) => {
        try {
            await api.put(`/api/ingredients/${ing.id}/dispo`, {}, {
                headers: { 'X-Snack-ID': snackId.toString() }
            });
            toast.success(`Ingrédient ${ing.disponible ? 'désactivé' : 'activé'}`);
            onRefresh();
        } catch (error) {
            // Erreur gérée par l'intercepteur
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cet ingrédient ?")) return;
        try {
            await api.delete(`/api/ingredients/${id}`, {
                headers: { 'X-Snack-ID': snackId.toString() }
            });
            toast.success('Ingrédient supprimé');
            onRefresh();
        } catch (error) {
            // Erreur gérée par l'intercepteur
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FORMULAIRE */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.01 }}
                className="glass-strong rounded-3xl shadow-2xl p-8 transition-all duration-500 border border-blue-200/60 dark:border-blue-500/30 hover:shadow-3xl"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-xl">
                        <Salad className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                    <h3 className="text-2xl font-extrabold gradient-text tracking-tight">Nouvel Ingrédient</h3>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nom"
                        type="text"
                        placeholder="Ex: Cheddar"
                        required
                        value={formData.nom}
                        onChange={e => setFormData({...formData, nom: e.target.value})}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => {
                                    const newType = e.target.value;
                                    setFormData({
                                        ...formData,
                                        type: newType,
                                        prixSupplement: newType === 'SUPPLEMENT' ? formData.prixSupplement : 0.0
                                    });
                                }}
                                className="form-select"
                            >
                                {typesList.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <Input
                            label={
                                <>
                                    Prix Vente (€)
                                    {formData.type === 'SUPPLEMENT' && (
                                        <span className="text-xs text-slate-500 ml-1">(requis)</span>
                                    )}
                                </>
                            }
                            type="number"
                            step="0.10"
                            min="0"
                            placeholder="0.00"
                            value={formData.prixSupplement}
                            onChange={e => setFormData({...formData, prixSupplement: parseFloat(e.target.value) || 0})}
                            disabled={formData.type !== 'SUPPLEMENT'}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        loading={isLoading}
                        className="w-full"
                    >
                        <Salad className="w-4 h-4 mr-2" />
                        Ajouter l'ingrédient
                    </Button>
                </form>
            </motion.div>

            {/* LISTE DES INGRÉDIENTS */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.01 }}
                className="glass-strong rounded-3xl shadow-2xl p-8 transition-all duration-500 border border-blue-200/60 dark:border-blue-500/30 hover:shadow-3xl"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-xl">
                            <Salad className="w-6 h-6 text-white drop-shadow-lg" />
                        </div>
                        <h3 className="text-2xl font-extrabold gradient-text tracking-tight">Stock</h3>
                    </div>
                    <motion.span 
                        whileHover={{ scale: 1.1 }}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-sm font-bold shadow-xl"
                    >
                        {ingredients.length} ingrédient{ingredients.length > 1 ? 's' : ''}
                    </motion.span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">État</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Nom</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Prix</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            <AnimatePresence mode="popLayout">
                                {ingredients.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                                            Aucun ingrédient enregistré.
                                        </td>
                                    </tr>
                                ) : (
                                    ingredients.map((ing, index) => (
                                        <motion.tr
                                            key={ing.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.02 }}
                                            className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                                                !ing.disponible ? 'opacity-60' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => toggleDispo(ing)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        ing.disponible
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                                                            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50'
                                                    }`}
                                                    title="Changer la disponibilité"
                                                >
                                                    {ing.disponible ? (
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5" />
                                                    )}
                                                </motion.button>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{ing.nom}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                                                    {ing.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {ing.prixSupplement > 0 ? (
                                                    <span className="flex items-center gap-1 font-bold text-emerald-600">
                                                        <Coins className="w-4 h-4" />
                                                        +{ing.prixSupplement.toFixed(2)}€
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">Gratuit</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDelete(ing.id)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
});

IngredientsAdmin.displayName = 'IngredientsAdmin';

export default IngredientsAdmin;
