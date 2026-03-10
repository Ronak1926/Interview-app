import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export const PLAN_LIMIT_MESSAGE = "PLAN_LIMIT";
export const RATE_LIMIT_MESSAGE = "RATE_LIMIT";
export function errorToast(message: string) {
    if (message === PLAN_LIMIT_MESSAGE) {
        const toastId = toast.error(
            "You have reached the limit of interviews for this plan.",
            {
                action: (
                    <Button
                        size="sm"
                        onClick={() => {
                            toast.dismiss(toastId);
                        }}
                    >
                        <Link href="/app/pricing">Upgrade</Link>
                    </Button>
                ),
            },
        );
    }

    if (message === RATE_LIMIT_MESSAGE) {
        const toastId = toast.error(
            "Woah! Slow down.",
            {
                description: "You are making too many requests. Please try again later."
            },
        );
        return
    }
    toast.error(message);
}
