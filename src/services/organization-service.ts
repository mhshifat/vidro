import { OrganizationRepository } from "@/repositories/organization-repository";
import { Logger, type LogContext } from "@/lib/logger";
import type { OrganizationRole } from "@prisma/client";
import {
    type SerializedOrganization,
    type CreateOrganizationInput,
    type UpdateOrganizationInput,
    serializeOrganization,
    hasPermission,
    generateSlug,
} from "@/entities/organization";

const organizationRepository = new OrganizationRepository();

interface ServiceResult<T> {
    data: T | null;
    error?: string;
    notFound?: boolean;
    forbidden?: boolean;
}

export class OrganizationService {
    /**
     * Get organization by ID
     */
    static async getById(
        id: string,
        userId: string,
        context: LogContext
    ): Promise<ServiceResult<SerializedOrganization & { role: OrganizationRole }>> {
        try {
            const org = await organizationRepository.findById(id);
            if (!org) {
                return { data: null, notFound: true };
            }

            // Check membership
            const member = await organizationRepository.getMember(id, userId);
            if (!member) {
                return { data: null, forbidden: true };
            }

            return {
                data: {
                    ...serializeOrganization(org),
                    role: member.role,
                },
            };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to fetch organization",
                error,
                context,
                { userMessage: "Failed to load organization.", organizationId: id }
            );
            return { data: null, error: errorResponse.message };
        }
    }

    /**
     * Get organization by slug
     */
    static async getBySlug(
        slug: string,
        userId: string,
        context: LogContext
    ): Promise<ServiceResult<SerializedOrganization & { role: OrganizationRole }>> {
        try {
            const org = await organizationRepository.findBySlug(slug);
            if (!org) {
                return { data: null, notFound: true };
            }

            const member = await organizationRepository.getMember(org.id, userId);
            if (!member) {
                return { data: null, forbidden: true };
            }

            return {
                data: {
                    ...serializeOrganization(org),
                    role: member.role,
                },
            };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to fetch organization by slug",
                error,
                context,
                { userMessage: "Failed to load organization.", slug }
            );
            return { data: null, error: errorResponse.message };
        }
    }

    /**
     * List all organizations for a user
     */
    static async listForUser(
        userId: string,
        context: LogContext
    ): Promise<ServiceResult<(SerializedOrganization & { role: OrganizationRole })[]>> {
        try {
            const orgs = await organizationRepository.findByUserId(userId);
            return {
                data: orgs.map(org => ({
                    ...serializeOrganization(org),
                    role: org.role,
                })),
            };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to list organizations",
                error,
                context,
                { userMessage: "Failed to load organizations.", userId }
            );
            return { data: null, error: errorResponse.message };
        }
    }

    /**
     * Create a new organization
     */
    static async create(
        data: Omit<CreateOrganizationInput, "slug"> & { slug?: string },
        userId: string,
        context: LogContext
    ): Promise<ServiceResult<SerializedOrganization>> {
        try {
            // Generate slug if not provided
            const slug = data.slug || generateSlug(data.name);

            // Check slug availability
            const isAvailable = await organizationRepository.isSlugAvailable(slug);
            if (!isAvailable) {
                return { data: null, error: "This organization URL is already taken." };
            }

            const org = await organizationRepository.create(
                { ...data, slug },
                userId
            );

            Logger.info("Organization created", context, {
                organizationId: org.id,
                slug: org.slug,
                userId,
            });

            return { data: serializeOrganization(org) };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to create organization",
                error,
                context,
                { userMessage: "Failed to create organization." }
            );
            return { data: null, error: errorResponse.message };
        }
    }

    /**
     * Update an organization
     */
    static async update(
        id: string,
        data: UpdateOrganizationInput,
        userId: string,
        context: LogContext
    ): Promise<ServiceResult<SerializedOrganization>> {
        try {
            // Check membership and permission
            const member = await organizationRepository.getMember(id, userId);
            if (!member) {
                return { data: null, forbidden: true };
            }
            if (!hasPermission(member.role, "manage_settings")) {
                return { data: null, forbidden: true, error: "You don't have permission to update this organization." };
            }

            // Check slug availability if changing
            if (data.slug) {
                const isAvailable = await organizationRepository.isSlugAvailable(data.slug, id);
                if (!isAvailable) {
                    return { data: null, error: "This organization URL is already taken." };
                }
            }

            const org = await organizationRepository.update(id, data);

            Logger.info("Organization updated", context, {
                organizationId: id,
                userId,
            });

            return { data: serializeOrganization(org) };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to update organization",
                error,
                context,
                { userMessage: "Failed to update organization.", organizationId: id }
            );
            return { data: null, error: errorResponse.message };
        }
    }

    /**
     * Delete an organization
     */
    static async delete(
        id: string,
        userId: string,
        context: LogContext
    ): Promise<ServiceResult<boolean>> {
        try {
            const member = await organizationRepository.getMember(id, userId);
            if (!member) {
                return { data: null, forbidden: true };
            }
            if (member.role !== "OWNER") {
                return { data: null, forbidden: true, error: "Only the owner can delete this organization." };
            }

            await organizationRepository.delete(id);

            Logger.info("Organization deleted", context, {
                organizationId: id,
                userId,
            });

            return { data: true };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to delete organization",
                error,
                context,
                { userMessage: "Failed to delete organization.", organizationId: id }
            );
            return { data: null, error: errorResponse.message };
        }
    }

    /**
     * Invite a user to an organization
     */
    static async inviteMember(
        organizationId: string,
        targetUserId: string,
        role: OrganizationRole,
        inviterId: string,
        context: LogContext
    ): Promise<ServiceResult<boolean>> {
        try {
            // Check inviter's permission
            const inviterMember = await organizationRepository.getMember(organizationId, inviterId);
            if (!inviterMember) {
                return { data: null, forbidden: true };
            }
            if (!hasPermission(inviterMember.role, "manage_members")) {
                return { data: null, forbidden: true, error: "You don't have permission to invite members." };
            }

            // Check organization limits
            const org = await organizationRepository.findById(organizationId);
            if (!org) {
                return { data: null, notFound: true };
            }
            const memberCount = await organizationRepository.countMembers(organizationId);
            if (memberCount >= org.maxMembers) {
                return { data: null, error: "Organization has reached its member limit." };
            }

            // Check if already a member
            const existingMember = await organizationRepository.getMember(organizationId, targetUserId);
            if (existingMember) {
                return { data: null, error: "User is already a member of this organization." };
            }

            await organizationRepository.addMember(organizationId, targetUserId, role);

            Logger.info("Member invited to organization", context, {
                organizationId,
                targetUserId,
                role,
                inviterId,
            });

            return { data: true };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to invite member",
                error,
                context,
                { userMessage: "Failed to invite member.", organizationId }
            );
            return { data: null, error: errorResponse.message };
        }
    }

    /**
     * Remove a member from an organization
     */
    static async removeMember(
        organizationId: string,
        targetUserId: string,
        removerId: string,
        context: LogContext
    ): Promise<ServiceResult<boolean>> {
        try {
            // Check remover's permission
            const removerMember = await organizationRepository.getMember(organizationId, removerId);
            if (!removerMember) {
                return { data: null, forbidden: true };
            }

            // Users can remove themselves
            if (targetUserId !== removerId && !hasPermission(removerMember.role, "manage_members")) {
                return { data: null, forbidden: true, error: "You don't have permission to remove members." };
            }

            // Cannot remove the owner
            const targetMember = await organizationRepository.getMember(organizationId, targetUserId);
            if (!targetMember) {
                return { data: null, notFound: true };
            }
            if (targetMember.role === "OWNER") {
                return { data: null, error: "Cannot remove the organization owner." };
            }

            await organizationRepository.removeMember(organizationId, targetUserId);

            Logger.info("Member removed from organization", context, {
                organizationId,
                targetUserId,
                removerId,
            });

            return { data: true };
        } catch (error) {
            const errorResponse = Logger.error(
                "Failed to remove member",
                error,
                context,
                { userMessage: "Failed to remove member.", organizationId }
            );
            return { data: null, error: errorResponse.message };
        }
    }
}
