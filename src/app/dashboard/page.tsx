"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboarding";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { VideoSearch } from "@/components/dashboard/video-search";
import { useSettingsStore } from "@/app/settings/page";

export default function Dashboard() {
  const { hasCompletedOnboarding } = useOnboardingStore();
  const { settings } = useSettingsStore();
  const router = useRouter();

  // Show onboarding for new users
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome back! Ready to continue learning{" "}
          {settings.targetLanguages[0]?.code === "es" ? "Spanish" : "French"}?
        </h1>
        <p className="text-muted-foreground">
          Start a new lesson or continue where you left off
        </p>
      </div>

      <VideoSearch />

      {/* We can add more sections here later */}
      {/* - Recent lessons */}
      {/* - Saved sentences for review */}
      {/* - Progress stats */}
      {/* - Practice suggestions */}
    </div>
  );
} 