import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Search, Tag } from 'lucide-react';
import TacosBuilder from './TacosBuilder';
import Badge from './common/Badge/Badge';
import { formatCurrency } from '../utils/formatters';
import { findBestPromotionForProduct, calculateDiscountedPrice, formatPromotionText } from '../utils/promotions';

const ProductList = memo(({ products, addToCart, ingredientsList, promotions = [] }) => {
    const [filter, setFilter] = useState('all');
    const [selectedTacos, setSelectedTacos] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Catégories disponibles
    const categories = useMemo(() => 
        ['all', ...new Set(products.map(p => p.categorie).filter(Boolean))], 
        [products]
    );

    // Produits filtrés
    const filteredProducts = useMemo(() => {
        let filtered = products;
        
        // Filtre par catégorie
        if (filter !== 'all') {
            filtered = filtered.filter(p => p.categorie === filter);
        }
        
        // Filtre par recherche
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.nom.toLowerCase().includes(query) ||
                (p.categorie && p.categorie.toLowerCase().includes(query))
            );
        }
        
        return filtered;
    }, [products, filter, searchQuery]);

    const handleProductClick = useCallback((product, isAvailable) => {
        if (!isAvailable) return;

        if (product.categorie === 'Tacos' || product.categorie === 'Menus') {
            setSelectedTacos(product);
        } else {
            addToCart(product);
        }
    }, [addToCart]);

    // Animation variants - Optimisées pour performance
    const containerVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03,
                delayChildren: 0
            }
        }
    }), []);

    const itemVariants = useMemo(() => ({
        hidden: { opacity: 0, y: 10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.2, ease: "easeOut" }
        }
    }), []);

    return (
        <div className="h-full flex flex-col">
            {/* BARRE DE RECHERCHE ET FILTRES */}
            <div className="mb-6 space-y-4">
                {/* Recherche */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                </div>

                {/* Filtres par catégorie */}
                <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {categories.map((category, index) => {
                        const isActive = filter === category;
                        return (
                            <motion.button
                                key={category}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilter(category)}
                                className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                            >
                                {category === 'all' ? 'TOUT' : category.toUpperCase()}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* GRILLE DE PRODUITS */}
            <div className="flex-1 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-full text-slate-400"
                    >
                        <Package className="w-16 h-16 mb-4 opacity-50" />
                        <p>Aucun produit disponible</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                        {filteredProducts.map((product, index) => {
                            const isAvailable = product.disponible !== false;

                            return (
                                <motion.button
                                    key={product.id}
                                    variants={itemVariants}
                                    whileHover={{ 
                                        scale: 1.03, 
                                        y: -3,
                                        transition: { duration: 0.15, ease: "easeOut" }
                                    }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleProductClick(product, isAvailable)}
                                    disabled={!isAvailable}
                                    className={`relative p-4 rounded-xl text-center transition-all duration-200 ${
                                        isAvailable
                                            ? 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg'
                                            : 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
                                    }`}
                                >
                                    {/* BADGE ÉPUISÉ */}
                                    {!isAvailable && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10"
                                        >
                                            <motion.div
                                                animate={{ 
                                                    scale: [1, 1.1],
                                                    opacity: [0.7, 1]
                                                }}
                                                transition={{ 
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    repeatType: "reverse",
                                                    ease: "easeInOut"
                                                }}
                                                className="flex flex-col items-center"
                                            >
                                                <X className="w-12 h-12 text-rose-500 mb-2" />
                                                <span className="text-rose-600 font-bold text-sm">Épuisé</span>
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    {/* CONTENU DU PRODUIT */}
                                    <div className="flex flex-col items-center gap-2">
                                        {/* Badge catégorie */}
                                        {product.categorie && (
                                            <div className="absolute top-2 right-2">
                                                <Badge variant="primary" size="sm">
                                                    {product.categorie}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Badge PROMO */}
                                        {(() => {
                                            const promotion = findBestPromotionForProduct(product, promotions, product.prix || 0);
                                            if (promotion) {
                                                const prixReduit = calculateDiscountedPrice(product.prix || 0, promotion);
                                                if (prixReduit < (product.prix || 0)) {
                                                    return (
                                                        <div className="absolute top-2 left-2 z-10">
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full shadow-lg"
                                                            >
                                                                <Tag className="w-3 h-3" />
                                                                {formatPromotionText(promotion)}
                                                            </motion.div>
                                                        </div>
                                                    );
                                                }
                                            }
                                            return null;
                                        })()}

                                        {/* Icône ou image placeholder */}
                                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-2 ${
                                            isAvailable 
                                                ? 'bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-600 dark:text-primary-400' 
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                        }`}>
                                            <Package className="w-8 h-8" />
                                        </div>

                                        <h3 className={`font-semibold text-sm leading-tight ${
                                            isAvailable ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {product.nom}
                                        </h3>

                                        {(() => {
                                            const promotion = findBestPromotionForProduct(product, promotions, product.prix || 0);
                                            const prixInitial = product.prix || 0;
                                            const prixReduit = promotion ? calculateDiscountedPrice(prixInitial, promotion) : prixInitial;
                                            
                                            if (promotion && prixReduit < prixInitial) {
                                                return (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <motion.span
                                                            className="text-xs text-slate-400 line-through"
                                                            whileHover={isAvailable ? { scale: 1.05 } : {}}
                                                        >
                                                            {formatCurrency(prixInitial)}
                                                        </motion.span>
                                                        <motion.span
                                                            className="text-lg font-bold text-green-600 dark:text-green-400"
                                                            whileHover={isAvailable ? { scale: 1.1 } : {}}
                                                        >
                                                            {formatCurrency(prixReduit)}
                                                        </motion.span>
                                                    </div>
                                                );
                                            }
                                            
                                            return (
                                                <motion.span
                                                    className={`text-lg font-bold ${
                                                        isAvailable 
                                                            ? 'text-success-600 dark:text-success-400' 
                                                            : 'text-slate-400'
                                                    }`}
                                                    whileHover={isAvailable ? { scale: 1.1 } : {}}
                                                >
                                                    {formatCurrency(prixInitial)}
                                                </motion.span>
                                            );
                                        })()}
                                    </div>

                                    {/* EFFET DE CLIC */}
                                    {isAvailable && (
                                        <motion.div
                                            className="absolute inset-0 rounded-xl bg-blue-500 opacity-0"
                                            whileTap={{ opacity: 0.1 }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* MODALE TACOS BUILDER */}
            <AnimatePresence>
                {selectedTacos && (
                    <TacosBuilder 
                        product={selectedTacos}
                        ingredients={ingredientsList || []} 
                        drinks={products.filter(p => p.categorie === 'Boissons' && p.disponible)}
                        onClose={() => setSelectedTacos(null)}
                        onValidate={(configuredProduct) => {
                            addToCart(configuredProduct);
                            setSelectedTacos(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
});

ProductList.displayName = 'ProductList';

export default ProductList;
