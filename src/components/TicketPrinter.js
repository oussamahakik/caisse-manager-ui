import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const TicketPrinter = ({ order, restaurantName, onClose }) => {
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Ticket_${order?.id || 'Commande'}_${new Date().toISOString().split('T')[0]}`,
        onBeforeGetContent: () => {
            toast.loading('Préparation de l\'impression...');
        },
        onAfterPrint: () => {
            toast.success('Ticket imprimé avec succès !');
            if (onClose) onClose();
        },
        onPrintError: (error) => {
            toast.error('Erreur lors de l\'impression : ' + error.message);
        }
    });

    if (!order) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Printer className="w-6 h-6 text-blue-600" /> Prévisualisation Ticket
                        </h2>
                        <motion.button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X className="w-6 h-6 text-slate-600" />
                        </motion.button>
                    </div>

                    {/* Contenu du ticket (sera imprimé) */}
                    <div ref={componentRef} className="bg-white p-6" style={{ fontFamily: 'monospace' }}>
                        <div className="text-center mb-4">
                            <h1 className="text-2xl font-bold mb-2">{restaurantName || 'RESTAURANT'}</h1>
                            <div className="border-t-2 border-b-2 border-slate-800 py-2 my-2">
                                <p className="text-sm">TICKET DE CAISSE</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm"><strong>Commande N°:</strong> {order.id}</p>
                            <p className="text-sm"><strong>Date:</strong> {formatDate(order.date || new Date())}</p>
                            <p className="text-sm"><strong>Paiement:</strong> {order.typePaiement || 'N/A'}</p>
                        </div>

                        <div className="border-t border-b border-slate-300 py-2 my-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold">Article</span>
                                <span className="font-bold">Qté</span>
                                <span className="font-bold">Prix</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            {order.lignes?.map((ligne, index) => (
                                <div key={index} className="mb-2 pb-2 border-b border-slate-200">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{ligne.nomProduit}</p>
                                            {ligne.details && (
                                                <p className="text-xs text-slate-600 italic mt-1">{ligne.details}</p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-sm">{ligne.quantite} x {ligne.prixFinal?.toFixed(2) || '0.00'} €</p>
                                            <p className="font-bold text-sm">{(ligne.quantite * (ligne.prixFinal || 0)).toFixed(2)} €</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t-2 border-slate-800 pt-4 mt-4">
                            <div className="flex justify-between text-lg mb-2">
                                <span className="font-bold">SOUS-TOTAL:</span>
                                <span className="font-bold">{order.total?.toFixed(2) || '0.00'} €</span>
                            </div>
                            {order.remise && order.remise > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600 mb-2">
                                    <span>Remise:</span>
                                    <span>-{order.remise.toFixed(2)} €</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold mt-4 pt-2 border-t-2 border-slate-800">
                                <span>TOTAL:</span>
                                <span>{(order.total - (order.remise || 0)).toFixed(2)} €</span>
                            </div>
                            {order.typePaiement === 'ESPECES' && order.montantRecu && (
                                <div className="mt-2 pt-2 border-t border-slate-300">
                                    <div className="flex justify-between text-sm">
                                        <span>Montant reçu:</span>
                                        <span>{order.montantRecu.toFixed(2)} €</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-emerald-600">
                                        <span>Monnaie:</span>
                                        <span>{(order.montantRecu - (order.total - (order.remise || 0))).toFixed(2)} €</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-center mt-6 pt-4 border-t border-slate-300">
                            <p className="text-xs text-slate-500">Merci de votre visite !</p>
                            <p className="text-xs text-slate-500 mt-1">À bientôt</p>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-3 mt-6">
                        <motion.button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Annuler
                        </motion.button>
                        <motion.button
                            onClick={handlePrint}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Printer className="w-5 h-5" /> Imprimer
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TicketPrinter;

