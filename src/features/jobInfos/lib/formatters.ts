import { ExperienceLevel } from "@/drizzle/schema";

export function formatExperienceLevel(level: ExperienceLevel) {
    switch (level) {
        case "junior":
            return "Junior";
        case "mid-level":
            return "Mid-level";
        case 'senior':
            return 'Senior'
        default: 
            throw new Error(`Unknown experience leval: ${level satisfies never}`)
    }
}