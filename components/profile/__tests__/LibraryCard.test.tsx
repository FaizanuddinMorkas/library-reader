import { fireEvent, render, screen } from "@testing-library/react-native";

import { LibraryCard } from "../LibraryCard";

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

jest.mock("react-native-qrcode-svg", () => "QRCode");

describe("LibraryCard", () => {
  it("switches between the front and back", async () => {
    await render(
      <LibraryCard readerId="READ-001" readerName="Asha Rao" />
    );

    expect(screen.getByText("MEMBER CARD")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Show back of reader card"));

    expect(screen.getByText("MEMBER INFO")).toBeTruthy();
    expect(screen.getByText("Property of library · Not for resale")).toBeTruthy();
  });
});
