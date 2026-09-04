"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchPiJson,
  PiLoadError,
  PI_UNAVAILABLE,
  type PiDataset,
} from "./pi-api";

export type PiJsonStatus = "idle" | "loading" | "loaded" | "error";

export type PiJsonState<T> = {
  status: PiJsonStatus;
  data: T | null;
  error: string | null;
  requestId: string | null;
  dataset: PiDataset;
  reload: () => Promise<void>;
};

export function usePiJson<T>(dataset: PiDataset, url: string | null): PiJsonState<T> {
  const [status, setStatus] = useState<PiJsonStatus>(url ? "loading" : "idle");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!url) {
      setStatus("idle");
      setData(null);
      setError(null);
      setRequestId(null);
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const next = await fetchPiJson<T>(url, dataset);
      setData(next);
      setRequestId(null);
      setStatus("loaded");
    } catch (err) {
      const load =
        err instanceof PiLoadError
          ? err
          : new PiLoadError(PI_UNAVAILABLE[dataset], {
              dataset,
              requestId: null,
              status: 0,
              code: null,
            });
      setData(null);
      setRequestId(load.requestId);
      setError(load.message);
      setStatus("error");
    }
  }, [dataset, url]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { status, data, error, requestId, dataset, reload };
}
