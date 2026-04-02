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
import { useSignUp } from "@clerk/clerk-expo";

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleSignup = useCallback(async () => {
    if (!isLoaded) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert("Greska", "Unesite e-mail adresu i lozinku.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Greska", "Lozinka mora imati najmanje 8 znakova.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Greska", "Lozinke se ne podudaraju.");
      return;
    }

    setIsLoading(true);
    try {
      await signUp.create({
        emailAddress: trimmedEmail,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registracija nije uspjela.";
      Alert.alert("Greska pri registraciji", message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, email, password, confirmPassword, signUp]);

  const handleVerification = useCallback(async () => {
    if (!isLoaded) return;

    if (!verificationCode.trim()) {
      Alert.alert("Greska", "Unesite verifikacijski kod.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)" as Parameters<typeof router.replace>[0]);
      } else {
        Alert.alert("Greska", "Verifikacija nije zavrsena. Pokusajte ponovo.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Verifikacija nije uspjela.";
      Alert.alert("Greska pri verifikaciji", message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, verificationCode, signUp, setActive, router]);

  if (pendingVerification) {
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
            <View className="items-center mb-10">
              <View className="w-16 h-16 rounded-2xl bg-[#2563EB] items-center justify-center mb-4">
                <Text className="text-white text-3xl">✉</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                Potvrdite e-mail
              </Text>
              <Text className="text-base text-gray-500 mt-1 text-center px-4">
                Poslali smo verifikacijski kod na {email}
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">
                Verifikacijski kod
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50 text-center tracking-widest"
                placeholder="123456"
                placeholderTextColor="#9CA3AF"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                accessibilityLabel="Verifikacijski kod"
              />
            </View>

            <TouchableOpacity
              className={`bg-[#2563EB] rounded-lg py-3.5 items-center ${
                isLoading ? "opacity-60" : ""
              }`}
              onPress={handleVerification}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Potvrdi"
              accessibilityState={{ disabled: isLoading, busy: isLoading }}
            >
              <Text className="text-white text-base font-semibold">
                {isLoading ? "Provjera u tijeku..." : "Potvrdi"}
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
          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-2xl bg-[#2563EB] items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">SF</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              Kreirajte racun
            </Text>
            <Text className="text-base text-gray-500 mt-1">
              Besplatno, za uvijek. Nadogradite kad zelite.
            </Text>
          </View>

          {/* Form */}
          <View className="mb-4">
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

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Lozinka
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50"
              placeholder="Najmanje 8 znakova"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              accessibilityLabel="Lozinka"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Potvrdite lozinku
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50"
              placeholder="Ponovite lozinku"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              accessibilityLabel="Potvrdite lozinku"
            />
          </View>

          {/* Signup button */}
          <TouchableOpacity
            className={`bg-[#2563EB] rounded-lg py-3.5 items-center ${
              isLoading ? "opacity-60" : ""
            }`}
            onPress={handleSignup}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Registriraj se"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            <Text className="text-white text-base font-semibold">
              {isLoading ? "Registracija u tijeku..." : "Registriraj se"}
            </Text>
          </TouchableOpacity>

          {/* Login link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-gray-500">Vec imate racun? </Text>
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
