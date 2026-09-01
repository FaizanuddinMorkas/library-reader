import { createRef } from "react";
import { render } from "@testing-library/react-native";
import {
  QuickActionsSheet,
  type QuickActionsSheetHandle,
} from "../QuickActionsSheet";

jest.mock("@/hooks/useReadingProgress", () => ({
  useReadingProgress: () => ({
    getLastReadBook: () => ({ bookId: "eb_001", page: 40, totalPages: 320 }),
  }),
}));

describe("QuickActionsSheet", () => {
  it("exposes all mock-first shortcuts", async () => {
    const ref = createRef<QuickActionsSheetHandle>();
    const screen = await render(<QuickActionsSheet ref={ref} />);

    expect(screen.getByLabelText("Scan book")).toBeTruthy();
    expect(screen.getByLabelText("E-Library")).toBeTruthy();
    expect(screen.getByLabelText("Reader card")).toBeTruthy();
    expect(screen.getByLabelText("Continue reading")).toBeTruthy();
  });
});
