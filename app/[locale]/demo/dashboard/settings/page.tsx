import { DemoSettingsTab } from "../../components/demo-settings-tab";

// DemoProvider shows a skeleton until IndexedDB loads, so this segment never
// renders on the server and Next can't validate it for instant navigation.
// `instant` isn't allowed in Client Components, hence this server wrapper.
export const instant = false;

export default function DemoSettingsPage() {
  return <DemoSettingsTab />;
}
