import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { BarChart3, TrendingUp, ShoppingCart, DollarSign, Calendar, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api, { setSnackId } from '../services/api';
import { ChartSkeleton, KPICardSkeleton } from './LoadingSkeleton';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const RapportDashboard = memo(({ token, snackId }) => {
    const [rapport, setRapport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [periode, setPeriode] = useState('MOIS');

    useEffect(() => {
        if (snackId) {
            setSnackId(snackId);
        }
    }, [snackId]);

    const fetchRapport = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/rapports?periode=${periode}`, {
                headers: { 'X-Snack-ID': snackId.toString() },
                // Cache la réponse pour éviter les requêtes répétées
                cache: 'force-cache'
            });
            setRapport(response.data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Erreur chargement rapport", error);
            }
        } finally {
            setLoading(false);
        }
    }, [periode, snackId]);

    useEffect(() => {
        fetchRapport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periode, snackId]);

    const caData = useMemo(() => ({
        labels: ['Chiffre d\'Affaires Total', 'CA Aujourd\'hui'],
        datasets: [{
            label: 'Chiffre d\'Affaires (€)',
            data: [
                rapport?.statsGlobales?.chiffreAffaires || 0,
                rapport?.statsGlobales?.caAujourdhui || 0
            ],
            backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
            borderRadius: 8
        }]
    }), [rapport]);

    const pieData = useMemo(() => ({
        labels: rapport?.ventesParCategorie?.map(v => v.categorie) || [],
        datasets: [{
            data: rapport?.ventesParCategorie?.map(v => v.chiffreAffaires || 0) || [],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(20, 184, 166, 0.8)'
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    }), [rapport]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 12 }
            }
        }
    };

    // Fonction d'export PDF
    const exportToPDF = useCallback(() => {
        if (!rapport) {
            toast.error('Aucune donnée à exporter');
            return;
        }

        try {
            const doc = new jsPDF();
            
            // Vérifier que autoTable est disponible
            if (typeof doc.autoTable === 'undefined' && typeof autoTable === 'function') {
                // Si autoTable n'est pas attaché à doc, l'utiliser directement
                console.warn('autoTable non attaché à doc, utilisation directe');
            }
            
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            let yPos = margin;

            // Titre
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('Rapport de Ventes', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;

            // Nom du restaurant supprimé pour éviter les erreurs serveur

            // Période
            doc.setFontSize(12);
            const periodeText = periode === 'JOUR' ? 'Aujourd\'hui' : periode === 'SEMAINE' ? '7 derniers jours' : '30 derniers jours';
            doc.text(`Période: ${periodeText}`, margin, yPos);
            doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, margin, yPos + 6);
            yPos += 15;

        // Statistiques globales
        doc.setFontSize(14);
        doc.text('Statistiques Globales', margin, yPos);
        yPos += 8;

        const statsData = [
            ['Chiffre d\'Affaires Total', `${(rapport.statsGlobales?.chiffreAffaires || 0).toFixed(2)} €`],
            ['CA Aujourd\'hui', `${(rapport.statsGlobales?.caAujourdhui || 0).toFixed(2)} €`],
            ['Total Commandes', `${rapport.statsGlobales?.totalCommandes || 0}`],
            ['Commandes Aujourd\'hui', `${rapport.statsGlobales?.commandesAujourdhui || 0}`]
        ];

        // Utiliser autoTable si disponible, sinon utiliser la méthode attachée
        const autoTableFn = doc.autoTable || autoTable;
        if (typeof autoTableFn !== 'function') {
            throw new Error('jspdf-autotable n\'est pas correctement importé');
        }
        
        autoTableFn(doc, {
            startY: yPos,
            head: [['Métrique', 'Valeur']],
            body: statsData,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            margin: { left: margin, right: margin }
        });
        yPos = doc.lastAutoTable.finalY + 15;

        // DÉTAILS DES VENTES DU JOUR (seulement si période = JOUR)
        if (periode === 'JOUR' && rapport.ventesDetail && rapport.ventesDetail.length > 0) {
            doc.setFontSize(14);
            doc.text('Détails des Ventes du Jour', margin, yPos);
            yPos += 8;

            const ventesData = rapport.ventesDetail.map(v => [
                v.nomProduit || 'N/A',
                `${v.quantite || 0}`,
                `${(v.prixUnitaire || 0).toFixed(2)} €`,
                `${(v.prixTotal || 0).toFixed(2)} €`,
                v.typePaiement || 'N/A'
            ]);

            autoTableFn(doc, {
                startY: yPos,
                head: [['Produit', 'Qté', 'Prix Unit.', 'Total', 'Paiement']],
                body: ventesData,
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] },
                margin: { left: margin, right: margin },
                styles: { fontSize: 8 }
            });
            yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : yPos + 30;
        }

        // Top Produits
        if (rapport.topProduits && rapport.topProduits.length > 0) {
            doc.setFontSize(14);
            doc.text('Top 10 Produits', margin, yPos);
            yPos += 8;

            const topProductsData = rapport.topProduits.map((p, idx) => {
                const quantiteVendue = p.quantiteVendue || p.quantite || p.qteVendue || 0;
                const chiffreAffaires = p.chiffreAffaires || p.ca || 0;
                return [
                    idx + 1,
                    p.nomProduit || p.nom || 'N/A',
                    `${quantiteVendue.toFixed(0)}`,
                    `${chiffreAffaires.toFixed(2)} €`
                ];
            });

            autoTableFn(doc, {
                startY: yPos,
                head: [['#', 'Produit', 'Quantité', 'CA']],
                body: topProductsData,
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] },
                margin: { left: margin, right: margin }
            });
            yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : yPos + 30;
        }

        // Ventes par catégorie
        if (rapport.ventesParCategorie && rapport.ventesParCategorie.length > 0) {
            doc.setFontSize(14);
            doc.text('Ventes par Catégorie', margin, yPos);
            yPos += 8;

            const categoriesData = rapport.ventesParCategorie.map(v => [
                v.categorie || 'N/A',
                `${(v.chiffreAffaires || 0).toFixed(2)} €`
            ]);

            autoTableFn(doc, {
                startY: yPos,
                head: [['Catégorie', 'Chiffre d\'Affaires']],
                body: categoriesData,
                theme: 'striped',
                headStyles: { fillColor: [139, 92, 246] },
                margin: { left: margin, right: margin }
            });
        }

            // Date de génération
            doc.setFontSize(10);
            doc.setFont(undefined, 'italic');
            doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

            // Sauvegarder
            const fileName = `Rapport_${periode}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            toast.success('Rapport PDF exporté avec succès !');
        } catch (error) {
            console.error('Erreur génération PDF:', error);
            toast.error('Erreur lors de la génération du PDF. Veuillez réessayer.');
        }
    }, [rapport, periode]);

    // Fonction d'export Excel
    const exportToExcel = useCallback(() => {
        if (!rapport) return;

        const wb = XLSX.utils.book_new();

        // Feuille 1: Statistiques Globales
        const statsData = [
            ['Métrique', 'Valeur'],
            ['Chiffre d\'Affaires Total', rapport.statsGlobales?.chiffreAffaires || 0],
            ['CA Aujourd\'hui', rapport.statsGlobales?.caAujourdhui || 0],
            ['Total Commandes', rapport.statsGlobales?.totalCommandes || 0],
            ['Commandes Aujourd\'hui', rapport.statsGlobales?.commandesAujourdhui || 0]
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(statsData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Statistiques');

        // Feuille 2: Top Produits
        if (rapport.topProduits && rapport.topProduits.length > 0) {
            const topProductsData = [
                ['#', 'Produit', 'Quantité Vendue', 'Chiffre d\'Affaires'],
                ...rapport.topProduits.map((p, idx) => {
                    const quantiteVendue = p.quantiteVendue || p.quantite || p.qteVendue || 0;
                    const chiffreAffaires = p.chiffreAffaires || p.ca || 0;
                    return [
                        idx + 1,
                        p.nomProduit || p.nom || 'N/A',
                        quantiteVendue,
                        chiffreAffaires
                    ];
                })
            ];
            const ws2 = XLSX.utils.aoa_to_sheet(topProductsData);
            XLSX.utils.book_append_sheet(wb, ws2, 'Top Produits');
        }

        // Feuille 3: Ventes par Catégorie
        if (rapport.ventesParCategorie && rapport.ventesParCategorie.length > 0) {
            const categoriesData = [
                ['Catégorie', 'Chiffre d\'Affaires'],
                ...rapport.ventesParCategorie.map(v => [
                    v.categorie || 'N/A',
                    v.chiffreAffaires || 0
                ])
            ];
            const ws3 = XLSX.utils.aoa_to_sheet(categoriesData);
            XLSX.utils.book_append_sheet(wb, ws3, 'Ventes par Catégorie');
        }

        // Sauvegarder
        const fileName = `Rapport_${periode}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success('Rapport Excel exporté avec succès !');
    }, [rapport, periode]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <KPICardSkeleton key={i} />
                    ))}
                </div>
                <ChartSkeleton />
            </div>
        );
    }

    if (!rapport) {
        return (
            <div className="text-center py-20 text-slate-400">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Aucune donnée disponible</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 rounded-2xl flex items-center justify-center shadow-2xl glow-hover"
                    >
                        <BarChart3 className="w-7 h-7 text-white drop-shadow-lg" />
                    </motion.div>
                    <div>
                        <h2 className="text-3xl font-extrabold gradient-text tracking-tight">Rapports et Statistiques</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">Analyse de vos performances</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={periode}
                        onChange={(e) => setPeriode(e.target.value)}
                        className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <option value="JOUR">Aujourd'hui</option>
                        <option value="SEMAINE">7 derniers jours</option>
                        <option value="MOIS">30 derniers jours</option>
                    </select>
                    <motion.button
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all font-bold shadow-xl hover:shadow-2xl hover:shadow-rose-500/50 glow-hover"
                        title="Exporter en PDF"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="tracking-wide">PDF</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-bold shadow-xl hover:shadow-2xl hover:shadow-emerald-500/50 glow-hover"
                        title="Exporter en Excel"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span className="tracking-wide">Excel</span>
                    </motion.button>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-3xl p-6 shadow-2xl glow-hover relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <DollarSign className="w-10 h-10 opacity-90 drop-shadow-lg" />
                    </div>
                    <p className="text-blue-100 text-sm font-semibold relative z-10 mb-2">Chiffre d'Affaires</p>
                    <p className="text-4xl font-extrabold mt-1 relative z-10 drop-shadow-lg">
                        {(rapport.statsGlobales?.chiffreAffaires || 0).toFixed(2)} €
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white rounded-3xl p-6 shadow-2xl glow-hover relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <ShoppingCart className="w-10 h-10 opacity-90 drop-shadow-lg" />
                    </div>
                    <p className="text-emerald-100 text-sm font-semibold relative z-10 mb-2">Total Commandes</p>
                    <p className="text-4xl font-extrabold mt-1 relative z-10 drop-shadow-lg">
                        {rapport.statsGlobales?.totalCommandes || 0}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-3xl p-6 shadow-2xl glow-hover relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <TrendingUp className="w-10 h-10 opacity-90 drop-shadow-lg" />
                    </div>
                    <p className="text-purple-100 text-sm font-semibold relative z-10 mb-2">Panier Moyen</p>
                    <p className="text-4xl font-extrabold mt-1 relative z-10 drop-shadow-lg">
                        {(rapport.statsGlobales?.panierMoyen || 0).toFixed(2)} €
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white rounded-3xl p-6 shadow-2xl glow-hover relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <Calendar className="w-10 h-10 opacity-90 drop-shadow-lg" />
                    </div>
                    <p className="text-orange-100 text-sm font-semibold relative z-10 mb-2">Commandes Aujourd'hui</p>
                    <p className="text-4xl font-extrabold mt-1 relative z-10 drop-shadow-lg">
                        {rapport.statsGlobales?.commandesAujourdhui || 0}
                    </p>
                </motion.div>
            </div>

            {/* GRAPHIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="glass-strong rounded-3xl shadow-2xl p-8 transition-all duration-500 border border-blue-200/60 dark:border-blue-500/30 hover:shadow-3xl"
                >
                    <h3 className="text-xl font-extrabold gradient-text mb-6 tracking-tight">Chiffre d'Affaires</h3>
                    <div className="h-64">
                        <Bar data={caData} options={chartOptions} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="glass-strong rounded-3xl shadow-2xl p-8 transition-all duration-500 border border-blue-200/60 dark:border-blue-500/30 hover:shadow-3xl"
                >
                    <h3 className="text-xl font-extrabold gradient-text mb-6 tracking-tight">Ventes par Catégorie</h3>
                    <div className="h-64">
                        <Pie data={pieData} options={chartOptions} />
                    </div>
                </motion.div>
            </div>

            {/* TOP 10 PRODUITS */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.01 }}
                className="glass-strong rounded-3xl shadow-2xl p-8 border border-blue-200/60 dark:border-blue-500/30 transition-all duration-500 hover:shadow-3xl"
            >
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-extrabold gradient-text flex items-center gap-3 tracking-tight">
                        <BarChart3 className="w-6 h-6" />
                        Top 10 Produits
                    </h3>
                    {periode === 'JOUR' && (
                        <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xs font-bold shadow-lg"
                        >
                            Rapport d'aujourd'hui
                        </motion.span>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Rang</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Produit</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Quantité Vendue</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Chiffre d'Affaires</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {rapport.topProduits?.map((produit, index) => {
                                // Normaliser les données pour gérer différents formats de l'API
                                const nomProduit = produit.nomProduit || produit.nom || 'N/A';
                                const quantiteVendue = produit.quantiteVendue || produit.quantite || produit.qteVendue || 0;
                                const prixUnitaire = produit.prixUnitaire || produit.prix || 0;
                                const chiffreAffaires = produit.chiffreAffaires || produit.ca || (quantiteVendue * prixUnitaire);
                                
                                return (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                                index === 1 ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                                                index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                                                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                            }`}>
                                                #{index + 1}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{nomProduit}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-slate-900 dark:text-white font-bold text-base">{quantiteVendue} unité{quantiteVendue > 1 ? 's' : ''}</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <span>Prix unitaire:</span>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{prixUnitaire.toFixed(2)} €</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-emerald-600 text-lg">{chiffreAffaires.toFixed(2)} €</span>
                                                {quantiteVendue > 0 && (
                                                    <span className="text-xs text-slate-500">
                                                        {(chiffreAffaires / quantiteVendue).toFixed(2)} €/unité
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
});

RapportDashboard.displayName = 'RapportDashboard';

export default RapportDashboard;
