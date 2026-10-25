import { render, screen } from "@testing-library/react-native";

import ReaderCardScreen from "../reader-card";

jest.mock("@/components/layout/AppHeader", () => ({
  AppHeader: () => null,
}));

jest.mock("@/components/ui/Screen", () => {
  const { View } = jest.requireActual<typeof import("react-native")>("react-native");
  return { Screen: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
});

jest.mock("@/components/profile/LibraryCard", () => ({
  LibraryCard: ({ readerId, readerName, branchName, libraryName, memberSince }: {
    readerId: string;
    readerName: string;
    branchName?: string;
    libraryName?: string;
    memberSince?: string;
  }) => {
    const { Text } = jest.requireActual<typeof import("react-native")>("react-native");
    return (
      <>
        <Text>{readerId}</Text>
        <Text>{readerName}</Text>
        <Text>{branchName}</Text>
        <Text>{libraryName}</Text>
        <Text>{memberSince}</Text>
      </>
    );
  },
}));

jest.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (state: { user: { name: string; email: string } }) => unknown) =>
    selector({ user: { name: "Asha Rao", email: "asha@example.com" } }),
}));

jest.mock("@/hooks/useReaderProfile", () => ({
  useReaderProfile: () => ({
    profile: {
      readerId: "READ-001",
      fullName: "Asha Rao",
      branchName: "Mumbai Central",
      libraryName: "LibraryOS Mumbai",
      createdAt: "2026-01-15T00:00:00.000Z",
    },
  }),
}));

describe("ReaderCardScreen", () => {
  it("renders the shared profile library card with reader profile data", async () => {
    await render(<ReaderCardScreen />);

    expect(screen.getByText("READ-001")).toBeTruthy();
    expect(screen.getByText("Asha Rao")).toBeTruthy();
    expect(screen.getByText("Mumbai Central")).toBeTruthy();
    expect(screen.getByText("LibraryOS Mumbai")).toBeTruthy();
  });
});
