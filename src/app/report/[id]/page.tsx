import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ReportPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const report = await prisma.report.findUnique({
        where: { id },
    });

    if (!report) return notFound();

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-gray-500 hover:text-black">← Back</Link>
                    <h1 className="text-xl font-bold">{report.title}</h1>
                </div>
                <span className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleString()}</span>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 max-w-7xl mx-auto h-[calc(100vh-80px)]">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Video Player Section */}
                    <div className="bg-black rounded-lg overflow-hidden aspect-video relative flex items-center justify-center">
                        <video controls src={report.videoUrl} className="w-full h-full object-contain" />
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-gray-700">{report.description || "No description provided."}</p>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-gray-50 border rounded-lg overflow-hidden flex flex-col max-h-full">
                    <div className="p-4 border-b bg-white font-medium">Developer Components</div>
                    <div className="overflow-auto flex-1 p-4 space-y-4">
                        <div>
                            <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Console Logs</h4>
                            <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-auto max-h-60">
                                {JSON.stringify(report.consoleLogs, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Network Logs</h4>
                            <pre className="text-xs bg-gray-900 text-blue-400 p-2 rounded overflow-auto max-h-60">
                                {JSON.stringify(report.networkLogs, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
