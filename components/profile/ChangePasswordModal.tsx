import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CircleCheck from "lucide-react-native/icons/circle-check";
import Eye from "lucide-react-native/icons/eye";
import EyeOff from "lucide-react-native/icons/eye-off";
import KeyRound from "lucide-react-native/icons/key-round";
import Lock from "lucide-react-native/icons/lock";
import ShieldCheck from "lucide-react-native/icons/shield-check";
import X from "lucide-react-native/icons/x";

const MIN_LENGTH = 8;

interface ChangePasswordModalProps {
  visible: boolean;
  email?: string;
  onClose: () => void;
}

interface FormState {
  current: string;
  next: string;
  confirm: string;
}

interface FieldErrors {
  current?: string;
  next?: string;
  confirm?: string;
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.current) {
    errors.current = "Enter your current password";
  }
  if (!form.next) {
    errors.next = "Choose a new password";
  } else if (form.next.length < MIN_LENGTH) {
    errors.next = `Use at least ${MIN_LENGTH} characters`;
  } else if (form.next === form.current) {
    errors.next = "New password must differ from current";
  }
  if (!form.confirm) {
    errors.confirm = "Re-enter the new password";
  } else if (form.confirm !== form.next) {
    errors.confirm = "Passwords don't match";
  }
  return errors;
}

export function ChangePasswordModal({
  visible,
  email,
  onClose,
}: ChangePasswordModalProps) {
  const [form, setForm] = useState<FormState>({
    current: "",
    next: "",
    confirm: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  const reset = () => {
    setForm({ current: "", next: "", confirm: "" });
    setErrors({});
    setSubmitted(false);
    setShowCurrent(false);
    setShowNext(false);
    setPending(false);
  };

  const handleClose = () => {
    if (pending) return;
    reset();
    onClose();
  };

  const strength = useMemo(() => {
    const value = form.next;
    let score = 0;
    if (value.length >= MIN_LENGTH) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return Math.min(score, 4);
  }, [form.next]);

  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthTone = [
    "bg-border",
    "bg-danger",
    "bg-warning",
    "bg-primary-300",
    "bg-success",
  ][strength];

  const handleSubmit = () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setSubmitted(true);
    }, 700);
  };

  const handleDone = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 bg-black/45 items-center justify-center px-5">
          <View className="w-full max-w-md rounded-[28px] bg-background p-5">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-row items-center flex-1 pr-2">
                <View className="w-11 h-11 rounded-2xl bg-primary-50 items-center justify-center">
                  <Lock size={20} stroke="#EA580C" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-lg font-black text-ink">
                    Change password
                  </Text>
                  <Text
                    className="text-xs text-ink-muted mt-0.5"
                    numberOfLines={1}
                  >
                    {email ?? "Your account"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                disabled={pending}
                className="w-9 h-9 rounded-full bg-white border border-border items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Close change password"
              >
                <X size={16} stroke="#57534E" />
              </TouchableOpacity>
            </View>

            {submitted ? (
              <View className="items-center py-4">
                <View className="w-16 h-16 rounded-[24px] bg-success-50 items-center justify-center">
                  <CircleCheck size={32} stroke="#10B981" />
                </View>
                <Text className="text-lg font-black text-ink mt-4">
                  Password updated
                </Text>
                <Text className="text-sm text-ink-muted text-center mt-2 px-4">
                  Your new password is active. Use it the next time you sign in.
                </Text>
                <TouchableOpacity
                  onPress={handleDone}
                  className="h-12 rounded-2xl bg-primary items-center justify-center w-full mt-6"
                >
                  <Text className="text-sm font-bold text-white">Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text className="text-sm text-ink-soft mb-4">
                  Use at least {MIN_LENGTH} characters with a mix of letters,
                  numbers, and symbols.
                </Text>

                <Field
                  label="Current password"
                  value={form.current}
                  onChangeText={(text) => {
                    setForm((prev) => ({ ...prev, current: text }));
                    if (errors.current) {
                      setErrors((prev) => ({ ...prev, current: undefined }));
                    }
                  }}
                  placeholder="Enter your current password"
                  secure={!showCurrent}
                  error={errors.current}
                  icon={<KeyRound size={16} stroke="#57534E" />}
                  rightAction={
                    <TouchableOpacity
                      onPress={() => setShowCurrent((prev) => !prev)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showCurrent ? "Hide current password" : "Show current password"
                      }
                    >
                      {showCurrent ? (
                        <EyeOff size={18} stroke="#57534E" />
                      ) : (
                        <Eye size={18} stroke="#57534E" />
                      )}
                    </TouchableOpacity>
                  }
                />

                <Field
                  label="New password"
                  value={form.next}
                  onChangeText={(text) => {
                    setForm((prev) => ({ ...prev, next: text }));
                    if (errors.next) {
                      setErrors((prev) => ({ ...prev, next: undefined }));
                    }
                  }}
                  placeholder="At least 8 characters"
                  secure={!showNext}
                  error={errors.next}
                  icon={<ShieldCheck size={16} stroke="#57534E" />}
                  rightAction={
                    <TouchableOpacity
                      onPress={() => setShowNext((prev) => !prev)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showNext ? "Hide new password" : "Show new password"
                      }
                    >
                      {showNext ? (
                        <EyeOff size={18} stroke="#57534E" />
                      ) : (
                        <Eye size={18} stroke="#57534E" />
                      )}
                    </TouchableOpacity>
                  }
                  footer={
                    form.next ? (
                      <View className="mt-1">
                        <View className="flex-row gap-1 mb-1">
                          {[0, 1, 2, 3].map((segment) => (
                            <View
                              key={segment}
                              className={`flex-1 h-1 rounded-full ${
                                strength > segment ? strengthTone : "bg-border"
                              }`}
                            />
                          ))}
                        </View>
                        <Text className="text-[11px] text-ink-muted">
                          Strength: {strengthLabel}
                        </Text>
                      </View>
                    ) : null
                  }
                />

                <Field
                  label="Confirm new password"
                  value={form.confirm}
                  onChangeText={(text) => {
                    setForm((prev) => ({ ...prev, confirm: text }));
                    if (errors.confirm) {
                      setErrors((prev) => ({ ...prev, confirm: undefined }));
                    }
                  }}
                  placeholder="Re-enter the new password"
                  secure
                  error={errors.confirm}
                  icon={<ShieldCheck size={16} stroke="#57534E" />}
                />

                <View className="flex-row gap-3 mt-2">
                  <TouchableOpacity
                    onPress={handleClose}
                    disabled={pending}
                    className="flex-1 h-12 rounded-2xl border border-border items-center justify-center"
                  >
                    <Text className="text-sm font-bold text-ink-soft">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={pending}
                    className={`flex-1 h-12 rounded-2xl items-center justify-center ${
                      pending ? "bg-primary-300" : "bg-primary"
                    }`}
                  >
                    <Text className="text-sm font-bold text-white">
                      {pending ? "Updating…" : "Update password"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secure: boolean;
  error?: string;
  icon: React.ReactNode;
  rightAction?: React.ReactNode;
  footer?: React.ReactNode;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  error,
  icon,
  rightAction,
  footer,
}: FieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold text-ink-soft mb-1.5">{label}</Text>
      <View
        className={`flex-row items-center bg-white border rounded-2xl px-4 ${
          error ? "border-danger" : "border-border"
        }`}
      >
        <View className="mr-2">{icon}</View>
        <TextInput
          className="flex-1 py-3 text-base text-ink"
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {rightAction ? <View className="ml-2">{rightAction}</View> : null}
      </View>
      {error ? (
        <Text className="text-xs text-danger mt-1">{error}</Text>
      ) : (
        footer
      )}
    </View>
  );
}