import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl font-bold mb-4">Learn With Clips</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Language Learning Redefined - Master Any Language Through YouTube Videos
      </p>
      <Link href="/dashboard">
        <Button>
          Start Learning
        </Button>
      </Link>
    </div>
  );
}
