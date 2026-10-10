import type {
  EventFull,
  SaveTheDateUpdate,
  SeatingUpdate,
} from "@/lib/schemas/database";
import { createSaveTheDateContent } from "@/lib/save-the-date";
import { DEMO_COVER_FALLBACK, DEMO_EVENT_ID } from "./constants";

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
    products: ["gold"],
    storage_used_bytes: 0,
  };
}

/** Published so the demo guest page shows "find your table" right away. */
export function createDemoSeating(): SeatingUpdate {
  return {
    is_published: true,
    tables: [
      {
        id: "demo-table-couple",
        name: "Para Młoda",
        shape: "head",
        seats: [
          "Marta Kowalska",
          "Piotr Kowalski",
          "Anna",
          "Jan",
          "Ewa Nowak",
          "Tomasz Nowak",
        ],
      },
      {
        id: "demo-table-1",
        name: "Stół 1",
        shape: "round",
        seats: [
          "Katarzyna Wiśniewska",
          "Michał Wiśniewski",
          "Zofia Lewandowska",
          "Łukasz Lewandowski",
          "Agnieszka Zielińska",
          "Paweł Zieliński",
          "Magdalena Wójcik",
          "Krzysztof Wójcik",
          "",
          "",
        ],
      },
      {
        id: "demo-table-2",
        name: "Stół 2",
        shape: "rectangle",
        seats: [
          "Ciocia Basia",
          "Wujek Staszek",
          "Babcia Halina",
          "Dziadek Józef",
          "Joanna Kamińska",
          "Adam Kamiński",
          "Natalia Dąbrowska",
          "Jakub Dąbrowski",
          "Ola Mazur",
          "Bartek Mazur",
        ],
      },
    ],
  };
}

/** Published, so the demo save the date link works right away. */
export function createDemoSaveTheDate(): SaveTheDateUpdate {
  return {
    template: "envelope",
    is_published: true,
    content: createSaveTheDateContent({
      template: "envelope",
      names: "Anna & Jan",
      location: "Pałac w Radziejowicach",
      eyebrow: "Save the date",
      message:
        "Zarezerwujcie sobie ten dzień. Formalne zaproszenie przyjdzie wkrótce, a my już nie możemy się doczekać, żeby świętować razem z Wami.",
      photoUrl: DEMO_COVER_FALLBACK,
    }),
  };
}
