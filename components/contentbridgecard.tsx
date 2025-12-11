import Link from "next/link";
import React from "react";

export default function Dashboard() {
  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        marginBottom: "24px",
        height: "256px",
      }}
    >
      <h2
        style={{ fontSize: "1.5rem", marginBottom: "12px", color: "#003366" }}
      >
        Content Bridge AI
      </h2>
      <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#333" }}>
        Convert external data into structured Contentstack entries instantly
        using our AI-powered pipeline.
      </p>

      <Link
        href="/"
        style={{
          marginTop: "16px",
          display: "inline-block",
          backgroundColor: "#0047b3",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: "6px",
          textDecoration: "none",
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        Explore App
      </Link>
    </div>
  );
}