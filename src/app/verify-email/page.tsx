import { Suspense } from "react";
import VerifyEmailContent from "@/components/auth/verify-email-content";
import { VerifyEmailSkeleton } from "@/components/shared/verify-email-skeleton";

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<VerifyEmailSkeleton />}>
            <VerifyEmailContent />
        </Suspense>
    );
}
