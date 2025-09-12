import { getAllUsers, getCourses } from "@/lib/data";
import { UserTableClient } from "./UserTableClient";
import type { Course, UserProfile } from "@/types";
import { Timestamp } from "firebase/firestore";

const serializeObject = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Timestamp) {
        return obj.toDate().toISOString();
    }
    
    if (Array.isArray(obj)) {
        return obj.map(serializeObject);
    }

    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = serializeObject(obj[key]);
        }
    }
    return newObj;
};


// This is the server component that fetches the initial data.
export default async function AdminUsersPage() {
    const rawUsers = await getAllUsers();
    const rawCourses = await getCourses(true); // Fetch all courses for mapping IDs to titles

    const users: UserProfile[] = rawUsers.map(user => serializeObject(user));
    const courses: Course[] = rawCourses.map(course => serializeObject(course));

    return (
        <div className="animate-fade-in">
           <UserTableClient initialUsers={users} allCourses={courses} />
        </div>
    );
}
