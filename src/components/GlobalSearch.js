import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package, ShoppingCart, Clock } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

const GlobalSearch = ({ products = [], orders = [], onProductSelect, onOrderSelect, isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Raccourci clavier Ctrl+K pour ouvrir la recherche
    useHotkeys('ctrl+k', (e) => {
        e.preventDefault();
        if (!isOpen) {
            // Simuler l'ouverture (nécessite un état parent)
        }
    }, { enabled: true });

    const filteredResults = useMemo(() => {
        if (!searchTerm.trim()) return { products: [], orders: [] };

        const term = searchTerm.toLowerCase();
        const filteredProducts = products.filter(p => 
            p.nom?.toLowerCase().includes(term) ||
            p.categorie?.toLowerCase().includes(term)
        ).slice(0, 5);

        const filteredOrders = orders.filter(o => 
            o.id?.toString().includes(term) ||
            o.typePaiement?.toLowerCase().includes(term)
        ).slice(0, 5);

        return { products: filteredProducts, orders: filteredOrders };
    }, [searchTerm, products, orders]);

    const handleProductClick = useCallback((product) => {
        if (onProductSelect) {
            onProductSelect(product);
        }
        setSearchTerm('');
        onClose();
    }, [onProductSelect, onClose]);

    const handleOrderClick = useCallback((order) => {
        if (onOrderSelect) {
            onOrderSelect(order);
        }
        setSearchTerm('');
        onClose();
    }, [onOrderSelect, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-start justify-center pt-20"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: -20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4"
                >
                    {/* Barre de recherche */}
                    <div className="flex items-center gap-3 p-4 border-b border-slate-200">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un produit, une commande... (Ctrl+K)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 outline-none text-lg"
                            autoFocus
                        />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </motion.button>
                    </div>

                    {/* Résultats */}
                    <div className="max-h-96 overflow-y-auto">
                        {searchTerm.trim() && (
                            <>
                                {/* Produits */}
                                {filteredResults.products.length > 0 && (
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-3">
                                            <Package className="w-4 h-4" />
                                            Produits ({filteredResults.products.length})
                                        </div>
                                        <div className="space-y-2">
                                            {filteredResults.products.map((product) => (
                                                <motion.button
                                                    key={product.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleProductClick(product)}
                                                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors text-left"
                                                >
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{product.nom}</div>
                                                        <div className="text-sm text-slate-500">{product.categorie}</div>
                                                    </div>
                                                    <div className="font-bold text-emerald-600">
                                                        {product.prix?.toFixed(2)} €
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Commandes */}
                                {filteredResults.orders.length > 0 && (
                                    <div className="p-4 border-t border-slate-200">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-3">
                                            <ShoppingCart className="w-4 h-4" />
                                            Commandes ({filteredResults.orders.length})
                                        </div>
                                        <div className="space-y-2">
                                            {filteredResults.orders.map((order) => (
                                                <motion.button
                                                    key={order.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleOrderClick(order)}
                                                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        <div>
                                                            <div className="font-semibold text-slate-900">
                                                                Commande #{order.id}
                                                            </div>
                                                            <div className="text-sm text-slate-500">
                                                                {new Date(order.date).toLocaleString('fr-FR')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-blue-600">
                                                        {order.total?.toFixed(2)} €
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Aucun résultat */}
                                {filteredResults.products.length === 0 && filteredResults.orders.length === 0 && (
                                    <div className="p-12 text-center text-slate-400">
                                        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Aucun résultat trouvé pour "{searchTerm}"</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* État initial */}
                        {!searchTerm.trim() && (
                            <div className="p-12 text-center text-slate-400">
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="mb-2">Recherche rapide</p>
                                <p className="text-sm">Tapez pour rechercher des produits ou des commandes</p>
                                <p className="text-xs mt-4 text-slate-300">Appuyez sur Ctrl+K pour ouvrir rapidement</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GlobalSearch;

