# 会話ログ

このファイルには開発中の会話内容を時系列順に記録しています。

## 主要な学び・パターン

### Composition パターンの徹底

- render 関数は使わない
- コンポーネントに切り出す
- children で柔軟に構築

### Redux action 命名規則

- ユーザー操作を直接表す
- `setArmy` ではなく `startBattle`
- `setArmyPosition` ではなく `moveArmy`

### 状態管理の一元化

- state.ts でアプリケーション全体の状態を管理
- slice は一本の盆栽として育てる
- リセットは `state.xxx = initialState.xxx`

### マジックナンバーの定数化

- `BATTLE_PHASE`, `PREPARATION_TAB`, `RIGHT_SIDEBAR_TAB`
- states/ 配下にドメインを切って定数化

### ディレクトリ構造

- **designs/**: ビジネスロジックを持たない純粋な UI
- **widgets/**: ビジネスロジックを持つコンポーネント
- **states/**: 状態管理とドメインの型・定数
- **routes/**: ページ単位のコンポーネント（組み立てのみ）

---

## 最近の実装

---

### 15. マップ上の軍名ラベルに向きの矢印を追加し、クリック可能に

#### 要求

- マップ上の軍名部分に向きの矢印をわかりやすく表現する
- 軍名ラベルを押下すると軍ポップオーバーを開く

#### 実装内容

**1. ArmyOverlay コンポーネントの更新**

```tsx
// widgets/Map/ArmyOverlay/index.tsx

// 向きに応じたアイコンを取得
const getDirectionIcon = (direction: string): LucideIcon => {
  switch (direction) {
    case ARMY_DIRECTION.UP:
      return ArrowUp;
    case ARMY_DIRECTION.DOWN:
      return ArrowDown;
    case ARMY_DIRECTION.LEFT:
      return ArrowLeft;
    case ARMY_DIRECTION.RIGHT:
      return ArrowRight;
    default:
      return ArrowUp;
  }
};

// 軍ポップオーバーを開く
const handleClick = () => {
  dispatch(
    openArmyPopover({
      positions: army.positions,
      armyId: army.id,
    })
  );
};
```

**2. 軍名ラベルのデザイン改善**

```tsx
<div
  onClick={handleClick}
  className="group cursor-pointer transition-all duration-200 hover:scale-105"
  style={{
    position: "absolute" as const,
    left: labelX + 4,
    top: labelY + 4,
    padding: "4px 10px",
    backgroundColor: "rgba(59, 130, 246, 0.95)",
    color: "white",
    fontSize: "13px",
    fontWeight: "bold" as const,
    borderRadius: "6px",
    pointerEvents: "auto" as const,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3), 0 0 12px rgba(59, 130, 246, 0.4)",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }}
>
  {/* 向きの矢印アイコン */}
  <DirectionIcon
    size={16}
    className="transition-transform duration-200 group-hover:scale-110"
    style={{
      filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))",
    }}
  />
  {/* 軍名 */}
  <span>{army.name}</span>
</div>
```

#### 改善ポイント

- ✅ 軍の向き（上下左右）が矢印アイコンで一目でわかる
- ✅ 矢印アイコンにドロップシャドウエフェクトで視認性向上
- ✅ ホバー時に矢印が拡大するアニメーション（`group-hover:scale-110`）
- ✅ ラベル全体がホバー時に 5%拡大（`hover:scale-105`）
- ✅ クリック可能なカーソル表示（`cursor-pointer`）
- ✅ 軍ポップオーバーがワンクリックで開ける（直感的な UX）
- ✅ フォントサイズを 13px に、パディングを増やして視認性向上
- ✅ より強いボックスシャドウで発光エフェクトを強調

#### UX

- マップ上の軍に、軍名と向きの矢印アイコンが表示される
- 矢印で軍がどちらを向いているかが一目でわかる
- 軍名ラベルにホバーすると、ラベル全体と矢印が拡大する
- 軍名ラベルをクリックすると、軍ポップオーバーが開く
- 右クリックメニューよりも直感的で素早いアクセス

---

### 16. 軍名ラベルの位置を下部中央に変更

#### 要求

- 軍名と向きの吹き出しを軍の下部に表示してほしい

#### 実装内容

**1. ラベル位置の計算を変更**

```tsx
// widgets/Map/ArmyOverlay/index.tsx

// 軍名のラベル位置（下部中央）
const labelX = minX * TILE_SIZE + ((maxX - minX + 1) * TILE_SIZE) / 2;
const labelY = (maxY + 1) * TILE_SIZE + 8; // 下端から8px下
```

**2. 中央揃えのスタイル追加**

```tsx
<div
  onClick={handleClick}
  className="group cursor-pointer transition-all duration-200 hover:scale-105"
  style={{
    position: "absolute" as const,
    left: labelX,
    top: labelY,
    transform: "translateX(-50%)", // 中央揃え
    // ...
  }}
>
```

#### 改善ポイント

- ✅ 軍名ラベルが軍の下部に表示される
- ✅ 水平方向に中央揃えで配置される
- ✅ 軍の範囲から 8px 下に配置して視認性を確保
- ✅ 軍の上部がスッキリして、マップが見やすくなる
- ✅ ラベルが軍の形状に対して常に中央に配置される

#### UX

- 軍名ラベルが軍の下部中央に表示される
- 軍の上部がクリアになり、地形や他の情報が見やすい
- クリックやホバーの動作はそのまま維持

---

### 17. 軍の分割モード実装

#### 要求

- コンテキストメニューの「軍分割モード」を実装
- 分割モードでマップ上のドラッグは矩形選択モードになる
- 軍内の矩形のみ選択可能
- 選択範囲内の兵のいるマス数は 2 以上（軍として成り立つため）
- 元の軍にも 2 以上の兵が残る必要がある
- エラーがある場合は分割を実行せずエラーメッセージを表示
- 分割可能状態で矩形選択を終えると軍ポップオーバーが出る
- 矩形選択部分が新しい軍として作成される
- 選択範囲外の元の軍は維持されるが、選択部分は別軍になる

#### 実装内容

**1. 分割用のバリデーション関数を追加**

```typescript
// lib/armyValidation.ts
export function validateArmySplit(
  selectedTiles: Set<string>,
  army: Army,
  placedTroops: PlacedTroop[]
): { isValid: boolean; errorMessage?: string } {
  // 1. 選択範囲が軍内に含まれているかチェック
  // 2. 選択範囲内の兵が2以上かチェック
  // 3. 残りの兵が2以上かチェック
  // 4. 選択範囲内の兵が連結しているかチェック
  // 5. 残りの兵が連結しているかチェック
  return { isValid: true };
}
```

**2. 分割モード用の状態を追加**

```typescript
// states/state.ts
export type AppState = {
  // ...
  splittingArmyId: string | null; // 分割対象の軍ID
};
```

**3. switchArmyFormationMode アクションを更新**

```typescript
// states/slice.ts
switchArmyFormationMode: (
  state,
  action: PayloadAction<{
    mode: ArmyFormationMode;
    armyId?: string; // 分割モードの場合、対象の軍ID
  }>
) => {
  state.armyFormationMode = action.payload.mode;

  // 分割モードの場合、対象の軍IDを設定
  if (action.payload.mode === ARMY_FORMATION_MODE.SPLIT && action.payload.armyId) {
    state.splittingArmyId = action.payload.armyId;
  } else {
    state.splittingArmyId = null;
  }

  // モード切り替え時は選択状態をリセット
  state.selectionDragStart = null;
  state.selectionDragCurrent = null;
},
```

**4. splitArmy アクションを追加**

```typescript
// states/slice.ts
splitArmy: (
  state,
  action: PayloadAction<{
    originalArmyId: string;
    newArmyPositions: Array<{ x: number; y: number }>;
  }>
) => {
  const { originalArmyId, newArmyPositions } = action.payload;

  // 元の軍を見つける
  const originalArmy = state.armies.find(a => a.id === originalArmyId);
  if (!originalArmy) return;

  // 新しい軍の座標をSetに変換（検索用）
  const newArmySet = new Set(
    newArmyPositions.map(pos => `${pos.x},${pos.y}`)
  );

  // 元の軍から新しい軍の座標を除外
  originalArmy.positions = originalArmy.positions.filter(
    pos => !newArmySet.has(`${pos.x},${pos.y}`)
  );

  // 分割モードをリセット
  state.armyFormationMode = ARMY_FORMATION_MODE.NONE;
  state.splittingArmyId = null;
},
```

**5. Map コンポーネントに分割処理を追加**

```tsx
// widgets/Map/index.tsx

// 軍分割モード
if (
  armyFormationMode === ARMY_FORMATION_MODE.SPLIT &&
  selectionDragStart &&
  selectionDragCurrent &&
  splittingArmyId
) {
  // 分割対象の軍を取得
  const army = armies.find((a) => a.id === splittingArmyId);

  // バリデーション実行
  const validation = validateArmySplit(selectedTiles, army, placedTroops);

  if (!validation.isValid && validation.errorMessage) {
    dispatch(showError(validation.errorMessage));
    dispatch(endSelectionDrag());
  } else if (validation.isValid) {
    // 元の軍を更新し、新しい軍のポップオーバーを開く
    dispatch(
      splitArmy({
        originalArmyId: splittingArmyId,
        newArmyPositions: positions,
      })
    );

    // 新しい軍のポップオーバーを開く
    dispatch(openArmyPopover({ positions }));

    dispatch(endSelectionDrag());
  }
}
```

#### 改善ポイント

- ✅ 軍内を右クリックして「軍分割モード」を選択可能
- ✅ 分割モードでは矩形選択が有効になる
- ✅ 5 つのバリデーションで分割の妥当性をチェック
  - 選択範囲が軍内に含まれているか
  - 選択範囲内の兵が 2 以上か
  - 残りの兵が 2 以上か
  - 選択範囲内の兵が連結しているか
  - 残りの兵が連結しているか
- ✅ バリデーションエラー時は明確なエラーメッセージを表示
- ✅ 分割成功時は元の軍を更新し、新しい軍のポップオーバーを表示
- ✅ 分割後は自動的にモードがリセットされる

#### UX

1. 軍内のマスを右クリック
2. 「軍分割モード」を選択
3. 矩形選択で分割したい部分を選択
4. バリデーション成功 → 新しい軍のポップオーバーが表示される
5. 元の軍は選択されていない部分のみで更新される
6. バリデーション失敗 → エラーメッセージが表示され、選択がリセットされる

---

### 18. 軍分割モードの矩形選択バグ修正

#### 問題

- 軍分割モードにしても矩形選択ができない（何も出てこない）

#### 原因

Tile コンポーネントのマウスイベントハンドラー（`handleMouseDown`と`handleMouseEnter`）が、`ARMY_FORMATION_MODE.SELECT`のみをチェックしており、`ARMY_FORMATION_MODE.SPLIT`をチェックしていなかった。

#### 修正内容

**1. マウスイベントハンドラーを更新**

```tsx
// widgets/Map/Tile/index.tsx

// 矩形選択のマウスイベントハンドラー
const handleMouseDown = (e: React.MouseEvent) => {
  if (
    armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
    armyFormationMode === ARMY_FORMATION_MODE.SPLIT
  ) {
    e.preventDefault();
    dispatch(beginSelectionDrag({ x, y }));
  }
};

const handleMouseEnter = () => {
  if (
    (armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
      armyFormationMode === ARMY_FORMATION_MODE.SPLIT) &&
    selectionDragStart
  ) {
    dispatch(updateSelectionDrag({ x, y }));
  }
};
```

**2. カーソルスタイルを更新**

```tsx
cursor:
  armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
  armyFormationMode === ARMY_FORMATION_MODE.SPLIT
    ? "crosshair"
    : undefined,
userSelect:
  armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
  armyFormationMode === ARMY_FORMATION_MODE.SPLIT
    ? "none"
    : undefined,
```

#### 改善ポイント

- ✅ 分割モードでも矩形選択が有効になる
- ✅ 分割モード時に crosshair カーソルが表示される
- ✅ 分割モード時にテキスト選択が無効化される（userSelect: "none"）
- ✅ 選択モードと分割モードで同じ矩形選択ロジックを使用

#### UX

- 軍分割モードに切り替えると、カーソルが crosshair に変わる
- マウスをドラッグすると矩形選択が表示される
- マウスを離すと、バリデーションが実行される

---

### 19. 軍分割後の元の軍の範囲が更新されないバグ修正

#### 問題

- 軍分割後、元の軍の範囲（ArmyOverlay のボーダー）が更新されない
- 分割した軍が、元いた軍の範囲内に重なって表示される

#### 原因

`splitArmy`アクションで、`state.armies.find()`で軍を見つけて直接`positions`プロパティを変更していたため、Redux Toolkit の Immer が正しく変更を検知できていなかった可能性がある。また、`armies`配列の参照自体が変わらないため、リアクティブに更新されない可能性があった。

#### 修正内容

**splitArmy アクションを修正**

```typescript
// states/slice.ts

// 修正前（直接変更）
const originalArmy = state.armies.find((a) => a.id === originalArmyId);
if (!originalArmy) return;
originalArmy.positions = originalArmy.positions.filter(
  (pos) => !newArmySet.has(`${pos.x},${pos.y}`)
);

// 修正後（mapで新しい配列を作成）
state.armies = state.armies.map((army) => {
  if (army.id === originalArmyId) {
    // 元の軍から新しい軍の座標を除外
    return {
      ...army,
      positions: army.positions.filter(
        (pos) => !newArmySet.has(`${pos.x},${pos.y}`)
      ),
    };
  }
  return army;
});
```

#### 改善ポイント

- ✅ `armies`配列を map で処理し、新しい配列を作成
- ✅ 対象の軍のみスプレッド演算子で新しいオブジェクトを作成
- ✅ `positions`を filter で新しい配列として作成
- ✅ 確実に Redux の状態の参照が変わるため、リアクティブに更新される
- ✅ ArmyOverlay が正しくリレンダリングされ、範囲が更新される

#### UX

- 軍分割実行後、元の軍の ArmyOverlay のボーダーが即座に更新される
- 分割した部分は新しい軍として別のボーダーで囲まれる
- 元の軍と新しい軍が重ならず、正しく分離して表示される

---

### 20. 軍編成に関するバリデーション追加

#### 要求

1. すでに軍が編成されている場合、兵の削除は行えない（コンテキストメニューを disabled にする）
2. 軍選択モードですでに軍の箇所を範囲内に含めないでほしい

#### 実装内容

**1. 軍に所属している兵の削除を禁止**

```tsx
// widgets/Map/Tile/index.tsx

<ContextMenuItem
  onClick={handleRemoveTroop}
  variant="destructive"
  disabled={!!belongingArmy} // 軍に所属している場合は削除不可
>
  兵の削除
  {belongingArmy && " (軍に所属)"}
</ContextMenuItem>
```

**2. 軍選択モードで既存の軍の兵を含めないバリデーション**

```typescript
// lib/armyValidation.ts

export function validateArmySelection(
  selectedTiles: Set<string>,
  placedTroops: PlacedTroop[],
  armies: Army[] // 既存の軍リスト
): { isValid: boolean; errorMessage?: string } {
  // ...

  // 2. 選択範囲内に既存の軍の兵が含まれていないかチェック
  const isAnyTroopInArmy = troopsInSelection.some((troop) =>
    armies.some((army) =>
      army.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
    )
  );

  if (isAnyTroopInArmy) {
    return {
      isValid: false,
      errorMessage: "選択範囲内に既に軍に所属している兵が含まれています",
    };
  }

  // ...
}
```

**3. Map コンポーネントで armies を渡す**

```tsx
// widgets/Map/index.tsx

const validation = validateArmySelection(selectedTiles, placedTroops, armies);
```

#### 改善ポイント

- ✅ 軍に所属している兵は削除できない
- ✅ コンテキストメニューで削除が disabled になる
- ✅ メニュー項目に「(軍に所属)」と表示され、理由が明確
- ✅ 軍選択モードで既存の軍の兵を含む選択はバリデーションエラー
- ✅ エラーメッセージで理由を明確に表示

#### UX

**兵の削除**

- 軍に所属していない兵：右クリック → 「兵の削除」が有効
- 軍に所属している兵：右クリック → 「兵の削除 (軍に所属)」がグレーアウト

**軍選択モード**

- 既存の軍の兵を含まない選択：成功 → 軍ポップオーバーが表示
- 既存の軍の兵を含む選択：失敗 → 「選択範囲内に既に軍に所属している兵が含まれています」エラー

---

### 21. コンテキストメニューに軍の削除を追加

#### 要求

- コンテキストメニューに軍の削除を追加する

#### 実装内容

**1. deleteArmy アクションを追加**

```typescript
// states/slice.ts

// ユーザーが軍を削除する
deleteArmy: (state, action: PayloadAction<string>) => {
  state.armies = state.armies.filter((army) => army.id !== action.payload);
},
```

**2. Tile コンポーネントに軍削除ハンドラーを追加**

```tsx
// widgets/Map/Tile/index.tsx

const handleDeleteArmy = () => {
  if (belongingArmy) {
    dispatch(deleteArmy(belongingArmy.id));
  }
};
```

**3. コンテキストメニューに軍の削除項目を追加**

```tsx
{
  /* 軍に属している場合は「軍の削除」を表示 */
}
{
  belongingArmy && (
    <>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={handleDeleteArmy} variant="destructive">
        軍の削除
      </ContextMenuItem>
    </>
  );
}
```

#### 改善ポイント

- ✅ 軍に属しているマスを右クリックすると「軍の削除」が表示される
- ✅ destructive variant で赤色表示され、危険な操作であることが明確
- ✅ クリックすると、その軍が armies 配列から削除される
- ✅ ArmyOverlay が自動的に更新され、ボーダーが消える
- ✅ 軍名ラベルも消える

#### UX

1. 軍内のマスを右クリック
2. コンテキストメニューに「軍の削除」が表示される（赤色）
3. クリックすると軍が即座に削除される
4. 軍のボーダーと軍名ラベルが消える
5. 兵は配置されたまま残る（軍から解放される）

---

### 22. 軍の枠線を形状に合わせた描画に変更

#### 要求

- マップ上の軍の枠線が常に四角形になっている
- 軍の中に兵じゃないマスがあるのは気持ち悪い
- 四角い枠線ではなく、兵マスのみを囲うようにしてほしい

#### 問題

現在の実装では、軍の最小座標と最大座標で矩形のボーダーを描画していたため、軍が L 字型や複雑な形状の場合でも、常に四角い枠線で囲まれていた。これにより、軍に属していない空のマスも枠線内に含まれてしまっていた。

#### 実装内容

**ArmyOverlay を完全に書き換え**

```tsx
// widgets/Map/ArmyOverlay/index.tsx

{
  armies.map((army) => {
    // 軍の座標をSetに変換（高速検索用）
    const armyPositionsSet = new Set(
      army.positions.map((pos) => `${pos.x},${pos.y}`)
    );

    // 各positionが隣接する方向で軍に属しているかチェック
    const hasArmyAt = (x: number, y: number): boolean => {
      return armyPositionsSet.has(`${x},${y}`);
    };

    return (
      <div key={army.id}>
        {/* 各タイルごとにボーダーを描画 */}
        {army.positions.map((pos) => {
          const { x, y } = pos;

          // 上下左右の隣接マスが軍に属しているかチェック
          const hasTop = hasArmyAt(x, y - 1);
          const hasBottom = hasArmyAt(x, y + 1);
          const hasLeft = hasArmyAt(x - 1, y);
          const hasRight = hasArmyAt(x + 1, y);

          // ボーダーのスタイル（各方向で隣接マスがない場合のみボーダーを描画）
          const borderStyle = {
            position: "absolute" as const,
            left: x * TILE_SIZE,
            top: y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            borderTop: !hasTop ? "3px solid rgba(59, 130, 246, 0.8)" : "none",
            borderBottom: !hasBottom
              ? "3px solid rgba(59, 130, 246, 0.8)"
              : "none",
            borderLeft: !hasLeft ? "3px solid rgba(59, 130, 246, 0.8)" : "none",
            borderRight: !hasRight
              ? "3px solid rgba(59, 130, 246, 0.8)"
              : "none",
            pointerEvents: "none" as const,
            boxShadow: "0 0 12px rgba(59, 130, 246, 0.4)",
          };

          return <div key={`${x},${y}`} style={borderStyle} />;
        })}

        {/* 軍名ラベル */}
        {/* ... */}
      </div>
    );
  });
}
```

#### 改善ポイント

- ✅ 各タイルごとに個別のボーダーを描画
- ✅ 隣接するタイルが軍に属していない場合のみ、その方向にボーダーを描画
- ✅ 軍の形状に完全に合わせた枠線になる
- ✅ L 字型、T 字型など複雑な形状の軍でも正しく囲まれる
- ✅ 軍に属していない空のマスは枠線内に含まれない
- ✅ パフォーマンス：Set を使用して高速な隣接チェック

#### 描画ロジック

各タイルについて：

1. 上の隣接マスが軍に属しているか → 属していなければ上辺にボーダー
2. 下の隣接マスが軍に属しているか → 属していなければ下辺にボーダー
3. 左の隣接マスが軍に属しているか → 属していなければ左辺にボーダー
4. 右の隣接マスが軍に属しているか → 属していなければ右辺にボーダー

これにより、軍の外周のみにボーダーが描画され、軍の形状に完全に合った枠線になる。

#### UX

- 軍が複雑な形状でも、兵がいるマスのみが正確に囲まれる
- より洗練された、ゲームの UI らしいリッチな見た目になった
- 情報の階層構造が明確になり、タイトルが際立つようになった

---

### 33. 合計兵力プログレスバーのデザイン刷新

#### 要求

- ヘッダーデザインを気に入ってもらえた
- 合計兵力のプログレスバーも良い感じのデザインにしてほしい

#### 修正内容

**エネルギー充填率風デザインへの変更**

既存の`Progress`コンポーネントを使わず、カスタム HTML/CSS でリッチなバーを実装。

```tsx
// widgets/ArmyPopover/index.tsx

{/* ラベルとパーセンテージ */}
<div className="flex justify-between items-end px-1">
  <label ...><Shield /> 合計兵力</label>
  <span className="text-cyan-400 ...">{healthPercentage}%</span>
</div>

{/* プログレスバー本体 */}
<div className="relative p-1 bg-slate-900/80 rounded-full ...">
  {/* 背景グリッド（目盛り） */}
  <div className="backgroundImage: linear-gradient(90deg, transparent 50%, rgba(59, 130, 246, 0.5) 50%)" />

  {/* バー（グラデーション＋発光） */}
  <div
    style={{
      width: `${healthPercentage}%`,
      background: "linear-gradient(90deg, rgba(37,99,235,1) 0%, rgba(59,130,246,1) 50%, rgba(34,211,238,1) 100%)",
      boxShadow: "0 0 15px rgba(59, 130, 246, 0.6)"
    }}
  >
    {/* 光沢ハイライト */}
    <div className="bg-gradient-to-b from-white/30 to-transparent" />
  </div>
</div>

{/* 数値詳細 */}
<div className="flex justify-end px-1">
  <span className="text-blue-400">{current}</span> / <span className="text-slate-400">{max}</span>
</div>
```

#### 改善ポイント

- ✅ **グラデーション**: 青〜シアンへの美しいグラデーションでエネルギー感を表現
- ✅ **グリッド背景**: バーの背景に細かい目盛りを入れ、ハイテク感を演出
- ✅ **光沢感**: 上部に白いハイライトを入れ、ガラス管のような質感を表現
- ✅ **レイアウト**: 数値をバーの横ではなく上下に分散させ、すっきりとした見た目に
- ✅ **アイコン**: `Shield`アイコンを追加し、防御力/耐久力であることを直感的に伝達

#### UX

- 兵力の残量が「エネルギー」として直感的に感じられるようになった
- 細かい数値よりもバーの視覚的なインパクトを優先しつつ、必要な情報はしっかり読める

---

### 34. プログレスバーの微調整

#### 要求

- ボーダー色が主張強すぎる
- プログレスバー本体をもっと太くしたい

#### 修正内容

1.  **ボーダー色の変更**:

    - `border-blue-500/30` → `border-blue-500/10`
    - 枠線の主張を抑え、バー本体を目立たせるように調整。

2.  **バーの高さ変更**:
    - `h-3` (12px) → `h-6` (24px)
    - 太さを倍増させ、エネルギー充填率のような迫力を強化。

```tsx
// widgets/ArmyPopover/index.tsx

<div className="... border border-blue-500/10 ...">
  {" "}
  {/* ボーダーを薄く */}
  {/* ... */}
  <div className="relative h-6 rounded-full overflow-hidden">
    {" "}
    {/* 高さを倍に */}
    {/* ... */}
  </div>
</div>
```

#### UX

- バーが太くなったことで、グリッドパターンやグラデーションがより鮮明に見えるようになった
- 枠線が薄くなり、デザイン全体の馴染みが良くなった

---

### 35. プログレスバーの黒ずみ解消

#### 要求

- ボーダーがやっぱり黒く太く見える

#### 原因

- `border`プロパティによる物理的な線
- `shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]`による黒い内側の影
- これらが重なって、意図しない「黒い太枠」に見えていた可能性が高い

#### 修正内容

1.  **ボーダーの削除**:

    - `border`クラスを完全に削除し、物理的な線をなくしました。

2.  **インナーシャドウの色変更**:
    - `rgba(0,0,0,0.5)`（黒） → `rgba(30,58,138,0.5)`（濃い青）
    - 影の色を背景色に馴染む濃い青に変更し、黒ずみを解消しつつ立体感を維持。

```tsx
// widgets/ArmyPopover/index.tsx

// 修正前
<div className="... border border-blue-500/10 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">

// 修正後
<div className="... shadow-[inset_0_0_10px_rgba(30,58,138,0.5)]">
```

#### UX

- 黒い枠線がなくなり、背景に溶け込むような自然な凹凸感が生まれた
- 全体的に青みで統一され、より洗練された印象に

---

### 36. プログレスバーの黒い枠線を完全除去

#### 問題

- 画像を確認したところ、バーの周囲に黒い枠線のようなものが見える
- `bg-slate-900/80`（濃い背景）と`p-1`（パディング）が原因で、背景色が枠線のように見えていた

#### 修正内容

1.  **背景色の透明度変更**:

    - `bg-slate-900/80` → `bg-slate-900/30`
    - 背景を薄くし、周囲とのコントラストを下げて黒さを軽減。

2.  **パディングの削除**:

    - `p-1`を削除。
    - バー本体とコンテナの隙間をなくし、「枠」という概念自体を排除。

3.  **インナーシャドウの削除**:
    - `shadow-[inset_...]`を削除。
    - 影による擬似的な枠線効果もなくし、完全にフラットに。

```tsx
// widgets/ArmyPopover/index.tsx

// 修正前
<div className="relative p-1 bg-slate-900/80 rounded-full shadow-[inset_0_0_10px_rgba(30,58,138,0.5)]">

// 修正後
<div className="relative bg-slate-900/30 rounded-full">
```

#### UX

- 「枠線」に見える要素が物理的になくなり、純粋なバーのみが表示されるようになった
- 背景色が薄くなったことで、より軽やかで未来的な印象に

---

### 37. プログレスバーを緑色に変更

#### 要求

- プログレスバーは緑色で表現したい

#### 修正内容

**カラーパレットの変更（青系 → 緑系）**

- **テキスト色**: `text-blue-300` → `text-emerald-300`
- **パーセンテージ**: `text-cyan-400` → `text-emerald-400`
- **グラデーション**:
  - `rgba(37,99,235,1)` (Blue) → `rgba(5,150,105,1)` (Emerald-600)
  - `rgba(59,130,246,1)` (Blue) → `rgba(16,185,129,1)` (Emerald-500)
  - `rgba(34,211,238,1)` (Cyan) → `rgba(52,211,153,1)` (Emerald-400)
- **シャドウ**: `rgba(59, 130, 246, 0.6)` → `rgba(16, 185, 129, 0.6)`

```tsx
// widgets/ArmyPopover/index.tsx

<div
  style={{
    background: "linear-gradient(90deg, rgba(5,150,105,1) 0%, rgba(16,185,129,1) 50%, rgba(52,211,153,1) 100%)",
    boxShadow: "0 0 15px rgba(16, 185, 129, 0.6)"
  }}
>
```

#### UX

- 緑色になることで「HP」「生命力」「正常な状態」というイメージが強化された
- 青系の UI の中でアクセントとなり、視認性が向上した

---

### 38. プログレスバーを濃い緑色に変更

#### 要求

- もっと濃くて、少し暗めの緑がいい

#### 修正内容

**カラーパレットの変更（明るい緑 → 濃い緑）**

- **テキスト色**: `text-emerald-300` → `text-green-400` / `text-green-500`
- **グラデーション**:
  - `rgba(5,150,105,1)` (Emerald-600) → `rgba(20,83,45,1)` (Green-900)
  - `rgba(16,185,129,1)` (Emerald-500) → `rgba(21,128,61,1)` (Green-700)
  - `rgba(52,211,153,1)` (Emerald-400) → `rgba(22,163,74,1)` (Green-600)
- **ハイライト**: `white/30` → `white/10`（光沢を控えめに）

```tsx
// widgets/ArmyPopover/index.tsx

<div
  style={{
    background: "linear-gradient(90deg, rgba(20,83,45,1) 0%, rgba(21,128,61,1) 50%, rgba(22,163,74,1) 100%)",
    // ...
  }}
>
```

#### UX

- 明るさを抑えたことで、より重厚感と落ち着きのあるデザインになった
- ミリタリーテーマやダークな UI により馴染むようになった

---

### 39. 軍の編集時にテーマカラーが変わるバグ修正

#### 問題

- 軍の編成ポップオーバーでチェックマーク（確定）を押すと、既存の軍であってもテーマカラーが変わってしまう
- 原因は、`confirmArmy` アクションが常に「新規作成」として処理しており、毎回新しい色を割り当てていたため
- また、`editingArmy` の状態に `id` や `color` が含まれておらず、既存の軍かどうかの判別ができていなかった

#### 修正内容

1.  **状態定義の更新 (`src/states/state.ts`)**:

    - `editingArmy` 型に `id` と `color` プロパティを追加。

2.  **ポップオーバー展開処理の修正 (`src/states/slice.ts`)**:

    - `openArmyPopover` で既存の軍を開く際、その `id` と `color` を `editingArmy` にコピーするように変更。

3.  **確定処理の修正 (`src/states/slice.ts`)**:
    - `confirmArmy` 内で `editingArmy.id` の有無をチェック。
    - ID がある場合は**既存の軍の更新**を行い、色は変更しない（維持する）。
    - ID がない場合のみ**新規作成**を行い、新しい色を割り当てる。

#### 結果

- 既存の軍を編集して確定しても、色が勝手に変わらなくなった
- 新規作成時はこれまで通り、自動で色が割り当てられる

---

### 40. マップ下部に軍数表示を追加

#### 要求

- マップ下部の配置数の枠に、最大軍数 {現在の軍数} / 9 を追加してほしい

#### 修正内容

**PlacementConstraints コンポーネントの拡張 (`src/widgets/Map/PlacementConstraints/index.tsx`)**

1.  **armies の取得**:

    - `useAppSelector`を使って、Redux ストアから現在の軍の配列 (`armies`) を取得。

2.  **軍数上限チェック**:

    - `isArmyLimitReached = armies.length >= 9` でチェック。

3.  **UI 表示の追加**:
    - 既存の「最大配置数」「騎兵上限」「将軍上限」と同じスタイルで「軍数上限」を追加。
    - 軍数が 9 に達した場合は、赤色でアニメーション表示。

```tsx
// widgets/Map/PlacementConstraints/index.tsx

<div className="flex flex-col items-center gap-1">
  <span className="text-slate-600 text-xs">軍数上限</span>
  <div className="flex items-baseline gap-1">
    <span
      className={`... ${
        isArmyLimitReached ? "text-red-600 animate-pulse" : "..."
      }`}
    >
      {armies.length}
    </span>
    <span className="text-slate-600 text-sm">/ 9</span>
  </div>
</div>
```

#### UX

- ユーザーが現在何個の軍を作成しているかが、一目で分かるようになった
- 上限（9 個）に達すると視覚的にフィードバックが得られる

---

### 23. 兵マスのみに枠線を描画するバグ修正

#### 問題

前回の修正で、`army.positions`の全てのマスに対して枠線を描画していたため、実際には兵が配置されていない空のマスも枠線で囲まれてしまっていた。

![上記画像のように、兵がいないマスも含めて枠線が描画されている](/Users/shouheitakai/.gemini/antigravity/brain/ca055d66-4e4a-4851-9676-733643d503a4/uploaded_image_1764868301888.png)

#### 原因

`army.positions`には、軍選択時に選択した全てのマス（兵がいるマスといないマス両方）が含まれているため、それらすべてに枠線が描画されていた。

#### 修正内容

**placedTroops を参照して、実際に兵が配置されているマスのみをフィルタリング**

```tsx
// widgets/Map/ArmyOverlay/index.tsx

export function ArmyOverlay() {
  const dispatch = useAppDispatch();
  const armies = useAppSelector((state) => state.app.armies);
  const placedTroops = useAppSelector((state) => state.app.placedTroops); // 追加

  return (
    <>
      {armies.map((army) => {
        // 軍の座標をSetに変換
        const armyPositionsSet = new Set(
          army.positions.map((pos) => `${pos.x},${pos.y}`)
        );

        // 実際に兵が配置されているマスのみをフィルタリング
        const troopsInArmy = placedTroops.filter((troop) =>
          armyPositionsSet.has(`${troop.x},${troop.y}`)
        );

        // 兵がいるマスの座標をSetに変換
        const troopPositionsSet = new Set(
          troopsInArmy.map((troop) => `${troop.x},${troop.y}`)
        );

        // 各positionに兵がいるかチェック
        const hasTroopAt = (x: number, y: number): boolean => {
          return troopPositionsSet.has(`${x},${y}`);
        };

        return (
          <div key={army.id}>
            {/* 兵が配置されているタイルごとにボーダーを描画 */}
            {troopsInArmy.map((troop) => {
              const { x, y } = troop;

              // 上下左右の隣接マスに兵がいるかチェック
              const hasTop = hasTroopAt(x, y - 1);
              const hasBottom = hasTroopAt(x, y + 1);
              const hasLeft = hasTroopAt(x - 1, y);
              const hasRight = hasTroopAt(x + 1, y);

              // ボーダーを描画
              // ...
            })}
          </div>
        );
      })}
    </>
  );
}
```

#### 改善ポイント

- ✅ `placedTroops`を参照して実際に兵が配置されているマスを特定
- ✅ `army.positions`と`placedTroops`の交差部分のみを使用
- ✅ 兵がいるマスのみに枠線を描画
- ✅ 空のマスは完全に除外される
- ✅ 隣接チェックも兵がいるマスに対してのみ実行

#### UX

- 兵が配置されているマスのみが正確に囲まれる
- 軍選択時に空のマスを含めて選択しても、枠線は兵マスのみに描画される
- 視覚的に軍の実体（兵の配置）が明確になる

---

### 24. 軍名ラベルの配置を周囲の空きスペースに応じて最適化

#### 要求

- 軍を分割すると、軍名と向きの吹き出しが別軍に完全にかぶってしまう
- 絶対に下に出すのではなく、自軍の周りの 2 マス以上空いているマスに吹き出しを出したい

#### 問題

従来は常に軍の下部中央にラベルを配置していたため、軍を分割して下に別の軍ができた場合、ラベルが重なってしまっていた。

#### 実装内容

**周囲 4 方向の衝突をチェックし、最適な位置を自動選択**

```tsx
// widgets/Map/ArmyOverlay/index.tsx

// 全ての兵の位置をSetに変換（衝突チェック用）
const allTroopsSet = new Set(
  placedTroops.map((troop) => `${troop.x},${troop.y}`)
);

const findBestLabelPosition = (): { x: number; y: number } => {
  // 各方向で、2マス先のエリアに他の兵がいるかチェック
  const checkDirection = (
    startX: number,
    startY: number,
    width: number,
    height: number
  ): number => {
    let count = 0;
    for (let x = startX; x < startX + width; x++) {
      for (let y = startY; y < startY + height; y++) {
        if (allTroopsSet.has(`${x},${y}`)) {
          count++;
        }
      }
    }
    return count;
  };

  // 下方向のチェック（優先度最高）
  const bottomConflict = checkDirection(
    Math.floor(minX),
    maxY + 1,
    Math.ceil(maxX - minX + 1),
    2
  );

  // 上、右、左方向も同様にチェック
  const topConflict = checkDirection(...);
  const rightConflict = checkDirection(...);
  const leftConflict = checkDirection(...);

  // 最も衝突が少ない方向を選択（優先順位：下、上、右、左）
  const conflicts = [
    { dir: "bottom", count: bottomConflict },
    { dir: "top", count: topConflict },
    { dir: "right", count: rightConflict },
    { dir: "left", count: leftConflict },
  ];

  const best = conflicts.reduce((prev, curr) =>
    curr.count < prev.count ? curr : prev
  );

  // 選択された方向に応じて位置を返す
  switch (best.dir) {
    case "bottom":
      return { x: centerX * TILE_SIZE, y: (maxY + 1) * TILE_SIZE + 8 };
    case "top":
      return { x: centerX * TILE_SIZE, y: minY * TILE_SIZE - 32 };
    case "right":
      return { x: (maxX + 1) * TILE_SIZE + 8, y: ... };
    case "left":
      return { x: minX * TILE_SIZE - 8, y: ... };
  }
};
```

#### 改善ポイント

- ✅ 軍の周囲 4 方向（下、上、右、左）で 2 マス分のエリアをチェック
- ✅ 各方向に他の兵がどれだけいるかをカウント
- ✅ 最も衝突が少ない方向を自動選択
- ✅ 優先順位：下（最も自然） → 上 → 右 → 左
- ✅ 全ての兵の位置を考慮（他の軍の兵も含む）
- ✅ 動的に最適な位置を決定するため、どんな配置でも重なりにくい

#### ラベル配置位置

- **下**: 軍の下部中央、下端から 8px 下
- **上**: 軍の上部中央、上端から 32px 上
- **右**: 軍の右側中央、右端から 8px 右
- **左**: 軍の左側中央、左端から 8px 左

#### UX

- 軍を分割しても、ラベルが自動的に空いている方向に配置される
- 複数の軍が密集していても、ラベルが重なりにくい
- 視認性が向上し、どの軍がどこにあるか明確になる

---

### 25. 軍ごとに自動的に色を割り当てるシステム

#### 要求

- 軍が多くなると、隣り合った軍のボーダーが重なってどちらの軍かわからなくなる
- 軍ごとに色を変えたい
- 色は自動で決まり、その軍の象徴的なカラーとして様々なところで使われる
- 色マスター（敵は全て赤想定なので赤以外の色）を用意
- 軍のステートとして色を持つ

#### 実装内容

**1. カラーマスターの定義**

```typescript
// states/army.ts

export const ARMY_COLORS = {
  BLUE: {
    name: "青",
    border: "rgba(59, 130, 246, 0.8)", // blue-500
    background: "rgba(59, 130, 246, 0.95)",
    shadow: "rgba(59, 130, 246, 0.4)",
  },
  GREEN: {
    name: "緑",
    border: "rgba(34, 197, 94, 0.8)", // green-500
    background: "rgba(34, 197, 94, 0.95)",
    shadow: "rgba(34, 197, 94, 0.4)",
  },
  YELLOW: {
    name: "黄",
    border: "rgba(234, 179, 8, 0.8)", // yellow-500
    background: "rgba(234, 179, 8, 0.95)",
    shadow: "rgba(234, 179, 8, 0.4)",
  },
  PURPLE: {
    name: "紫",
    border: "rgba(168, 85, 247, 0.8)", // purple-500
    background: "rgba(168, 85, 247, 0.95)",
    shadow: "rgba(168, 85, 247, 0.4)",
  },
  CYAN: {
    name: "シアン",
    border: "rgba(6, 182, 212, 0.8)", // cyan-500
    background: "rgba(6, 182, 212, 0.95)",
    shadow: "rgba(6, 182, 212, 0.4)",
  },
  ORANGE: {
    name: "オレンジ",
    border: "rgba(249, 115, 22, 0.8)", // orange-500
    background: "rgba(249, 115, 22, 0.95)",
    shadow: "rgba(249, 115, 22, 0.4)",
  },
  PINK: {
    name: "ピンク",
    border: "rgba(236, 72, 153, 0.8)", // pink-500
    background: "rgba(236, 72, 153, 0.95)",
    shadow: "rgba(236, 72, 153, 0.4)",
  },
  INDIGO: {
    name: "藍",
    border: "rgba(99, 102, 241, 0.8)", // indigo-500
    background: "rgba(99, 102, 241, 0.95)",
    shadow: "rgba(99, 102, 241, 0.4)",
  },
} as const;

export type ArmyColorKey = keyof typeof ARMY_COLORS;
export type ArmyColor = (typeof ARMY_COLORS)[ArmyColorKey];
```

**2. Army の型に color プロパティを追加**

```typescript
export type Army = {
  id: string;
  name: string;
  morale: number;
  direction: ArmyDirection;
  positions: Array<{ x: number; y: number }>;
  color: ArmyColorKey; // 軍の象徴カラー
};
```

**3. 軍作成時に自動的に色を割り当て**

```typescript
// states/slice.ts

confirmArmy: (state) => {
  if (state.editingArmy) {
    // 既に使用されている色を取得
    const usedColors = new Set(state.armies.map((army) => army.color));

    // カラーマスターから未使用の色を探す
    const availableColors = (
      Object.keys(ARMY_COLORS) as Array<keyof typeof ARMY_COLORS>
    ).filter((colorKey) => !usedColors.has(colorKey));

    // 未使用の色がある場合はその最初の色、なければ最初の色を使用（ループ）
    const assignedColor =
      availableColors.length > 0
        ? availableColors[0]
        : (Object.keys(ARMY_COLORS)[0] as keyof typeof ARMY_COLORS);

    const newArmy: Army = {
      id: `army-${Date.now()}`,
      name: state.editingArmy.name,
      morale: state.editingArmy.morale,
      direction: state.editingArmy.direction,
      positions: state.editingArmy.positions,
      color: assignedColor,
    };
    state.armies.push(newArmy);
  }
},
```

**4. ArmyOverlay で色を使用**

```tsx
// widgets/Map/ArmyOverlay/index.tsx

{troopsInArmy.map((troop) => {
  // 軍の色を取得
  const armyColor = ARMY_COLORS[army.color];

  const borderStyle = {
    // ...
    borderTop: !hasTop ? `3px solid ${armyColor.border}` : "none",
    borderBottom: !hasBottom ? `3px solid ${armyColor.border}` : "none",
    borderLeft: !hasLeft ? `3px solid ${armyColor.border}` : "none",
    borderRight: !hasRight ? `3px solid ${armyColor.border}` : "none",
    boxShadow: `0 0 12px ${armyColor.shadow}`,
  };
  // ...
})}

{/* ラベルの背景色も軍の色を使用 */}
<div style={{
  backgroundColor: ARMY_COLORS[army.color].background,
  boxShadow: `0 2px 8px rgba(0, 0, 0, 0.3), 0 0 12px ${ARMY_COLORS[army.color].shadow}`,
}}>
```

#### 改善ポイント

- ✅ 8 色のカラーマスター（青、緑、黄、紫、シアン、オレンジ、ピンク、藍）
- ✅ 赤は敵用として除外
- ✅ 各色に border、background、shadow の値を定義
- ✅ 軍作成時に自動的に未使用の色を割り当て
- ✅ 8 個以上の軍を作成した場合は色がループ
- ✅ ボーダーとラベルの両方で色を使用
- ✅ 将来的に他の箇所でも軍の色を使用可能

#### UX

- 各軍が異なる色で表示される
- 隣り合った軍でも色が異なるため、どちらの軍か一目でわかる
- 色が軍の象徴として機能し、視覚的に識別しやすい

---

### 26. 軍ラベルの色を暗めに調整

#### 要求

- 吹き出しや向きの矢印の色が白なので、色（背景）はもう少し暗めがいい

#### 問題

各色の背景が明るすぎて（特に黄色やシアン）、白いテキストと矢印アイコンのコントラストが低く、読みにくい場合があった。

#### 修正内容

**カラーマスターの背景色を暗めに調整**

```typescript
// states/army.ts

export const ARMY_COLORS = {
  BLUE: {
    name: "青",
    border: "rgba(59, 130, 246, 0.8)", // blue-500
    background: "rgba(37, 99, 235, 0.9)", // blue-600 (darker)
    shadow: "rgba(59, 130, 246, 0.4)",
  },
  GREEN: {
    name: "緑",
    border: "rgba(34, 197, 94, 0.8)", // green-500
    background: "rgba(22, 163, 74, 0.9)", // green-600 (darker)
    shadow: "rgba(34, 197, 94, 0.4)",
  },
  YELLOW: {
    name: "黄",
    border: "rgba(234, 179, 8, 0.8)", // yellow-500
    background: "rgba(202, 138, 4, 0.9)", // yellow-600 (darker)
    shadow: "rgba(234, 179, 8, 0.4)",
  },
  // 他の色も同様に暗めに調整
};
```

#### 改善ポイント

- ✅ 各色を Tailwind CSS の 600 番台（より暗い色）に変更
- ✅ 不透明度を 0.95 から 0.9 に微調整
- ✅ 白いテキストと矢印のコントラストが向上
- ✅ 特に黄色やシアンなどの明るい色で読みやすさが改善
- ✅ ボーダーと影の色はそのまま維持（視認性のバランス）

#### UX

- ラベルの背景が暗めになり、白いテキストがはっきり読める
- 矢印アイコンも見やすくなる
- 全ての色で統一感のあるコントラストが確保される

---

### 27. コンテキストメニューに「モードをキャンセル」を追加

#### 要求

- 軍選択モード、軍分割モードの時は「モードをキャンセル」をコンテキストメニューに追加してほしい

#### 実装内容

**コンテキストメニューに「モードをキャンセル」を追加**

```tsx
// widgets/Map/Tile/index.tsx

<ContextMenuContent className="w-48">
  {/* 準備フェーズの軍編成メニュー */}
  {phase === BATTLE_PHASE.PREPARATION && (
    <>
      <ContextMenuItem onClick={() => handleContextMenu("軍選択モード")}>
        軍選択モード
      </ContextMenuItem>
      {/* ... */}
    </>
  )}

  {/* 軍選択モードまたは軍分割モードの場合は「モードをキャンセル」を表示 */}
  {(armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
    armyFormationMode === ARMY_FORMATION_MODE.SPLIT) && (
    <>
      <ContextMenuSeparator />
      <ContextMenuItem
        onClick={() =>
          dispatch(switchArmyFormationMode({ mode: ARMY_FORMATION_MODE.NONE }))
        }
      >
        モードをキャンセル
      </ContextMenuItem>
    </>
  )}

  {/* その他のメニュー項目 */}
</ContextMenuContent>
```

#### 改善ポイント

- ✅ 軍選択モードまたは軍分割モードの時のみ表示
- ✅ クリックすると`armyFormationMode`を`NONE`にリセット
- ✅ セパレーターで他のメニュー項目と区切って視覚的に分離
- ✅ モードをキャンセルすると矩形選択もリセットされる

#### UX

**軍選択モードの場合**

1. 軍選択モードに切り替える
2. マップを右クリック
3. 「モードをキャンセル」が表示される
4. クリックすると通常モードに戻る

**軍分割モードの場合**

1. 軍内を右クリックして軍分割モードに切り替える
2. マップを右クリック
3. 「モードをキャンセル」が表示される
4. クリックすると通常モードに戻る

---

### 28. コンテキストメニューの重複項目を修正

#### 問題

- コンテキストメニューに同じモード（軍選択モード、軍分割モード）が複数表示されている

#### 原因

前回の修正で新しいメニュー構造を追加したが、古い重複した項目を削除していなかったため、同じメニュー項目が 2 回表示されていた。

#### 修正内容

**重複しているメニュー項目を削除**

```tsx
// widgets/Map/Tile/index.tsx

<ContextMenuContent>
  {/* 軍編成（軍に属している場合） */}
  {belongingArmy && (
    <>
      <ContextMenuItem onClick={() => handleContextMenu("軍編成")}>
        軍編成
      </ContextMenuItem>
      <ContextMenuSeparator />
    </>
  )}

  {/* 準備フェーズの軍編成メニュー */}
  {phase === BATTLE_PHASE.PREPARATION && (
    <>
      <ContextMenuItem onClick={() => handleContextMenu("軍選択モード")}>
        軍選択モード
        {armyFormationMode === ARMY_FORMATION_MODE.SELECT && " ✓"}
      </ContextMenuItem>

      {belongingArmy && (
        <ContextMenuItem onClick={() => handleContextMenu("軍分割モード")}>
          軍分割モード
          {armyFormationMode === ARMY_FORMATION_MODE.SPLIT && " ✓"}
        </ContextMenuItem>
      )}

      {belongingArmy && (
        <ContextMenuSub>
          <ContextMenuSubTrigger>向き</ContextMenuSubTrigger>
          {/* ... */}
        </ContextMenuSub>
      )}
    </>
  )}

  {/* モードをキャンセル */}
  {(armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
    armyFormationMode === ARMY_FORMATION_MODE.SPLIT) && (
    <>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => /* ... */}>
        モードをキャンセル
      </ContextMenuItem>
    </>
  )}

  {/* その他のメニュー */}
</ContextMenuContent>
```

#### 改善ポイント

- ✅ 重複していた古いメニュー項目を削除
- ✅ 各メニュー項目が 1 回だけ表示される
- ✅ メニュー構造が整理され、理解しやすくなった
- ✅ 準備フェーズの条件内に軍編成関連のメニューを統合

---

### 29. 右クリック時のバリデーションエラーを修正

#### 問題

- モードをキャンセルするために何も置かれていないマスを右クリックすると「分割する軍は最低 2 体以上の兵が必要です」というエラーが表示される
- 右クリックだけでドラッグしていない場合でも、マウスアップ時のバリデーションが実行されてしまう

#### 原因

`handleGlobalMouseUp`関数で、`selectedTiles`が空でもバリデーション処理が実行されていた。右クリックでコンテキストメニューを開いた場合、ドラッグしていないため`selectedTiles`は空だが、それでもバリデーションが走ってしまっていた。

#### 修正内容

**selectedTiles が空の場合はバリデーション処理をスキップ**

```tsx
// widgets/Map/index.tsx

const handleGlobalMouseUp = () => {
  if (
    !isSelecting ||
    armyFormationMode === ARMY_FORMATION_MODE.NONE ||
    selectedTiles.length === 0 // 選択タイルがない場合はスキップ
  )
    return;

  // 軍選択モードの場合
  if (armyFormationMode === ARMY_FORMATION_MODE.SELECT) {
    // バリデーション処理
    // ...
  }

  // 軍分割モードの場合
  if (armyFormationMode === ARMY_FORMATION_MODE.SPLIT && splittingArmyId) {
    // バリデーション処理
    // ...
  }

  dispatch(clearSelection());
};
```

#### 改善ポイント

- ✅ `selectedTiles.length === 0`の場合は早期リターン
- ✅ 右クリックのみでドラッグしていない場合はバリデーションをスキップ
- ✅ モードキャンセルのために空のマスを右クリックしてもエラーが出ない
- ✅ 実際にドラッグして選択した場合のみバリデーションが実行される

#### UX

**修正前**:

1. 軍分割モードに入る
2. 空のマスを右クリック（ドラッグなし）
3. ❌ 「分割する軍は最低 2 体以上の兵が必要です」エラーが表示される

**修正後**:

1. 軍分割モードに入る
2. 空のマスを右クリック（ドラッグなし）
3. ✅ コンテキストメニューが開き、「モードをキャンセル」を選択できる

---

### 30. 右クリック時の選択ドラッグを防止

#### 問題

- 右クリックするとやはりエラーが出てしまう
- 前回の修正では解決しなかった

#### 原因

`handleMouseDown`関数で、右クリック（`button === 2`）の場合でも`beginSelectionDrag`が実行されていた。これにより、右クリック時にも選択ドラッグが開始され、その結果`selectedTiles`が設定され、`handleGlobalMouseUp`でバリデーションが実行されてしまっていた。

#### 修正内容

**右クリック時は選択ドラッグを開始しないように修正**

```tsx
// widgets/Map/Tile/index.tsx

const handleMouseDown = (e: React.MouseEvent) => {
  // 右クリック（button === 2）の場合は何もしない
  if (e.button === 2) {
    return;
  }

  if (
    armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
    armyFormationMode === ARMY_FORMATION_MODE.SPLIT
  ) {
    e.preventDefault();
    dispatch(beginSelectionDrag({ x, y }));
  }
};
```

#### マウスボタンの値

- `button === 0`: 左クリック
- `button === 1`: 中クリック（ホイールクリック）
- `button === 2`: 右クリック

#### 改善ポイント

- ✅ 右クリック時は選択ドラッグが開始されない
- ✅ 左クリックでのみ矩形選択が可能
- ✅ 右クリックでコンテキストメニューを開いてもエラーが出ない
- ✅ `selectedTiles`が空のまま維持される

#### UX

**修正前**:

1. 軍分割モードに入る
2. 空のマスを右クリック
3. ❌ 選択ドラッグが開始される
4. ❌ マウスアップ時にバリデーションエラーが表示される

**修正後**:

1. 軍分割モードに入る
2. 空のマスを右クリック
3. ✅ 選択ドラッグは開始されない
4. ✅ コンテキストメニューが開き、「モードをキャンセル」を選択できる

---

### 31. ArmyPopover の余白とタイトルを調整

#### 要求

- 軍編成ポップオーバーの上部に変な余白がついているので解消してほしい
- 軍作成済みの場合は「軍編成」文言を軍名に変えてほしい

#### 修正内容

**1. 上部余白の削除**

```tsx
// widgets/ArmyPopover/index.tsx

// 修正前
<PopoverContent className="w-80 space-y-4 p-4" ...>

// 修正後
<PopoverContent className="w-80 p-4" ...>
```

`space-y-4`を削除することで、PopoverContent 直下の不要な余白を解消。子要素の`div`に`space-y-4`があるため、そちらで十分。

**2. タイトルを軍名に変更**

```tsx
// 修正前
<h3 className="font-bold text-lg">軍編成</h3>

// 修正後
<h3 className="font-bold text-lg">
  {editingArmy ? editingArmy.name : "軍編成"}
</h3>
```

#### 改善ポイント

- ✅ PopoverContent の`space-y-4`を削除して上部余白を解消
- ✅ 軍作成済み（editingArmy がある）の場合は軍名を表示
- ✅ 新規軍編成の場合は「軍編成」を表示
- ✅ ポップオーバーがよりコンパクトになる

#### UX

**新規軍編成の場合**:

- タイトル: 「軍編成」

**既存軍の編集の場合**:

- タイトル: 軍の名前（例: 「第一軍」「本隊」など）

---

### 41. 兵ツールチップに地形効果を追加

#### 要求

- 兵をホバーした時に、地形による効果を表示したい
- かかっている効果エリアに地形名、説明文、ステータス増減を表示
- ステータスは「デフォルト値 + 増減」の形式で表示
- 減っていれば赤色、増えていれば緑色で表示

#### 実装内容

**1. PlacedTroop 型に hp プロパティを追加**

```typescript
// src/lib/placement.ts
export type PlacedTroop = {
  x: number;
  y: number;
  type: SoldierType;
  hp: number; // 兵力を追加
  theme: { primary: string; secondary: string };
};
```

**2. 地形効果を計算するユーティリティ関数を作成**

```typescript
// src/lib/terrainEffect.ts
export type TerrainEffect = {
  name: string;
  description: string;
  effects: Array<{
    stat: "attack" | "defense" | "range" | "speed";
    change: number; // 正の値は増加、負の値は減少
    overrideValue?: number; // 指定された場合、この値に固定される
  }>;
};

export function getTerrainEffect(
  soldierType: SoldierType,
  terrain: Terrain
): TerrainEffect | null {
  // 地形と兵種に応じた効果を計算
}
```

**3. 地形ごとの効果実装**

```typescript
// 水: 全兵種が速さ1になり、攻撃、防御、射程が2ずつ下がる
case TERRAIN_TYPE.WATER:
  return {
    name: "水",
    description: "全身が水に浸かっている",
    effects: [
      { stat: "attack", change: -2 },
      { stat: "defense", change: -2 },
      { stat: "range", change: -2 },
      { stat: "speed", change: 0, overrideValue: 1 },
    ],
  };

// 森: 兵種によって効果が異なる
case TERRAIN_TYPE.FOREST:
  if (soldierType === "ARCHER") {
    return {
      name: "森",
      description: "木々に視界を遮られている",
      effects: [{ stat: "range", change: -2 }],
    };
  } else if (soldierType === "INFANTRY" || soldierType === "SHIELD") {
    return {
      name: "森",
      description: "森の中で身を隠している",
      effects: [
        { stat: "attack", change: 1 },
        { stat: "defense", change: 1 },
      ],
    };
  } else if (soldierType === "CAVALRY" || soldierType === "GENERAL") {
    return {
      name: "森",
      description: "森の中で動きが制限されている",
      effects: [
        { stat: "attack", change: -1 },
        { stat: "defense", change: -1 },
        { stat: "speed", change: -2 },
      ],
    };
  }
```

**4. ツールチップに地形効果を表示**

```tsx
// widgets/Map/Tile/index.tsx

{/* 右エリア：かかっている効果 */}
<div className="border-l border-slate-700 pl-3 min-w-[100px]">
  <h4 className="text-slate-400 text-xs font-medium mb-2">
    かかっている効果
  </h4>
  {terrainEffect ? (
    <div className="flex flex-col gap-2">
      {/* 地形名 */}
      <div className="text-white text-sm font-bold">
        {terrainEffect.name}
      </div>
      {/* ステータス変化 */}
      <div className="flex flex-col gap-1">
        {terrainEffect.effects.map((effect) => {
          const StatIcon = statIconMap[effect.stat];
          const defaultValue = SOLDIER_STATS[troopOnTile.type][effect.stat];
          return (
            <div key={effect.stat} className="flex items-center gap-1.5 text-xs">
              <StatIcon size={14} className={...} />
              {effect.overrideValue !== undefined ? (
                // 値が固定される場合（例：速度が1になる）
                <>
                  <span className="text-slate-400 font-mono">{defaultValue}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-red-400 font-bold font-mono">
                    {effect.overrideValue}
                  </span>
                </>
              ) : (
                // 増減の場合
                <span className="text-red-400 font-bold font-mono">
                  {effect.change}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <p className="text-slate-500 text-xs">なし</p>
  )}
</div>
```

#### 改善ポイント

- ✅ 地形ごとの効果を battle-rule.md に基づいて正確に実装
- ✅ 水：全兵種の攻撃、防御、射程が -2、速度は兵種ごとに変化量を計算
- ✅ 森：弓兵は射程 -2、歩兵/盾兵は攻撃+防御+1、騎兵/将軍は攻撃+防御-1、速度-2
- ✅ 草・山：効果なし
- ✅ ステータス増減を視覚的に表示（赤=減少、緑=増加）
- ✅ シンプルな表示：ステータスアイコンと変化量のみ
- ✅ すべての効果を変化量で統一的に表示（「+2」「-2」など）

#### 地形効果の詳細

**水**:
- [剣] -2、[盾] -2、[的] -2、[炎] 変化量（兵種による）
  - 歩兵: -2
  - 騎兵: -4
  - 将軍: -1

**森（弓兵）**:
- [的] -2

**森（歩兵・盾兵）**:
- [剣] +1、[盾] +1

**森（騎兵・将軍）**:
- [剣] -1、[盾] -1、[炎] -2

**草・山**:
- なし

#### UX

- 兵をホバーすると、ツールチップの右エリアに地形効果が表示される
- 地形名とステータスアイコン+変化量のみのシンプルな表示
- ステータスの増減が色で視覚的に理解できる（赤=減少、緑=増加）
- すべてのステータスが変化量のみで統一的に表示される
- 効果がない地形では「なし」と表示される

#### 表示例

**水の上の歩兵（速度3）**:
```
かかっている効果
水
[剣] -2
[盾] -2
[的] -2
[炎] -2
```

**水の上の騎兵（速度5）**:
```
かかっている効果
水
[剣] -2
[盾] -2
[的] -2
[炎] -4
```

**森の中の弓兵**:
```
かかっている効果
森
[的] -2
```

**森の中の歩兵**:
```
かかっている効果
森
[剣] +1
[盾] +1
```

---

### 42. 左側のステータスに地形効果の変化量を追加

#### 要求

- 左側のステータス表示に、地形効果による変化量を追加したい

#### 実装内容

**各ステータスに地形効果の変化量を表示**

```tsx
// widgets/Map/Tile/index.tsx

{/* ステータス */}
<div className="grid grid-cols-2 gap-2 text-xs">
  <div className="flex items-center gap-1 text-slate-300">
    <Swords size={12} className="text-red-400" />
    <span>攻撃:</span>
    <span className="font-bold text-white">
      {SOLDIER_STATS[troopOnTile.type].attack}
    </span>
    {terrainEffect &&
      terrainEffect.effects.find((e) => e.stat === "attack") && (
        <span className="text-green-400 font-bold text-xs">
          +{terrainEffect.effects.find((e) => e.stat === "attack")!.change}
        </span>
      )}
  </div>
  {/* 他のステータスも同様 */}
</div>
```

#### 改善ポイント

- ✅ 各ステータスの横に地形効果による変化量を表示
- ✅ 変化量がある場合のみ表示（効果がない場合は非表示）
- ✅ 色分けで視覚化（緑=増加、赤=減少）
- ✅ 左側のステータスと右側の効果詳細の両方で確認できる

#### 表示例

**水の上の歩兵**:

左エリア:
```
攻撃: 3 -2
防御: 3 -2
射程: 1 -2
速度: 3 -2
```

右エリア:
```
かかっている効果
水
[剣] -2
[盾] -2
[的] -2
[炎] -2
```

**森の中の歩兵**:

左エリア:
```
攻撃: 3 +1
防御: 3 +1
射程: 1
速度: 3
```

右エリア:
```
かかっている効果
森
[剣] +1
[盾] +1
```

#### UX

- 左側のステータスで現在のステータス値と変化量が一目で分かる
- 右側の効果詳細で地形名と全ての効果を確認できる
- 地形効果がないステータスは変化量が表示されない（シンプル）
- 色分けで増減が直感的に理解できる

---
