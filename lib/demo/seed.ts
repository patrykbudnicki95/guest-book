import type { EventFull } from "@/lib/schemas/database";
import { DEMO_EVENT_ID } from "./constants";

export function createDemoSeed(): EventFull {
  return {
    id: DEMO_EVENT_ID,
    names: "Anna & Jan",
    date: "2026-09-12",
    location: "Pałac w Radziejowicach",
    theme_color: "#ec4899",
    cover_photo_url: null,
    welcome_message:
      "Dziękujemy, że jesteście z nami. Wrzućcie zdjęcie z telefonu — bez instalacji, bez logowania.",
    schedule: [
      { time: "16:00", title: "Ceremonia", description: "Ogród pałacowy" },
      { time: "17:30", title: "Wesele", description: "Sala balowa" },
      { time: "20:00", title: "Pierwszy taniec" },
      { time: "00:00", title: "Oczepiny" },
    ],
    menu: [
      {
        title: "Przystawki",
        items: [{ name: "Tatar z łososia" }, { name: "Carpaccio wołowe" }],
      },
      {
        title: "Danie główne",
        items: [{ name: "Kaczka z burakami" }, { name: "Risotto z bazylią" }],
      },
    ],
    plan_id: "gold",
    storage_used_bytes: 0,
  };
}
