import { DemoSaveTheDatePage } from "../components/demo-save-the-date-page";

// DemoProvider shows a skeleton until IndexedDB loads, so this segment never
// renders on the server and Next can't validate it for instant navigation.
export const instant = false;

export default function DemoSaveTheDate() {
  return <DemoSaveTheDatePage />;
}
