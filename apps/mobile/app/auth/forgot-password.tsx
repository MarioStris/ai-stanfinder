import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";

type ResetStep = "request" | "verify" | "done";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [step, setStep] = useState<ResetStep>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = useCallback(async () => {
    if (!isLoaded) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert("Greska", "Unesite e-mail adresu.");
      return;
    }

    setIsLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: trimmedEmail,
      });
      setStep("verify");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Slanje koda nije uspjelo. Provjerite e-mail adresu.";
      Alert.alert("Greska", message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, email, signIn]);

  const handleVerifyAndReset = useCallback(async () => {
    if (!isLoaded) return;

    if (!code.trim()) {
      Alert.alert("Greska", "Unesite verifikacijski kod.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Greska", "Nova lozinka mora imati najmanje 8 znakova.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password: newPassword,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        setStep("done");
      } else {
        Alert.alert(
          "Greska",
          "Resetiranje lozinke nije zavrseno. Pokusajte ponovo."
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Resetiranje lozinke nije uspjelo.";
      Alert.alert("Greska", message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, code, newPassword, signIn, setActive]);

  if (step === "done") {
    return (
      <View className="flex-1 bg-white px-6 items-center justify-center">
        <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-4">
          <Text className="text-3xl">✓</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Lozinka promijenjena
        </Text>
        <Text className="text-base text-gray-500 text-center mb-8">
          Vasa lozinka je uspjesno promijenjena. Prijavljeni ste.
        </Text>
        <TouchableOpacity
          className="bg-[#2563EB] rounded-lg py-3.5 px-8 items-center"
          onPress={() =>
            router.replace("/(tabs)" as Parameters<typeof router.replace>[0])
          }
          accessibilityRole="button"
          accessibilityLabel="Nastavi u aplikaciju"
        >
          <Text className="text-white text-base font-semibold">
            Nastavi u aplikaciju
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === "verify") {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-24 pb-8">
            {/* Back button */}
            <TouchableOpacity
              className="mb-6"
              onPress={() => setStep("request")}
              accessibilityRole="button"
              accessibilityLabel="Natrag"
            >
              <Text className="text-[#2563EB] text-base font-medium">
                ← Natrag
              </Text>
            </TouchableOpacity>

            <View className="items-center mb-10">
              <Text className="text-2xl font-bold text-gray-900">
                Unesite kod i novu lozinku
              </Text>
              <Text className="text-base text-gray-500 mt-1 text-center">
                Kod je poslan na {email}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">
                Verifikacijski kod
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50 text-center tracking-widest"
                placeholder="123456"
                placeholderTextColor="#9CA3AF"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                accessibilityLabel="Verifikacijski kod"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">
                Nova lozinka
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50"
                placeholder="Najmanje 8 znakova"
                placeholderTextColor="#9CA3AF"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
                accessibilityLabel="Nova lozinka"
              />
            </View>

            <TouchableOpacity
              className={`bg-[#2563EB] rounded-lg py-3.5 items-center ${
                isLoading ? "opacity-60" : ""
              }`}
              onPress={handleVerifyAndReset}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Postavi novu lozinku"
              accessibilityState={{ disabled: isLoading, busy: isLoading }}
            >
              <Text className="text-white text-base font-semibold">
                {isLoading ? "Obrada u tijeku..." : "Postavi novu lozinku"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-24 pb-8">
          {/* Back button */}
          <TouchableOpacity
            className="mb-6"
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Natrag"
          >
            <Text className="text-[#2563EB] text-base font-medium">
              ← Natrag
            </Text>
          </TouchableOpacity>

          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-2xl bg-gray-100 items-center justify-center mb-4">
              <Text className="text-3xl">🔑</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              Zaboravljena lozinka?
            </Text>
            <Text className="text-base text-gray-500 mt-1 text-center px-4">
              Unesite e-mail adresu i poslat cemo vam kod za resetiranje.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              E-mail adresa
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50"
              placeholder="vas@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              accessibilityLabel="E-mail adresa"
            />
          </View>

          <TouchableOpacity
            className={`bg-[#2563EB] rounded-lg py-3.5 items-center ${
              isLoading ? "opacity-60" : ""
            }`}
            onPress={handleRequestReset}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Posalji kod za resetiranje"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            <Text className="text-white text-base font-semibold">
              {isLoading ? "Slanje u tijeku..." : "Posalji kod"}
            </Text>
          </TouchableOpacity>

          {/* Back to login */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-gray-500">Sjetili ste se? </Text>
            <TouchableOpacity
              onPress={() =>
                router.push("/auth/login" as Parameters<typeof router.push>[0])
              }
              accessibilityRole="link"
              accessibilityLabel="Prijavite se"
            >
              <Text className="text-sm text-[#2563EB] font-semibold">
                Prijavite se
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
