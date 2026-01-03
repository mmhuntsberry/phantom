"use client";

import { useMemo, useState } from "react";
import Button from "./button/button";
import styles from "./AdminReaderApplicants.module.css";

export type AdminApplicant = {
  id: number;
  email: string;
  cohortType: "beta" | "arc";
  program: string;
  formatPref?: string | null;
  contentNotesAck: boolean;
  tasteProfile?: string | null;
  source?: string | null;
  status?: string | null;
  approvedAt?: string | null;
  createdAt: string;
};

type AdminReaderApplicantsProps = {
  applicants: AdminApplicant[];
};

export default function AdminReaderApplicants({
  applicants,
}: AdminReaderApplicantsProps) {
  const [tokensById, setTokensById] = useState<Record<number, string>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [adminToken, setAdminToken] = useState<string>("");

  const sortedApplicants = useMemo(
    () => applicants,
    [applicants]
  );

  async function approve(applicant: AdminApplicant) {
    setError("");
    setLoadingId(applicant.id);
    try {
      const res = await fetch("/api/admin/reader/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId: applicant.id,
          cohortType: applicant.cohortType,
          program: applicant.program,
          email: applicant.email,
          adminToken: adminToken || null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Approval failed.");
        return;
      }

      setTokensById((prev) => ({ ...prev, [applicant.id]: data.token }));
    } catch (err) {
      setError("Approval failed. Try again.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.tokenField}>
          <label className={styles.label} htmlFor="adminToken">
            Admin token (optional)
          </label>
          <input
            id="adminToken"
            className={styles.input}
            type="password"
            value={adminToken}
            onChange={(event) => setAdminToken(event.target.value)}
            placeholder="ADMIN_TOKEN"
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      {sortedApplicants.length === 0 ? (
        <p className={styles.empty}>No applicants yet.</p>
      ) : (
        <ul className={styles.list}>
          {sortedApplicants.map((applicant) => (
            <li className={styles.card} key={applicant.id}>
              <div className={styles.meta}>
                <p className={styles.email}>{applicant.email}</p>
                <p className={styles.detail}>
                  {applicant.cohortType.toUpperCase()} · {applicant.program}
                </p>
                <p className={styles.detail}>
                  Status: {applicant.status || "pending"}
                </p>
                <p className={styles.detail}>
                  Format: {applicant.formatPref || "unspecified"}
                </p>
                <p className={styles.detail}>
                  Content notes: {applicant.contentNotesAck ? "yes" : "no"}
                </p>
                {applicant.tasteProfile && (
                  <p className={styles.detail}>{applicant.tasteProfile}</p>
                )}
                {applicant.source && (
                  <p className={styles.detail}>Source: {applicant.source}</p>
                )}
                <p className={styles.detail}>
                  Submitted: {new Date(applicant.createdAt).toLocaleString()}
                </p>
              </div>
              <div className={styles.actions}>
                <Button
                  type="button"
                  disabled={
                    loadingId === applicant.id || applicant.status === "approved"
                  }
                  onClick={() => approve(applicant)}
                >
                  {applicant.status === "approved"
                    ? "Approved"
                    : loadingId === applicant.id
                    ? "Generating"
                    : "Approve + generate"}
                </Button>
                {tokensById[applicant.id] && (
                  <p className={styles.token}>
                    /r/{tokensById[applicant.id]}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
