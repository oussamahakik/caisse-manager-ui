import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Utensils, Droplet, Plus, Coffee } from 'lucide-react';
import { toast } from 'sonner';

const TacosBuilder = ({ product, ingredients, drinks, onClose, onValidate }) => {
    const [step, setStep] = useState(1);
    const [selection, setSelection] = useState({
        viandes: [],
        sauces: [],
        frites: true,
        sauceFromagere: true,
        supplements: [],
        boisson: null
    });

    const getViandeLimit = () => {
        const name = product.nom.toUpperCase();
        if (name.includes('XL')) return 3;
        if (name.includes('L')) return 2;
        return 1;
    };
    const maxViandes = getViandeLimit();

    const toggleSelection = (category, item) => {
        setSelection(prev => {
            const list = prev[category];
            const isSelected = list.find(i => i.id === item.id);

            if (isSelected) {
                return { ...prev, [category]: list.filter(i => i.id !== item.id) };
            } else {
                if (category === 'viandes' && list.length >= maxViandes) {
                    toast.error(`Maximum ${maxViandes} viande(s) pour ce Tacos !`);
                    return prev;
                }
                return { ...prev, [category]: [...list, item] };
            }
        });
    };

    const calculateTotalPrice = useMemo(() => {
        const basePrice = product.prix || 0;
        const supplementsCost = selection.supplements.reduce((sum, sup) => {
            return sum + (sup.prixSupplement || 0);
        }, 0);
        const boissonPrice = selection.boisson ? (selection.boisson.prix || 0) : 0;
        return basePrice + supplementsCost + boissonPrice;
    }, [product.prix, selection.supplements, selection.boisson]);

    const handleFinalize = () => {
        let detailsTxt = [];
        if (selection.viandes.length) detailsTxt.push(`Viandes: ${selection.viandes.map(v => v.nom).join(', ')}`);
        if (selection.sauces.length) detailsTxt.push(`Sauces: ${selection.sauces.map(s => s.nom).join(', ')}`);
        if (!selection.frites) detailsTxt.push("SANS Frites");
        if (!selection.sauceFromagere) detailsTxt.push("SANS Sauce From.");
        if (selection.supplements.length) detailsTxt.push(`Supp: ${selection.supplements.map(s => s.nom).join(', ')}`);
        if (selection.boisson) detailsTxt.push(`Boisson: ${selection.boisson.nom}`);

        const extraCost = selection.supplements.reduce((sum, sup) => sum + (sup.prixSupplement || 0), 0);
        const boissonCost = selection.boisson ? (selection.boisson.prix || 0) : 0;
        const totalExtraCost = extraCost + boissonCost;
        const finalPrice = calculateTotalPrice;

        onValidate({
            ...product,
            uniqueId: Date.now(),
            nom: `${product.nom}${totalExtraCost > 0 ? ` (+${totalExtraCost.toFixed(2)}€)` : ''}`,
            prix: finalPrice,
            details: detailsTxt.join(' | ')
        });
    };

    const viandesDispo = ingredients.filter(i => i.type === 'VIANDE' && i.disponible);
    const saucesDispo = ingredients.filter(i => i.type === 'SAUCE' && i.disponible);
    const supplementsDispo = ingredients.filter(i => i.type === 'SUPPLEMENT' && i.disponible);

    const steps = [
        { id: 1, label: 'Viandes', icon: Utensils },
        { id: 2, label: 'Sauces', icon: Droplet },
        { id: 3, label: 'Suppléments', icon: Plus },
        { id: 4, label: 'Boisson', icon: Coffee }
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                >
                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <Utensils className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Configurer : {product.nom}</h3>
                                <p className="text-sm text-orange-100">Étape {step}/4</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            aria-label="Fermer"
                        >
                            <X className="w-6 h-6" />
                        </motion.button>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="px-6 pt-4">
                        <div className="flex gap-2">
                            {steps.map((s, idx) => {
                                const isActive = step === s.id;
                                const isCompleted = step > s.id;
                                return (
                                    <div key={s.id} className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                isCompleted ? 'bg-emerald-500 text-white' :
                                                isActive ? 'bg-orange-500 text-white' :
                                                'bg-slate-200 text-slate-500'
                                            }`}>
                                                {isCompleted ? <Check className="w-4 h-4" /> : s.id}
                                            </div>
                                            <span className={`text-xs font-medium ${
                                                isActive ? 'text-orange-600' : 'text-slate-500'
                                            }`}>
                                                {s.label}
                                            </span>
                                        </div>
                                        <div className={`h-1 rounded-full ${
                                            isCompleted ? 'bg-emerald-500' :
                                            isActive ? 'bg-orange-500' :
                                            'bg-slate-200'
                                        }`} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* BODY */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <AnimatePresence mode="wait">
                            {/* ÉTAPE 1: VIANDES */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <Utensils className="w-5 h-5 text-orange-600" />
                                            1. Viandes
                                        </h4>
                                        <span className="text-sm text-slate-500">
                                            {selection.viandes.length}/{maxViandes} sélectionnées
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {viandesDispo.map((v, idx) => {
                                            const isSelected = selection.viandes.find(i => i.id === v.id);
                                            return (
                                                <motion.button
                                                    key={v.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => toggleSelection('viandes', v)}
                                                    className={`p-4 rounded-xl border-2 transition-all ${
                                                        isSelected
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                                                            : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                                                    }`}
                                                >
                                                    {v.nom}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* ÉTAPE 2: SAUCES */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <Droplet className="w-5 h-5 text-blue-600" />
                                        2. Sauces
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {saucesDispo.map((s, idx) => {
                                            const isSelected = selection.sauces.find(i => i.id === s.id);
                                            return (
                                                <motion.button
                                                    key={s.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => toggleSelection('sauces', s)}
                                                    className={`p-4 rounded-xl border-2 transition-all ${
                                                        isSelected
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                                                            : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                                                    }`}
                                                >
                                                    {s.nom}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* ÉTAPE 3: SUPPLÉMENTS */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <Plus className="w-5 h-5 text-purple-600" />
                                        3. Suppléments Payants
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {supplementsDispo.map((sup, idx) => {
                                            const isSelected = selection.supplements.find(i => i.id === sup.id);
                                            return (
                                                <motion.button
                                                    key={sup.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => toggleSelection('supplements', sup)}
                                                    className={`p-4 rounded-xl border-2 transition-all ${
                                                        isSelected
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                                                            : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                                                    }`}
                                                >
                                                    <div className="text-left">
                                                        <div className="font-semibold">{sup.nom}</div>
                                                        <div className="text-sm text-emerald-600 font-bold">
                                                            +{sup.prixSupplement.toFixed(2)}€
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                    <div className="border-t border-slate-200 pt-4 space-y-3">
                                        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selection.frites}
                                                onChange={() => setSelection({...selection, frites: !selection.frites})}
                                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                            />
                                            <span className="font-medium">Avec Frites</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selection.sauceFromagere}
                                                onChange={() => setSelection({...selection, sauceFromagere: !selection.sauceFromagere})}
                                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                            />
                                            <span className="font-medium">Avec Sauce Fromagère</span>
                                        </label>
                                    </div>
                                </motion.div>
                            )}

                            {/* ÉTAPE 4: BOISSON */}
                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <Coffee className="w-5 h-5 text-amber-600" />
                                        4. Boisson
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelection({...selection, boisson: null})}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                !selection.boisson
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                                                    : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50'
                                            }`}
                                        >
                                            Aucune
                                        </motion.button>
                                        {drinks.map((d, idx) => {
                                            const isSelected = selection.boisson?.id === d.id;
                                            return (
                                                <motion.button
                                                    key={d.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setSelection({...selection, boisson: d})}
                                                    className={`p-4 rounded-xl border-2 transition-all ${
                                                        isSelected
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                                                            : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50'
                                                    }`}
                                                >
                                                    <div className="text-left">
                                                        <div className="font-semibold">{d.nom}</div>
                                                        {d.prix > 0 && (
                                                            <div className="text-sm text-emerald-600 font-bold mt-1">
                                                                +{d.prix.toFixed(2)}€
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* FOOTER */}
                    <div className="border-t border-slate-200 p-6 bg-slate-50 rounded-b-2xl flex items-center justify-between">
                        <div className="flex-1">
                            {step > 1 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setStep(step - 1)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Précédent
                                </motion.button>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-slate-600">Prix Total</p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {calculateTotalPrice.toFixed(2)} €
                                </p>
                            </div>
                            {step < 4 ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setStep(step + 1)}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Suivant
                                    <ChevronRight className="w-4 h-4" />
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleFinalize}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    <Check className="w-5 h-5" />
                                    Valider
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TacosBuilder;
