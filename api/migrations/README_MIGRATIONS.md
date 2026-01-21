# 📋 Guide des Migrations - Base de données Kaonty

## 🆕 Nouvelles migrations créées (19 Janvier 2026)

### Tables complètes créées

#### 1️⃣ **Immobilisations**
- `20260119000001-create-details-immo.js` - Table principale des immobilisations
- `20260119000002-create-details-immo-lignes.js` - Lignes d'amortissement

#### 2️⃣ **Rapprochements bancaires**
- `20260119000003-create-rapprochements.js` - Gestion des rapprochements

#### 3️⃣ **IRSA (Paie)**
- `20260119000004-create-avantage-natures.js` - Avantages en nature
- `20260119000005-create-indemnites.js` - Indemnités

#### 4️⃣ **Tables principales complètes (avec TOUTES les colonnes)**
- `20260119100001-create-complete-journals.js` - Table journals complète
- `20260119100002-create-complete-dossiers.js` - Table dossiers complète
- `20260119100003-create-complete-exercices.js` - Table exercices complète

### Colonnes ajoutées aux tables existantes

#### 5️⃣ **Mise à jour journals**
- `20260119000006-add-missing-columns-to-journals.js`
  - fichier, id_immob, declisi*, rapprocher, date_rapprochement, timestamps

#### 6️⃣ **Mise à jour dossiers**
- `20260119000007-add-missing-columns-to-dossiers.js`
  - province, region, district, commune, compteisi, immo_amort_base_jours, timestamps

---

## 🚀 Comment appliquer les migrations

### Option 1 : Nouvelles tables uniquement
Si vous avez déjà les tables `journals`, `dossiers`, `exercices` mais qu'il manque des colonnes :

```bash
cd c:\Users\Number One\Documents\GitHub\kaonty\api
npx sequelize-cli db:migrate
```

Cela appliquera :
- Les 5 nouvelles tables (details_immo, details_immo_lignes, rapprochements, avantage_natures, indemnites)
- Les colonnes manquantes dans journals et dossiers

### Option 2 : Recréer complètement les tables
Si vous voulez recréer les tables `journals`, `dossiers`, `exercices` avec toutes les colonnes :

1. **Sauvegarder vos données** (IMPORTANT !)
2. Supprimer les anciennes migrations de ces tables
3. Utiliser les nouvelles migrations complètes (20260119100001, 20260119100002, 20260119100003)

---

## 📊 Détails des tables créées

### `details_immo` (30+ colonnes)
- Informations de base : code, intitulé, fournisseur
- Dates : acquisition, mise en service, sortie, reprises
- Montants : HT, TTC, TVA, VNC, prix de vente
- Amortissements comptables : amort_ant_comp, dotation_periode_comp, etc.
- Amortissements fiscaux : amort_ant_fisc, dotation_periode_fisc, etc.
- Reprises : flags et dates pour reprise comptable/fiscale

### `details_immo_lignes`
- Lignes d'amortissement par exercice
- Calculs comptables et fiscaux
- Dotations, cumuls, VNC, dérogatoire

### `rapprochements`
- Périodes de rapprochement (date_debut, date_fin)
- Soldes : comptable, bancaire, non rapproché
- Liens : dossier, exercice, compte

### `avantage_natures` & `indemnites`
- Pour la gestion IRSA
- Montants imposables et non imposables

### `journals` (version complète)
- Toutes les colonnes du modèle
- Déclarations TVA et ISI
- Rapprochements bancaires
- Immobilisations

### `dossiers` (version complète)
- Toutes les informations du dossier
- Localisation complète (province, région, district, commune)
- Configuration comptable
- Paramètres fiscaux

---

## ⚠️ Notes importantes

1. **PostgreSQL requis** : La colonne `id_portefeuille` utilise le type ARRAY
2. **Sécurité** : Les migrations "add-missing-columns" utilisent `.catch()` pour éviter les erreurs si une colonne existe déjà
3. **Index** : Tous les index nécessaires sont créés automatiquement
4. **Timestamps** : createdAt et updatedAt ajoutés à toutes les tables

---

## 🔄 Rollback (annuler les migrations)

Pour annuler la dernière migration :
```bash
npx sequelize-cli db:migrate:undo
```

Pour annuler toutes les migrations :
```bash
npx sequelize-cli db:migrate:undo:all
```

---

## ✅ Vérification

Après avoir exécuté les migrations, vérifiez dans votre base de données que :
- Les 5 nouvelles tables existent
- Les colonnes manquantes ont été ajoutées
- Les index sont créés
- Les clés étrangères fonctionnent

---

**Créé le** : 19 Janvier 2026  
**Auteur** : Cascade AI  
**Version** : 1.0
