import { formatPercent, formatYen, summarize } from "../format";
import { publicUrl } from "../publicUrl";
import type { Oripa } from "../types";

type Props = {
  shopName: string;
  oripa: Oripa;
};

export function DetailView({ shopName, oripa }: Props) {
  const summary = summarize(oripa);
  const tone = summary.slotGap !== 0 ? "note warn" : summary.margin < 0 ? "note bad" : "note";

  return (
    <>
      <img
        className="hero"
        src={publicUrl("/nico-oripa.jpg")}
        alt="ニコちゃんオリパ 1口2,500円 全250口"
      />
      {shopName && (
        <header className="toolbar no-print">
          <span className="shop-name">{shopName}</span>
        </header>
      )}

      <div className="sheet-page">
        <div className="sheet-wrap">
          <table className="sheet">
            <thead>
              <tr>
                <th className="num">口数</th>
                <th className="num">販売価格（1口）</th>
                <th className="num">販売総額</th>
                <th className="num">買取総額</th>
                <th className="num">差額</th>
                <th className="num">還元率</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="num">{oripa.slots.toLocaleString("ja-JP")}</td>
                <td className="num">{formatYen(oripa.sellPrice)}</td>
                <td className="num">{formatYen(summary.salesTotal)}</td>
                <td className="num">{formatYen(summary.buybackTotal)}</td>
                <td className="num">{formatYen(summary.margin)}</td>
                <td className="num">{summary.returnRate === null ? "—" : formatPercent(summary.returnRate)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {oripa.note && <p className="note">{oripa.note}</p>}
        {oripa.slots > 0 && summary.slotGap !== 0 && (
          <p className={tone}>
            景品は {summary.drawSlots}口。販売口数より {Math.abs(summary.slotGap)}口
            {summary.slotGap > 0 ? "少ない" : "多い"}です。
          </p>
        )}

        <div className="sheet-wrap">
          <table className="sheet prizes">
            <thead>
              <tr>
                <th className="rowno">#</th>
                <th>写真</th>
                <th>カード名</th>
                <th>番号</th>
                <th className="num">口数</th>
                <th className="num">販売価格</th>
                <th className="num">買取価格</th>
                <th>メモ</th>
              </tr>
            </thead>
            <tbody>
              {oripa.prizes.length === 0 ? (
                <tr>
                  <td colSpan={8}>まだカードがありません。</td>
                </tr>
              ) : (
                oripa.prizes.map((prize, index) => (
                  <tr key={prize.id}>
                    <td className="rowno">{index + 1}</td>
                    <td>
                      {prize.image ? (
                        <a href={publicUrl(prize.image)} target="_blank" rel="noreferrer">
                          <img className="thumb" src={publicUrl(prize.image)} alt={prize.name || "カード"} />
                        </a>
                      ) : (
                        <span className="thumb-empty">—</span>
                      )}
                    </td>
                    <td>{prize.name.trim() || "—"}</td>
                    <td>{prize.cardNo.trim() || "—"}</td>
                    <td className="num">{prize.quantity.toLocaleString("ja-JP")}</td>
                    <PriceCell unit={prize.listPrice} quantity={prize.quantity} />
                    <PriceCell unit={prize.buybackPrice} quantity={prize.quantity} />
                    <td>{prize.note}</td>
                  </tr>
                ))
              )}
            </tbody>
            {oripa.prizes.length > 0 && (
              <tfoot>
                <tr>
                  <td className="rowno" />
                  <td colSpan={3}>合計</td>
                  <td className="num">{summary.prizeSlots.toLocaleString("ja-JP")}</td>
                  <td className="num">{formatYen(summary.listTotal)}</td>
                  <td className="num">{formatYen(summary.buybackTotal)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <StaffNote oripa={oripa} />
      </div>
    </>
  );
}

function StaffNote({ oripa }: { oripa: Oripa }) {
  const psa = oripa.prizes.find((prize) => prize.id === "psa10-ar");
  const rest = oripa.prizes.filter(
    (prize) =>
      prize.id !== "psa10-ar" &&
      prize.id !== "m05-box-shrink" &&
      prize.id !== "sv2a-box" &&
      prize.id !== "svom-020-019",
  );
  const psaQty = psa?.quantity ?? 0;
  const psaCost = psaQty * 5000;
  const restQty = rest.reduce((sum, prize) => sum + prize.quantity, 0);
  const restBuy = rest.reduce((sum, prize) => sum + prize.quantity * prize.buybackPrice, 0);
  const misc = 3000;
  const shintaro = 45000;
  const ryusei = psaCost + restBuy + misc;
  const gift = 50;
  const ryuseiPay = ryusei - gift;
  const cost = ryusei + shintaro;
  const total = ryuseiPay + shintaro;

  return (
    <section className="staff">
      <h2>スタッフ向け。この時点の立替</h2>
      <p>売上から、立て替えた金額を渡す。お客さんの買取とは別。</p>
      <table className="sheet">
        <thead>
          <tr>
            <th>誰が</th>
            <th>何を</th>
            <th className="num">口数</th>
            <th className="num">売上から渡す</th>
            <th>内容</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>りゅうせい</td>
            <td>PSA10 AR</td>
            <td className="num">{psaQty.toLocaleString("ja-JP")}</td>
            <td className="num">{formatYen(psaCost)}</td>
            <td>仕入れは1口5,000円。お客さんの買取は1口3,000円のまま。</td>
          </tr>
          <tr>
            <td>りゅうせい</td>
            <td>その他のカード</td>
            <td className="num">{restQty.toLocaleString("ja-JP")}</td>
            <td className="num">{formatYen(restBuy)}</td>
            <td>今の表の買取金額。ARとCHR。マリィのモルペコは入れない。</td>
          </tr>
          <tr>
            <td>りゅうせい</td>
            <td>雑費</td>
            <td className="num">—</td>
            <td className="num">{formatYen(misc)}</td>
            <td>スリーブ代と印刷代。</td>
          </tr>
          <tr>
            <td>慎太郎</td>
            <td>151BOX</td>
            <td className="num">1</td>
            <td className="num">{formatYen(shintaro)}</td>
            <td>45,000円を立て替え。</td>
          </tr>
          <tr>
            <td>なし</td>
            <td>アビスアイBOX</td>
            <td className="num">1</td>
            <td className="num">{formatYen(0)}</td>
            <td>立て替えた人はいない。</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>りゅうせいへ</td>
            <td className="num">{formatYen(ryuseiPay)}</td>
            <td>計算は {formatYen(ryusei)}。50円はおまけ⭐️</td>
          </tr>
          <tr>
            <td colSpan={3}>慎太郎へ</td>
            <td className="num">{formatYen(shintaro)}</td>
            <td />
          </tr>
          <tr>
            <td colSpan={3}>売上から取る合計</td>
            <td className="num">{formatYen(total)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
      <p className="staff-cost">
        1口の原価は <strong>{formatPerSlot(cost / oripa.slots)}</strong>
        <span>
          原価 {formatYen(cost)} ÷ {oripa.slots.toLocaleString("ja-JP")}口。250口分 {formatYen(ryusei)} と、151BOX{" "}
          {formatYen(shintaro)} を足しています。販売は1口 {formatYen(oripa.sellPrice)} です。
        </span>
      </p>
      <div className="staff-faces">
        <img src={publicUrl("/staff-ryusei.jpg")} alt="" />
        <img src={publicUrl("/staff-shintaro.jpg")} alt="" />
      </div>
    </section>
  );
}

function formatPerSlot(value: number): string {
  const amount = Math.round(value * 10) / 10;
  return `¥${amount.toLocaleString("ja-JP")}`;
}

function PriceCell({ unit, quantity }: { unit: number; quantity: number }) {
  return (
    <td className="num">
      {formatYen(unit)}
      {quantity > 1 && <span className="line-total">小計 {formatYen(unit * quantity)}</span>}
    </td>
  );
}
