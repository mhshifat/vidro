import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_change_me");

export class JWTManager {
    static async sign(payload: { userId: string }): Promise<string> {
        return new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(JWT_SECRET);
    }

    static async verify(token: string) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            return payload as { userId: string };
        } catch {
            return null;
        }
    }
}
