import type { Organization as PrismaOrganization, OrganizationMember as PrismaOrganizationMember, OrganizationRole } from "@prisma/client";

export type { OrganizationRole } from "@prisma/client";

export interface Organization {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    storageLimit: bigint;
    maxReports: number;
    maxMembers: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface SerializedOrganization {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    storageLimit: number;
    maxReports: number;
    maxMembers: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrganizationMember {
    id: string;
    role: OrganizationRole;
    organizationId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrganizationMemberWithUser extends OrganizationMember {
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}

export interface OrganizationWithMembers extends Organization {
    members: OrganizationMemberWithUser[];
    _count?: {
        reports: number;
        members: number;
    };
}

export interface CreateOrganizationInput {
    name: string;
    slug: string;
    logoUrl?: string;
    storageLimit?: bigint;
    maxReports?: number;
    maxMembers?: number;
}

export interface UpdateOrganizationInput {
    name?: string;
    slug?: string;
    logoUrl?: string | null;
    storageLimit?: bigint;
    maxReports?: number;
    maxMembers?: number;
}

export interface InviteMemberInput {
    organizationId: string;
    userId: string;
    role?: OrganizationRole;
}

/**
 * Serialize an organization for API responses (BigInt → number)
 */
export function serializeOrganization(org: Organization | PrismaOrganization): SerializedOrganization {
    return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logoUrl: org.logoUrl,
        storageLimit: Number(org.storageLimit),
        maxReports: org.maxReports,
        maxMembers: org.maxMembers,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
    };
}

/**
 * Check if a role has permission to perform an action
 */
export function hasPermission(
    role: OrganizationRole,
    action: "read" | "write" | "delete" | "manage_members" | "manage_settings"
): boolean {
    const permissions: Record<OrganizationRole, string[]> = {
        OWNER: ["read", "write", "delete", "manage_members", "manage_settings"],
        ADMIN: ["read", "write", "delete", "manage_members"],
        MEMBER: ["read", "write"],
        VIEWER: ["read"],
    };

    return permissions[role]?.includes(action) ?? false;
}

/**
 * Generate a URL-friendly slug from organization name
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);
}
