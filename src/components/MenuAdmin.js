import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Package, XCircle, AlertTriangle, Box, X } from 'lucide-react';
import { toast } from 'sonner';
import api, { setSnackId } from '../services/api';

const MenuAdmin = ({ products, token, snackId, onRefresh }) => {
    const [formData, setFormData] = useState({ nom: '', prix: '', categorie: 'Burgers', stock: null });
    const [isEditing, setIsEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('TOUT');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const categoriesList = ["Burgers", "Tacos", "Boissons", "Frites", "Desserts", "Menus", "Divers"];

    useEffect(() => {
        if (snackId) {
            setSnackId(snackId);
        }
    }, [snackId]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'TOUT' || product.categorie === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, categoryFilter]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEditing) {
                await api.put(`/api/produits/${isEditing}`, formData, {
                    headers: { 'X-Snack-ID': snackId.toString() }
                });
                toast.success('Produit modifié avec succès');
            } else {
                await api.post('/api/produits', formData, {
                    headers: { 'X-Snack-ID': snackId.toString() }
                });
                toast.success('Produit ajouté au menu');
            }
            onRefresh();
            setFormData({ nom: '', prix: '', categorie: 'Burgers', stock: null });
            setIsEditing(null);
            setIsModalOpen(false);
        } catch (error) {
            // Erreur gérée par l'intercepteur
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDispo = async (produit) => {
        try {
            await api.put(`/api/produits/${produit.id}/dispo`, {}, {
                headers: { 'X-Snack-ID': snackId.toString() }
            });
            toast.success(`Produit ${produit.disponible ? 'désactivé' : 'activé'}`);
            onRefresh();
        } catch (error) {
            // Erreur gérée par l'intercepteur
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer définitivement ce produit ?")) return;
        try {
            await api.delete(`/api/produits/${id}`, {
                headers: { 'X-Snack-ID': snackId.toString() }
            });
            toast.success('Produit supprimé');
            onRefresh();
        } catch (error) {
            // Erreur gérée par l'intercepteur
        }
    };

    const handleEditClick = (product) => {
        setFormData({ nom: product.nom, prix: product.prix, categorie: product.categorie, stock: product.stock ?? null });
        setIsEditing(product.id);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setFormData({ nom: '', prix: '', categorie: 'Burgers', stock: null });
        setIsEditing(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(null);
        setFormData({ nom: '', prix: '', categorie: 'Burgers', stock: null });
    };

    return (
        <div className="space-y-6">
            {/* HEADER avec bouton Ajouter */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gestion du Menu</h2>
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-semibold">
                        {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                    </span>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddClick}
                    className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Ajouter un Produit</span>
                </motion.button>
            </div>

            {/* DATA GRID */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
                {/* FILTRES */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                placeholder="Rechercher un produit..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        >
                            <option value="TOUT">Toutes les catégories</option>
                            {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* TABLEAU - Data Grid */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-100 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Nom</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Prix</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Catégorie</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p className="text-sm">Aucun produit trouvé.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((p, index) => (
                                        <motion.tr
                                            key={p.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.02 }}
                                            className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                                                !p.disponible ? 'opacity-60' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => toggleDispo(p)}
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                                        p.disponible
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50'
                                                    }`}
                                                    title="Changer la disponibilité"
                                                >
                                                    {p.disponible ? 'Actif' : 'Suspendu'}
                                                </motion.button>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{p.nom}</td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{p.prix.toFixed(2)} €</td>
                                            <td className="px-4 py-3">
                                                {p.stock !== null && p.stock !== undefined ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            p.stock === 0
                                                                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                                                                : p.stock <= 5
                                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                        }`}>
                                                            {p.stock}
                                                        </span>
                                                        {p.stock <= 5 && p.stock > 0 && (
                                                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" title="Stock faible" />
                                                        )}
                                                        {p.stock === 0 && (
                                                            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" title="Rupture de stock" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">Illimité</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold">
                                                    {p.categorie}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleEditClick(p)}
                                                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* MODALE FORMULAIRE */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        {isEditing ? <Edit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                            {isEditing ? 'Modifier le Produit' : 'Ajouter un Produit'}
                                        </h3>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleCloseModal}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        aria-label="Fermer"
                                    >
                                        <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                    </motion.button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nom</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Maxi Burger"
                                            required
                                            value={formData.nom}
                                            onChange={e => setFormData({...formData, nom: e.target.value})}
                                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prix (€)</label>
                                            <input
                                                type="number"
                                                step="0.10"
                                                placeholder="0.00"
                                                required
                                                value={formData.prix}
                                                onChange={e => setFormData({...formData, prix: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Catégorie</label>
                                            <select
                                                value={formData.categorie}
                                                onChange={e => setFormData({...formData, categorie: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                            >
                                                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                            <Box className="w-4 h-4" />
                                            Stock (optionnel)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="Laisser vide pour illimité"
                                            value={formData.stock ?? ''}
                                            onChange={e => setFormData({...formData, stock: e.target.value ? parseInt(e.target.value) : null})}
                                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                        />
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Laisser vide si le stock n'est pas suivi</p>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <motion.button
                                            type="submit"
                                            disabled={isLoading}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-1 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-xl disabled:opacity-50 transition-colors"
                                        >
                                            {isLoading ? 'Enregistrement...' : isEditing ? 'Sauvegarder' : 'Ajouter au Menu'}
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleCloseModal}
                                            className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            Annuler
                                        </motion.button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MenuAdmin;
