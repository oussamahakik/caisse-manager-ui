import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, X, ShoppingCart, CreditCard, Coins, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/formatters';
import Button from './common/Button/Button';
import { calculateDiscountedPrice, findBestPromotionForProduct, formatPromotionText } from '../utils/promotions';

const OrderTicket = ({ cart, updateQuantity, finalizeOrder, removeFromCart, clearCart, promotions = [] }) => {
    const [isCashModalOpen, setIsCashModalOpen] = useState(false);
    const [cashReceived, setCashReceived] = useState(0);
    const [remise, setRemise] = useState(0);
    const [remiseType, setRemiseType] = useState('montant'); // 'montant' ou 'pourcentage'
    const [showRemiseInput, setShowRemiseInput] = useState(false);

    // Calculs avec promotions - Prix réduits
    const cartWithPromotions = useMemo(() => {
        // DEBUG : Vérifier les promotions chargées
        console.log('🔍 Promotions disponibles:', promotions);
        console.log('🔍 Panier:', cart);
        
        return cart.map(item => {
            const prixInitial = item.prix || 0;
            
            // DEBUG pour chaque item
            console.log(`🔍 Item: ${item.nom}, Catégorie: ${item.categorie}, Prix: ${prixInitial}`);
            
            const promotion = findBestPromotionForProduct(item, promotions, prixInitial);
            
            if (promotion) {
                console.log(`✅ Promotion trouvée pour ${item.nom}:`, promotion.nom, formatPromotionText(promotion));
            } else {
                console.log(`❌ Aucune promotion pour ${item.nom}`);
            }
            
            const prixReduit = promotion ? calculateDiscountedPrice(prixInitial, promotion) : prixInitial;
            
            return {
                ...item,
                prixInitial,
                prixReduit,
                promotion,
                prixFinal: prixReduit // Prix à utiliser pour les calculs
            };
        });
    }, [cart, promotions]);

    // Calculs avec useMemo pour performance - Utilise les prix réduits
    const subTotal = useMemo(() => 
        cartWithPromotions.reduce((sum, item) => sum + (item.prixFinal * item.quantity), 0), 
        [cartWithPromotions]
    );
    
    const remiseAmount = useMemo(() => {
        if (remiseType === 'pourcentage') {
            return (subTotal * remise) / 100;
        }
        return remise;
    }, [remise, remiseType, subTotal]);

    const total = Math.max(0, subTotal - remiseAmount);

    const handleCashPayment = () => {
        setCashReceived(total);
        setIsCashModalOpen(true);
    };

    const confirmCashPayment = () => {
        if (cashReceived < total) {
            toast.error('Le montant reçu doit être supérieur ou égal au total');
            return;
        }
        // Envoyer les prix réduits au backend
        finalizeOrder('ESPECES', cashReceived, remiseAmount, cartWithPromotions);
        setIsCashModalOpen(false);
        setCashReceived(0);
        setRemise(0);
        setShowRemiseInput(false);
    };

    const handleCardPayment = () => {
        // Envoyer les prix réduits au backend
        finalizeOrder('CARTE', null, remiseAmount, cartWithPromotions);
        setRemise(0);
        setShowRemiseInput(false);
    };

    const handleClearCart = () => {
        toast.promise(
            new Promise((resolve) => {
                if (window.confirm("Voulez-vous vraiment vider tout le panier ?")) {
                    clearCart();
                    resolve();
                } else {
                    resolve();
                }
            }),
            {
                loading: 'Vidage du panier...',
                success: 'Panier vidé',
                error: 'Erreur',
            }
        );
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-white to-slate-50 rounded-xl shadow-lg border border-slate-200">
            {/* EN-TÊTE */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white rounded-t-xl">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900 m-0">Panier</h3>
                    {cart.length > 0 && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                            {cart.length}
                        </span>
                    )}
                </div>
                {cart.length > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClearCart}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Vider tout le panier"
                        aria-label="Vider le panier"
                    >
                        <Trash2 className="w-4 h-4" />
                    </motion.button>
                )}
            </div>

            {/* LISTE DES ARTICLES */}
            <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="popLayout">
                    {cart.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full text-slate-400"
                        >
                            <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-center">Votre panier est vide</p>
                        </motion.div>
                    ) : (
                        <motion.ul className="space-y-3">
                            {cartWithPromotions.map((item, index) => (
                                <motion.li
                                    key={item.uniqueId || item.id || index}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group"
                                >
                                    {/* BOUTON SUPPRIMER */}
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeFromCart(index)}
                                        className="absolute top-2 right-2 p-1 text-rose-500 hover:bg-rose-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Supprimer l'article"
                                    >
                                        <X className="w-4 h-4" />
                                    </motion.button>

                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-slate-900">{item.nom}</h4>
                                                {item.promotion && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                        <Tag className="w-3 h-3" />
                                                        {formatPromotionText(item.promotion)}
                                                    </span>
                                                )}
                                            </div>
                                            {item.details && (
                                                <div className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded mt-1 italic">
                                                    {item.details}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                {item.promotion && item.prixInitial !== item.prixReduit ? (
                                                    <>
                                                        <p className="text-sm text-slate-400 line-through">
                                                            {item.prixInitial.toFixed(2)} €
                                                        </p>
                                                        <p className="text-sm font-semibold text-green-600">
                                                            {item.prixReduit.toFixed(2)} € / unit
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-slate-500">
                                                        {(item.prix || 0).toFixed(2)} € / unit
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-7 h-7 flex items-center justify-center bg-white rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    aria-label="Diminuer la quantité"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </motion.button>
                                                <span className="w-8 text-center font-semibold text-slate-900">
                                                    {item.quantity}
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-7 h-7 flex items-center justify-center bg-white rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                                                    aria-label="Augmenter la quantité"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </motion.button>
                                            </div>
                                            <div className="text-right">
                                                {item.promotion && item.prixInitial !== item.prixReduit ? (
                                                    <>
                                                        <p className="text-xs text-slate-400 line-through">
                                                            {(item.prixInitial * item.quantity).toFixed(2)} €
                                                        </p>
                                                        <p className="font-bold text-green-600">
                                                            {(item.prixFinal * item.quantity).toFixed(2)} €
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="font-bold text-slate-900">
                                                        {(item.prixFinal * item.quantity).toFixed(2)} €
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>

            {/* TOTAUX */}
            <div className="border-t-2 border-slate-300 bg-white p-4 rounded-b-xl">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Sous-total:</span>
                    <span className="font-semibold text-slate-900">{subTotal.toFixed(2)} €</span>
                </div>
                
                {/* REMISE */}
                {cart.length > 0 && (
                    <div className="mb-2">
                        {!showRemiseInput ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowRemiseInput(true)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <Tag className="w-4 h-4" />
                                Ajouter une remise
                            </motion.button>
                        ) : (
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <button
                                        onClick={() => setRemiseType('montant')}
                                        className={`flex-1 px-3 py-1 text-xs font-semibold rounded ${
                                            remiseType === 'montant' 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-white text-slate-700 border border-slate-300'
                                        }`}
                                    >
                                        Montant (€)
                                    </button>
                                    <button
                                        onClick={() => setRemiseType('pourcentage')}
                                        className={`flex-1 px-3 py-1 text-xs font-semibold rounded ${
                                            remiseType === 'pourcentage' 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-white text-slate-700 border border-slate-300'
                                        }`}
                                    >
                                        Pourcentage (%)
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        step={remiseType === 'pourcentage' ? '0.1' : '0.01'}
                                        min="0"
                                        max={remiseType === 'pourcentage' ? '100' : subTotal}
                                        value={remise}
                                        onChange={(e) => setRemise(parseFloat(e.target.value) || 0)}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder={remiseType === 'pourcentage' ? '0.0' : '0.00'}
                                    />
                                    <button
                                        onClick={() => {
                                            setRemise(0);
                                            setShowRemiseInput(false);
                                        }}
                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {remiseAmount > 0 && (
                                    <div className="text-sm text-emerald-600 font-semibold text-center">
                                        Remise: -{remiseAmount.toFixed(2)} €
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {remiseAmount > 0 && (
                    <div className="flex justify-between items-center mb-2 text-emerald-600">
                        <span className="text-sm font-medium">Remise:</span>
                        <span className="font-semibold">-{remiseAmount.toFixed(2)} €</span>
                    </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="text-lg font-bold text-slate-900">TOTAL À PAYER:</span>
                    <motion.span
                        key={total}
                        initial={{ scale: 1.2, color: '#10b981' }}
                        animate={{ scale: 1, color: '#059669' }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl font-bold text-emerald-600"
                    >
                        {total.toFixed(2)} €
                    </motion.span>
                </div>
            </div>

            {/* BOUTONS PAIEMENT */}
            <div className="p-4 space-y-2 bg-white rounded-b-xl">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCashPayment}
                    disabled={cart.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Coins className="w-5 h-5" />
                    <span>Espèces</span>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCardPayment}
                    disabled={cart.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <CreditCard className="w-5 h-5" />
                    <span>Carte</span>
                </motion.button>
            </div>

            {/* MODALE DE PAIEMENT EN ESPECES */}
            <AnimatePresence>
                {isCashModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCashModalOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        <Coins className="w-6 h-6 text-emerald-600" />
                                        Paiement Espèces
                                    </h2>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsCashModalOpen(false)}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                        aria-label="Fermer"
                                    >
                                        <X className="w-5 h-5 text-slate-500" />
                                    </motion.button>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600 text-sm">Sous-total:</span>
                                            <span className="font-semibold text-slate-700">{subTotal.toFixed(2)} €</span>
                                        </div>
                                        {remiseAmount > 0 && (
                                            <div className="flex justify-between items-center text-emerald-600">
                                                <span className="text-sm">Remise:</span>
                                                <span className="font-semibold">-{remiseAmount.toFixed(2)} €</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                                            <span className="text-slate-600 font-medium">Total à Payer :</span>
                                            <span className="text-2xl font-bold text-slate-900">{total.toFixed(2)} €</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Montant Reçu :
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        autoFocus
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-slate-600 mb-2">Suggestions :</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            total,
                                            Math.ceil(total / 5) * 5,
                                            Math.ceil(total / 10) * 10,
                                            50,
                                            100
                                        ].map((amount, idx) => (
                                            <motion.button
                                                key={idx}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setCashReceived(amount)}
                                                className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                                            >
                                                {amount.toFixed(2)}€
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {cashReceived >= total && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-6"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-emerald-800 font-semibold text-lg">Monnaie à Rendre :</span>
                                            <span className="text-3xl font-bold text-emerald-600">
                                                {(cashReceived - total).toFixed(2)} €
                                            </span>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setIsCashModalOpen(false)}
                                        className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors"
                                    >
                                        Annuler
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={confirmCashPayment}
                                        disabled={cashReceived < total}
                                        className="flex-1 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Valider Paiement
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderTicket;
