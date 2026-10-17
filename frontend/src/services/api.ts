import axios from "axios";
import type { ProblemDetail, ProblemSummary, SubmissionResponse, SubmissionStatus, User } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT access token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  auth: {
    register: async (email: string, password: string, displayName?: string): Promise<User> => {
      const res = await apiClient.post<User>("/auth/register", {
        email,
        password,
        display_name: displayName || "",
      });
      return res.data;
    },
    login: async (email: string, password: string): Promise<User> => {
      const res = await apiClient.post<User>("/auth/login", {
        email,
        password,
      });
      return res.data;
    },
    google: async (idToken: string): Promise<User> => {
      const res = await apiClient.post<User>("/auth/google", {
        id_token: idToken,
      });
      return res.data;
    },
  },
  problems: {
    list: async (): Promise<ProblemSummary[]> => {
      const res = await apiClient.get<ProblemSummary[]>("/problems/");
      return res.data;
    },
    get: async (id: string): Promise<ProblemDetail> => {
      const res = await apiClient.get<ProblemDetail>(`/problems/${id}`);
      return res.data;
    },
  },
  submissions: {
    submit: async (problemId: string, code: string): Promise<SubmissionResponse> => {
      const res = await apiClient.post<SubmissionResponse>("/submissions/", {
        problem_id: problemId,
        code,
      });
      return res.data;
    },
    getStatus: async (submissionId: string): Promise<SubmissionStatus> => {
      const res = await apiClient.get<SubmissionStatus>(`/submissions/${submissionId}/status`);
      return res.data;
    },
  },
};
