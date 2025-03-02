//src/app/dashboard/DashboardClient.tsx

"use client"; // Mark this component as a Client Component

import { signOut } from "next-auth/react";

export default function DashboardClient({ session }: { session: any }) {
  console.log("Session in DashboardClient:", session); // Add this line

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl mb-4">Welcome, {session.user?.name || "Player"}</h2>
        <div className="space-y-4">
          <p>Email: {session.user?.email}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}