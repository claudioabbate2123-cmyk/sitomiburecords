"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function AdminDashboardPage() {
  return (
    <h1 style={{ color: "red" }}>
      ADMIN DASHBOARD — TEST OK
    </h1>
  );
}
