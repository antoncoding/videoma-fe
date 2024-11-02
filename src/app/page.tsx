import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AVAILABLE_LANGUAGES } from "@/constants/languages";

export default function Home() {
  // Get a random selection of available languages for display
  const displayLanguages = AVAILABLE_LANGUAGES
    .map(lang => lang.nativeName)
    .slice(0, 3)
    .join(" · ");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center font-inter">
      <h1 className="text-6xl font-montserrat mb-4">Vidioma</h1>
      <p className="text-xl text-muted-foreground mb-2 font-inter">
        Master {displayLanguages}
      </p>
      <p className="text-lg text-muted-foreground mb-8 font-inter">
        Learn languages naturally through YouTube videos with AI-powered tutoring
      </p>
      <Link href="/dashboard">
        <Button size="lg" className="h-12">
          Start Learning
        </Button>
      </Link>
      <p className="mt-4 text-sm text-muted-foreground">
        {AVAILABLE_LANGUAGES.length} languages available · Interactive learning · Personal AI tutors
      </p>
    </div>
  );
}
