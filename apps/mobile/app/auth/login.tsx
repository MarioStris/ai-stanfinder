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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!isLoaded) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert("Greska", "Unesite e-mail adresu i lozinku.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: trimmedEmail,
        password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)" as Parameters<typeof router.replace>[0]);
      } else {
        Alert.alert("Greska", "Neocekivani status prijave. Pokusajte ponovo.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Prijava nije uspjela.";
      Alert.alert("Greska pri prijavi", message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, email, password, signIn, setActive, router]);

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
              Dobro dosli natrag
            </Text>
            <Text className="text-base text-gray-500 mt-1">
              Prijavite se na svoj racun
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

          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Lozinka
            </Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-gray-50 pr-12"
                placeholder="Unesite lozinku"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                accessibilityLabel="Lozinka"
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowPassword((prev) => !prev)}
                accessibilityLabel={showPassword ? "Sakrij lozinku" : "Pokazi lozinku"}
                accessibilityRole="button"
              >
                <Text className="text-gray-500 text-sm">
                  {showPassword ? "Sakrij" : "Pokazi"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot password */}
          <TouchableOpacity
            className="self-end mb-6"
            onPress={() =>
              router.push("/auth/forgot-password" as Parameters<typeof router.push>[0])
            }
            accessibilityRole="link"
            accessibilityLabel="Zaboravljena lozinka"
          >
            <Text className="text-sm text-[#2563EB] font-medium">
              Zaboravljena lozinka?
            </Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            className={`bg-[#2563EB] rounded-lg py-3.5 items-center ${
              isLoading ? "opacity-60" : ""
            }`}
            onPress={handleLogin}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Prijavi se"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            <Text className="text-white text-base font-semibold">
              {isLoading ? "Prijava u tijeku..." : "Prijavi se"}
            </Text>
          </TouchableOpacity>

          {/* Signup link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-gray-500">Nemate racun? </Text>
            <TouchableOpacity
              onPress={() =>
                router.push("/auth/signup" as Parameters<typeof router.push>[0])
              }
              accessibilityRole="link"
              accessibilityLabel="Registrirajte se"
            >
              <Text className="text-sm text-[#2563EB] font-semibold">
                Registrirajte se
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
