import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-4 shadow-sm">
        <GraduationCap className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-text tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-text mt-2">Page Not Found</h2>
      <p className="mt-2 max-w-md text-sm text-text-muted leading-relaxed">
        The learner profile, analytics report, or dashboard page you are searching for does
        not exist or may have been relocated.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link href="/dashboard">
          <Button className="bg-primary hover:bg-primary-hover text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/learners">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Explore Learners
          </Button>
        </Link>
      </div>
    </div>
  );
}
