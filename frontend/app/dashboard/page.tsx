"use client"

import { api } from "@/lib/api";
import { useEffect } from "react";

export default function DashboardPage() {
    useEffect(() => {
        api.get("/protected", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p>Welcome to your dashboard!</p>
        </div>
    );
}