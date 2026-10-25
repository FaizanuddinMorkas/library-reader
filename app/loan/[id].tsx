import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import Clock from "lucide-react-native/icons/clock";
import MapPin from "lucide-react-native/icons/map-pin";
import Hash from "lucide-react-native/icons/hash";
import Tag from "lucide-react-native/icons/tag";
import Building from "lucide-react-native/icons/building";
import BookOpen from "lucide-react-native/icons/book-open";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useLoan } from "@/hooks/useLoan";
import { calculateDaysUntilDue, formatDate } from "@/lib/utils";
import { BookCover } from "@/components/library/BookCover";

export default function LoanDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loan, book, readingHistory, historyError, isLoadingMoreHistory, loadMoreHistory, isLoading, saveProgress } = useLoan(id);
  const [progressMode, setProgressMode] = useState<"range" | "count">("count");
  const [fromPage, setFromPage] = useState("");
  const [toPage, setToPage] = useState("");
  const [pagesReadCount, setPagesReadCount] = useState("");
  const [progressError, setProgressError] = useState("");
  const [progressSaved, setProgressSaved] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const saveReadingProgress = async () => {
    setProgressError("");
    setProgressSaved(false);

    const parseWholeNumber = (value: string) => /^\d+$/.test(value.trim()) ? Number(value.trim()) : null;
    let progress: { pagesReadFrom: number; pagesReadTo: number } | { pagesReadCount: number };

    if (progressMode === "range") {
      const from = parseWholeNumber(fromPage);
      const to = parseWholeNumber(toPage);
      if (from === null || to === null || from < 1 || to < 1) {
        setProgressError("Enter both page numbers as whole numbers starting from 1.");
        return;
      }
      if (to < from) {
        setProgressError("The to-page must be greater than or equal to the from-page.");
        return;
      }
      progress = { pagesReadFrom: from, pagesReadTo: to };
    } else {
      const count = parseWholeNumber(pagesReadCount);
      if (count === null || count < 0) {
        setProgressError("Enter the number of pages read as a whole number (0 or more).");
        return;
      }
      progress = { pagesReadCount: count };
    }

    setIsSavingProgress(true);
    try {
      await saveProgress(progress);
      setFromPage("");
      setToPage("");
      setPagesReadCount("");
      setProgressSaved(true);
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : "Unable to save reading progress. Try again.");
    } finally {
      setIsSavingProgress(false);
    }
  };

  if (isLoading) {
    return <Screen><View className="flex-1 items-center justify-center"><Text className="text-sm text-ink-muted">Loading loan details...</Text></View></Screen>;
  }

  if (!loan) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-bold text-ink">Loan not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 px-6 py-3 bg-primary rounded-2xl"
          >
            <Text className="text-white font-bold">Go back</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const isReturned = loan.status === "returned";
  const canUpdateProgress = loan.status === "checked-out" || loan.status === "overdue";
  // Derive overdue from the actual due date, not the status field.
  // This protects against stale status data (e.g. a "checked-out" loan
  // whose due date has already passed).
  const daysUntilDue = calculateDaysUntilDue(loan.dueDate);
  const isOverdue = !isReturned && daysUntilDue < 0;
  const overdueDays = Math.abs(daysUntilDue);
  const daysToReturn = Math.max(0, daysUntilDue);

  const totalDays = Math.ceil(
    (new Date(loan.dueDate).getTime() - new Date(loan.issueDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const daysElapsed = Math.ceil(
    (new Date(isReturned && loan.returnDate ? loan.returnDate : new Date().toISOString()).getTime() -
      new Date(loan.issueDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const readPct = book?.totalPages && loan.currentPage
    ? Math.min(100, Math.ceil((loan.currentPage / book.totalPages) * 100))
    : 0;
  const fineBg = !loan.fineAmount || loan.fineAmount === 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100";
  const fineTextColor = !loan.fineAmount || loan.fineAmount === 0 ? "text-green-700" : "text-red-700";

  const statusLabel = isReturned
    ? "Returned"
    : isOverdue
    ? "Overdue"
    : "Active";
  const statusBg = isReturned
    ? "bg-green-50"
    : isOverdue
    ? "bg-red-50"
    : "bg-primary-50";
  const statusBorder = isReturned
    ? "border-green-200"
    : isOverdue
    ? "border-red-200"
    : "border-primary-200";
  const statusIconColor = isReturned
    ? "#059669"
    : isOverdue
    ? "#DC2626"
    : "#EA580C";

  const header = (
    <View className="pt-10 pb-4 flex-row items-center w-full">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-11 h-11 rounded-full bg-white border border-border items-center justify-center"
      >
        <ArrowLeft size={20} stroke="#181713" />
      </TouchableOpacity>
      <Text className="text-xl font-black text-ink ml-3">Loan details</Text>
    </View>
  );

  return (
    <Screen header={header}>
      {/* Hero: Book Cover + Book Info */}
        <View className="flex-row gap-4 mt-2 mb-4">
          <BookCover title={loan.bookTitle} className="w-[100px] h-[148px] rounded-[16px] self-start" coverUrl={book?.coverUrl} />

          <View className="flex-1 justify-between py-1">
            <View>
              <Text
                className="text-base font-black text-ink leading-tight mb-1"
                numberOfLines={2}
              >
                {loan.bookTitle}
              </Text>
              {(loan.book ?? book) && (
                <Text className="text-xs text-ink-soft mb-0.5">
                  {(loan.book ?? book)?.authorName}
                </Text>
              )}
              <Text className="text-xs text-ink-soft">
                {(loan.book ?? book) ? `ISBN ${(loan.book ?? book)?.isbn ?? loan.bookBarcode}` : loan.bookBarcode}
              </Text>
              {(loan.book ?? book) && (
                <View className="flex-row items-center gap-1.5 mt-1 flex-wrap">
                  <View className="bg-muted-50 rounded-full px-2 py-0.5">
                    <Text className="text-xs text-ink-soft">{(loan.book ?? book)?.category}</Text>
                  </View>
                  <View className="bg-muted-50 rounded-full px-2 py-0.5">
                    <Text className="text-xs text-ink-soft">{(loan.book ?? book)?.publisher}</Text>
                  </View>
                  <View className="bg-muted-50 rounded-full px-2 py-0.5">
                    <Text className="text-xs text-ink-soft">{(loan.book ?? book)?.totalPages} pg</Text>
                  </View>
                </View>
              )}
            </View>

            <View
              className={`self-start rounded-full px-3 py-1.5 ${statusBg} border ${statusBorder}`}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: statusIconColor }}
              >
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats row — always 4 chips in a single row, evenly spaced */}
        {/* Stats row — order: Pages read → Read % → Overdue/return days → Fine amount */}
        <View
          className="flex-row mb-4"
          style={{ gap: 6 }}
        >
          {loan.currentPage !== undefined && book && (
            <>
              <View
                className="flex-1 rounded-[16px] bg-green-50 border border-green-100 p-2.5 items-center"
              >
                <Text className="text-lg font-black text-green-700">
                  {loan.currentPage}
                </Text>
                <Text className="text-[10px] mt-0.5 text-center text-green-700" numberOfLines={2}>
                  Pages read
                </Text>
              </View>
              <View
                className="flex-1 rounded-[16px] bg-green-50 border border-green-100 p-2.5 items-center"
              >
                <Text className="text-lg font-black text-green-700">{readPct}%</Text>
                <Text className="text-[10px] mt-0.5 text-center text-green-700" numberOfLines={2}>
                  Read
                </Text>
              </View>
            </>
          )}
          {!isReturned && (
            <View
              className={`flex-1 rounded-[16px] border p-2.5 items-center ${
                isOverdue ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"
              }`}
            >
              <Text
                className={`text-lg font-black ${isOverdue ? "text-red-600" : "text-green-700"}`}
              >
                {isOverdue ? overdueDays : daysToReturn}
              </Text>
              <Text
                className={`text-[10px] mt-0.5 text-center ${isOverdue ? "text-red-600" : "text-green-700"}`}
                numberOfLines={2}
              >
                {isOverdue ? "Overdue days" : "Days to return"}
              </Text>
            </View>
          )}
          {isReturned && (
            <View className="flex-1 rounded-[16px] bg-green-50 border border-green-100 p-2.5 items-center">
              <Text className="text-lg font-black text-green-700">
                {Math.ceil(
                  (new Date(loan.returnDate!).getTime() - new Date(loan.issueDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </Text>
              <Text className="text-[10px] mt-0.5 text-center text-green-700" numberOfLines={2}>
                Days held
              </Text>
            </View>
          )}
          <View
            className={`flex-1 rounded-[16px] border p-2.5 items-center ${fineBg}`}
          >
            <Text className={`text-lg font-black ${fineTextColor}`}>
              ₹{loan.fineAmount ?? 0}
            </Text>
            <Text className={`text-[10px] mt-0.5 text-center ${fineTextColor}`} numberOfLines={2}>
              Fine amount
            </Text>
          </View>
        </View>

        <View className="rounded-[20px] bg-white border border-border p-4 mb-4">
          <Text className="text-sm font-bold text-ink">Reading history</Text>
          <Text className="text-xs text-ink-soft mt-1">
            Pages read during this lending: {loan.currentLendingPagesReadCount ?? 0}
          </Text>
          <Text className="text-xs text-ink-soft mt-1 mb-3">
            Across all lendings of this book: {readingHistory?.bookPagesReadTotal ?? 0} pages
          </Text>

          {historyError && <Text accessibilityRole="alert" className="text-xs text-red-600 mb-3">{historyError.message}</Text>}
          {readingHistory?.lendingPeriods.map((period) => {
            const entries = readingHistory.data.filter((entry) => entry.loanId === period.loanId);
            return (
              <View key={period.loanId} className="border-t border-border py-3">
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="flex-1 text-xs font-bold text-ink">
                    {period.loanId === loan.id ? "This lending" : "Previous lending"} · {formatDate(period.issueDate)}
                  </Text>
                  <Text className="text-xs font-semibold text-ink-soft">{period.pagesReadCount} pages</Text>
                </View>
                {period.returnDate && <Text className="text-[11px] text-ink-muted mt-1">Returned {formatDate(period.returnDate)}</Text>}
                {period.legacySummary && (
                  <Text className="text-xs text-ink-muted mt-2">Legacy summary · date unavailable</Text>
                )}
                {entries.map((entry) => (
                  <View key={entry.id} className="mt-2 flex-row items-center justify-between">
                    <Text className="text-xs text-ink-soft">{formatDate(entry.createdAt)}</Text>
                    <Text className="text-xs text-ink">
                      {entry.pagesReadFrom !== undefined && entry.pagesReadTo !== undefined
                        ? `Pages ${entry.pagesReadFrom}–${entry.pagesReadTo} · ${entry.pagesReadCount} read`
                        : `${entry.pagesReadCount} pages read`}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
          {readingHistory && readingHistory.data.length < readingHistory.total && (
            <TouchableOpacity accessibilityRole="button" onPress={() => { void loadMoreHistory(); }} disabled={isLoadingMoreHistory} className="items-center py-3">
              <Text className="text-sm font-semibold text-primary-700">{isLoadingMoreHistory ? "Loading…" : "Load older reading entries"}</Text>
            </TouchableOpacity>
          )}
          {readingHistory?.data.length === 0 && readingHistory.lendingPeriods.every((period) => !period.legacySummary) && (
            <Text className="text-xs text-ink-muted mb-3">No dated reading sessions recorded yet.</Text>
          )}

          {canUpdateProgress && (
            <>
              <View className="flex-row gap-2 mb-3">
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{ selected: progressMode === "range" }}
                  onPress={() => { setProgressMode("range"); setProgressError(""); setProgressSaved(false); }}
                  className={`flex-1 rounded-xl border px-3 py-3 ${progressMode === "range" ? "bg-primary-50 border-primary-300" : "bg-white border-border"}`}
                >
                  <Text className={`text-center text-sm font-semibold ${progressMode === "range" ? "text-primary-700" : "text-ink-soft"}`}>From / to pages</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{ selected: progressMode === "count" }}
                  onPress={() => { setProgressMode("count"); setProgressError(""); setProgressSaved(false); }}
                  className={`flex-1 rounded-xl border px-3 py-3 ${progressMode === "count" ? "bg-primary-50 border-primary-300" : "bg-white border-border"}`}
                >
                  <Text className={`text-center text-sm font-semibold ${progressMode === "count" ? "text-primary-700" : "text-ink-soft"}`}>Pages read</Text>
                </TouchableOpacity>
              </View>

              {progressMode === "range" ? (
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-ink-soft mb-1">From page</Text>
                    <TextInput value={fromPage} onChangeText={(value) => { setFromPage(value); setProgressSaved(false); }} keyboardType="number-pad" accessibilityLabel="From page" placeholder="1" placeholderTextColor="#8A857C" className="h-12 rounded-xl bg-white border border-border px-3 text-base text-ink" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-ink-soft mb-1">To page</Text>
                    <TextInput value={toPage} onChangeText={(value) => { setToPage(value); setProgressSaved(false); }} keyboardType="number-pad" accessibilityLabel="To page" placeholder="20" placeholderTextColor="#8A857C" className="h-12 rounded-xl bg-white border border-border px-3 text-base text-ink" />
                  </View>
                </View>
              ) : (
                <View>
                  <Text className="text-xs font-semibold text-ink-soft mb-1">Pages read in this session</Text>
                  <TextInput value={pagesReadCount} onChangeText={(value) => { setPagesReadCount(value); setProgressSaved(false); }} keyboardType="number-pad" accessibilityLabel="Number of pages read" placeholder="0" placeholderTextColor="#8A857C" className="h-12 rounded-xl bg-white border border-border px-3 text-base text-ink" />
                </View>
              )}
              {!!progressError && <Text accessibilityRole="alert" className="text-sm text-red-600 mt-3">{progressError}</Text>}
              {progressSaved && <Text accessibilityRole="text" className="text-sm text-green-700 mt-3">Reading progress saved.</Text>}
              <Button variant="primary" size="md" title="Save progress" onPress={() => { void saveReadingProgress(); }} loading={isSavingProgress} disabled={isSavingProgress} className="mt-3" />
            </>
          )}
        </View>

        {/* Loan info card */}
        <View className="rounded-[20px] bg-white border border-border p-4 mb-4">
          <Text className="text-sm font-bold text-ink mb-4">Loan information</Text>

          <View className="flex-row items-center py-3 border-b border-border">
            <View className="w-9 h-9 rounded-xl bg-primary-50 items-center justify-center">
              <BookOpen size={16} stroke="#EA580C" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-ink-soft">Issued on</Text>
              <Text className="text-sm font-semibold text-ink">
                {formatDate(loan.issueDate)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-3 border-b border-border">
            <View className="w-9 h-9 rounded-xl bg-primary-50 items-center justify-center">
              <Clock size={16} stroke="#EA580C" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-ink-soft">Due date</Text>
              <Text className="text-sm font-semibold text-ink">
                {formatDate(loan.dueDate)}
              </Text>
            </View>
          </View>

          {isReturned && loan.returnDate && (
            <View className="flex-row items-center py-3 border-b border-border">
              <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center">
                <Clock size={16} stroke="#059669" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-ink-soft">Returned on</Text>
                <Text className="text-sm font-semibold text-ink">
                  {formatDate(loan.returnDate)}
                </Text>
              </View>
            </View>
          )}

          <View className="flex-row items-center py-3 border-b border-border">
            <View className="w-9 h-9 rounded-xl bg-muted-50 items-center justify-center">
              <Hash size={16} stroke="#8A857C" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-ink-soft">Copy barcode</Text>
              <Text className="text-sm font-semibold text-ink">
                {loan.copyBarcode ?? loan.bookBarcode}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-3">
            <View className="w-9 h-9 rounded-xl bg-muted-50 items-center justify-center">
              <Tag size={16} stroke="#8A857C" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-ink-soft">Loan duration</Text>
              <Text className="text-sm font-semibold text-ink">
                {totalDays} days ({daysElapsed} {isReturned ? "held" : "elapsed"})
              </Text>
            </View>
          </View>
        </View>

        {/* Book details card */}
        {book && (
          <View className="rounded-[20px] bg-white border border-border p-4 mb-4">
            <Text className="text-sm font-bold text-ink mb-4">Book details</Text>

            <View className="flex-row items-center py-3 border-b border-border">
              <View className="w-9 h-9 rounded-xl bg-muted-50 items-center justify-center">
                <BookOpen size={16} stroke="#8A857C" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-ink-soft">Title</Text>
                <Text className="text-sm font-semibold text-ink">
                  {book.name}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center py-3 border-b border-border">
              <View className="w-9 h-9 rounded-xl bg-muted-50 items-center justify-center">
                <Tag size={16} stroke="#8A857C" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-ink-soft">Category</Text>
                <Text className="text-sm font-semibold text-ink">
                  {book.category}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center py-3 border-b border-border">
              <View className="w-9 h-9 rounded-xl bg-muted-50 items-center justify-center">
                <Building size={16} stroke="#8A857C" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-ink-soft">Publisher</Text>
                <Text className="text-sm font-semibold text-ink">
                  {book.publisher}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center py-3">
              <View className="w-9 h-9 rounded-xl bg-muted-50 items-center justify-center">
                <Hash size={16} stroke="#8A857C" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-ink-soft">Pages</Text>
                <Text className="text-sm font-semibold text-ink">
                  {book.totalPages}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Branch card */}
        <View className="rounded-[20px] bg-white border border-border p-4 mb-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-primary-50 items-center justify-center">
              <MapPin size={20} stroke="#EA580C" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-ink-soft">Branch</Text>
              <Text className="text-sm font-bold text-ink">
                {loan.branchId}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {!isReturned && !isOverdue && (
          <Button
            variant="primary"
            size="lg"
            title="Renew Loan"
            onPress={() => {}}
            className="w-full"
          />
        )}

        {isOverdue && (
          <>
            <Button
              variant="danger"
              size="lg"
              title="Pay Fine"
              onPress={() => router.push(`/fine/${loan.id}`)}
              className="w-full"
            />
            <View className="h-3" />
            <Button
              variant="secondary"
              size="lg"
              title="Renew Loan"
              onPress={() => {}}
              className="w-full"
            />
          </>
        )}
    </Screen>
  );
}
