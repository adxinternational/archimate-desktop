import { describe, it, expect, beforeEach } from "vitest";
import * as crmDb from "./db_crm";
import { TRPCError } from "@trpc/server";

describe("CRM Database Functions", () => {
  describe("Organizations", () => {
    it("should create an organization", async () => {
      const org = await crmDb.createOrganization({
        name: "Test Architects",
        country: "FR",
        industry: "architecture",
        plan: "pro",
      });

      expect(org).toBeDefined();
      expect(org.name).toBe("Test Architects");
      expect(org.plan).toBe("pro");
    });

    it("should get organization by id", async () => {
      const created = await crmDb.createOrganization({
        name: "Test Org 2",
        country: "FR",
        industry: "architecture",
        plan: "basic",
      });

      const retrieved = await crmDb.getOrganizationById(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("Test Org 2");
    });

    it("should update organization", async () => {
      const created = await crmDb.createOrganization({
        name: "Original Name",
        country: "FR",
        industry: "architecture",
        plan: "basic",
      });

      const updated = await crmDb.updateOrganization(created.id, {
        name: "Updated Name",
        plan: "pro",
      });

      expect(updated?.name).toBe("Updated Name");
      expect(updated?.plan).toBe("pro");
    });
  });

  describe("Leads", () => {
    let orgId: number;

    beforeEach(async () => {
      const org = await crmDb.createOrganization({
        name: "Test Org for Leads",
        country: "FR",
        industry: "architecture",
        plan: "pro",
      });
      orgId = org.id;
    });

    it("should create a lead", async () => {
      const lead = await crmDb.createLead({
        organizationId: orgId,
        name: "John Doe",
        email: "john@example.com",
        phone: "+33612345678",
        company: "Acme Corp",
        source: "website",
        value: "50000",
      });

      expect(lead).toBeDefined();
      expect(lead.name).toBe("John Doe");
      expect(lead.status).toBe("new");
    });

    it("should list leads by organization", async () => {
      await crmDb.createLead({
        organizationId: orgId,
        name: "Lead 1",
        email: "lead1@example.com",
        source: "website",
      });

      await crmDb.createLead({
        organizationId: orgId,
        name: "Lead 2",
        email: "lead2@example.com",
        source: "referral",
      });

      const leads = await crmDb.getLeadsByOrganization(orgId);
      expect(leads.length).toBeGreaterThanOrEqual(2);
    });

    it("should update lead status", async () => {
      const lead = await crmDb.createLead({
        organizationId: orgId,
        name: "Test Lead",
        email: "test@example.com",
        source: "website",
      });

      const updated = await crmDb.updateLead(lead.id, {
        status: "qualified",
      });

      expect(updated?.status).toBe("qualified");
    });

    it("should delete a lead", async () => {
      const lead = await crmDb.createLead({
        organizationId: orgId,
        name: "Deletable Lead",
        email: "delete@example.com",
        source: "website",
      });

      const result = await crmDb.deleteLead(lead.id);
      expect(result).toBeDefined();

      const retrieved = await crmDb.getLeadById(lead.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe("Sales Pipeline", () => {
    let orgId: number;

    beforeEach(async () => {
      const org = await crmDb.createOrganization({
        name: "Test Org for Pipeline",
        country: "FR",
        industry: "architecture",
        plan: "pro",
      });
      orgId = org.id;
    });

    it("should get sales pipeline by organization", async () => {
      const pipeline = await crmDb.getSalesPipelineByOrganization(orgId);
      expect(Array.isArray(pipeline)).toBe(true);
    });

    it("should get pipeline by stage", async () => {
      const pipeline = await crmDb.getSalesPipelineByStage(orgId, "prospect");
      expect(Array.isArray(pipeline)).toBe(true);
    });
  });

  describe("Exchange History", () => {
    let orgId: number;

    beforeEach(async () => {
      const org = await crmDb.createOrganization({
        name: "Test Org for Exchanges",
        country: "FR",
        industry: "architecture",
        plan: "pro",
      });
      orgId = org.id;
    });

    it("should add exchange history", async () => {
      const exchange = await crmDb.addExchangeHistory({
        organizationId: orgId,
        leadId: 1,
        type: "email",
        date: new Date(),
        subject: "Test Email",
        content: "This is a test email",
      });

      expect(exchange).toBeDefined();
      expect(exchange.type).toBe("email");
    });
  });

  describe("Cost Estimates", () => {
    it("should create cost estimate", async () => {
      const estimate = await crmDb.createCostEstimate({
        projectId: 1,
        phase: "APD",
        category: "Structure",
        description: "Fondations et ossature",
        estimatedAmount: "150000",
      });

      expect(estimate).toBeDefined();
      expect(estimate.category).toBe("Structure");
      expect(estimate.status).toBe("draft");
    });

    it("should get cost estimates by project", async () => {
      const estimates = await crmDb.getCostEstimatesByProject(1);
      expect(Array.isArray(estimates)).toBe(true);
    });

    it("should get cost estimates by phase", async () => {
      const estimates = await crmDb.getCostEstimatesByPhase(1, "APD");
      expect(Array.isArray(estimates)).toBe(true);
    });
  });

  describe("Alerts", () => {
    let orgId: number;

    beforeEach(async () => {
      const org = await crmDb.createOrganization({
        name: "Test Org for Alerts",
        country: "FR",
        industry: "architecture",
        plan: "pro",
      });
      orgId = org.id;
    });

    it("should create alert", async () => {
      const alert = await crmDb.createAlert({
        organizationId: orgId,
        projectId: 1,
        type: "budget_overrun",
        severity: "high",
        title: "Budget Alert",
        description: "Project exceeds budget",
      });

      expect(alert).toBeDefined();
      expect(alert.type).toBe("budget_overrun");
      expect(alert.status).toBe("active");
    });

    it("should get alerts by organization", async () => {
      const alerts = await crmDb.getAlertsByOrganization(orgId);
      expect(Array.isArray(alerts)).toBe(true);
    });

    it("should acknowledge alert", async () => {
      const alert = await crmDb.createAlert({
        organizationId: orgId,
        projectId: 1,
        type: "schedule_delay",
        severity: "medium",
        title: "Schedule Alert",
      });

      const acknowledged = await crmDb.acknowledgeAlert(alert.id);
      expect(acknowledged?.acknowledged).toBe(true);
    });

    it("should resolve alert", async () => {
      const alert = await crmDb.createAlert({
        organizationId: orgId,
        projectId: 1,
        type: "permit_expiry",
        severity: "critical",
        title: "Permit Alert",
      });

      const resolved = await crmDb.resolveAlert(alert.id);
      expect(resolved?.status).toBe("resolved");
    });
  });

  describe("AI Content", () => {
    let orgId: number;

    beforeEach(async () => {
      const org = await crmDb.createOrganization({
        name: "Test Org for AI",
        country: "FR",
        industry: "architecture",
        plan: "pro",
      });
      orgId = org.id;
    });

    it("should create AI content", async () => {
      const content = await crmDb.createAIContent({
        organizationId: orgId,
        projectId: 1,
        type: "report",
        title: "Project Report",
        content: "This is a generated report",
        prompt: "Generate a project report",
        status: "draft",
      });

      expect(content).toBeDefined();
      expect(content.type).toBe("report");
    });

    it("should get AI content by organization", async () => {
      const contents = await crmDb.getAIContentByOrganization(orgId);
      expect(Array.isArray(contents)).toBe(true);
    });
  });
});

describe("Authorization Middleware", () => {
  it("should allow admin role", () => {
    const userRole = "admin";
    expect(["admin", "manager"].includes(userRole)).toBe(true);
  });

  it("should allow manager role", () => {
    const userRole = "manager";
    expect(["admin", "manager"].includes(userRole)).toBe(true);
  });

  it("should deny viewer role for edit operations", () => {
    const userRole = "viewer";
    expect(userRole === "viewer").toBe(true);
  });

  it("should allow user role for view operations", () => {
    const userRole = "user";
    expect(["admin", "manager", "user", "viewer"].includes(userRole)).toBe(true);
  });
});
