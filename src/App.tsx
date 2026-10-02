import { useEffect, useState } from "react";
import { DetailView } from "./components/DetailView";
import { loadCatalog } from "./db";
import type { Oripa } from "./types";

const SHOP_KEY = "oripa-shop-name";

export default function App() {
  const [oripas, setOripas] = useState<Oripa[] | null>(null);
  const [shopName] = useState(() => localStorage.getItem(SHOP_KEY) ?? "");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog()
      .then(setOripas)
      .catch(() => setLoadError("表を開けませんでした。"));
  }, []);

  if (loadError) {
    return (
      <main className="shell">
        <p className="banner bad">{loadError}</p>
      </main>
    );
  }

  if (!oripas) {
    return (
      <main className="shell">
        <p className="loading">読み込み中…</p>
      </main>
    );
  }

  const oripa = oripas[0];
  if (!oripa) {
    return (
      <main className="shell">
        <p className="loading">まだオリパがありません。</p>
      </main>
    );
  }

  return (
    <main className="shell">
      <DetailView shopName={shopName} oripa={oripa} />
    </main>
  );
}
