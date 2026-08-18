import { Heart } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      <div className="hidden w-1/2 bg-linear-to-br from-primary via-primary to-pink-400 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="px-12 text-center text-white">
          <Heart className="mx-auto mb-6 size-16 fill-white/20" />
          <h2 className="mb-4 font-script text-4xl italic">Księga Gości</h2>
          <p className="text-lg text-white/80">
            Zbierz wspomnienia z najważniejszego dnia
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-end p-4">
          <LanguageSwitcher />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12">
          {children}
        </div>
      </div>
    </div>
  );
}
