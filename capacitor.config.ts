import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fitnessdrive.gym",
  appName: "Fitness Drive Gym",
  webDir: "public",
  server: {
    androidScheme: "https",
    cleartext: true,
    ...(process.env.CAPACITOR_SERVER_URL ? { url: process.env.CAPACITOR_SERVER_URL } : {}),
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#090d16",
      showSpinner: false,
    },
  },
};

export default config;

