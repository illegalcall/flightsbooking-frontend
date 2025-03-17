import React from "react";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <div className="admin-dashboard">{children}</div>
    </AdminProtectedRoute>
  );
}
