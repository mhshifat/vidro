import bcrypt from "bcryptjs";
import { UserRepository } from "@/repositories/user-repository";
import { User } from "@/entities/user";
import { JWTManager } from "@/lib/jwt";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { Logger } from "@/lib/logger";

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async register(data: Pick<User, "email" | "password" | "name">): Promise<{ success: boolean; message: string }> {
        const context = Logger.createContext();
        
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error("User already exists");
        }

        if (!data.password) {
            throw new Error("Password is required");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        // Generate verification token (24 hour expiry)
        const verificationToken = randomBytes(32).toString("hex");
        const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const user = await this.userRepository.create({
            ...data,
            password: hashedPassword,
            emailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationExpiry: verificationExpiry,
        });

        // Send verification email
        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://vidro.dev"}/verify-email?token=${verificationToken}`;
        
        try {
            await sendVerificationEmail(user.email, verificationLink, user.name || "");
        } catch (error) {
            Logger.error("Failed to send verification email", error, context, {
                userMessage: "Could not send verification email. Please try registering again.",
                email: user.email,
            });
            // Don't throw - user is created, just email failed
        }

        return { 
            success: true,
            message: "Registration successful! Please check your email to verify your account." 
        };
    }

    async verifyEmail(token: string): Promise<{ token: string; user: User }> {
        // Find user by verification token
        const user = await this.userRepository.findByVerificationToken(token);
        
        if (!user) {
            throw new Error("Invalid or expired verification token");
        }

        // Check if token is expired
        if (!user.emailVerificationExpiry || new Date() > user.emailVerificationExpiry) {
            throw new Error("Verification token has expired");
        }

        // Mark email as verified and clear token
        const verifiedUser = await this.userRepository.update(user.id, {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpiry: null,
        });

        // Sign JWT token
        const jwtToken = await JWTManager.sign({ userId: verifiedUser.id });
        return { token: jwtToken, user: verifiedUser };
    }

    async login(data: Pick<User, "email" | "password">): Promise<{ token: string; user: User }> {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user || !user.password) {
            throw new Error("Invalid credentials");
        }

        // Check if email is verified
        if (!user.emailVerified) {
            throw new Error("Please verify your email first");
        }

        const isValid = await bcrypt.compare(data.password!, user.password);
        if (!isValid) {
            throw new Error("Invalid credentials");
        }

        const token = await JWTManager.sign({ userId: user.id });
        return { token, user };
    }
}
