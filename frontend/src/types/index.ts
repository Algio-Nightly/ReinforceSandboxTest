export interface User {
  user_id: string;
  email: string;
  display_name?: string;
  access_token: string;
}

export interface ProblemSummary {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
}

export interface ProblemDetail extends ProblemSummary {
  description_markdown: string;
  starter_code: string;
  constraints?: string;
}

export interface TestResult {
  name: string;
  docstring: string | null;
  status: "passed" | "failed" | "error";
  duration_ms?: number;
  message?: string | null;
  stdout?: string | null;
}

export interface HiddenTestSummary {
  passed: number;
  total: number;
}

export interface SubmissionResponse {
  submission_id: string;
}

export interface SubmissionStatus {
  submission_id: string;
  status: "queued" | "running" | "completed" | "error";
  overall?: string | null;
  execution_time_ms?: number | null;
  public_tests: TestResult[];
  hidden_tests: TestResult[];
  hidden_summary?: HiddenTestSummary | null;
  error_message?: string | null;
}
