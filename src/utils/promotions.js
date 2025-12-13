/**
 * Utilitaires pour gérer les promotions
 */

/**
 * Calcule le prix après application d'une promotion
 * @param {number} prixInitial - Prix initial du produit
 * @param {Object} promotion - Objet promotion avec typePromotion et valeur
 * @returns {number} Prix réduit
 */
export function calculateDiscountedPrice(prixInitial, promotion) {
    if (!promotion || !promotion.typePromotion || !promotion.valeur) {
        return prixInitial;
    }

    const { typePromotion, valeur } = promotion;

    switch (typePromotion) {
        case 'POURCENTAGE':
            // Réduction en pourcentage : NouveauPrix = PrixInitial * (1 - valeur/100)
            return Math.max(0.0, prixInitial * (1 - valeur / 100.0));

        case 'MONTANT_FIXE':
        case 'MONTANT':
            // Réduction en montant fixe : NouveauPrix = PrixInitial - valeur
            return Math.max(0.0, prixInitial - valeur);

        case 'CODE_PROMO':
            // Traité comme un pourcentage pour l'instant
            const reductionCode = prixInitial * (valeur / 100.0);
            return Math.max(0.0, prixInitial - reductionCode);

        default:
            return prixInitial;
    }
}

/**
 * Trouve la meilleure promotion pour un produit (par catégorie ou produitId)
 * Priorité : Promotion sur produit spécifique > Promotion sur catégorie
 * Compare toutes les promotions applicables et retourne celle qui donne le meilleur prix
 * @param {Object} produit - Produit avec id et categorie
 * @param {Array} promotions - Liste des promotions actives
 * @param {number} prixInitial - Prix initial pour comparer
 * @returns {Object|null} La meilleure promotion ou null
 */
export function findBestPromotionForProduct(produit, promotions, prixInitial) {
    if (!produit || !promotions || promotions.length === 0) {
        console.log('❌ Pas de promotions ou produit manquant', { produit, promotionsLength: promotions?.length });
        return null;
    }

    // DEBUG
    console.log(`🔍 Recherche promo pour produit:`, {
        id: produit.id,
        nom: produit.nom,
        categorie: produit.categorie,
        prixInitial
    });
    console.log(`🔍 Promotions à vérifier:`, promotions.map(p => ({
        id: p.id,
        nom: p.nom,
        actif: p.actif,
        categorie: p.categorie,
        produitId: p.produitId,
        dateDebut: p.dateDebut,
        dateFin: p.dateFin
    })));

    // 1. D'abord chercher une promotion sur le produit spécifique (produitId)
    if (produit.id) {
        const promotionsProduit = promotions.filter(promo => {
            const match = promo.actif && 
                promo.produitId === produit.id &&
                isPromotionActive(promo);
            if (match) {
                console.log(`✅ Promotion produit trouvée:`, promo.nom);
            }
            return match;
        });

        if (promotionsProduit.length > 0) {
            // Trouver la meilleure promotion sur ce produit
            let meilleurePromoProduit = null;
            let meilleurPrixProduit = prixInitial;

            for (const promo of promotionsProduit) {
                const prixAvecPromo = calculateDiscountedPrice(prixInitial, promo);
                if (prixAvecPromo < meilleurPrixProduit) {
                    meilleurPrixProduit = prixAvecPromo;
                    meilleurePromoProduit = promo;
                }
            }

            if (meilleurePromoProduit) {
                return meilleurePromoProduit;
            }
        }
    }

    // 2. Sinon, chercher une promotion sur la catégorie
    if (!produit.categorie) {
        return null;
    }

    const promotionsCategorie = promotions.filter(promo => {
        const matchCategorie = promo.categorie && produit.categorie && 
                              promo.categorie.trim().toUpperCase() === produit.categorie.trim().toUpperCase();
        const match = promo.actif && 
                     matchCategorie &&
                     !promo.produitId && // Exclure les promotions sur produit spécifique
                     isPromotionActive(promo);
        if (match || (matchCategorie && promo.actif)) {
            console.log(`🔍 Promotion catégorie vérifiée:`, {
                promoNom: promo.nom,
                promoCategorie: promo.categorie,
                produitCategorie: produit.categorie,
                matchCategorie,
                actif: promo.actif,
                isActive: isPromotionActive(promo),
                produitId: promo.produitId,
                match
            });
        }
        return match;
    });

    if (promotionsCategorie.length === 0) {
        console.log(`❌ Aucune promotion catégorie trouvée pour "${produit.categorie}"`);
        return null;
    }

    console.log(`✅ ${promotionsCategorie.length} promotion(s) catégorie trouvée(s) pour "${produit.categorie}"`);

    // Trouver la promotion qui donne le meilleur prix (le plus bas)
    let meilleurePromotion = null;
    let meilleurPrix = prixInitial;

    for (const promo of promotionsCategorie) {
        const prixAvecPromo = calculateDiscountedPrice(prixInitial, promo);
        console.log(`  - ${promo.nom}: ${prixInitial}€ -> ${prixAvecPromo}€`);
        if (prixAvecPromo < meilleurPrix) {
            meilleurPrix = prixAvecPromo;
            meilleurePromotion = promo;
        }
    }

    if (meilleurePromotion) {
        console.log(`✅ Meilleure promotion sélectionnée: ${meilleurePromotion.nom}`);
    }

    return meilleurePromotion;
}

/**
 * Vérifie si une promotion est active (dans sa période de validité)
 * @param {Object} promotion - Promotion à vérifier
 * @returns {boolean} True si la promotion est active
 */
function isPromotionActive(promotion) {
    if (!promotion.dateDebut || !promotion.dateFin) {
        console.log('⚠️ Promotion sans dates, considérée active:', promotion.nom);
        return true; // Si pas de dates, on considère active
    }

    const now = new Date();
    const dateDebut = new Date(promotion.dateDebut);
    const dateFin = new Date(promotion.dateFin);
    
    // Réinitialiser les heures pour comparer uniquement les dates
    now.setHours(0, 0, 0, 0);
    dateDebut.setHours(0, 0, 0, 0);
    dateFin.setHours(23, 59, 59, 999);

    const isActive = now >= dateDebut && now <= dateFin;
    
    if (!isActive) {
        console.log('❌ Promotion expirée ou pas encore active:', {
            nom: promotion.nom,
            now: now.toISOString(),
            dateDebut: dateDebut.toISOString(),
            dateFin: dateFin.toISOString()
        });
    }
    
    return isActive;
}

/**
 * Formate le texte de la promotion pour l'affichage
 * @param {Object} promotion - Promotion
 * @returns {string} Texte formaté (ex: "-10%" ou "-5€")
 */
export function formatPromotionText(promotion) {
    if (!promotion) return '';

    const { typePromotion, valeur, nom } = promotion;

    switch (typePromotion) {
        case 'POURCENTAGE':
            return `-${valeur}%`;
        case 'MONTANT_FIXE':
            return `-${valeur.toFixed(2)}€`;
        case 'CODE_PROMO':
            return nom || `-${valeur}%`;
        default:
            return nom || 'PROMO';
    }
}

