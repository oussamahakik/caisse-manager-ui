# PROMPT DÉTAILLÉ POUR CORRIGER LES BUGS

## CONTEXTE
L'application CaisseManager a plusieurs erreurs et warnings à corriger :
- Erreurs 500 sur les endpoints backend (plans, logs)
- Warnings ESLint (dépendances useEffect, exports, variables non utilisées)
- Problèmes d'affichage (éléments cachés)
- Fonctionnalité de création de plan qui ne fonctionne pas

---

## 1. CORRIGER LES ERREURS 500 BACKEND

### 1.1 Problème : Erreur 500 sur `/api/plans`
**Cause probable** : La table `plans` n'existe pas dans la base de données ou les colonnes sont manquantes.

**Solution** :
1. Vérifier que la table `plans` existe avec toutes les colonnes nécessaires :
   - `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
   - `nom` (VARCHAR, NOT NULL, UNIQUE)
   - `prix_mensuel` (DOUBLE, NOT NULL)
   - `description` (VARCHAR(1000), nullable)
   - `nombre_restaurants_max` (INT, nullable)
   - `nombre_utilisateurs_max` (INT, nullable)
   - `actif` (BOOLEAN, NOT NULL, DEFAULT true)

2. Si la table n'existe pas, créer un script SQL de migration ou utiliser JPA pour la créer automatiquement.

3. Vérifier que `PlanController` a bien `@PreAuthorize("hasRole('SUPER_ADMIN')")` et que la sécurité est correctement configurée.

4. Ajouter une gestion d'erreur plus détaillée dans le contrôleur pour voir l'erreur exacte :
```java
@GetMapping
@PreAuthorize("hasRole('SUPER_ADMIN')")
public ResponseEntity<?> getAllPlans() {
    try {
        List<Plan> plans = planRepository.findAll();
        return ResponseEntity.ok(plans != null ? plans : java.util.Collections.emptyList());
    } catch (Exception e) {
        e.printStackTrace(); // Pour voir l'erreur dans les logs
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Erreur lors de la récupération des plans", 
                        "message", e.getMessage(),
                        "cause", e.getCause() != null ? e.getCause().getMessage() : "N/A"));
    }
}
```

### 1.2 Problème : Erreur 500 sur `/api/logs` et `/api/logs/export`
**Cause probable** : La table `log_entries` n'existe pas dans la base de données.

**Solution** :
1. Vérifier que la table `log_entries` existe avec toutes les colonnes :
   - `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
   - `timestamp` (DATETIME, NOT NULL)
   - `level` (VARCHAR(50), NOT NULL)
   - `category` (VARCHAR(100), NOT NULL)
   - `message` (VARCHAR(500), NOT NULL)
   - `username` (VARCHAR(100), nullable)
   - `snack_id` (BIGINT, nullable)
   - `details` (VARCHAR(1000), nullable)
   - `ip_address` (VARCHAR(50), nullable)
   - `user_agent` (VARCHAR(200), nullable)

2. Si la table n'existe pas, créer un script SQL ou laisser JPA la créer automatiquement.

3. Pour l'export CSV, vérifier que le Content-Type est correct :
```java
@GetMapping("/export")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public ResponseEntity<?> exportLogs(...) {
    try {
        // ... code existant ...
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", filename);
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(csv.toString());
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500)
            .body(Map.of("error", "Erreur lors de l'export", "message", e.getMessage()));
    }
}
```

---

## 2. CORRIGER LES WARNINGS ESLINT

### 2.1 Warning : `useEffect` manque des dépendances dans `PrintersManager.js`
**Fichier** : `caisse-manager-ui/src/components/PrintersManager.js`
**Ligne** : 28

**Solution** :
```javascript
// AVANT
useEffect(() => {
    fetchPrinters();
}, [snackId]);

// APRÈS - Option 1 : Ajouter fetchPrinters dans les dépendances avec useCallback
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

// OU Option 2 : Désactiver le warning (moins recommandé)
useEffect(() => {
    fetchPrinters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [snackId]);
```

### 2.2 Warning : `useEffect` manque des dépendances dans `PromotionsManager.js`
**Fichier** : `caisse-manager-ui/src/components/PromotionsManager.js`
**Ligne** : 30

**Solution** : Même approche que pour `PrintersManager.js`
```javascript
const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
        const response = await api.get('/api/promotions', {
            headers: { 'X-Snack-ID': snackId?.toString() }
        });
        setPromotions(response.data || []);
    } catch (error) {
        toast.error('Erreur lors du chargement des promotions');
    } finally {
        setIsLoading(false);
    }
}, [snackId]);

useEffect(() => {
    fetchPromotions();
}, [fetchPromotions]);
```

### 2.3 Warning : Export anonyme dans `i18n/index.js`
**Fichier** : `caisse-manager-ui/src/i18n/index.js`
**Ligne** : 42

**Solution** :
```javascript
// AVANT
export default { setLanguage, getLanguage, t };

// APRÈS
const i18n = { setLanguage, getLanguage, t };
export default i18n;
```

### 2.4 Warning : `t` défini mais jamais utilisé dans `LanguageToggle.js`
**Fichier** : `caisse-manager-ui/src/components/LanguageToggle.js`
**Ligne** : 4

**Solution** :
```javascript
// AVANT
import { setLanguage, getLanguage, t } from '../i18n';

// APRÈS - Supprimer t de l'import
import { setLanguage, getLanguage } from '../i18n';
```

---

## 3. CORRIGER LES PROBLÈMES D'AFFICHAGE

### 3.1 Problème : Éléments cachés ou mal affichés
**Causes possibles** :
- Classes CSS avec `hidden` ou `opacity-0`
- Problèmes de z-index
- Problèmes de hauteur/largeur (overflow hidden)
- Problèmes de dark mode

**Solution** :
1. Vérifier dans `SuperAdminDashboard.js` que les sections sont bien visibles :
```javascript
// Vérifier que les onglets sont bien affichés
{activeTab === 'plans' && (
    <div className="glass-strong rounded-3xl shadow-2xl p-8 border border-blue-200/60 dark:border-blue-500/30">
        <PlansManagement token={token} />
    </div>
)}
```

2. Vérifier que les modales ne sont pas cachées :
```javascript
// S'assurer que les modales ont un z-index élevé
<motion.div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    // z-50 est correct pour les modales
>
```

3. Vérifier les classes de visibilité dans les composants :
   - Remplacer `hidden` par `block` ou `flex` si nécessaire
   - Vérifier les conditions de rendu conditionnel
   - Vérifier que `isLoading` ne bloque pas l'affichage

4. Ajouter des styles de débogage temporaires :
```javascript
<div className="border-2 border-red-500 p-4"> {/* Pour voir les limites */}
    {/* Contenu */}
</div>
```

---

## 4. CORRIGER LA FONCTIONNALITÉ DE CRÉATION DE PLAN

### 4.1 Problème : La création de plan ne fonctionne pas
**Causes possibles** :
- Erreur backend (500)
- Données mal formatées
- Token d'authentification invalide
- Validation échouée

**Solution** :

1. **Vérifier le payload envoyé** dans `PlansManagement.js` :
```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            nom: formData.nom,
            prixMensuel: parseFloat(formData.prixMensuel) || 0,
            description: formData.description || null,
            nombreRestaurantsMax: formData.nombreRestaurantsMax ? parseInt(formData.nombreRestaurantsMax) : null,
            nombreUtilisateursMax: formData.nombreUtilisateursMax ? parseInt(formData.nombreUtilisateursMax) : null,
            actif: formData.actif !== undefined ? formData.actif : true
        };

        console.log('Payload envoyé:', payload); // Pour déboguer

        if (isEditMode) {
            await api.put(`/api/plans/${selectedPlan.id}`, payload);
            toast.success('Plan modifié avec succès');
        } else {
            const response = await api.post('/api/plans', payload);
            console.log('Réponse serveur:', response.data); // Pour déboguer
            toast.success('Plan créé avec succès');
        }
        setIsModalOpen(false);
        fetchPlans();
    } catch (error) {
        console.error('Erreur détaillée:', error.response?.data || error.message); // Pour déboguer
        toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement du plan');
    }
};
```

2. **Vérifier la validation côté backend** dans `PlanController.java` :
```java
@PostMapping
@PreAuthorize("hasRole('SUPER_ADMIN')")
public ResponseEntity<?> createPlan(@RequestBody PlanDTO dto) {
    try {
        // Validation
        if (dto.getNom() == null || dto.getNom().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Le nom du plan est requis"));
        }
        if (dto.getPrixMensuel() == null || dto.getPrixMensuel() < 0) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Le prix mensuel doit être positif"));
        }

        Plan plan = new Plan();
        plan.setNom(dto.getNom().trim());
        plan.setPrixMensuel(dto.getPrixMensuel());
        plan.setDescription(dto.getDescription());
        plan.setNombreRestaurantsMax(dto.getNombreRestaurantsMax());
        plan.setNombreUtilisateursMax(dto.getNombreUtilisateursMax());
        plan.setActif(dto.getActif() != null ? dto.getActif() : true);
        
        plan = planRepository.save(plan);
        return ResponseEntity.ok(plan);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Erreur lors de la création du plan", 
                        "message", e.getMessage()));
    }
}
```

3. **Vérifier que le token est bien envoyé** :
   - Vérifier dans la console du navigateur (Network tab) que le header `Authorization` est présent
   - Vérifier que le token n'est pas expiré

4. **Vérifier les logs backend** pour voir l'erreur exacte

---

## 5. ACTIONS À EFFECTUER DANS L'ORDRE

1. **Créer les tables manquantes dans la base de données** :
   - Exécuter les scripts SQL pour créer `plans` et `log_entries`
   - OU vérifier que JPA crée automatiquement les tables

2. **Corriger les warnings ESLint** :
   - Modifier `PrintersManager.js` et `PromotionsManager.js` pour utiliser `useCallback`
   - Modifier `i18n/index.js` pour l'export nommé
   - Supprimer `t` de l'import dans `LanguageToggle.js`

3. **Corriger les problèmes d'affichage** :
   - Vérifier les classes CSS
   - Vérifier les conditions de rendu
   - Tester en mode clair et sombre

4. **Corriger la création de plan** :
   - Ajouter des logs de débogage
   - Vérifier le payload
   - Vérifier les erreurs backend
   - Tester la création

5. **Tester toutes les fonctionnalités** :
   - Créer un plan
   - Exporter les logs
   - Vérifier l'affichage de tous les composants

---

## 6. SCRIPTS SQL POUR CRÉER LES TABLES

```sql
-- Table plans
CREATE TABLE IF NOT EXISTS plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    prix_mensuel DOUBLE NOT NULL,
    description VARCHAR(1000),
    nombre_restaurants_max INT,
    nombre_utilisateurs_max INT,
    actif BOOLEAN NOT NULL DEFAULT TRUE
);

-- Table log_entries
CREATE TABLE IF NOT EXISTS log_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    level VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    message VARCHAR(500) NOT NULL,
    username VARCHAR(100),
    snack_id BIGINT,
    details VARCHAR(1000),
    ip_address VARCHAR(50),
    user_agent VARCHAR(200)
);

-- Index pour améliorer les performances
CREATE INDEX idx_log_snack_id ON log_entries(snack_id);
CREATE INDEX idx_log_timestamp ON log_entries(timestamp);
CREATE INDEX idx_log_level ON log_entries(level);
```

---

## 7. VÉRIFICATIONS FINALES

- [ ] Les endpoints `/api/plans` retournent 200 OK
- [ ] Les endpoints `/api/logs` retournent 200 OK
- [ ] L'export CSV fonctionne
- [ ] Aucun warning ESLint
- [ ] Tous les éléments sont visibles
- [ ] La création de plan fonctionne
- [ ] Les modales s'ouvrent correctement
- [ ] Le dark mode fonctionne partout

---

## NOTES IMPORTANTES

- Toujours vérifier les logs backend pour voir les erreurs exactes
- Utiliser la console du navigateur (F12) pour voir les erreurs frontend
- Tester avec différents rôles (SUPER_ADMIN, MANAGER)
- Vérifier que la base de données est accessible et que les tables existent


