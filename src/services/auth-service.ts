import bcrypt from "bcryptjs";
import { UserRepository } from "@/repositories/user-repository";
import { User } from "@/entities/user";
import { JWTManager } from "@/lib/jwt";

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async register(data: Pick<User, "email" | "password" | "name">): Promise<{ token: string; user: User }> {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error("User already exists");
        }

        if (!data.password) {
            throw new Error("Password is required");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.userRepository.create({
            ...data,
            password: hashedPassword,
        });

        const token = await JWTManager.sign({ userId: user.id });
        return { token, user };
    }

    async login(data: Pick<User, "email" | "password">): Promise<{ token: string; user: User }> {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user || !user.password) {
            throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(data.password!, user.password);
        if (!isValid) {
            throw new Error("Invalid credentials");
        }

        const token = await JWTManager.sign({ userId: user.id });
        return { token, user };
    }
}
