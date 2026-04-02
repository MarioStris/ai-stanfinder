import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const Config = {
  apiUrl: (extra.apiUrl as string) ?? "http://localhost:3000",
  appVersion: Constants.expoConfig?.version ?? "1.0.0",
  clerkPublishableKey: (extra.clerkPublishableKey as string) ?? "",
  apiTimeout: 15000,
  matchRefreshIntervalMs: 15 * 60 * 1000,
  freeTierMatchLimit: 5,
  minMatchPercentageDefault: 80,
} as const;
