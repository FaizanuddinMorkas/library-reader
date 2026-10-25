import { isValidEmail, MIN_PASSWORD_LENGTH } from "./validation";

export type ReaderType = "student" | "teacher" | "guest" | "other";

export interface ReaderRegistrationValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  branchId: string;
  readerType: ReaderType;
  readerTypeOtherText?: string;
  address: { line: string; city: string; state: string; pincode: string; district?: string };
}

export interface ReaderRegistrationFormValues extends Omit<ReaderRegistrationValues, "password"> {
  password: string;
  confirmPassword: string;
}

export type ReaderRegistrationErrors = Partial<Record<
  "fullName" | "email" | "phone" | "password" | "confirmPassword" | "branchId" |
  "readerTypeOtherText" | "line" | "city" | "state" | "pincode" | "district",
  string
>>;

export function validateReaderRegistration(input: ReaderRegistrationFormValues) {
  const errors: ReaderRegistrationErrors = {};
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const password = input.password;
  const address = {
    line: input.address.line.trim(),
    city: input.address.city.trim(),
    state: input.address.state.trim(),
    pincode: input.address.pincode.trim(),
    ...(input.address.district?.trim() ? { district: input.address.district.trim() } : {}),
  };

  if (!fullName) errors.fullName = "Full name is required";
  else if (fullName.length > 120) errors.fullName = "Full name must be 120 characters or fewer";
  if (!isValidEmail(email)) errors.email = "Enter a valid email address";
  else if (email.length > 254) errors.email = "Email must be 254 characters or fewer";
  if (!phone) errors.phone = "Phone number is required";
  else if (phone.length > 40) errors.phone = "Phone number must be 40 characters or fewer";
  if (password.length < MIN_PASSWORD_LENGTH) errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  else if (password.length > 128) errors.password = "Password must be 128 characters or fewer";
  if (password !== input.confirmPassword) errors.confirmPassword = "Passwords do not match";
  if (!input.branchId) errors.branchId = "Choose a library branch";
  if (input.readerType === "other" && !input.readerTypeOtherText?.trim()) {
    errors.readerTypeOtherText = "Please describe your reader type";
  }
  if (input.readerType === "other" && (input.readerTypeOtherText?.trim().length ?? 0) > 100) {
    errors.readerTypeOtherText = "Reader type details must be 100 characters or fewer";
  }
  if (!address.line) errors.line = "Address is required";
  else if (address.line.length > 500) errors.line = "Address must be 500 characters or fewer";
  if (!address.city) errors.city = "City is required";
  else if (address.city.length > 100) errors.city = "City must be 100 characters or fewer";
  if (!address.state) errors.state = "State is required";
  else if (address.state.length > 100) errors.state = "State must be 100 characters or fewer";
  if (!address.pincode) errors.pincode = "Pincode is required";
  else if (address.pincode.length > 20) errors.pincode = "Pincode must be 20 characters or fewer";
  if (address.district && address.district.length > 100) errors.district = "District must be 100 characters or fewer";

  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    values: {
      fullName,
      email,
      phone,
      password,
      branchId: input.branchId,
      readerType: input.readerType,
      ...(input.readerType === "other" ? { readerTypeOtherText: input.readerTypeOtherText!.trim() } : {}),
      address,
    } satisfies ReaderRegistrationValues,
  };
}

export function getReaderLoginErrorMessage(error: unknown) {
  if (
    error && typeof error === "object" && "status" in error && error.status === 401 &&
    "message" in error && error.message === "Account is deactivated"
  ) {
    return "Your registration is awaiting library approval. You can sign in after the library approves your account.";
  }
  return "Invalid email or password";
}
