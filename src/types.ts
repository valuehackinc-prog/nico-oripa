export type PrizeKind = "通常" | "ラストワン" | "キリ番";

export type Prize = {
  id: string;
  name: string;
  cardNo: string;
  tier: string;
  kind: PrizeKind;
  quantity: number;
  listPrice: number;
  buybackPrice: number;
  note: string;
  image: string | null;
};

export type Oripa = {
  id: string;
  title: string;
  note: string;
  slots: number;
  sellPrice: number;
  coverImage: string | null;
  prizes: Prize[];
  updatedAt: number;
};

export function createPrize(): Prize {
  return {
    id: crypto.randomUUID(),
    name: "",
    cardNo: "",
    tier: "",
    kind: "通常",
    quantity: 1,
    listPrice: 0,
    buybackPrice: 0,
    note: "",
    image: null,
  };
}

export function createOripa(): Oripa {
  return {
    id: crypto.randomUUID(),
    title: "",
    note: "",
    slots: 0,
    sellPrice: 0,
    coverImage: null,
    prizes: [],
    updatedAt: Date.now(),
  };
}

export function displayTitle(title: string): string {
  return title.trim() || "無題のオリパ";
}

export function isBlank(oripa: Oripa): boolean {
  return (
    !oripa.title.trim() &&
    !oripa.note.trim() &&
    oripa.slots === 0 &&
    oripa.sellPrice === 0 &&
    !oripa.coverImage &&
    oripa.prizes.length === 0
  );
}

export function normalizeOripa(raw: Partial<Oripa> | null): Oripa | null {
  if (!raw || typeof raw !== "object" || typeof raw.id !== "string") return null;
  const prizes = Array.isArray(raw.prizes) ? raw.prizes : [];
  return {
    id: raw.id,
    title: typeof raw.title === "string" ? raw.title : "",
    note: typeof raw.note === "string" ? raw.note : "",
    slots: toCount(raw.slots),
    sellPrice: toCount(raw.sellPrice),
    coverImage: typeof raw.coverImage === "string" ? raw.coverImage : null,
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now(),
    prizes: prizes.flatMap((prize) => {
      const next = normalizePrize(prize);
      return next ? [next] : [];
    }),
  };
}

function normalizePrize(raw: Partial<Prize> | null): Prize | null {
  if (!raw || typeof raw !== "object") return null;
  const kind: PrizeKind =
    raw.kind === "ラストワン" || raw.kind === "キリ番" ? raw.kind : "通常";
  return {
    id: typeof raw.id === "string" ? raw.id : crypto.randomUUID(),
    name: typeof raw.name === "string" ? raw.name : "",
    cardNo: typeof raw.cardNo === "string" ? raw.cardNo : "",
    tier: typeof raw.tier === "string" ? raw.tier : "",
    kind,
    quantity: toCount(raw.quantity),
    listPrice: toCount(raw.listPrice),
    buybackPrice: toCount(raw.buybackPrice),
    note: typeof raw.note === "string" ? raw.note : "",
    image: typeof raw.image === "string" ? raw.image : null,
  };
}

function toCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}
