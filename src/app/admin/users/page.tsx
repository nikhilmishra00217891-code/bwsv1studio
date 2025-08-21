import { getAllUsers } from "@/lib/data";
import { UserTableClient } from "./UserTableClient";

// This is the server component that fetches the initial data.
export default async function AdminUsersPage() {
    const users = await getAllUsers();

    return (
        <div className="animate-fade-in">
           <UserTableClient initialUsers={users} />
        </div>
    );
}
