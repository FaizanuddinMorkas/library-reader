import { fireEvent, render } from "@testing-library/react-native";
import { BottomTabBar } from "../BottomTabBar";

describe("BottomTabBar", () => {
  const state = {
    index: 0,
    routes: [
      { name: "index" },
      { name: "library" },
      { name: "my-library" },
      { name: "profile" },
    ],
  };

  it("renders the four destinations and Quick action", async () => {
    const screen = await render(
      <BottomTabBar
        state={state}
        navigation={{ navigate: jest.fn() }}
        onQuickPress={jest.fn()}
      />
    );

    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Library")).toBeTruthy();
    expect(screen.getByText("My Library")).toBeTruthy();
    expect(screen.getByText("Profile")).toBeTruthy();
    expect(screen.getByLabelText("Open quick actions")).toBeTruthy();
  });

  it("navigates to destinations and opens Quick actions", async () => {
    const navigate = jest.fn();
    const onQuickPress = jest.fn();
    const screen = await render(
      <BottomTabBar
        state={state}
        navigation={{ navigate }}
        onQuickPress={onQuickPress}
      />
    );

    fireEvent.press(screen.getByText("Library"));
    fireEvent.press(screen.getByLabelText("Open quick actions"));

    expect(navigate).toHaveBeenCalledWith("library");
    expect(onQuickPress).toHaveBeenCalledTimes(1);
  });
});
