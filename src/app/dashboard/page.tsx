import { prisma } from "@/lib/db";
import Link from "next/link";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";

// Force dynamic to fetching latest reports
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <p>Please log in to view your dashboard.</p>
                    <Link href="/login" className="text-blue-500 hover:underline">Go to Login</Link>
                </div>
            </div>
        )
    }

    // Verify token (simplified)
    const payload = await JWTManager.verify(token.value);
    if (!payload) {
        return <div>Invalid session. Please login again.</div>
    }

    const reports = await prisma.report.findMany({
        where: { userId: payload.userId as string },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Your Reports</h1>
                    <div className="flex gap-4">
                        <span className="text-sm text-gray-500 self-center">User ID: {payload.userId}</span>
                        <Link href="/" className="bg-black text-white px-4 py-2 rounded">Back Home</Link>
                    </div>
                </header>

                {reports.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                        <p className="text-lg">No reports yet.</p>
                        <p className="text-sm mt-2">Use the browser extension to record your first bug!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report) => (
                            <Link key={report.id} href={`/report/${report.id}`} className="block group">
                                <div className="bg-white rounded-lg shadow overflow-hidden group-hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="aspect-video bg-gray-200 relative items-center justify-center flex">
                                        {/* Placeholder video thumbnail */}
                                        <span className="text-4xl">🎥</span>
                                    </div>
                                    <div className="p-4">
                                        <h2 className="font-semibold text-lg text-gray-800 mb-1 group-hover:text-blue-600">
                                            {report.title}
                                        </h2>
                                        <p className="text-xs text-gray-500 mb-2">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="flex gap-2 text-xs">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                Console: {Array.isArray(report.consoleLogs) ? report.consoleLogs.length : 0}
                                            </span>
                                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                Network: {Array.isArray(report.networkLogs) ? report.networkLogs.length : 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
