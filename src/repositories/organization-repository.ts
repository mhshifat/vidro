import { prisma } from "@/lib/db";
import type { OrganizationRole } from "@prisma/client";
import type {
    Organization,
    OrganizationMember,
    OrganizationWithMembers,
    CreateOrganizationInput,
    UpdateOrganizationInput,
} from "@/entities/organization";

export class OrganizationRepository {
    /**
     * Find organization by ID
     */
    async findById(id: string): Promise<Organization | null> {
        return prisma.organization.findUnique({
            where: { id },
        });
    }

    /**
     * Find organization by slug
     */
    async findBySlug(slug: string): Promise<Organization | null> {
        return prisma.organization.findUnique({
            where: { slug },
        });
    }

    /**
     * Find organization with members
     */
    async findByIdWithMembers(id: string): Promise<OrganizationWithMembers | null> {
        const org = await prisma.organization.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
                _count: {
                    select: { reports: true, members: true },
                },
            },
        });

        if (!org) return null;

        return org as unknown as OrganizationWithMembers;
    }

    /**
     * Find all organizations for a user
     */
    async findByUserId(userId: string): Promise<(Organization & { role: OrganizationRole })[]> {
        const memberships = await prisma.organizationMember.findMany({
            where: { userId },
            include: {
                organization: true,
            },
        });

        return memberships.map(m => ({
            ...m.organization,
            role: m.role,
        }));
    }

    /**
     * Create a new organization
     */
    async create(
        data: CreateOrganizationInput,
        ownerId: string
    ): Promise<Organization> {
        return prisma.organization.create({
            data: {
                name: data.name,
                slug: data.slug,
                logoUrl: data.logoUrl,
                storageLimit: data.storageLimit,
                maxReports: data.maxReports,
                maxMembers: data.maxMembers,
                members: {
                    create: {
                        userId: ownerId,
                        role: "OWNER",
                    },
                },
            },
        });
    }

    /**
     * Update an organization
     */
    async update(id: string, data: UpdateOrganizationInput): Promise<Organization> {
        return prisma.organization.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete an organization
     */
    async delete(id: string): Promise<void> {
        await prisma.organization.delete({
            where: { id },
        });
    }

    /**
     * Check if slug is available
     */
    async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
        const existing = await prisma.organization.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!existing) return true;
        if (excludeId && existing.id === excludeId) return true;
        return false;
    }

    /**
     * Get member by organization and user
     */
    async getMember(organizationId: string, userId: string): Promise<OrganizationMember | null> {
        return prisma.organizationMember.findUnique({
            where: {
                organizationId_userId: { organizationId, userId },
            },
        });
    }

    /**
     * Add member to organization
     */
    async addMember(
        organizationId: string,
        userId: string,
        role: OrganizationRole = "MEMBER"
    ): Promise<OrganizationMember> {
        return prisma.organizationMember.create({
            data: {
                organizationId,
                userId,
                role,
            },
        });
    }

    /**
     * Update member role
     */
    async updateMemberRole(
        organizationId: string,
        userId: string,
        role: OrganizationRole
    ): Promise<OrganizationMember> {
        return prisma.organizationMember.update({
            where: {
                organizationId_userId: { organizationId, userId },
            },
            data: { role },
        });
    }

    /**
     * Remove member from organization
     */
    async removeMember(organizationId: string, userId: string): Promise<void> {
        await prisma.organizationMember.delete({
            where: {
                organizationId_userId: { organizationId, userId },
            },
        });
    }

    /**
     * Count members in organization
     */
    async countMembers(organizationId: string): Promise<number> {
        return prisma.organizationMember.count({
            where: { organizationId },
        });
    }

    /**
     * Count reports in organization
     */
    async countReports(organizationId: string): Promise<number> {
        return prisma.report.count({
            where: { organizationId },
        });
    }

    /**
     * Get storage used by organization
     */
    async getStorageUsed(organizationId: string): Promise<bigint> {
        const result = await prisma.report.aggregate({
            where: { organizationId },
            _sum: { fileSize: true },
        });
        return result._sum.fileSize ?? BigInt(0);
    }
}
