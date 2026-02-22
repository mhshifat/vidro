import { prisma } from "@/lib/db";
import type {
    ReportActionWithUser,
    CreateReportActionInput,
    ReportActionListOptions,
    PaginatedReportActions,
    ReportActionType,
} from "@/entities/report-action";

const DEFAULT_PAGE_SIZE = 20;

export class ReportActionRepository {
    /**
     * Create a single report action
     */
    async create(data: CreateReportActionInput): Promise<ReportActionWithUser> {
        const action = await prisma.reportAction.create({
            data: {
                actionType: data.actionType,
                description: data.description,
                metadata: data.metadata ?? undefined,
                reportId: data.reportId,
                userId: data.userId ?? null,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        return action as ReportActionWithUser;
    }

    /**
     * Create multiple report actions in a single transaction
     */
    async createMany(actions: CreateReportActionInput[]): Promise<number> {
        const result = await prisma.reportAction.createMany({
            data: actions.map((a) => ({
                actionType: a.actionType,
                description: a.description,
                metadata: a.metadata ?? undefined,
                reportId: a.reportId,
                userId: a.userId ?? null,
            })),
        });
        return result.count;
    }

    /**
     * Get paginated list of actions for a report, newest first
     */
    async findByReport(options: ReportActionListOptions): Promise<PaginatedReportActions> {
        const {
            reportId,
            page = 1,
            limit = DEFAULT_PAGE_SIZE,
            actionType,
        } = options;

        const skip = (page - 1) * limit;

        const where: {
            reportId: string;
            actionType?: ReportActionType;
        } = { reportId };

        if (actionType) {
            where.actionType = actionType;
        }

        const [total, actions] = await Promise.all([
            prisma.reportAction.count({ where }),
            prisma.reportAction.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            }),
        ]);

        return {
            actions: actions as ReportActionWithUser[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get the total number of actions for a report
     */
    async countByReport(reportId: string): Promise<number> {
        return prisma.reportAction.count({ where: { reportId } });
    }

    /**
     * Delete all actions for a report (used in cascade scenarios)
     */
    async deleteByReport(reportId: string): Promise<number> {
        const result = await prisma.reportAction.deleteMany({
            where: { reportId },
        });
        return result.count;
    }
}
