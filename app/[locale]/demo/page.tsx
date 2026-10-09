import { DemoGuestPage } from "./components/demo-guest-page";

// Rendered client-side only once DemoProvider has loaded IndexedDB.
export const instant = false;

export default function DemoPage() {
  return <DemoGuestPage />;
}
