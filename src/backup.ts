import { normalizeOripa, type Oripa } from "./types";

export function parseBackup(text: string): Oripa[] {
  const data: unknown = JSON.parse(text);
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.oripas)
      ? data.oripas
      : null;
  if (!list) throw new Error("このファイルはオリパのバックアップではありません。");
  return list.flatMap((item) => {
    const oripa = normalizeOripa(item as Partial<Oripa>);
    return oripa ? [oripa] : [];
  });
}

export function downloadBackup(oripas: Oripa[]): void {
  const payload = JSON.stringify({ version: 1, oripas }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const day = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `oripa-shitami-${day}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function isRecord(value: unknown): value is { oripas?: unknown } {
  return typeof value === "object" && value !== null;
}
