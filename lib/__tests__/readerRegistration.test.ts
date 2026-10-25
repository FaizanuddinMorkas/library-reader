import { getReaderLoginErrorMessage, validateReaderRegistration } from "../readerRegistration";

describe("validateReaderRegistration", () => {
  const validInput = {
    fullName: " Sam Reader ",
    email: "sam@example.com",
    phone: " 555-0100 ",
    password: "password123",
    confirmPassword: "password123",
    branchId: "branch-1",
    readerType: "student" as const,
    address: {
      line: " 10 Main Street ",
      city: " Pune ",
      state: " Maharashtra ",
      pincode: " 411001 ",
      district: " Pune ",
    },
  };

  it("accepts and normalizes a complete reader registration", () => {
    expect(validateReaderRegistration(validInput)).toEqual({
      values: {
        fullName: "Sam Reader",
        email: "sam@example.com",
        phone: "555-0100",
        password: "password123",
        branchId: "branch-1",
        readerType: "student",
        address: {
          line: "10 Main Street",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411001",
          district: "Pune",
        },
      },
      errors: {},
    });
  });

  it("requires Other details and confirmation to match", () => {
    const result = validateReaderRegistration({
      ...validInput,
      confirmPassword: "different123",
      readerType: "other",
      readerTypeOtherText: "  Volunteer ",
    });
    expect(result.errors.confirmPassword).toBe("Passwords do not match");
    expect(validateReaderRegistration({
      ...validInput,
      readerType: "other",
      readerTypeOtherText: "  Volunteer ",
    }).values?.readerTypeOtherText).toBe("Volunteer");
  });

  it("rejects missing branch, invalid email, short password, and incomplete address", () => {
    const result = validateReaderRegistration({
      ...validInput,
      email: "invalid",
      password: "short",
      confirmPassword: "short",
      branchId: "",
      address: { ...validInput.address, pincode: "" },
    });
    expect(result.errors).toMatchObject({
      email: "Enter a valid email address",
      password: "Password must be at least 8 characters",
      branchId: "Choose a library branch",
      pincode: "Pincode is required",
    });
  });

  it("matches the backend's maximum field lengths", () => {
    const result = validateReaderRegistration({
      ...validInput,
      fullName: "x".repeat(121),
      phone: "1".repeat(41),
      password: "p".repeat(129),
      confirmPassword: "p".repeat(129),
      address: { ...validInput.address, line: "x".repeat(501) },
    });
    expect(result.errors).toMatchObject({
      fullName: "Full name must be 120 characters or fewer",
      phone: "Phone number must be 40 characters or fewer",
      password: "Password must be 128 characters or fewer",
      line: "Address must be 500 characters or fewer",
    });
  });
});

describe("getReaderLoginErrorMessage", () => {
  it("explains that inactive reader accounts await library approval", () => {
    expect(getReaderLoginErrorMessage({ status: 401, message: "Account is deactivated" })).toContain("awaiting library approval");
  });

  it("keeps other login errors generic", () => {
    expect(getReaderLoginErrorMessage({ status: 401, message: "Invalid credentials" })).toBe("Invalid email or password");
  });
});
