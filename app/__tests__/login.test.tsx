import { fireEvent, render } from "@testing-library/react-native"
import LoginScreen from "../(auth)/login"

const mockPush = jest.fn()

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}))

jest.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (state: { login: jest.Mock }) => unknown) => selector({ login: jest.fn() }),
}))

describe("LoginScreen registration navigation", () => {
  beforeEach(() => mockPush.mockClear())

  it("navigates to the reader registration form", async () => {
    const { getByRole } = await render(<LoginScreen />)

    fireEvent.press(getByRole("button", { name: "Create an account" }))

    expect(mockPush).toHaveBeenCalledWith("/(auth)/register")
  })
})
