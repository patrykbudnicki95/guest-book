import { Link } from "@/i18n/navigation";
import type { GuideContent } from "../types";

export const kodQrNaWesele: GuideContent = {
  slug: "kod-qr-na-wesele-zdjecia-od-gosci",
  title: "Kod QR na wesele — jak zebrać zdjęcia od gości bez aplikacji",
  metaTitle: "Kod QR na wesele — zdjęcia od gości bez aplikacji",
  description:
    "Instrukcja krok po kroku: jak przygotować kod QR na wesele, gdzie postawić tabliczki i jak zachęcić gości do dodawania zdjęć oraz filmów.",
  excerpt:
    "Gdzie postawić kod QR, jak go przetestować przed weselem i jakich błędów unikać, żeby goście naprawdę z niego korzystali.",
  datePublished: "2026-08-22",
  readingMinutes: 5,
  faq: [
    {
      question: "Ile kodów QR przygotować na wesele?",
      answer:
        "W praktyce od 3 do 10, zależnie od wielkości sali i liczby stołów. Jedna tabliczka przy wejściu to zwykle za mało — najlepiej działa kilka punktów: wejście, stoły, okolice parkietu i bar.",
    },
    {
      question: "Czy kod QR musi być kolorowy?",
      answer:
        "Nie. Liczy się kontrast i rozmiar. Czarny kod na białym tle zeskanuje się szybciej niż ozdobny kod w pastelowych barwach, zwłaszcza przy słabym świetle na sali.",
    },
    {
      question: "Co jeśli na sali nie ma zasięgu?",
      answer:
        "Dopiszcie hasło do Wi-Fi małym drukiem na tabliczce z kodem. To najprostszy sposób, żeby usunąć jedyną realną przeszkodę techniczną.",
    },
  ],
  Body: () => (
    <>
      <p>
        Kod QR to najprostszy sposób, żeby gość w kilka sekund przeszedł do
        Waszej galerii i wrzucił zdjęcie. Poniżej plan, który działa też przy
        mniej technicznych osobach.
      </p>

      <h2>Krok 1: przygotujcie jeden krótki link</h2>
      <p>
        Kod powinien prowadzić bezpośrednio do strony Waszego wydarzenia, bez
        przekierowań i długich parametrów. Im krótszy adres, tym mniejszy i
        czytelniejszy kod, a to przekłada się na szybkość skanowania.
      </p>

      <h2>Krok 2: przetestujcie go na kilku telefonach</h2>
      <p>Minimalny test przed weselem:</p>
      <ul>
        <li>iPhone z Safari,</li>
        <li>Android z Chrome,</li>
        <li>telefon ze słabszym zasięgiem lub oszczędzaniem danych.</li>
      </ul>
      <p>
        Sprawdźcie nie tylko to, czy kod się skanuje, ale też czy strona otwiera
        się szybko i czy przycisk dodawania zdjęcia jest widoczny bez
        przewijania.
      </p>

      <h2>Krok 3: rozstawcie kody tam, gdzie ludzie mają czas</h2>
      <p>Najlepiej działają miejsca, w których goście i tak sięgają po telefon:</p>
      <ul>
        <li>na stołach — małe tabliczki obok winietek,</li>
        <li>przy wejściu na salę — plakat lub sztaluga,</li>
        <li>obok fotobudki albo tradycyjnej księgi gości,</li>
        <li>przy barze i słodkim stole, gdzie tworzą się kolejki.</li>
      </ul>

      <h2>Krok 4: napiszcie krótkie i konkretne hasło</h2>
      <p>
        Tabliczka ma jedno zadanie: powiedzieć, co zrobić. Dwa zdania
        wystarczą, na przykład „Zrób zdjęcie i wrzuć tutaj — chcemy zobaczyć
        wesele Waszymi oczami” albo „Zeskanuj kod i dodaj fotkę lub filmik. Bez
        aplikacji”.
      </p>

      <h2>Krok 5: zadbajcie o internet</h2>
      <p>
        To najczęstszy powód, dla którego wszystko inne przestaje mieć
        znaczenie. Jeśli sala ma słabe LTE, poproście o hasło do Wi-Fi i dopiszcie
        je małym drukiem na tabliczce.
      </p>

      <h2>Najczęstsze błędy</h2>
      <ul>
        <li>kod za mały — ludzie nie skanują, bo muszą podchodzić zbyt blisko,</li>
        <li>za dużo tekstu na tabliczce, więc nikt go nie czyta,</li>
        <li>link prowadzi na stronę wymagającą logowania,</li>
        <li>brak jasnej informacji, co się stanie po zeskanowaniu,</li>
        <li>
          jedna tabliczka na całą salę, zwykle postawiona tam, gdzie nikt nie
          siedzi.
        </li>
      </ul>

      <p>
        Jeśli chcecie od razu zobaczyć, jak wygląda taka księga po
        zeskanowaniu, sprawdźcie{" "}
        <Link href="/virtual-guestbook">jak działa wirtualna księga gości</Link>{" "}
        albo przeczytajcie, jak{" "}
        <Link
          href={{
            pathname: "/guides/[slug]",
            params: { slug: "jak-zachecic-gosci-do-dodawania-zdjec" },
          }}
        >
          zachęcić gości do dodawania zdjęć
        </Link>
        .
      </p>
    </>
  ),
};
