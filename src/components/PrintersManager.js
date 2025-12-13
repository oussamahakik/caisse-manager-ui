import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Printer, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { t } from '../i18n';

const PrintersManager = memo(({ token, snackId }) => {
    const [printers, setPrinters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedPrinter, setSelectedPrinter] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        type: 'USB',
        chemin: '',
        actif: true,
        description: '',
        largeurPapier: 80,
        copies: 1,
        impressionAuto: false,
        typeTicket: 'COMMANDE'
    });

    const fetchPrinters = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/imprimantes', {
                headers: { 'X-Snack-ID': snackId?.toString() }
            });
            setPrinters(response.data || []);
        } catch (error) {
            toast.error('Erreur lors du chargement des imprimantes');
        } finally {
            setIsLoading(false);
        }
    }, [snackId]);

    useEffect(() => {
        fetchPrinters();
    }, [fetchPrinters]);

    const handleCreate = () => {
        setIsEditMode(false);
        setSelectedPrinter(null);
        setFormData({
            nom: '',
            type: 'USB',
            chemin: '',
            actif: true,
            description: '',
            largeurPapier: 80,
            copies: 1,
            impressionAuto: false,
            typeTicket: 'COMMANDE'
        });
        setIsModalOpen(true);
    };

    const handleEdit = (printer) => {
        setIsEditMode(true);
        setSelectedPrinter(printer);
        setFormData({
            nom: printer.nom || '',
            type: printer.type || 'USB',
            chemin: printer.chemin || '',
            actif: printer.actif !== undefined ? printer.actif : true,
            description: printer.description || '',
            largeurPapier: printer.largeurPapier || 80,
            copies: printer.copies || 1,
            impressionAuto: printer.impressionAuto || false,
            typeTicket: printer.typeTicket || 'COMMANDE'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                largeurPapier: parseInt(formData.largeurPapier) || 80,
                copies: parseInt(formData.copies) || 1,
                snackId: snackId
            };

            if (isEditMode) {
                await api.put(`/api/imprimantes/${selectedPrinter.id}`, payload);
                toast.success('Imprimante modifiée avec succès');
            } else {
                await api.post('/api/imprimantes', payload, {
                    headers: { 'X-Snack-ID': snackId?.toString() }
                });
                toast.success('Imprimante créée avec succès');
            }
            setIsModalOpen(false);
            fetchPrinters();
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement de l\'imprimante');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette imprimante ?')) return;
        try {
            await api.delete(`/api/imprimantes/${id}`);
            toast.success('Imprimante supprimée avec succès');
            fetchPrinters();
        } catch (error) {
            toast.error('Erreur lors de la suppression de l\'imprimante');
        }
    };

    const handleTest = async (id) => {
        try {
            await api.post(`/api/imprimantes/${id}/test`);
            toast.success('Test d\'impression envoyé');
        } catch (error) {
            toast.error('Erreur lors du test d\'impression');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold gradient-text">{t('printers.title')}</h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    {t('printers.create')}
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {printers.map((printer) => (
                    <motion.div
                        key={printer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-strong rounded-2xl p-6 border border-blue-200/50 dark:border-blue-500/30"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <Printer className="w-5 h-5 text-blue-600" />
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{printer.nom}</h3>
                            </div>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleTest(printer.id)}
                                    className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg"
                                    title={t('printers.test')}
                                >
                                    <TestTube className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleEdit(printer)}
                                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg"
                                >
                                    <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDelete(printer.id)}
                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </motion.button>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p className="text-slate-600 dark:text-slate-400">
                                <span className="font-semibold">Type:</span> {printer.type}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400">
                                <span className="font-semibold">Chemin:</span> {printer.chemin}
                            </p>
                            {printer.description && (
                                <p className="text-slate-600 dark:text-slate-400">{printer.description}</p>
                            )}
                            <p className="text-slate-600 dark:text-slate-400">
                                <span className="font-semibold">Type de ticket:</span> {printer.typeTicket}
                            </p>
                            <p className={`font-semibold ${printer.actif ? 'text-green-600' : 'text-red-600'}`}>
                                {printer.actif ? 'Actif' : 'Inactif'}
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
                                    {isEditMode ? t('printers.edit') : t('printers.create')}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('printers.name')}</label>
                                        <input
                                            type="text"
                                            value={formData.nom}
                                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('printers.type')}</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        >
                                            <option value="USB">USB</option>
                                            <option value="RESEAU">Réseau</option>
                                            <option value="BLUETOOTH">Bluetooth</option>
                                            <option value="FILE">Fichier</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t('printers.path')}</label>
                                    <input
                                        type="text"
                                        value={formData.chemin}
                                        onChange={(e) => setFormData({ ...formData, chemin: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        placeholder="Nom imprimante système, IP, ou chemin fichier"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t('printers.description')}</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        rows="2"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('printers.paperWidth')}</label>
                                        <input
                                            type="number"
                                            value={formData.largeurPapier}
                                            onChange={(e) => setFormData({ ...formData, largeurPapier: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('printers.copies')}</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.copies}
                                            onChange={(e) => setFormData({ ...formData, copies: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('printers.ticketType')}</label>
                                        <select
                                            value={formData.typeTicket}
                                            onChange={(e) => setFormData({ ...formData, typeTicket: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        >
                                            <option value="COMMANDE">Commande</option>
                                            <option value="RECU">Reçu</option>
                                            <option value="CUISINE">Cuisine</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.impressionAuto}
                                        onChange={(e) => setFormData({ ...formData, impressionAuto: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label className="text-sm font-medium">{t('printers.autoPrint')}</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.actif}
                                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label className="text-sm font-medium">{t('printers.active')}</label>
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

PrintersManager.displayName = 'PrintersManager';

export default PrintersManager;

