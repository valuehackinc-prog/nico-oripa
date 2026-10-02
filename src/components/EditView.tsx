import { useRef, useState } from "react";
import { formatYen, summarize } from "../format";
import { fileToDataUrl } from "../image";
import type { Oripa, Prize, PrizeKind } from "../types";

type Props = {
  initial: Oripa;
  onSave: (oripa: Oripa) => void;
  onCancel: (draft: Oripa, dirty: boolean) => void;
  onDelete: () => void;
};

const KINDS: PrizeKind[] = ["通常", "ラストワン", "キリ番"];

export function EditView({ initial, onSave, onCancel, onDelete }: Props) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const summary = summarize(draft);

  function patch(partial: Partial<Oripa>) {
    setDirty(true);
    setDraft((current) => ({ ...current, ...partial }));
  }

  function patchPrize(id: string, partial: Partial<Prize>) {
    setDirty(true);
    setDraft((current) => ({
      ...current,
      prizes: current.prizes.map((prize) => (prize.id === id ? { ...prize, ...partial } : prize)),
    }));
  }

  function movePrize(index: number, direction: -1 | 1) {
    setDirty(true);
    setDraft((current) => {
      const next = current.prizes.slice();
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...current, prizes: next };
    });
  }

  return (
    <div>
      <header className="toolbar">
        <button type="button" className="btn" onClick={() => onCancel(draft, dirty)}>
          一覧
        </button>
        <input
          className="title-input"
          value={draft.title}
          aria-label="オリパ名"
          placeholder="オリパ名"
          autoComplete="off"
          onChange={(event) => patch({ title: event.target.value })}
        />
        <span className="spacer" />
        <button type="button" className="btn btn-primary" onClick={() => onSave(draft)}>
          保存
        </button>
      </header>

      {photoError && <p className="banner">{photoError}</p>}

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
                <th>メモ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    className="num"
                    inputMode="numeric"
                    aria-label="口数"
                    value={draft.slots === 0 ? "" : draft.slots}
                    onChange={(event) => patch({ slots: toCount(event.target.value) })}
                  />
                </td>
                <td>
                  <input
                    className="num"
                    inputMode="numeric"
                    aria-label="1口の販売価格"
                    value={draft.sellPrice === 0 ? "" : draft.sellPrice}
                    onChange={(event) => patch({ sellPrice: toCount(event.target.value) })}
                  />
                </td>
                <td className="num">{formatYen(summary.salesTotal)}</td>
                <td className="num">{formatYen(summary.buybackTotal)}</td>
                <td className="num">{formatYen(summary.margin)}</td>
                <td>
                  <input
                    aria-label="メモ"
                    value={draft.note}
                    onChange={(event) => patch({ note: event.target.value })}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {draft.slots > 0 && summary.slotGap !== 0 && (
          <p className="note warn">
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
                <th>等級</th>
                <th>区分</th>
                <th className="num">口数</th>
                <th className="num">販売価格</th>
                <th className="num">買取価格</th>
                <th>メモ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {draft.prizes.map((prize, index) => (
                <tr key={prize.id}>
                  <td className="rowno">
                    {index + 1}
                    <div>
                      <button type="button" className="text-btn" disabled={index === 0} onClick={() => movePrize(index, -1)}>
                        ↑
                      </button>
                      <button
                        type="button"
                        className="text-btn"
                        disabled={index === draft.prizes.length - 1}
                        onClick={() => movePrize(index, 1)}
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td>
                    <ImageCell
                      image={prize.image}
                      onChange={(image) => patchPrize(prize.id, { image })}
                      onError={setPhotoError}
                    />
                  </td>
                  <td>
                    <input
                      aria-label="カード名"
                      value={prize.name}
                      autoComplete="off"
                      onChange={(event) => patchPrize(prize.id, { name: event.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      aria-label="番号"
                      value={prize.cardNo}
                      autoComplete="off"
                      onChange={(event) => patchPrize(prize.id, { cardNo: event.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      aria-label="等級"
                      value={prize.tier}
                      list="tier-list"
                      onChange={(event) => patchPrize(prize.id, { tier: event.target.value })}
                    />
                  </td>
                  <td>
                    <select
                      aria-label="区分"
                      value={prize.kind}
                      onChange={(event) => patchPrize(prize.id, { kind: event.target.value as PrizeKind })}
                    >
                      {KINDS.map((kind) => (
                        <option key={kind} value={kind}>
                          {kind}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="num"
                      inputMode="numeric"
                      aria-label="口数"
                      value={prize.quantity === 0 ? "" : prize.quantity}
                      onChange={(event) => patchPrize(prize.id, { quantity: toCount(event.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      className="num"
                      inputMode="numeric"
                      aria-label="販売価格"
                      value={prize.listPrice === 0 ? "" : prize.listPrice}
                      onChange={(event) => patchPrize(prize.id, { listPrice: toCount(event.target.value) })}
                    />
                    {prize.quantity > 1 && (
                      <span className="line-total">小計 {formatYen(prize.quantity * prize.listPrice)}</span>
                    )}
                  </td>
                  <td>
                    <input
                      className="num"
                      inputMode="numeric"
                      aria-label="買取価格"
                      value={prize.buybackPrice === 0 ? "" : prize.buybackPrice}
                      onChange={(event) => patchPrize(prize.id, { buybackPrice: toCount(event.target.value) })}
                    />
                    {prize.quantity > 1 && (
                      <span className="line-total">小計 {formatYen(prize.quantity * prize.buybackPrice)}</span>
                    )}
                  </td>
                  <td>
                    <input
                      aria-label="メモ"
                      value={prize.note}
                      onChange={(event) => patchPrize(prize.id, { note: event.target.value })}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="text-btn text-danger"
                      onClick={() => {
                        const labeled = prize.name.trim() || `${index + 1}行目`;
                        if ((prize.name.trim() || prize.image) && !confirm(`${labeled}を消しますか？`)) return;
                        patch({ prizes: draft.prizes.filter((item) => item.id !== prize.id) });
                      }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="rowno" />
                <td colSpan={5}>合計</td>
                <td className="num">{summary.prizeSlots.toLocaleString("ja-JP")}</td>
                <td className="num">{formatYen(summary.listTotal)}</td>
                <td className="num">{formatYen(summary.buybackTotal)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
        <datalist id="tier-list">
          <option value="1等" />
          <option value="2等" />
          <option value="3等" />
          <option value="4等" />
          <option value="5等" />
        </datalist>

        <div className="row-actions sheet-actions">
          <button type="button" className="text-btn text-danger" onClick={onDelete}>
            このオリパを削除
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageCell({
  image,
  onChange,
  onError,
}: {
  image: string | null;
  onChange: (image: string | null) => void;
  onError: (message: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="thumb-cell">
      {image ? <img className="thumb" src={image} alt="" /> : <span className="thumb-empty">なし</span>}
      <button type="button" className="btn btn-small" onClick={() => inputRef.current?.click()}>
        {image ? "変更" : "追加"}
      </button>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          fileToDataUrl(file)
            .then((next) => {
              onError(null);
              onChange(next);
            })
            .catch(() => onError("この写真は読み込めませんでした。JPEGかPNGにしてください。"));
        }}
      />
    </div>
  );
}

function toCount(value: string): number {
  const n = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}
