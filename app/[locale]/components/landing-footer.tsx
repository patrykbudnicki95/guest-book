import { Heart } from "lucide-react";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white py-8">
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center">
        <div className="flex items-center gap-2">
          <Heart className="size-4 fill-primary text-primary" />
          <span className="font-semibold">
            Wirtualna <span className="font-script italic text-primary">Księga Gości</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {year} Wirtualna Księga Gości. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
