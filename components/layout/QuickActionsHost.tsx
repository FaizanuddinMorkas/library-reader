import { forwardRef } from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  QuickActionsSheet,
  type QuickActionsSheetHandle,
} from "./QuickActionsSheet";

export const QuickActionsHost = forwardRef<QuickActionsSheetHandle>(
  function QuickActionsHost(_, ref) {
    return (
      <BottomSheetModalProvider>
        <QuickActionsSheet ref={ref} />
      </BottomSheetModalProvider>
    );
  }
);
