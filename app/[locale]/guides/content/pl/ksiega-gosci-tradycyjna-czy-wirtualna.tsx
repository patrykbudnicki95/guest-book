import { Link } from "@/i18n/navigation";
import type { GuideContent } from "../types";

export const ksiegaTradycyjnaCzyWirtualna: GuideContent = {
  slug: "ksiega-gosci-tradycyjna-czy-wirtualna",
  title: "Księga gości weselnych — tradycyjna czy wirtualna? Co wybrać?",
  metaTitle: "Księga gości weselnych — tradycyjna czy wirtualna?",
  description:
    "Papierowa księga wpisów czy nowoczesna księga gości na kod QR? Porównujemy koszty, wygodę dla gości i to, co zostaje Wam po weselu.",
  excerpt:
    "Papierowa księga wpisów czy wersja na kod QR? Porównanie kosztów, wygody dla gości i tego, co realnie zostaje Wam po weselu.",
  datePublished: "2026-08-22",
  readingMinutes: 5,
  faq: [
    {
      question: "Czy można mieć obie księgi jednocześnie?",
      answer:
        "Tak i to częsty układ. Papierowa księga zbiera odręczne życzenia, a wirtualna zdjęcia i filmy. Jedna nie przeszkadza drugiej, bo goście korzystają z nich w różnych momentach wieczoru.",
    },
    {
      question: "Co jest tańsze — księga papierowa czy wirtualna?",
      answer:
        "Zależy od dodatków. Sama papierowa księga jest tania, ale koszt rośnie razem z wkładami do aparatu natychmiastowego. Wirtualna księga to jedna opłata z góry, bez kosztu zależnego od liczby zdjęć.",
    },
  ],
  Body: () => (
    <>
      <p>
        Księga gości to jeden z tych elementów wesela, o których myśli się na
        końcu, a potem okazuje się, że to jedna z niewielu rzeczy, które
        naprawdę zostają. Tradycyjnie była to gruba książka z pustymi kartkami.
        Dziś do wyboru jest też wersja cyfrowa. Poniżej uczciwe porównanie.
      </p>

      <h2>Tradycyjna księga gości</h2>
      <p>
        Papierowa księga to fizyczna pamiątka, którą można postawić na półce i
        wyjąć po latach. Często łączy się ją z aparatem natychmiastowym, żeby
        goście wklejali zdjęcie obok wpisu.
      </p>
      <h3>Na plus</h3>
      <ul>
        <li>namacalna pamiątka i odręczne pismo bliskich,</li>
        <li>nie potrzebuje internetu ani zasięgu,</li>
        <li>działa jako atrakcja przy stoliku.</li>
      </ul>
      <h3>Na minus</h3>
      <ul>
        <li>koszt wkładów do aparatu rośnie z liczbą gości,</li>
        <li>
          jedna księga to jedno miejsce — w szczycie zabawy nikt nie stoi w
          kolejce do wpisu,
        </li>
        <li>
          nie zostaje Wam żadna kopia cyfrowa, a rozlany kieliszek potrafi
          zniszczyć kilka stron.
        </li>
      </ul>

      <h2>Wirtualna księga gości</h2>
      <p>
        To aplikacja działająca w przeglądarce, dostępna przez kod QR
        postawiony na stołach albo plakat przy wejściu. Gość skanuje kod, dodaje
        zdjęcie lub film i dopisuje życzenia.
      </p>
      <h3>Na plus</h3>
      <ul>
        <li>
          <strong>brak kosztu zależnego od liczby zdjęć</strong> — płacicie raz
          za pakiet,
        </li>
        <li>
          <strong>filmy, nie tylko zdjęcia</strong> — czego papierowa księga nie
          potrafi,
        </li>
        <li>
          <strong>dostępność z każdego miejsca</strong> — gość dodaje materiał
          siedząc przy stole,
        </li>
        <li>
          <strong>galeria na żywo</strong> — widok tego, co wrzucili inni,
          napędza kolejne zgłoszenia.
        </li>
      </ul>
      <h3>Na minus</h3>
      <ul>
        <li>potrzebny zasięg albo Wi-Fi na sali,</li>
        <li>
          nie zastąpi odręcznego wpisu, jeśli właśnie na tym Wam zależy,
        </li>
        <li>ktoś musi wcześniej wydrukować i rozstawić tabliczki z kodem.</li>
      </ul>

      <h2>Werdykt</h2>
      <p>
        Jeśli najważniejsza jest fizyczna pamiątka z odręcznym pismem, zostańcie
        przy papierze. Jeśli zależy Wam na zdjęciach i filmach z perspektywy
        gości, wersja cyfrowa zbierze ich nieporównywalnie więcej — bo próg
        wejścia to jedno zeskanowanie kodu.
      </p>
      <p>
        Najbezpieczniejszy wybór to jedno i drugie: papier na życzenia,{" "}
        <Link href="/virtual-guestbook">wirtualna księga</Link> na materiały.{" "}
        <Link href="/pricing">Sprawdźcie pakiety</Link>, żeby zobaczyć, jaki
        zakres odpowiada Waszemu weselu.
      </p>
    </>
  ),
};
