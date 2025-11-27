import apiClient from "./api"; // your Axios instance

/**
 * STUDENT SERVICE FILE - FRONTEND INSTRUCTIONS
 * 
 * This file contains all methods to interact with the backend for student data.
 * All methods should use the `apiClient` instance so that the institutional ID 
 * and auth tokens are automatically included via Axios interceptors.
 * 
 * Instructions:
 * 
 * 2. CRUD Operations for Students:
 *    - Create: a method to add a new student. Pass all required student fields.
 *    - Read / List: a method to fetch all students for the institution. Accept optional filters (e.g., active, program).
 *    - Update: a method to update a student's information by ID.
 *    - Delete: a method to delete a student by ID.
 * 
 * 3. Error Handling:
 *    - All methods should handle errors gracefully and return meaningful messages
 *      that can be displayed to the user.
 * 
 * 4. Usage in Components:
 *    - In any component (e.g., Students.tsx), import the needed method:
 *        import { getStudents, createStudent, updateStudent, deleteStudent } from "@/services/students";
 *    - Call the method and update state accordingly.
 * 
 * 5. Notes:
 *    - Always use async/await or `.then()` for promise handling.
 *    - Ensure the API client automatically sends the token & institution ID using interceptors.
 *    - Keep methods modular and single-purpose.
 */
