//page/api/auth/[...nextauth].ts

import { authOptions } from "@/lib/auth"; // Import authOptions from src/lib/auth.ts
import NextAuth from "next-auth";

// Use the imported authOptions
export default NextAuth(authOptions);