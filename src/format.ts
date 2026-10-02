import type { Oripa } from "./types";

export type Summary = {
  prizeSlots: number;
  drawSlots: number;
  listTotal: number;
  buybackTotal: number;
  salesTotal: number;
  margin: number;
  slotGap: number;
  returnRate: number | null;
};

export function summarize(oripa: Pick<Oripa, "slots" | "sellPrice" | "prizes">): Summary {
  const prizeSlots = oripa.prizes.reduce((sum, prize) => sum + prize.quantity, 0);
  const drawSlots = oripa.prizes.reduce(
    (sum, prize) => sum + (prize.kind === "ラストワン" ? 0 : prize.quantity),
    0,
  );
  const listTotal = oripa.prizes.reduce((sum, prize) => sum + prize.quantity * prize.listPrice, 0);
  const buybackTotal = oripa.prizes.reduce(
    (sum, prize) => sum + prize.quantity * prize.buybackPrice,
    0,
  );
  const salesTotal = oripa.slots * oripa.sellPrice;
  return {
    prizeSlots,
    drawSlots,
    listTotal,
    buybackTotal,
    salesTotal,
    margin: salesTotal - buybackTotal,
    slotGap: oripa.slots - drawSlots,
    returnRate: salesTotal > 0 ? listTotal / salesTotal : null,
  };
}

export function formatYen(value: number): string {
  const amount = Math.round(value);
  const formatted = Math.abs(amount).toLocaleString("ja-JP");
  return amount < 0 ? `-¥${formatted}` : `¥${formatted}`;
}

export function formatPercent(rate: number): string {
  const pct = Math.round(rate * 1000) / 10;
  return `${pct}%`;
}

export function formatUpdated(timestamp: number): string {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}
