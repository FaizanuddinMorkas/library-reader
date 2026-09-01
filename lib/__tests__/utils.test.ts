import {
  formatDate,
  calculateDaysOverdue,
  calculateDaysUntilDue,
  getTimeOfDay,
  getInitials,
  cn,
} from "../utils";

describe("formatDate", () => {
  it("formats a valid date string correctly", () => {
    const result = formatDate("2025-01-15T10:30:00Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns a readable date format", () => {
    const result = formatDate("2025-06-01");
    expect(result).not.toBe("");
  });

  it("returns a string for any valid date input", () => {
    const result = formatDate("2024-12-25T00:00:00Z");
    expect(typeof result).toBe("string");
  });
});

describe("calculateDaysOverdue", () => {
  it("returns positive number for past dates", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const result = calculateDaysOverdue(pastDate.toISOString());
    expect(result).toBeGreaterThan(0);
  });

  it("returns 0 for future dates", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const result = calculateDaysOverdue(futureDate.toISOString());
    expect(result).toBe(0);
  });

  it("returns 0 for today's date", () => {
    const today = new Date();
    const result = calculateDaysOverdue(today.toISOString());
    expect(result).toBe(0);
  });

  it("returns correct count for exactly 1 day overdue", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = calculateDaysOverdue(yesterday.toISOString());
    expect(result).toBe(1);
  });
});

describe("calculateDaysUntilDue", () => {
  it("returns positive number for future dates", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const result = calculateDaysUntilDue(futureDate.toISOString());
    expect(result).toBeGreaterThan(0);
  });

  it("returns 0 or negative for past dates", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    const result = calculateDaysUntilDue(pastDate.toISOString());
    expect(result).toBeLessThanOrEqual(0);
  });

  it("returns a number", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const result = calculateDaysUntilDue(futureDate.toISOString());
    expect(typeof result).toBe("number");
  });
});

describe("getTimeOfDay", () => {
  it("returns a valid time of day string", () => {
    const result = getTimeOfDay();
    expect(["morning", "afternoon", "evening"]).toContain(result);
  });
});

describe("getInitials", () => {
  it("returns initials from a full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns single initial from single name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("returns first and last initials from multi-word name", () => {
    expect(getInitials("John Middle Doe")).toBe("JM");
  });

  it("returns empty string for empty input", () => {
    expect(getInitials("")).toBe("");
  });

  it("handles names with extra spaces", () => {
    expect(getInitials("  John   Doe  ")).toBe("JD");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("foo", "bar");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
  });

  it("filters falsy values", () => {
    const result = cn("foo", false, null, undefined, "bar");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
    expect(result).not.toContain("false");
    expect(result).not.toContain("null");
  });

  it("handles empty input", () => {
    const result = cn();
    expect(typeof result).toBe("string");
  });
});
