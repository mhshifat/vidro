"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewReportPage() {
    const [recording, setRecording] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("Unlabeled Recording");
    const router = useRouter();

    useEffect(() => {
        // We look for the extension to send us the data
        const handleMessage = (event: MessageEvent) => {
            // Check if it's from our extension content script
            if (event.data?.type === "TRANSFER_RECORDING") {
                setRecording(event.data.payload);
                setLoading(false);
            }
        };

        window.addEventListener("message", handleMessage);

        // Notify content script we are ready
        window.postMessage({ type: "REPORT_PAGE_READY" }, "*");

        return () => window.removeEventListener("message", handleMessage);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-gray-500">Waiting for recording data from Jam Clone extension...</p>
                <p className="text-xs text-gray-400">If this takes too long, make sure the extension is active.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-gray-500 hover:text-black">← Back</Link>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                    />
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>Discard</Button>
                    <Button onClick={() => alert('Implementation for saving to Cloud coming soon!')}>Save and Share</Button>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-hidden">
                <div className="lg:col-span-2 flex flex-col gap-6 overflow-auto pr-2">
                    <div className="bg-black rounded-lg overflow-hidden aspect-video relative flex items-center justify-center shadow-lg">
                        <video controls src={recording.videoUrl} className="w-full h-full object-contain" />
                    </div>

                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="font-semibold mb-2">Description</h3>
                        <textarea
                            placeholder="Add a description of what happened..."
                            className="w-full min-h-[100px] p-3 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white border rounded-lg overflow-hidden flex flex-col max-h-full shadow-sm">
                    <div className="p-4 border-b bg-gray-50 font-medium">Capture Details</div>
                    <div className="overflow-auto flex-1 p-4 space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold uppercase text-gray-400">Console Logs</h4>
                                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {recording.consoleLogs?.length || 0} Events
                                </span>
                            </div>
                            <pre className="text-[10px] bg-gray-900 text-green-400 p-3 rounded-lg overflow-auto max-h-64 font-mono leading-relaxed">
                                {JSON.stringify(recording.consoleLogs, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold uppercase text-gray-400">Network Requests</h4>
                                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {recording.networkLogs?.length || 0} Requests
                                </span>
                            </div>
                            <pre className="text-[10px] bg-gray-900 text-blue-400 p-3 rounded-lg overflow-auto max-h-64 font-mono leading-relaxed">
                                {JSON.stringify(recording.networkLogs, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
