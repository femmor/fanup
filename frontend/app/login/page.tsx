"use client"

import { api } from "@/lib/api";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("testadmin@fanup.com");
    const [password, setPassword] = useState("password");

    const handleLogin = async () => {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        window.location.href = "/dashboard";
    }

    return (
    <div className="p-8 max-w-md mx-auto">
      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <input
        type="password"
        value={password}
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <button onClick={handleLogin} className="bg-black text-white p-2 w-full">
        Login
      </button>
    </div>
  );
}