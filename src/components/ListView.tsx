import { formatPercent, formatUpdated, formatYen, summarize } from "../format";
import type { Oripa } from "../types";
import { displayTitle } from "../types";

type Props = {
  shopName: string;
  oripas: Oripa[];
  onOpen: (id: string) => void;
};

export function ListView({ shopName, oripas, onOpen }: Props) {
  return (
    <>
      <header className="toolbar">
        {shopName && <span className="shop-name">{shopName}</span>}
        <span className="spacer" />
      </header>

      <div className="sheet-page">
        {oripas.length === 0 ? (
          <section className="empty">
            <p>まだオリパがありません。</p>
          </section>
        ) : (
          <div className="sheet-wrap">
            <table className="sheet">
              <thead>
                <tr>
                  <th>オリパ名</th>
                  <th className="num">口数</th>
                  <th className="num">販売価格</th>
                  <th className="num">販売総額</th>
                  <th className="num">買取総額</th>
                  <th className="num">還元率</th>
                  <th>更新</th>
                </tr>
              </thead>
              <tbody>
                {oripas.map((oripa) => {
                  const summary = summarize(oripa);
                  return (
                    <tr key={oripa.id}>
                      <td>
                        <button type="button" className="link" onClick={() => onOpen(oripa.id)}>
                          {displayTitle(oripa.title)}
                        </button>
                      </td>
                      <td className="num">{oripa.slots.toLocaleString("ja-JP")}</td>
                      <td className="num">{formatYen(oripa.sellPrice)}</td>
                      <td className="num">{formatYen(summary.salesTotal)}</td>
                      <td className="num">{formatYen(summary.buybackTotal)}</td>
                      <td className="num">
                        {summary.returnRate === null ? "—" : formatPercent(summary.returnRate)}
                      </td>
                      <td>{formatUpdated(oripa.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
