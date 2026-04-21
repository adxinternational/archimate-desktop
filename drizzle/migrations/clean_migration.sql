CREATE TABLE `admin_procedures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('PC','DP','AT','CU','ERP','autre') NOT NULL DEFAULT 'PC',
	`referenceNumber` varchar(100),
	`status` enum('draft','submitted','approved','rejected','expired') NOT NULL DEFAULT 'draft',
	`submissionDate` timestamp,
	`approvalDate` timestamp,
	`expiryDate` timestamp,
	`dueDate` timestamp,
	`notes` text,
	`fileUrl` text,
	`fileKey` text,
	`checklist` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_procedures_id` PRIMARY KEY(`id`)
);

CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('deadline','budget','incident','task','crm','other') NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`link` text,
	`isRead` boolean DEFAULT false,
	`isResolved` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);

CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('individual','company','public') NOT NULL DEFAULT 'individual',
	`email` varchar(320),
	`phone` varchar(50),
	`address` text,
	`city` varchar(100),
	`notes` text,
	`status` enum('prospect','active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);

CREATE TABLE `construction_sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`status` enum('active','completed','suspended') NOT NULL DEFAULT 'active',
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `construction_sites_id` PRIMARY KEY(`id`)
);

CREATE TABLE `cost_estimates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`phase` enum('esq','aps','apd','pro','dce','exe','det','aor') NOT NULL,
	`category` varchar(255) NOT NULL,
	`description` text,
	`estimatedAmount` decimal(15,2) DEFAULT '0',
	`actualAmount` decimal(15,2) DEFAULT '0',
	`status` enum('draft','approved','rejected') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cost_estimates_id` PRIMARY KEY(`id`)
);

CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('plan','report','contract','permit','photo','cctp','dpgf','bim','other') NOT NULL DEFAULT 'other',
	`phase` enum('esq','aps','apd','pro','dce','exe','det','aor'),
	`version` int DEFAULT 1,
	`fileUrl` text,
	`fileKey` text,
	`mimeType` varchar(100),
	`fileSize` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);

CREATE TABLE `enterprises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`trade` varchar(100),
	`contactName` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`address` text,
	`rating` float,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `enterprises_id` PRIMARY KEY(`id`)
);

CREATE TABLE `exchange_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int,
	`leadId` int,
	`type` enum('email','call','meeting','note','document','proposal') NOT NULL,
	`date` timestamp NOT NULL,
	`subject` varchar(255),
	`content` text,
	`createdBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exchange_history_id` PRIMARY KEY(`id`)
);

CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`category` varchar(100) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`date` timestamp NOT NULL,
	`description` text,
	`vendor` varchar(255),
	`status` enum('pending','approved','reimbursed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);

CREATE TABLE `gantt_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`siteId` int,
	`title` varchar(255) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`progress` int DEFAULT 0,
	`dependencies` json,
	`color` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gantt_tasks_id` PRIMARY KEY(`id`)
);

CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`dueDate` timestamp,
	`resolvedDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);

CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`number` varchar(50) NOT NULL,
	`projectId` int,
	`clientId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`tax` decimal(15,2) DEFAULT '0',
	`total` decimal(15,2) NOT NULL,
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`issueDate` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`paidDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_number_unique` UNIQUE(`number`)
);

CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`company` varchar(255),
	`source` enum('website','referral','cold_call','email','event','other') NOT NULL DEFAULT 'other',
	`status` enum('new','contacted','qualified','proposal','negotiation','won','lost') NOT NULL DEFAULT 'new',
	`value` decimal(12,2) DEFAULT '0',
	`expectedCloseDate` timestamp,
	`notes` text,
	`convertedClientId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);

CREATE TABLE `meeting_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int,
	`projectId` int,
	`title` varchar(255) NOT NULL,
	`date` timestamp NOT NULL,
	`location` varchar(255),
	`content` text,
	`attendees` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meeting_reports_id` PRIMARY KEY(`id`)
);

CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`country` varchar(100),
	`industry` varchar(100),
	`logo` text,
	`plan` enum('basic','pro','enterprise') NOT NULL DEFAULT 'basic',
	`status` enum('active','suspended','cancelled') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);

CREATE TABLE `phase_checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`phase` enum('esq','aps','apd','pro','dce','exe','det','aor') NOT NULL,
	`items` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `phase_checklists_id` PRIMARY KEY(`id`)
);

CREATE TABLE `project_deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`phase` enum('esq','aps','apd','pro','dce','exe','det','aor') NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','in_progress','completed','approved','rejected') NOT NULL DEFAULT 'pending',
	`dueDate` timestamp,
	`completedDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_deliverables_id` PRIMARY KEY(`id`)
);

CREATE TABLE `project_phases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`phase` enum('esq','aps','apd','pro','dce','exe','det','aor') NOT NULL,
	`status` enum('pending','in_progress','completed','skipped') NOT NULL DEFAULT 'pending',
	`startDate` timestamp,
	`endDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_phases_id` PRIMARY KEY(`id`)
);

CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`clientId` int,
	`leadId` int,
	`type` varchar(100),
	`description` text,
	`address` text,
	`city` varchar(100),
	`surface` float,
	`currentPhase` enum('esq','aps','apd','pro','dce','exe','det','aor') NOT NULL DEFAULT 'esq',
	`status` enum('active','on_hold','completed','cancelled') NOT NULL DEFAULT 'active',
	`budgetEstimated` float DEFAULT 0,
	`budgetActual` float DEFAULT 0,
	`startDate` timestamp,
	`endDate` timestamp,
	`progress` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);

CREATE TABLE `site_enterprises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`enterpriseId` int NOT NULL,
	`role` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_enterprises_id` PRIMARY KEY(`id`)
);

CREATE TABLE `site_journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`date` timestamp NOT NULL,
	`weather` varchar(100),
	`temperature` float,
	`content` text,
	`author` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_journal_entries_id` PRIMARY KEY(`id`)
);

CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('todo','in_progress','review','done') NOT NULL DEFAULT 'todo',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`dueDate` timestamp,
	`assigneeId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);

CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(100),
	`email` varchar(320),
	`phone` varchar(50),
	`hourlyRate` float,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);

CREATE TABLE `time_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`projectId` int,
	`taskId` int,
	`date` timestamp NOT NULL,
	`duration` float NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `time_entries_id` PRIMARY KEY(`id`)
);

CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

ALTER TABLE `admin_procedures` ADD CONSTRAINT `admin_procedures_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `construction_sites` ADD CONSTRAINT `construction_sites_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `cost_estimates` ADD CONSTRAINT `cost_estimates_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `documents` ADD CONSTRAINT `documents_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `exchange_history` ADD CONSTRAINT `exchange_history_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `exchange_history` ADD CONSTRAINT `exchange_history_leadId_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `gantt_tasks` ADD CONSTRAINT `gantt_tasks_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `gantt_tasks` ADD CONSTRAINT `gantt_tasks_siteId_construction_sites_id_fk` FOREIGN KEY (`siteId`) REFERENCES `construction_sites`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_siteId_construction_sites_id_fk` FOREIGN KEY (`siteId`) REFERENCES `construction_sites`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `meeting_reports` ADD CONSTRAINT `meeting_reports_siteId_construction_sites_id_fk` FOREIGN KEY (`siteId`) REFERENCES `construction_sites`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `meeting_reports` ADD CONSTRAINT `meeting_reports_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `phase_checklists` ADD CONSTRAINT `phase_checklists_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `project_deliverables` ADD CONSTRAINT `project_deliverables_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `project_phases` ADD CONSTRAINT `project_phases_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `projects` ADD CONSTRAINT `projects_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `projects` ADD CONSTRAINT `projects_leadId_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `site_enterprises` ADD CONSTRAINT `site_enterprises_siteId_construction_sites_id_fk` FOREIGN KEY (`siteId`) REFERENCES `construction_sites`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `site_enterprises` ADD CONSTRAINT `site_enterprises_enterpriseId_enterprises_id_fk` FOREIGN KEY (`enterpriseId`) REFERENCES `enterprises`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `site_journal_entries` ADD CONSTRAINT `site_journal_entries_siteId_construction_sites_id_fk` FOREIGN KEY (`siteId`) REFERENCES `construction_sites`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assigneeId_team_members_id_fk` FOREIGN KEY (`assigneeId`) REFERENCES `team_members`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `time_entries` ADD CONSTRAINT `time_entries_memberId_team_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `team_members`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `time_entries` ADD CONSTRAINT `time_entries_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `time_entries` ADD CONSTRAINT `time_entries_taskId_tasks_id_fk` FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON DELETE set null ON UPDATE no action;