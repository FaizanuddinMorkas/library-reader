import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KeyboardAwareScreen } from "@/components/ui/KeyboardAwareScreen";
import { Select, type SelectOption } from "@/components/ui/Select";
import { ApiError } from "@/lib/api/apiErrors";
import { AuthBackground, AuthCardAccent } from "@/components/auth/AuthBackground";
import {
  readerRegistrationApi,
  type ReaderRegistrationBranch,
} from "@/lib/api/readerRegistrationApi";
import {
  validateReaderRegistration,
  type ReaderRegistrationErrors,
  type ReaderRegistrationFormValues,
  type ReaderType,
} from "@/lib/readerRegistration";

const initialValues: ReaderRegistrationFormValues = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  branchId: "",
  readerType: "student",
  address: { line: "", city: "", state: "", pincode: "", district: "" },
};

const readerTypes: { value: ReaderType; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "guest", label: "Guest" },
  { value: "other", label: "Other" },
];

export default function RegisterReaderScreen() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [branches, setBranches] = useState<ReaderRegistrationBranch[]>([]);
  const [branchLoading, setBranchLoading] = useState(true);
  const [branchError, setBranchError] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [libraryId, setLibraryId] = useState("");
  const [libraryError, setLibraryError] = useState("");
  const [errors, setErrors] = useState<ReaderRegistrationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    readerRegistrationApi
      .getBranches()
      .then((result) => {
        if (mounted) setBranches(result);
      })
      .catch((error: unknown) => {
        if (mounted) {
          setBranchError(
            error instanceof Error
              ? error.message
              : "Unable to load library branches",
          );
        }
      })
      .finally(() => {
        if (mounted) setBranchLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const update = <K extends keyof ReaderRegistrationFormValues>(
    key: K,
    value: ReaderRegistrationFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({
      ...current,
      [key]: undefined,
      ...(key === "readerType" ? { readerTypeOtherText: undefined } : {}),
    }));
  };
  const updateAddress = (
    key: keyof ReaderRegistrationFormValues["address"],
    value: string,
  ) => {
    setValues((current) => ({
      ...current,
      address: { ...current.address, [key]: value },
    }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async () => {
    const result = validateReaderRegistration(values);
    setErrors(result.errors);
    if (!result.values) return;

    setLoading(true);
    try {
      await readerRegistrationApi.register(result.values);
      setSubmitted(true);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to submit registration. Please try again.";
      Alert.alert("Registration failed", message);
    } finally {
      setLoading(false);
    }
  };

  const libraryOptions: SelectOption[] = Array.from(
    new Map(
      branches.map((branch) => [branch.libraryId, branch.libraryName]),
    ),
  ).map(([value, label]) => ({ value, label }));
  const branchOptions: SelectOption[] = branches
    .filter((branch) => branch.libraryId === libraryId)
    .map((branch) => ({
      value: branch.branchId,
      label: branch.city ? `${branch.branchName} · ${branch.city}` : branch.branchName,
    }));

  const continueFromAccount = () => {
    const { errors: validationErrors } = validateReaderRegistration(values);
    const accountFieldNames = [
      "fullName",
      "email",
      "phone",
      "password",
      "confirmPassword",
      "readerTypeOtherText",
    ] as const;
    const accountErrors = Object.fromEntries(
      accountFieldNames.flatMap((field) =>
        validationErrors[field] ? [[field, validationErrors[field]]] : [],
      ),
    ) as ReaderRegistrationErrors;

    setErrors(accountErrors);
    if (Object.keys(accountErrors).length === 0) setStep(2);
  };

  const continueFromLibrary = () => {
    setLibraryError(libraryId ? "" : "Choose a library");
    setErrors((current) => ({
      ...current,
      branchId: values.branchId ? undefined : "Choose a library branch",
    }));

    if (libraryId && values.branchId) setStep(3);
  };

  const chooseLibrary = (nextLibraryId: string) => {
    setLibraryId(nextLibraryId);
    update("branchId", "");
    setLibraryError("");
  };

  if (submitted) {
    return (
      <AuthBackground>
        <View className="flex-1 justify-center px-5 py-8">
          <View className="w-full max-w-md self-center overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
            <AuthCardAccent />
            <View className="p-7">
              <Text className="mb-3 text-2xl font-black text-ink">
                Request submitted
              </Text>
              <Text className="mb-6 text-base leading-6 text-ink-soft">
                Your reader registration is awaiting library approval. You can
                sign in after the library approves your account.
              </Text>
              <Button
                title="Back to sign in"
                onPress={() => router.replace("/(auth)/login")}
                size="lg"
              />
            </View>
          </View>
        </View>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <KeyboardAwareScreen>
        <View className="w-full max-w-md self-center px-5 py-8">
          <View className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
            <AuthCardAccent />
            <View className="p-6">
              <View className="mb-6">
                <Text className="text-xs font-bold uppercase tracking-widest text-primary-700">
                  Step {step} of 3
                </Text>
                <View className="mt-3 flex-row gap-2">
                  {[1, 2, 3].map((stepNumber) => (
                    <View
                      key={stepNumber}
                      className={`h-1.5 flex-1 rounded-full ${stepNumber <= step ? "bg-primary-600" : "bg-border"}`}
                    />
                  ))}
                </View>
              </View>

              {step === 1 ? (
                <>
                  <Text className="mb-1 text-2xl font-black text-ink">
                    Create your account
                  </Text>
                  <Text className="mb-6 text-sm leading-5 text-ink-soft">
                    Enter your contact details and choose your reader type.
                  </Text>
                  <Input
                    label="Full name"
                    placeholder="Enter your full name"
                    value={values.fullName}
                    onChangeText={(value) => update("fullName", value)}
                    autoCapitalize="words"
                    error={errors.fullName}
                  />
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={values.email}
                    onChangeText={(value) => update("email", value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                  />
                  <Input
                    label="Phone"
                    placeholder="Enter your phone number"
                    value={values.phone}
                    onChangeText={(value) => update("phone", value)}
                    keyboardType="phone-pad"
                    error={errors.phone}
                  />
                  <Input
                    label="Password"
                    placeholder="At least 8 characters"
                    value={values.password}
                    onChangeText={(value) => update("password", value)}
                    secureTextEntry
                    error={errors.password}
                  />
                  <Input
                    label="Confirm password"
                    placeholder="Re-enter your password"
                    value={values.confirmPassword}
                    onChangeText={(value) => update("confirmPassword", value)}
                    secureTextEntry
                    error={errors.confirmPassword}
                  />
                  <Text className="mb-2 text-sm font-medium text-ink">
                    Reader type
                  </Text>
                  <View className="mb-2 flex-row flex-wrap">
                    {readerTypes.map((type) => {
                      const selected = values.readerType === type.value;
                      return (
                        <TouchableOpacity
                          key={type.value}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected }}
                          onPress={() => update("readerType", type.value)}
                          className={`mb-2 mr-2 rounded-full border px-4 py-2 ${selected ? "border-primary-600 bg-primary-600" : "border-border bg-surface"}`}
                        >
                          <Text
                            className={
                              selected
                                ? "font-semibold text-white"
                                : "font-medium text-ink-soft"
                            }
                          >
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {values.readerType === "other" ? (
                    <Input
                      label="Please specify"
                      placeholder="Describe your reader type"
                      value={values.readerTypeOtherText ?? ""}
                      onChangeText={(value) =>
                        update("readerTypeOtherText", value)
                      }
                      error={errors.readerTypeOtherText}
                    />
                  ) : null}
                  <Button
                    title="Continue"
                    onPress={continueFromAccount}
                    size="lg"
                    className="mt-2 w-full"
                  />
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <Text className="mb-1 text-2xl font-black text-ink">
                    Choose your library
                  </Text>
                  <Text className="mb-6 text-sm leading-5 text-ink-soft">
                    Select the library and the branch you want to register with.
                  </Text>
                  {branchLoading ? (
                    <View className="mb-5 flex-row items-center py-3">
                      <ActivityIndicator />
                      <Text className="ml-2 text-sm text-ink-muted">
                        Loading libraries…
                      </Text>
                    </View>
                  ) : branchError ? (
                    <View className="mb-5 rounded-xl border border-danger p-3">
                      <Text className="mb-2 text-sm text-danger">
                        {branchError}
                      </Text>
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => {
                          setBranchLoading(true);
                          setBranchError("");
                          readerRegistrationApi
                            .getBranches()
                            .then(setBranches)
                            .catch((error: unknown) =>
                              setBranchError(
                                error instanceof Error
                                  ? error.message
                                  : "Unable to load library branches",
                              ),
                            )
                            .finally(() => setBranchLoading(false));
                        }}
                      >
                        <Text className="font-semibold text-primary-600">
                          Try again
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : branches.length === 0 ? (
                    <Text className="mb-5 text-sm text-ink-muted">
                      No active libraries are available for registration.
                    </Text>
                  ) : (
                    <>
                      <Select
                        label="Library"
                        placeholder="Select a library"
                        value={libraryId}
                        options={libraryOptions}
                        onChange={chooseLibrary}
                        error={libraryError}
                      />
                      <Select
                        label="Branch"
                        placeholder="Select a branch"
                        value={values.branchId}
                        options={branchOptions}
                        onChange={(branchId) => update("branchId", branchId)}
                        disabled={!libraryId}
                        error={errors.branchId}
                      />
                    </>
                  )}
                  <View className="mt-2 flex-row gap-3">
                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={() => setStep(1)}
                      className="flex-1 items-center justify-center rounded-xl border border-border px-4 py-3"
                    >
                      <Text className="font-semibold text-ink">Back</Text>
                    </TouchableOpacity>
                    <View className="flex-1">
                      <Button
                        title="Continue"
                        onPress={continueFromLibrary}
                        size="md"
                        className="w-full"
                      />
                    </View>
                  </View>
                </>
              ) : null}

              {step === 3 ? (
                <>
                  <Text className="mb-1 text-2xl font-black text-ink">
                    Address details
                  </Text>
                  <Text className="mb-6 text-sm leading-5 text-ink-soft">
                    Add your address to complete your reader profile.
                  </Text>
                  <Input
                    label="Address"
                    placeholder="Street address"
                    value={values.address.line}
                    onChangeText={(value) => updateAddress("line", value)}
                    error={errors.line}
                  />
                  <Input
                    label="City"
                    placeholder="Enter your city"
                    value={values.address.city}
                    onChangeText={(value) => updateAddress("city", value)}
                    error={errors.city}
                  />
                  <Input
                    label="State"
                    placeholder="Enter your state"
                    value={values.address.state}
                    onChangeText={(value) => updateAddress("state", value)}
                    error={errors.state}
                  />
                  <Input
                    label="Pincode"
                    placeholder="Enter your pincode"
                    value={values.address.pincode}
                    onChangeText={(value) => updateAddress("pincode", value)}
                    keyboardType="number-pad"
                    error={errors.pincode}
                  />
                  <Input
                    label="District (optional)"
                    placeholder="Enter your district"
                    value={values.address.district}
                    onChangeText={(value) => updateAddress("district", value)}
                    error={errors.district}
                  />
                  <View className="mt-2 flex-row gap-3">
                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={() => setStep(2)}
                      className="flex-1 items-center justify-center rounded-xl border border-border px-4 py-3"
                    >
                      <Text className="font-semibold text-ink">Back</Text>
                    </TouchableOpacity>
                    <View className="flex-1">
                      <Button
                        title="Submit registration"
                        onPress={submit}
                        loading={loading}
                        size="md"
                        className="w-full"
                      />
                    </View>
                  </View>
                </>
              ) : null}

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Already have an account? Sign in"
                onPress={() => router.replace("/(auth)/login")}
                className="mt-5 items-center py-2"
              >
                <Text className="text-sm text-primary-600">
                  Already have an account?{" "}
                  <Text className="font-bold">Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScreen>
    </AuthBackground>
  );
}
