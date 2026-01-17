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
  bookId?: string | null;
  bookTitle?: string | null;
  status?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  inviteToken?: string | null;
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
  const [message, setMessage] = useState<string>("");
  const [adminToken, setAdminToken] = useState<string>("");

  const sortedApplicants = useMemo(
    () => applicants,
    [applicants]
  );

  async function approve(applicant: AdminApplicant) {
    setError("");
    setMessage("");
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
      
      // Show email status
      if (data.emailSent === false) {
        const emailMsg = data.emailError 
          ? `Approved, but email failed: ${data.emailError}`
          : "Approved, but email was not sent (check RESEND_API_KEY)";
        setError(emailMsg);
        // Still refresh after a delay to show the status
        setTimeout(() => window.location.reload(), 2000);
      } else if (data.emailSent === true) {
        setMessage("✅ Approved and welcome email sent!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        // Refresh the page to show updated status
        window.location.reload();
      }
    } catch (err) {
      setError("Approval failed. Try again.");
    } finally {
      setLoadingId(null);
    }
  }

  async function resendEmail(applicant: AdminApplicant) {
    setError("");
    setMessage("");
    setLoadingId(applicant.id);
    try {
      const res = await fetch("/api/admin/reader/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId: applicant.id,
          adminToken: adminToken || null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to resend email.");
        return;
      }

      setMessage("✅ Email sent successfully!");
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setError("Failed to resend email. Try again.");
    } finally {
      setLoadingId(null);
    }
  }

  async function reject(applicant: AdminApplicant) {
    setError("");
    setLoadingId(applicant.id);
    try {
      const res = await fetch("/api/admin/reader/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId: applicant.id,
          adminToken: adminToken || null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Rejection failed.");
        return;
      }

      // Refresh the page to show updated status
      window.location.reload();
    } catch (err) {
      setError("Rejection failed. Try again.");
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
        {message && <p className={styles.message}>{message}</p>}
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
                {applicant.bookTitle && (
                  <p className={styles.detail}>
                    <strong>Book:</strong> {applicant.bookTitle}
                  </p>
                )}
                <p className={styles.detail}>
                  Status: <strong>{applicant.status || "pending"}</strong>
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
                {applicant.status === "approved" ? (
                  <>
                    <p className={styles.approved}>✓ Approved</p>
                    {(tokensById[applicant.id] || applicant.inviteToken) && (
                      <p className={styles.token}>
                        /r/{tokensById[applicant.id] || applicant.inviteToken}
                      </p>
                    )}
                    <button
                      type="button"
                      className={styles.resendButton}
                      disabled={loadingId === applicant.id}
                      onClick={() => resendEmail(applicant)}
                    >
                      {loadingId === applicant.id
                        ? "Sending..."
                        : "Resend email"}
                    </button>
                  </>
                ) : applicant.status === "rejected" ? (
                  <p className={styles.rejected}>✗ Rejected</p>
                ) : (
                  <>
                    <Button
                      type="button"
                      disabled={loadingId === applicant.id}
                      onClick={() => approve(applicant)}
                    >
                      {loadingId === applicant.id
                        ? "Processing..."
                        : "Approve + generate"}
                    </Button>
                    <button
                      type="button"
                      className={styles.rejectButton}
                      disabled={loadingId === applicant.id}
                      onClick={() => reject(applicant)}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
