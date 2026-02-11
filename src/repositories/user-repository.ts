import { prisma } from "@/lib/db";
import { User } from "@/entities/user";

export class UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }

    async findByVerificationToken(token: string): Promise<User | null> {
        return prisma.user.findFirst({
            where: { emailVerificationToken: token },
        });
    }

    async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
        if (!data.password) {
            throw new Error("Password is required for user creation");
        }
        return prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                name: data.name,
                emailVerified: data.emailVerified ?? false,
                emailVerificationToken: data.emailVerificationToken,
                emailVerificationExpiry: data.emailVerificationExpiry,
            },
        });
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: {
                emailVerified: data.emailVerified,
                emailVerificationToken: data.emailVerificationToken,
                emailVerificationExpiry: data.emailVerificationExpiry,
            },
        });
    }
}
