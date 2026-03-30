# Architecture Operating System - Design Document

**Date** : 30 mars 2026  
**Auteur** : Manus AI - Architecte Logiciel Senior  
**Version** : 1.0

---

## Executive Summary

L'Architecture Operating System (AOS) est une plateforme SaaS professionnelle conçue pour devenir le système d'exploitation numérique des cabinets d'architecture. Elle centralise l'ensemble du cycle de vie des projets architecturaux, de la prospection commerciale jusqu'à la réception des travaux, en remplaçant Excel, WhatsApp, les emails dispersés et les logiciels multiples.

Cette plateforme offre trois niveaux d'abonnement (Basic, Pro, Enterprise) adaptés à différentes tailles de cabinets, avec une architecture scalable, sécurisée et optimisée pour les marchés africains et internationaux.

---

## 1. Architecture Générale

### 1.1 Principes Architecturaux

L'AOS repose sur les principes suivants :

**Modularité** : Chaque domaine métier (CRM, Projets, Chantier, etc.) est implémenté comme un module indépendant avec ses propres tables, procédures et interfaces. Cette approche permet d'ajouter ou de modifier des fonctionnalités sans affecter les autres modules.

**Multi-agences** : La plateforme supporte plusieurs organisations (cabinets) sur une même instance, avec isolation complète des données et gestion des permissions par organisation.

**Scalabilité** : L'architecture est conçue pour supporter des milliers de projets et des millions de documents, avec optimisations de performance au niveau base de données et cache.

**Sécurité** : Authentification OAuth, chiffrement des données sensibles, audit logging complet, et contrôle d'accès granulaire par rôle.

**Intelligence** : Intégration IA native pour automatiser la génération de documents, l'estimation des coûts et la détection des retards.

### 1.2 Stack Technique

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Frontend** | React 19 + Tailwind CSS 4 | Framework moderne, performant, avec écosystème riche |
| **Backend** | Express.js + tRPC 11 | API type-safe, architecture procédurale claire |
| **Base de données** | MySQL 8+ (TiDB compatible) | Scalabilité horizontale, support des transactions ACID |
| **ORM** | Drizzle ORM | Type-safe, migrations versionnées, performance optimale |
| **Authentification** | OAuth Manus | Intégration native, gestion des sessions sécurisée |
| **Stockage fichiers** | AWS S3 (via Manus) | Scalabilité illimitée, versioning, accès rapide |
| **IA** | OpenAI API (via Manus) | Génération de texte, analyse, optimisations |
| **Temps réel** | WebSockets (Socket.io) | Notifications en temps réel, collaboration live |
| **Monitoring** | Logs structurés + Audit Log | Traçabilité complète des opérations |

---

## 2. Architecture de Base de Données

### 2.1 Domaines Métier & Tables

La base de données est organisée en 10 domaines métier majeurs :

#### 2.1.1 Authentification & Organisations

```sql
-- Organisations (cabinets d'architecture)
organizations (id, name, country, industry, logo, plan, status, createdAt)

-- Utilisateurs avec multi-org support
users (id, openId, email, name, role, organizationId, createdAt)

-- Permissions par rôle
rolePermissions (id, organizationId, role, permission, createdAt)
```

#### 2.1.2 CRM & Pipeline Commercial

```sql
-- Leads et prospects
leads (id, organizationId, name, email, phone, source, status, value, createdAt)

-- Clients
clients (id, organizationId, name, type, email, phone, address, status, createdAt)

-- Historique d'échanges
exchangeHistory (id, clientId, type, date, subject, content, attachments, createdAt)

-- Pipeline commercial
salesPipeline (id, organizationId, leadId, stage, value, probability, expectedCloseDate)
```

#### 2.1.3 Gestion des Projets

```sql
-- Projets
projects (id, organizationId, clientId, name, type, address, currentPhase, status, budget, createdAt)

-- Phases architecturales (ESQ, APS, APD, PRO, DCE, EXE, DET, AOR)
projectPhases (id, projectId, phase, status, startDate, endDate, progress, createdAt)

-- Checklists par phase
phaseChecklists (id, projectId, phase, items[], createdAt)

-- Livrables
projectDeliverables (id, projectId, phase, name, status, dueDate, createdAt)
```

#### 2.1.4 Gestion de Chantier

```sql
-- Sites de construction
constructionSites (id, projectId, name, address, status, startDate, endDate, createdAt)

-- Planning Gantt
ganttTasks (id, projectId, siteId, title, startDate, endDate, progress, dependencies[], createdAt)

-- Journal de chantier
siteJournalEntries (id, siteId, date, weather, workDescription, workers, photos[], createdAt)

-- Incidents
incidents (id, siteId, title, severity, status, date, resolution, createdAt)

-- Rapports de réunion
meetingReports (id, siteId, date, attendees[], summary, decisions[], nextActions[], createdAt)
```

#### 2.1.5 Économie de la Construction

```sql
-- Estimations de coûts
costEstimates (id, projectId, phase, description, estimatedAmount, actualAmount, status, createdAt)

-- Devis
quotations (id, projectId, companyId, number, amount, items[], status, validUntil, createdAt)

-- Suivi des coûts
costTracking (id, projectId, phase, category, amount, date, createdAt)

-- Alertes budget
budgetAlerts (id, projectId, phase, threshold, currentAmount, status, createdAt)
```

#### 2.1.6 BIM & Documents

```sql
-- Documents
documents (id, projectId, name, category, phase, fileUrl, fileKey, version, mimeType, createdAt)

-- Annotations sur plans
documentAnnotations (id, documentId, x, y, text, author, resolved, createdAt)

-- Versioning
documentVersions (id, documentId, version, fileUrl, createdBy, createdAt)

-- Commentaires
comments (id, projectId, documentId, author, content, createdAt)
```

#### 2.1.7 Module Administratif

```sql
-- Permis de construire
buildingPermits (id, projectId, referenceNumber, type, status, submissionDate, approvalDate, createdAt)

-- Autorisations urbaines
urbanAuthorizations (id, projectId, type, status, dueDate, createdAt)

-- Documents administratifs
adminDocuments (id, projectId, type, country, fileUrl, status, createdAt)
```

#### 2.1.8 Gestion des Entreprises & Ouvriers

```sql
-- Entreprises
companies (id, organizationId, name, type, email, phone, specialization, rating, createdAt)

-- Ouvriers
workers (id, companyId, name, role, phone, email, specialization, hourlyRate, createdAt)

-- Affectation des tâches
taskAssignments (id, taskId, workerId, startDate, endDate, status, createdAt)

-- Évaluation de performance
performanceRatings (id, workerId, rating, feedback, date, createdAt)
```

#### 2.1.9 Gestion Interne du Cabinet

```sql
-- Équipe interne
teamMembers (id, organizationId, name, role, email, hourlyRate, createdAt)

-- Suivi du temps
timeEntries (id, memberId, projectId, taskId, date, hours, description, createdAt)

-- Facturation
invoices (id, organizationId, clientId, projectId, number, amount, status, dueDate, createdAt)

-- Rentabilité par projet
projectProfitability (id, projectId, revenue, costs, profit, margin, createdAt)
```

#### 2.1.10 Audit & Conformité

```sql
-- Journal d'audit
auditLog (id, organizationId, userId, action, entityType, entityId, oldValue, newValue, timestamp)

-- Notifications
notifications (id, organizationId, userId, type, title, content, read, createdAt)

-- Alertes intelligentes
intelligentAlerts (id, organizationId, type, condition, severity, status, createdAt)
```

### 2.2 Relations & Intégrité

La base de données maintient l'intégrité référentielle à travers des clés étrangères et des contraintes :

- **Cascade delete** : Suppression d'un projet supprime tous ses documents, phases, tâches
- **Soft delete** : Les utilisateurs supprimés restent en base avec un flag `deleted`
- **Audit trail** : Chaque modification est enregistrée dans `auditLog`
- **Isolation multi-org** : Chaque requête filtre par `organizationId` pour l'isolation des données

---

## 3. Architecture Fonctionnelle

### 3.1 Modules & Responsabilités

#### Module CRM (Customer Relationship Management)

**Responsabilités** :
- Gestion complète des leads et prospects
- Pipeline commercial avec étapes configurables
- Historique d'échanges (emails, appels, notes, documents)
- Segmentation et tagging des clients
- Prévisions de revenus

**Endpoints clés** :
- `crm.leads.list/create/update/delete`
- `crm.pipeline.getByStage/moveToStage`
- `crm.exchangeHistory.list/add`
- `crm.clients.convertLead`

#### Module Projets

**Responsabilités** :
- Création et gestion du cycle de vie des projets
- Gestion des 8 phases architecturales normalisées
- Checklists automatiques par phase
- Livrables et jalons
- Suivi du budget et de la progression

**Endpoints clés** :
- `projects.list/create/update/delete`
- `projects.phases.list/update`
- `projects.checklists.get/update`
- `projects.deliverables.list/complete`

#### Module Chantier

**Responsabilités** :
- Planning interactif Gantt
- Journal de chantier structuré
- Gestion des incidents
- Rapports de réunion
- Suivi quotidien avec photos

**Endpoints clés** :
- `sites.gantt.list/create/update`
- `sites.journal.list/add`
- `sites.incidents.list/create/resolve`
- `sites.meetings.list/create`

#### Module Économie

**Responsabilités** :
- Estimation automatique des coûts
- Gestion des devis
- Suivi détaillé des coûts par phase
- Alertes de dépassement budget
- Rapports financiers

**Endpoints clés** :
- `economy.estimates.list/create/approve`
- `economy.quotations.list/send/accept`
- `economy.costTracking.list/add`
- `economy.budgetAlerts.list`

#### Module BIM/Documents

**Responsabilités** :
- Stockage et versioning des documents
- Annotations collaboratives sur plans
- Visualisation intégrée (PDF, images)
- Commentaires et discussions
- Contrôle d'accès par document

**Endpoints clés** :
- `documents.list/upload/delete`
- `documents.versions.list`
- `documents.annotations.list/create`
- `documents.comments.list/add`

#### Module Administratif

**Responsabilités** :
- Gestion des permis de construire
- Suivi des autorisations urbaines
- Templates de documents adaptables par pays
- Workflow d'approbation
- Alertes d'échéances

**Endpoints clés** :
- `admin.permits.list/create/track`
- `admin.authorizations.list/update`
- `admin.documents.list/generate`
- `admin.workflow.approve/reject`

#### Module Entreprises & Ouvriers

**Responsabilités** :
- Base de données des entreprises
- Gestion des ouvriers par entreprise
- Affectation des tâches
- Suivi des performances
- Évaluation des prestataires

**Endpoints clés** :
- `companies.list/create/update`
- `workers.list/create/update`
- `assignments.list/create`
- `performance.ratings.list/add`

#### Module Cabinet

**Responsabilités** :
- Gestion RH interne
- Suivi du temps détaillé
- Facturation intelligente
- Calcul de rentabilité par projet
- Rapports financiers

**Endpoints clés** :
- `cabinet.team.list/create`
- `cabinet.timeEntries.list/add`
- `cabinet.invoices.list/create/send`
- `cabinet.profitability.getByProject`

#### Module IA

**Responsabilités** :
- Génération automatique de comptes rendus
- Génération de CCTP
- Génération de rapports de chantier
- Analyse intelligente des projets
- Suggestions d'optimisation
- Estimation intelligente des coûts
- Détection des retards

**Endpoints clés** :
- `ai.generateReport.mutation`
- `ai.generateCCTP.mutation`
- `ai.analyzeCosts.mutation`
- `ai.detectDelays.mutation`

#### Module Alertes

**Responsabilités** :
- Alertes pour retards de projet
- Alertes de dépassement budgétaire
- Alertes d'échéances administratives
- Alertes de validation de livrables
- Notifications en temps réel

**Endpoints clés** :
- `alerts.list/acknowledge`
- `alerts.settings.update`
- `notifications.subscribe`

---

## 4. Niveaux d'Abonnement SaaS

### 4.1 Version Basic

**Cible** : Petits cabinets (1-5 personnes)  
**Prix** : 99€/mois

| Fonctionnalité | Inclus |
|---|---|
| Gestion clients basique | ✅ |
| Gestion projets simple | ✅ |
| Jusqu'à 5 utilisateurs | ✅ |
| Stockage 10GB | ✅ |
| Support email | ✅ |
| Export PDF basique | ✅ |
| Rapports simples | ✅ |
| Chantier basique | ✅ |
| **IA** | ❌ |
| **Gantt** | ❌ |
| **Intégrations CAO** | ❌ |

### 4.2 Version Pro

**Cible** : Agences structurées (6-20 personnes)  
**Prix** : 299€/mois

| Fonctionnalité | Inclus |
|---|---|
| CRM complet | ✅ |
| Gestion projets avancée | ✅ |
| Planning Gantt | ✅ |
| Jusqu'à 20 utilisateurs | ✅ |
| Stockage 100GB | ✅ |
| Support prioritaire | ✅ |
| Rapports avancés | ✅ |
| Économie de construction | ✅ |
| Module administratif | ✅ |
| Annotations sur plans | ✅ |
| **IA basique** | ✅ |
| **Alertes intelligentes** | ✅ |
| **Intégrations CAO** | ❌ |

### 4.3 Version Enterprise

**Cible** : Grands cabinets / Institutions (20+ personnes)  
**Prix** : Personnalisé

| Fonctionnalité | Inclus |
|---|---|
| Tous les modules | ✅ |
| IA complète | ✅ |
| Intégrations CAO (AutoCAD, Revit, SketchUp, Rhino) | ✅ |
| Utilisateurs illimités | ✅ |
| Stockage illimité | ✅ |
| Support 24/7 | ✅ |
| API personnalisée | ✅ |
| Déploiement custom | ✅ |
| SLA garanti | ✅ |
| Audit logging avancé | ✅ |

---

## 5. Architecture Technique Détaillée

### 5.1 Frontend Architecture

```
client/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx          # Tableau de bord stratégique
│   │   ├── CRM/
│   │   │   ├── Leads.tsx
│   │   │   ├── Clients.tsx
│   │   │   └── Pipeline.tsx
│   │   ├── Projects/
│   │   │   ├── List.tsx
│   │   │   ├── Detail.tsx
│   │   │   └── Phases.tsx
│   │   ├── Sites/
│   │   │   ├── List.tsx
│   │   │   ├── Gantt.tsx
│   │   │   └── Journal.tsx
│   │   ├── Economy/
│   │   │   ├── Estimates.tsx
│   │   │   ├── Quotations.tsx
│   │   │   └── CostTracking.tsx
│   │   ├── Documents/
│   │   │   ├── List.tsx
│   │   │   ├── Viewer.tsx
│   │   │   └── Annotations.tsx
│   │   ├── Admin/
│   │   │   ├── Permits.tsx
│   │   │   └── Authorizations.tsx
│   │   ├── Companies/
│   │   │   ├── List.tsx
│   │   │   └── Workers.tsx
│   │   ├── Cabinet/
│   │   │   ├── Team.tsx
│   │   │   ├── TimeTracking.tsx
│   │   │   └── Invoicing.tsx
│   │   └── Reports/
│   │       ├── Financial.tsx
│   │       ├── Activity.tsx
│   │       └── Custom.tsx
│   ├── components/
│   │   ├── DashboardLayout.tsx    # Layout principal
│   │   ├── GanttChart.tsx         # Planification
│   │   ├── DocumentViewer.tsx     # Visualisation docs
│   │   ├── AnnotationTool.tsx     # Annotations
│   │   ├── AIAssistant.tsx        # Chat IA
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useOrganization.ts
│   │   ├── usePermissions.ts
│   │   └── ...
│   ├── lib/
│   │   ├── trpc.ts
│   │   ├── api.ts
│   │   └── utils.ts
│   └── index.css                  # Design system
```

### 5.2 Backend Architecture

```
server/
├── routers/
│   ├── auth.ts                    # Authentification
│   ├── crm.ts                     # CRM & Pipeline
│   ├── projects.ts                # Gestion projets
│   ├── sites.ts                   # Gestion chantier
│   ├── economy.ts                 # Économie
│   ├── documents.ts               # BIM & Documents
│   ├── admin.ts                   # Module administratif
│   ├── companies.ts               # Entreprises & ouvriers
│   ├── cabinet.ts                 # Gestion interne
│   ├── ai.ts                      # IA
│   ├── alerts.ts                  # Alertes
│   └── reports.ts                 # Rapports
├── db/
│   ├── crm.ts                     # Requêtes CRM
│   ├── projects.ts                # Requêtes projets
│   ├── sites.ts                   # Requêtes chantier
│   ├── economy.ts                 # Requêtes économie
│   ├── documents.ts               # Requêtes documents
│   ├── admin.ts                   # Requêtes admin
│   ├── companies.ts               # Requêtes entreprises
│   ├── cabinet.ts                 # Requêtes cabinet
│   ├── ai.ts                      # Requêtes IA
│   └── alerts.ts                  # Requêtes alertes
├── services/
│   ├── aiService.ts               # Logique IA
│   ├── alertService.ts            # Logique alertes
│   ├── reportService.ts           # Génération rapports
│   └── ...
├── _core/
│   ├── index.ts
│   ├── context.ts
│   ├── trpc.ts
│   └── ...
```

### 5.3 Flux de Données

```
User Action (Frontend)
    ↓
React Component
    ↓
tRPC Hook (useQuery/useMutation)
    ↓
Backend Procedure (publicProcedure/protectedProcedure)
    ↓
Authorization Check (ctx.user, permissions)
    ↓
Database Query (Drizzle ORM)
    ↓
Business Logic (Service Layer)
    ↓
AI Processing (si applicable)
    ↓
Response (Superjson serialization)
    ↓
Frontend State Update
    ↓
UI Re-render
```

---

## 6. Sécurité & Conformité

### 6.1 Authentification & Autorisation

- **OAuth Manus** : Authentification centralisée, pas de gestion de mots de passe
- **Rôles & Permissions** : Admin, Manager, User, Viewer par organisation
- **Isolation multi-org** : Chaque requête filtre par `organizationId`
- **Session sécurisée** : Cookies httpOnly, SameSite=None, Secure

### 6.2 Chiffrement & Données Sensibles

- **Données en transit** : HTTPS/TLS 1.3
- **Données au repos** : Chiffrement des contrats, permis, documents sensibles
- **Fichiers S3** : Versioning, ACL, accès présigné avec expiration

### 6.3 Audit & Conformité

- **Audit Log complet** : Chaque action enregistrée avec userId, timestamp, avant/après
- **RGPD** : Droit à l'oubli, export de données, consentement
- **Conformité locale** : Adaptation aux réglementations par pays (Afrique, Europe)

---

## 7. Performance & Scalabilité

### 7.1 Optimisations Base de Données

- **Indexation** : Index sur `organizationId`, `projectId`, `clientId`, `createdAt`
- **Partitioning** : Partitioning par année pour les tables volumineuses (auditLog, timeEntries)
- **Caching** : Redis pour les KPIs, les listes fréquentes
- **Pagination** : Limit/offset pour les listes longues

### 7.2 Optimisations Frontend

- **Code splitting** : Chargement lazy des modules
- **Memoization** : useMemo pour les calculs coûteux
- **Virtualisation** : Listes virtuelles pour les gros volumes
- **Service Worker** : Mode hors ligne pour les marchés africains

### 7.3 Optimisations Backend

- **Batch processing** : Traitement par lots pour les imports
- **Queue** : Job queue pour les tâches longues (génération rapports, IA)
- **Compression** : Gzip pour les réponses API
- **CDN** : Distribution des fichiers statiques

---

## 8. Intégrations Tierces

### 8.1 Intégrations CAO (Enterprise)

- **AutoCAD** : API REST pour synchronisation des plans
- **Revit** : Plugin pour extraction de données BIM
- **SketchUp** : Extension pour export/import de modèles
- **Rhino** : Grasshopper integration pour paramétrisation

### 8.2 Intégrations Métier

- **Google Maps** : Localisation des projets et chantiers
- **Stripe** : Paiement des abonnements
- **SendGrid** : Envoi d'emails
- **Slack** : Notifications en temps réel

---

## 9. Roadmap de Déploiement

### Phase 1 (Semaines 1-4) : Fondations
- Restructuration multi-org
- CRM complet
- Phases normalisées
- Interface utilisateur

### Phase 2 (Semaines 5-10) : Modules Critiques
- Planning Gantt
- Économie de construction
- BIM & Documents
- Module administratif

### Phase 3 (Semaines 11-15) : IA & Intelligence
- Génération de documents
- Estimation intelligente
- Détection des retards
- Alertes intelligentes

### Phase 4 (Semaines 16-18) : Intégrations
- Intégrations CAO
- Application mobile
- Mode hors ligne
- API publique

---

## 10. Métriques de Succès

| Métrique | Cible |
|----------|-------|
| Temps de chargement (p95) | < 2s |
| Disponibilité | 99.9% |
| Couverture tests | > 80% |
| Adoption utilisateurs | > 80% |
| NPS (Net Promoter Score) | > 50 |
| Rétention clients | > 90% |
| Taux de conversion (Basic → Pro) | > 30% |

---

## Conclusion

L'Architecture Operating System est conçue pour devenir la plateforme indispensable pour les cabinets d'architecture, en combinant une architecture technique solide, une expérience utilisateur intuitive, et une intelligence artificielle intégrée pour automatiser et optimiser chaque aspect de la gestion d'agence.

