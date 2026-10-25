import { apiClient } from "@/lib/api/client";
import { readerRegistrationApi } from "@/lib/api/readerRegistrationApi";

jest.mock("@/lib/api/client", () => ({ apiClient: { get: jest.fn(), post: jest.fn() } }));

describe("readerRegistrationApi", () => {
  beforeEach(() => jest.resetAllMocks());

  it("loads branches from the public registration endpoint", async () => {
    const branches = [{ branchId: "b1", branchName: "Main", libraryId: "l1", libraryName: "Central" }];
    jest.mocked(apiClient.get).mockResolvedValue({ data: branches } as never);
    await expect(readerRegistrationApi.getBranches()).resolves.toEqual(branches);
    expect(apiClient.get).toHaveBeenCalledWith("/auth/reader-registration/branches");
  });

  it("submits the full registration payload and returns its pending status", async () => {
    const payload = {
      fullName: "Sam Reader", email: "sam@example.com", phone: "555-0100", password: "password123",
      branchId: "b1", readerType: "other" as const, readerTypeOtherText: "Volunteer",
      address: { line: "10 Main", city: "Pune", state: "Maharashtra", pincode: "411001" },
    };
    const response = { registrationId: "r1", status: "pending" as const, message: "Registration submitted for library approval" };
    jest.mocked(apiClient.post).mockResolvedValue({ data: response } as never);
    await expect(readerRegistrationApi.register(payload)).resolves.toEqual(response);
    expect(apiClient.post).toHaveBeenCalledWith("/auth/register-reader", payload);
  });
});
