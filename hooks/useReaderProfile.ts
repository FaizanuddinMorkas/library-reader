import { useCallback, useEffect, useState } from "react";
import { readerApi, type ReaderProfile } from "@/lib/api/readerApi";

export function useReaderProfile() {
  const [profile, setProfile] = useState<ReaderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setProfile(await readerApi.profile());
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("Unable to load profile"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { profile, isLoading, error, refresh: load };
}
