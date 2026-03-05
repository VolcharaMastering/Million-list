import { isAxiosError } from "axios";
import type { AddNewResult } from "../api/itemsApi";

type AddNewStatus = { text: string; tone: "success" | "error" };

const joinIds = (ids: number[]) => ids.join(", ");

export const formatAddNewSuccess = (result: AddNewResult): AddNewStatus => {
  const added = result.added.join(", ") || "-";
  const parts = [`Successfully added: ${added}`];
  if ((result.alreadyExists ?? []).length > 0) {
    parts.push(`Already exists: ${joinIds(result.alreadyExists ?? [])}`);
  }
  return { text: parts.join(". "), tone: "success" };
};

type ErrorPayload = {
  message?: string;
  error?: {
    message?: string;
    alreadyExists?: number[];
  };
};

export const formatAddNewError = (error: unknown): AddNewStatus => {
  if (!isAxiosError(error)) {
    return { text: "Error", tone: "error" };
  }
  const data = error.response?.data as ErrorPayload | undefined;
  const message =
    data?.error?.message ?? data?.message ?? "Error";
  const parts = [message];
  const alreadyExists = data?.error?.alreadyExists ?? [];
  if (alreadyExists.length > 0) {
    parts.push(`Already exists: ${joinIds(alreadyExists)}`);
  }
  return { text: parts.join(". "), tone: "error" };
};

/**
 * Returns status for success or caught error from addNewItems flow.
 */
export const formatAddNewStatus = (
  result?: AddNewResult,
  error?: unknown
): AddNewStatus => {
  if (error != null) return formatAddNewError(error);
  if (result != null) return formatAddNewSuccess(result);
  return { text: "Error", tone: "error" };
};
