import { useState, useEffect } from "react";
import type { ProblemDetail } from "../types";
import { api } from "../services/api";

export const useProblem = (problemId?: string) => {
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!problemId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    api.problems
      .get(problemId)
      .then((data) => {
        if (isMounted) {
          setProblem(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.detail || "Failed to load problem details");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [problemId]);

  return { problem, loading, error };
};
