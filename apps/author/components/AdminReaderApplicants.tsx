"use client";

import { Fragment, useMemo, useState } from "react";
import Button from "./button/button";
import styles from "./AdminReaderApplicants.module.css";
import {
  Plus,
  PaperPlaneTilt,
  Trash,
} from "@phosphor-icons/react/dist/ssr";

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
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const sortedApplicants = useMemo(() => applicants, [applicants]);

  function toggleExpanded(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

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
        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}
      </div>

      {sortedApplicants.length === 0 ? (
        <p className={styles.empty}>No applicants yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Cohort</th>
                <th>Program</th>
                <th>Book</th>
                <th>Status</th>
                <th>Submitted</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedApplicants.map((applicant) => {
                const isExpanded = expandedId === applicant.id;
                const status = applicant.status || "pending";
                const inviteToken =
                  tokensById[applicant.id] || applicant.inviteToken || null;

                return (
                  <Fragment key={applicant.id}>
                    <tr>
                      <td className={styles.emailCell}>
                        <button
                          type="button"
                          className={styles.detailsButton}
                          aria-expanded={isExpanded}
                          onClick={() => toggleExpanded(applicant.id)}
                        >
                          {applicant.email}
                        </button>
                      </td>
                      <td>{applicant.cohortType.toUpperCase()}</td>
                      <td>{applicant.program}</td>
                      <td>{applicant.bookTitle || "—"}</td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            status === "approved"
                              ? styles.statusApproved
                              : status === "rejected"
                              ? styles.statusRejected
                              : styles.statusPending
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        {new Date(applicant.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className={styles.actionsCell}>
                        {status === "approved" ? (
                          <div className={styles.actionStack}>
                            {inviteToken && (
                              <p className={styles.token}>/r/{inviteToken}</p>
                            )}
                            <button
                              type="button"
                              className={styles.resendButton}
                              disabled={loadingId === applicant.id}
                              onClick={() => resendEmail(applicant)}
                              aria-label="Resend welcome email"
                              title="Resend welcome email"
                            >
                              <PaperPlaneTilt size={24} aria-hidden="true" />
                            </button>
                          </div>
                        ) : status === "rejected" ? (
                          <span className={styles.rejected}>Rejected</span>
                        ) : (
                          <div className={styles.actionRow}>
                            <button
                              type="button"
                              className={`${styles.iconButton} ${styles.approveButton}`}
                              disabled={loadingId === applicant.id}
                              onClick={() => approve(applicant)}
                              aria-label={`Approve ${applicant.email}`}
                              title="Approve"
                            >
                              <Plus size={24} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className={`${styles.iconButton} ${styles.rejectIconButton}`}
                              disabled={loadingId === applicant.id}
                              onClick={() => reject(applicant)}
                              aria-label={`Reject ${applicant.email}`}
                              title="Reject"
                            >
                              <Trash size={24} aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className={styles.detailsRow}>
                        <td colSpan={7} className={styles.detailsCell}>
                          <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                              <p className={styles.detailLabel}>Format</p>
                              <p className={styles.detailValue}>
                                {applicant.formatPref || "unspecified"}
                              </p>
                            </div>
                            <div className={styles.detailItem}>
                              <p className={styles.detailLabel}>Content notes</p>
                              <p className={styles.detailValue}>
                                {applicant.contentNotesAck ? "yes" : "no"}
                              </p>
                            </div>
                            <div className={styles.detailItem}>
                              <p className={styles.detailLabel}>Source</p>
                              <p className={styles.detailValue}>
                                {applicant.source || "—"}
                              </p>
                            </div>
                            <div className={styles.detailItem}>
                              <p className={styles.detailLabel}>Approved at</p>
                              <p className={styles.detailValue}>
                                {applicant.approvedAt
                                  ? new Date(applicant.approvedAt).toLocaleString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })
                                  : "—"}
                              </p>
                            </div>
                          </div>

                          {applicant.tasteProfile && (
                            <div className={styles.longDetail}>
                              <p className={styles.detailLabel}>Taste profile</p>
                              <p className={styles.longDetailValue}>
                                {applicant.tasteProfile}
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
