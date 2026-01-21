import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { getUser } from "../features/users/actions";

export default async function AppPage() {
    const { userId, user } = await getCurrentUser({allData: true});
    console.log("userId in app page:", userId);
    console.log("user in app page:", user);
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
                <h1>Hi</h1>
            </div>
        </div>
    );
}