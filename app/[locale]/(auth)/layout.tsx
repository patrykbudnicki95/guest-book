import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  );
}

