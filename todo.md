# ArchiMate Desktop - TODO

## Infrastructure & Base
- [x] Schéma base de données (projets, clients, chantiers, équipe, finances)
- [x] Migrations SQL et types partagés
- [x] Routes tRPC pour tous les modules
- [x] Layout principal avec sidebar navigation
- [x] Thème et design system professionnel

## Module Dashboard
- [x] KPIs (projets actifs, budget total, tâches en retard, heures du mois)
- [x] Projets récents
- [x] Tâches prioritaires
- [x] Graphiques de performance (revenus, dépenses)
- [x] Accès rapide (nouveau projet, nouveau client)

## Module Projets
- [x] Liste des projets avec filtres et recherche
- [x] Création de projet (formulaire complet)
- [x] Détail projet avec onglets (Aperçu, Phases, Documents, Équipe)
- [x] Gestion des phases architecturales (faisabilité → livraison)
- [x] Upload et gestion de documents par projet
- [x] Procédures administratives (permis, autorisations)

## Module Clients
- [x] Liste des clients avec recherche
- [x] Fiche client détaillée (coordonnées, projets, historique)
- [x] Création/édition de client
- [x] Suivi des prospects

## Module Chantier
- [x] Liste des chantiers actifs
- [x] Détail chantier avec onglets (Journal, Réunions, Incidents)
- [x] Journal de chantier (entrées avec description, météo, workers)
- [x] Comptes rendus de réunion
- [x] Gestion des incidents (sévérité, statut, résolution)

## Module Cabinet
- [x] Gestion d'équipe (membres, rôles, taux horaire)
- [x] Attribution et suivi des tâches (Kanban)
- [x] Facturation (création, statuts, montants)
- [x] Dépenses par catégorie
- [x] Tableaux de bord financiers (KPIs revenus/dépenses)

## Qualité & Tests
- [x] Tests vitest pour les routes tRPC principales (12 tests passants)
- [x] Gestion des états vides et erreurs
- [x] Responsive design
- [x] Correction erreurs TypeScript

## Améliorations - Design & Navigation (OOTI-inspired)
- [x] Redesigner la sidebar avec sections collapsibles (Général, Équipe, Gestion, Collaboration, Besoin d'aide)
- [x] Ajouter des icônes modernes pour chaque section
- [x] Implémenter un thème bleu professionnel (comme OOTI)
- [x] Ajouter des badges de notification et compteurs
- [x] Améliorer la barre d'en-tête avec actions rapides

## Améliorations - Graphiques & Analytics
- [x] Ajouter des graphiques de synthèse financière (revenus, coûts, marge)
- [x] Créer des cartes KPI interactives (Facturé, Non payé, Temps enregistré, Note)
- [ ] Ajouter des graphiques par période (jour, mois, année)
- [ ] Implémenter des graphiques de performance par projet
- [x] Ajouter des tableaux de bord financiers avancés

## Améliorations - Fonctionnalités
- [x] Ajouter un module Rapports avec exports PDF
- [x] Ajouter un module Validation avec workflow d'approbation
- [ ] Ajouter un module Notes et Blog
- [x] Ajouter un système de Notifications avancé
- [x] Implémenter des filtres et recherches avancés
- [ ] Ajouter des actions en masse (bulk actions)
- [ ] Ajouter des exports CSV/Excel

## Améliorations - Modules existants
- [x] Enrichir Dashboard avec plus de widgets
- [x] Ajouter des tableaux détaillés pour chaque module
- [ ] Ajouter des modales d'édition rapide
- [ ] Implémenter des actions contextuelles (menu)
- [ ] Ajouter des confirmations de suppression
- [ ] Améliorer les formulaires avec validation avancée

## Nouvelles pages créées (Phase 3-4)
- [x] EnhancedLayout avec sidebar collapsible et top bar
- [x] EnhancedDashboard avec KPIs et graphiques Recharts
- [x] Reports avec liste, filtres et aperçu financier
- [x] Validation avec workflow d'approbation (pending/approved/rejected)
- [x] Notifications avec système de filtrage et timestamps
- [x] Opportunities avec pipeline de ventes et probabilités
- [x] KPICard composant réutilisable avec trends
- [x] FinancialChart composant pour graphiques (area/bar/line)
- [x] Mise à jour App.tsx avec toutes les nouvelles routes
- [x] Thème bleu professionnel OOTI dans index.css
