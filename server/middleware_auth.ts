import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./_core/trpc";

/**
 * Role-based authorization middleware for tRPC procedures
 * Enforces role checks on sensitive operations
 */

export type UserRole = "admin" | "manager" | "user" | "viewer";

/**
 * Procedure that requires admin role (organization admin)
 */
export const adminOrgProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Seuls les administrateurs peuvent accéder à cette ressource",
    });
  }
  return next({ ctx });
});

/**
 * Procedure that requires manager or admin role
 */
export const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
  const userRole = ctx.user.role as UserRole;
  if (userRole !== "admin" && userRole !== "manager") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Seuls les gestionnaires et administrateurs peuvent accéder à cette ressource",
    });
  }
  return next({ ctx });
});

/**
 * Procedure that requires authenticated user (any role except viewer)
 */
export const editorProcedure = protectedProcedure.use(({ ctx, next }) => {
  const userRole = ctx.user.role as UserRole;
  if (userRole === "viewer") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Les lecteurs n'ont pas accès à cette action",
    });
  }
  return next({ ctx });
});

/**
 * Procedure for read-only access (all authenticated users)
 */
export const readerProcedure = protectedProcedure;

/**
 * Helper function to check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Helper function to check if user can edit organization resource
 */
export function canEditOrganization(userRole: UserRole): boolean {
  return hasRole(userRole, ["admin", "manager"]);
}

/**
 * Helper function to check if user can delete organization resource
 */
export function canDeleteOrganization(userRole: UserRole): boolean {
  return hasRole(userRole, ["admin"]);
}

/**
 * Helper function to check if user can view organization resource
 */
export function canViewOrganization(userRole: UserRole): boolean {
  return hasRole(userRole, ["admin", "manager", "user", "viewer"]);
}
