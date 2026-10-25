import { fireEvent, render, waitFor } from "@testing-library/react-native";
import RegisterReaderScreen from "../(auth)/register";

const mockReplace = jest.fn();
const mockRegister = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
}));

jest.mock("@/lib/api/readerRegistrationApi", () => ({
  readerRegistrationApi: {
    getBranches: jest.fn().mockResolvedValue([
      {
        branchId: "central-1",
        branchName: "Central Branch",
        libraryId: "library-1",
        libraryName: "City Library",
        city: "Pune",
      },
      {
        branchId: "west-1",
        branchName: "West Branch",
        libraryId: "library-1",
        libraryName: "City Library",
        city: "Pune",
      },
      {
        branchId: "north-1",
        branchName: "North Branch",
        libraryId: "library-2",
        libraryName: "County Library",
        city: "Mumbai",
      },
    ]),
    register: (...args: unknown[]) => mockRegister(...args),
  },
}));

describe("RegisterReaderScreen", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockRegister.mockClear();
  });

  it("starts with account details and validates them before continuing", async () => {
    const screen = await render(<RegisterReaderScreen />);

    expect(screen.getByText("Step 1 of 3")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter your full name")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter your phone number")).toBeTruthy();
    expect(screen.getByPlaceholderText("At least 8 characters")).toBeTruthy();
    expect(screen.queryByText("Library")).toBeNull();

    await fireEvent.press(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Full name is required")).toBeTruthy();
    expect(screen.queryByText("Step 2 of 3")).toBeNull();
  });

  it("uses library and branch dropdowns before proceeding to address details", async () => {
    const screen = await render(<RegisterReaderScreen />);

    await fireEvent.changeText(screen.getByPlaceholderText("Enter your full name"), "Reader One");
    await fireEvent.changeText(screen.getByPlaceholderText("Enter your email"), "reader@example.com");
    await fireEvent.changeText(screen.getByPlaceholderText("Enter your phone number"), "1234567890");
    await fireEvent.changeText(screen.getByPlaceholderText("At least 8 characters"), "password123");
    await fireEvent.changeText(screen.getByPlaceholderText("Re-enter your password"), "password123");
    await fireEvent.press(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Step 2 of 3")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Select a library" }));
    await fireEvent.press(await screen.findByRole("button", { name: "City Library" }));

    await fireEvent.press(screen.getByRole("button", { name: "Select a branch" }));
    expect(await screen.findByRole("button", { name: "Central Branch · Pune" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "West Branch · Pune" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "North Branch · Mumbai" })).toBeNull();
    await fireEvent.press(screen.getByRole("button", { name: "Central Branch · Pune" }));
    await fireEvent.press(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Step 3 of 3")).toBeTruthy();
    expect(screen.getByPlaceholderText("Street address")).toBeTruthy();
    expect(screen.getByText("Submit registration")).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();

    await fireEvent.changeText(
      screen.getByPlaceholderText("Street address"),
      "10 Main Street",
    );
    await fireEvent.changeText(screen.getByPlaceholderText("Enter your city"), "Pune");
    await fireEvent.changeText(screen.getByPlaceholderText("Enter your state"), "Maharashtra");
    await fireEvent.changeText(screen.getByPlaceholderText("Enter your pincode"), "411001");
    await fireEvent.press(
      screen.getByRole("button", { name: "Submit registration" }),
    );

    expect(await screen.findByText("Request submitted")).toBeTruthy();
    expect(mockRegister).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: "central-1" }),
    );
  });

  it("returns to login from the existing account link", async () => {
    const screen = await render(<RegisterReaderScreen />);

    await fireEvent.press(screen.getByRole("button", { name: /Already have an account/ }));

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/login"),
    );
  });
});
