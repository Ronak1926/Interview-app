import { ReactNode } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export function BackLink ({
    href, children, className,
} : {
    href: string,
    children: ReactNode,
    className?: string,
}) {
    return (
        <Button asChild variant="ghost" size="sm" className={cn("-ml-3",className)}>
            <Link href={href} className="flex gap-2 items-center text-sm text-muuted-foreground">
                <ArrowLeftIcon/>
            {children}
            </Link>
        </Button>
    )
}