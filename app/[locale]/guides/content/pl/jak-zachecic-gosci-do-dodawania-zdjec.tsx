import { Link } from "@/i18n/navigation";
import type { GuideContent } from "../types";

export const jakZachecicGosci: GuideContent = {
  slug: "jak-zachecic-gosci-do-dodawania-zdjec",
  title: "Jak zachęcić gości do dodawania zdjęć na weselu? 12 sposobów",
  metaTitle: "Jak zachęcić gości do dodawania zdjęć? 12 sposobów",
  description:
    "12 sprawdzonych pomysłów, które zwiększają liczbę zdjęć od gości: komunikat od wodzireja, moment w harmonogramie, konkurs i dobre rozstawienie kodów QR.",
  excerpt:
    "Sama możliwość dodawania zdjęć nie wystarczy — potrzebna jest motywacja. Dwanaście rzeczy, które realnie podbijają liczbę przesłanych materiałów.",
  datePublished: "2026-08-22",
  readingMinutes: 6,
  faq: [
    {
      question: "Kiedy goście wrzucają najwięcej zdjęć?",
      answer:
        "Zwykle w trzech momentach: po pierwszym tańcu, w szczycie zabawy oraz pod koniec wieczoru. Warto przypomnieć o księdze co najmniej dwa razy, a nie tylko na początku.",
    },
    {
      question: "Czy warto wymagać podania imienia?",
      answer:
        "Lepiej nie. Każde dodatkowe pole zmniejsza liczbę przesłanych zdjęć. Zostawcie imię i życzenia jako opcjonalne — kto chce, ten je wpisze.",
    },
  ],
  Body: () => (
    <>
      <p>
        Udostępnienie gościom możliwości dodawania zdjęć to dopiero połowa
        sprawy. Druga, ważniejsza, to motywacja. Poniżej dwanaście rzeczy, które
        realnie zwiększają liczbę przesłanych materiałów.
      </p>

      <h2>1. Powiedzcie o tym raz ze sceny</h2>
      <p>
        Krótki komunikat od DJ-a albo wodzireja działa lepiej niż jakakolwiek
        tabliczka: „Na stołach macie kod QR — wrzucajcie zdjęcia i filmiki, to
        będzie nasza pamiątka”.
      </p>

      <h2>2. Wpiszcie „moment na zdjęcia” do harmonogramu</h2>
      <p>
        Najlepiej po pierwszym tańcu albo po torcie. Dwie minuty i jedno zdanie:
        „wrzućcie po jednej fotce do galerii”.
      </p>

      <h2>3. Zrobcie mini-konkurs</h2>
      <p>
        Prosty mechanizm i jedna nagroda, na przykład butelka wina za
        najzabawniejsze zdjęcie wieczoru. Kluczowe: nie komplikujcie zasad.
      </p>

      <h2>4. Zadbajcie o jedną akcję po zeskanowaniu</h2>
      <p>
        Po zeskanowaniu kodu gość powinien od razu widzieć przycisk dodawania
        zdjęcia. Każdy dodatkowy krok to część osób, która rezygnuje.
      </p>

      <h2>5. Postawcie kody tam, gdzie tworzą się kolejki</h2>
      <p>
        Bar, fotobudka, słodki stół. Ludzie stoją, czekają i naturalnie sięgają
        po telefon.
      </p>

      <h2>6. Podpowiedzcie, co wrzucać</h2>
      <p>
        Na tabliczce wystarczą trzy przykłady: „selfie ze stołu”, „parkiet”,
        „ekipa z sali”. Konkret działa lepiej niż ogólne „dodaj zdjęcie”.
      </p>

      <h2>7. Pokażcie, że inni już dodają</h2>
      <p>
        Widoczna galeria robi robotę — część osób wrzuca zdjęcia dopiero wtedy,
        gdy widzi, że nie są pierwsi.
      </p>

      <h2>8. Przygotujcie kilka tabliczek, nie jedną</h2>
      <p>
        Minimum trzy punkty: wejście, środek sali i okolice parkietu. Jedna
        tabliczka przy wejściu zostanie zauważona tylko na początku wieczoru.
      </p>

      <h2>9. Przypomnijcie drugi raz, później</h2>
      <p>
        Pierwsza informacja pada, gdy goście są jeszcze przy stołach. Druga
        powinna wybrzmieć w szczycie zabawy, bo wtedy powstają najlepsze kadry.
      </p>

      <h2>10. Nie wymagajcie imienia ani życzeń</h2>
      <p>
        Pola opcjonalne są w porządku, ale samo dodanie zdjęcia ma być „na
        klik”. Im krótszy formularz, tym więcej materiałów.
      </p>

      <h2>11. Dodajcie link tekstowy obok kodu</h2>
      <p>
        Czasem aparat nie łapie kodu — złe światło, odbicie, zabrudzony
        obiektyw. Krótki adres wpisywany ręcznie ratuje sytuację.
      </p>

      <h2>12. Ustalcie zasady moderacji przed weselem</h2>
      <p>
        Jeśli obawiacie się przypadkowych treści, włączcie moderację. Ważne
        tylko, żeby nie zabiła tempa — galeria, w której nic się nie pojawia,
        przestaje zachęcać do dodawania.
      </p>

      <h2>Zacznijcie od testu</h2>
      <p>
        Najprostszy sposób sprawdzenia, czy wszystko działa, to utworzyć
        wydarzenie próbne i przejść całą drogę gościa z dwiema czy trzema
        znajomymi osobami. Zobaczcie{" "}
        <Link href="/pricing">pakiety</Link> albo doczytajcie, jak{" "}
        <Link
          href={{
            pathname: "/guides/[slug]",
            params: { slug: "kod-qr-na-wesele-zdjecia-od-gosci" },
          }}
        >
          przygotować i rozstawić kody QR
        </Link>
        .
      </p>
    </>
  ),
};
