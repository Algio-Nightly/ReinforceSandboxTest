import { useState, useRef, useEffect, useCallback } from "react";
import type { SubmissionStatus } from "../types";
import { api } from "../services/api";

export const useSubmission = () => {
  const [submission, setSubmission] = useState<SubmissionStatus | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const clearPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  const submitCode = async (problemId: string, code: string) => {
    clearPolling();
    setError(null);
    setSubmitting(true);
    setSubmission({
      submission_id: "",
      status: "queued",
      public_tests: [],
      hidden_tests: [],
    });

    try {
      const res = await api.submissions.submit(problemId, code);
      const subId = res.submission_id;

      setSubmission({
        submission_id: subId,
        status: "queued",
        public_tests: [],
        hidden_tests: [],
      });

      // Start polling
      let attempts = 0;
      const maxAttempts = 40; // 40 * 1.5s = 60 seconds max

      pollTimerRef.current = window.setInterval(async () => {
        attempts++;
        try {
          const statusRes = await api.submissions.getStatus(subId);
          setSubmission(statusRes);

          if (statusRes.status === "completed" || statusRes.status === "error") {
            clearPolling();
            setSubmitting(false);
          }
        } catch (pollErr: any) {
          console.error("Polling error:", pollErr);
          if (attempts >= maxAttempts) {
            clearPolling();
            setSubmitting(false);
            setError("Evaluation timed out. Please try again.");
          }
        }

        if (attempts >= maxAttempts) {
          clearPolling();
          setSubmitting(false);
        }
      }, 1500);
    } catch (err: any) {
      clearPolling();
      setSubmitting(false);
      setError(err.response?.data?.detail || "Failed to submit code. Are you logged in?");
    }
  };

  return {
    submission,
    submitting,
    error,
    submitCode,
    clearSubmission: () => {
      clearPolling();
      setSubmission(null);
      setError(null);
    },
  };
};
