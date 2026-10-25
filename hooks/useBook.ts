import { useEffect, useState } from "react";
import { booksApi } from "@/lib/api/booksApi";
import type { Book } from "@/types/book";

export function useBook(id?: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    void booksApi.getById(id)
      .then((value) => { if (active) setBook(value); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause : new Error("Unable to load book")); })
      .finally(() => { if (active) setIsLoading(false); });

    return () => { active = false; };
  }, [id]);

  return { book, isLoading, error };
}
