import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Package, CheckCircle2, XCircle, AlertTriangle, Box } from 'lucide-react';
import { toast } from 'sonner';
import api, { setSnackId } from '../services/api';

const MenuAdmin = ({ products, token, snackId, onRefresh }) => {
    const [formData, setFormData] = useState({ nom: '', prix: '', categorie: 'Burgers', stock: null });
    const [isEditing, setIsEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('TOUT');
    const [isLoading, setIsLoading] = useState(false);

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
    };

    return (
        <div className="space-y-6">
            {/* FORMULAIRE */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <div className="flex items-center gap-2 mb-4">
                    {isEditing ? <Edit2 className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-emerald-600" />}
                    <h3 className="text-xl font-bold text-slate-900">
                        {isEditing ? 'Modifier' : 'Ajouter un Produit'}
                    </h3>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                        <input
                            type="text"
                            placeholder="Ex: Maxi Burger"
                            required
                            value={formData.nom}
                            onChange={e => setFormData({...formData, nom: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Prix</label>
                            <input
                                type="number"
                                step="0.10"
                                placeholder="€"
                                required
                                value={formData.prix}
                                onChange={e => setFormData({...formData, prix: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                            <select
                                value={formData.categorie}
                                onChange={e => setFormData({...formData, categorie: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
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
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">Laisser vide si le stock n'est pas suivi</p>
                    </div>
                    <div className="flex gap-3">
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? 'Enregistrement...' : isEditing ? 'Sauvegarder' : 'Ajouter au Menu'}
                        </motion.button>
                        {isEditing && (
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {setIsEditing(null); setFormData({ nom: '', prix: '', categorie: 'Burgers', stock: null })}}
                                className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Annuler
                            </motion.button>
                        )}
                    </div>
                </form>
            </motion.div>

            {/* LISTE DES PRODUITS */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xl font-bold text-slate-900">Mon Menu ({filteredProducts.length})</h3>
                    </div>
                </div>

                {/* FILTRES */}
                <div className="flex gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="TOUT">Toutes les catégories</option>
                        {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* TABLEAU */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Dispo</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nom</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Prix</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Catégorie</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                                            Aucun produit trouvé.
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
                                            className={`hover:bg-slate-50 transition-colors ${
                                                !p.disponible ? 'opacity-60' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => toggleDispo(p)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        p.disponible
                                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                                    }`}
                                                    title="Changer la disponibilité"
                                                >
                                                    {p.disponible ? (
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5" />
                                                    )}
                                                </motion.button>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-900">{p.nom}</td>
                                            <td className="px-4 py-3 text-slate-700">{p.prix.toFixed(2)} €</td>
                                            <td className="px-4 py-3">
                                                {p.stock !== null && p.stock !== undefined ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            p.stock === 0
                                                                ? 'bg-rose-100 text-rose-700'
                                                                : p.stock <= 5
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                            {p.stock}
                                                        </span>
                                                        {p.stock <= 5 && p.stock > 0 && (
                                                            <AlertTriangle className="w-4 h-4 text-amber-600" title="Stock faible" />
                                                        )}
                                                        {p.stock === 0 && (
                                                            <XCircle className="w-4 h-4 text-rose-600" title="Rupture de stock" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Illimité</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                                                    {p.categorie}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleEditClick(p)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
        </div>
    );
};

export default MenuAdmin;
