import { DemoTablesPage } from "../components/demo-tables-page";

// DemoProvider shows a skeleton until IndexedDB loads, so this segment never
// renders on the server and Next can't validate it for instant navigation.
export const instant = false;

export default function DemoTables() {
  return <DemoTablesPage />;
}
