import { getAllUsers, getCourses } from "@/lib/data";
import { UserTableClient } from "./UserTableClient";

// This is the server component that fetches the initial data.
export default async function AdminUsersPage() {
    const users = await getAllUsers();
    const courses = await getCourses(true); // Fetch all courses for mapping IDs to titles

    return (
        <div className="animate-fade-in">
           <UserTableClient initialUsers={users} allCourses={courses} />
        </div>
    );
}
