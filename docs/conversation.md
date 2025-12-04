# 会話ログ

このファイルには開発中の会話内容を時系列順に記録しています。

## 2025-12-03 セッション

### 1. initialMap.ts の作成 - 地形ルールに従った平原マップ

#### 要求

- バトルルールに従った自然な地形のマップが欲しい
- 直線的な川ではなく蛇行する川
- 森を4マス固定ではなく有機的な形に
- 山を十字キーのような形ではなく自然な山脈に

#### 実装内容

**src/data/initialMap.ts**

- 30×30のマップ（900マス）
- **川（水）**: 北から南へS字を描きながら蛇行（91マス）
- **湖**: 2つの不規則な形状の湖を配置
- **森**: 5グループに分割（L字型、クラスター状、T字型など）
- **山脈**: 3つの山脈を配置
  - 主要山脈: レベル3を頂点に、レベル2が四方、レベル1が広範囲
  - 小規模山脈×2: レベル2中心
  - 丘陵地帯: レベル1のみ

#### ルール遵守

- ✅ 水は4つ以上連続
- ✅ 森は4つ以上のグループ
- ✅ 山レベル3の四方にはレベル2が隣接
- ✅ 山レベル2の四方にはレベル1が隣接

---

### 2. coding-rule.md の補完 - 説明不足箇所に例を追加

#### 要求

- 説明が足りない箇所を補うように解説
- 例が必要であれば必ず良い例、悪い例を記載

#### 実装内容

**docs/coding-rule.md**

1. **ライブラリの公式ガイド活用**

   - 具体的な手順を追加（公式ドキュメント参照 → ベストプラクティス → アンチパターン回避）
   - React 18のuseTransitionを使った良い例・悪い例を追加

2. **shadcn/ui Theming の具体化**

   - CSS変数を使った正しいカラー指定の例
   - ダークモード対応のためのテーマ変数活用
   - 直接カラーコードを使う悪い例との比較

3. **shadcn/ui コンポーネント探索**

   - 具体的な手順（確認 → インストール → カスタム作成）を追加
   - Button、Dialogなどの実践的な使用例
   - 車輪の再発明を避けるための悪い例を追加

4. **Redux Action命名規則の大幅拡充**
   - 4つの基本原則を明記（動詞で始める、ユーザーの意図を表現、現在形、具体的に）
   - 7つの実践例（startBattle, moveArmy, attackEnemy など）
   - 9つの操作パターン表で一目で良い命名・悪い命名が分かるように整理

---

### 3. colors.ts の修正 - コーディングルール違反の解消

#### 問題点

**src/designs/colors.ts**

```typescript
// ❌ 直接カラーコードを定義（ダークモード非対応）
export const TERRAIN_COLORS = {
  GRASS: "#7cb342",
  WATER: "#42a5f5",
  // ...
};
```

#### 修正内容

1. **App.css に shadcn/ui テーマとCSS変数を追加**

```css
@theme {
  /* shadcn/ui カラー */
  --color-background: 0 0% 100%;
  --color-border: 214.3 31.8% 91.4%;

  /* 地形カラー */
  --color-terrain-grass: 88 55% 53%;
  --color-terrain-water: 207 87% 61%;
  /* ... */
}

@layer base {
  :root {
    --terrain-grass: 88 55% 53%;
    /* ... */
  }

  .dark {
    --terrain-grass: 88 45% 45%; /* ダークモード用 */
    /* ... */
  }
}
```

2. **colors.ts を CSS変数を参照するように変更**

```typescript
// ✅ CSS変数を参照（テーマ対応）
export const TERRAIN_COLORS = {
  GRASS: "hsl(var(--terrain-grass))",
  WATER: "hsl(var(--terrain-water))",
  // ...
};
```

#### メリット

- ✅ ダークモード対応
- ✅ テーマの一貫性
- ✅ 保守性向上
- ✅ コーディングルール準拠

---

### 4. Tailwind CSS v4 対応 - ビルドエラーの解消

#### 問題

`[plugin:@tailwindcss/vite:generate:serve] Cannot apply unknown utility class 'border-border'`

#### 原因

Tailwind CSS v4では設定方法が変更：

- `tailwind.config.js`は不要
- `@theme`ディレクティブでカスタムカラーを定義
- `@apply`の使用は推奨されない

#### 修正内容

**App.css**

```css
/* ❌ 修正前（Tailwind v4では非推奨） */
@layer base {
  * {
    @apply border-border;
  }
}

/* ✅ 修正後（直接CSSプロパティ） */
@layer base {
  * {
    border-color: hsl(var(--color-border));
  }
}
```

---

### 5. バトルフェーズの概念導入

#### 要求

- バトルフェーズを3つに分ける：準備中・バトル中・結果
- 準備中: ヘッダー右側は「バトル開始」ボタン
- バトル中: ターン数表示 + 「次ターン」ボタン
- 結果: 「バトルを終了する」ボタン
- 準備中の左側ナビ: 「兵配置」「軍編成」タブ

#### 実装内容

1. **states/battle.ts** - 定数と型定義

```typescript
export const BATTLE_PHASE = {
  PREPARATION: "PREPARATION",
  BATTLE: "BATTLE",
  RESULT: "RESULT",
} as const;

export const PREPARATION_TAB = {
  DEPLOY_SOLDIER: "DEPLOY_SOLDIER",
  FORM_ARMY: "FORM_ARMY",
} as const;
```

2. **states/slice.ts** - Redux Slice

```typescript
// ユーザー操作を直接表すaction名
startBattle, nextTurn, endBattle, finishBattle, switchPreparationTab
```

3. **BattlePage.tsx** - フェーズに応じた動的UI
   - ヘッダー右側ボタン（フェーズ別）
   - 左側ナビ（準備中のみ表示）
   - タブ切り替え機能

---

### 6. 状態管理の整理 - 一本の盆栽として育てる

#### 要求

- battle.ts は型と定数だけ
- 実際のステートは state.ts に配置
- slice.ts は battleSlice という名前にせず slice でいい
- ステートのリセットは `state.phase = initialState.phase` のように

#### 修正内容

1. **state.ts** - アプリケーション全体の状態を一元管理

```typescript
export type AppState = {
  phase: BattlePhase;
  turn: number;
  preparationTab: PreparationTab;
  // 今後、他の状態もここに追加していく
};
```

2. **battle.ts** - 型と定数のみに整理

```typescript
// BattleState型定義は削除（state.tsに移動）
```

3. **slice.ts** - 一本の盆栽として

```typescript
// ❌ 修正前
export const battleSlice = createSlice({ name: "battle", ... });

// ✅ 修正後
export const slice = createSlice({
  name: "app",
  initialState, // state.tsからインポート
  reducers: {
    finishBattle: (state) => {
      state.phase = initialState.phase;
      state.turn = initialState.turn;
      state.preparationTab = initialState.preparationTab;
    },
  },
});
```

4. **states/index.ts** - ストア設定を更新

```typescript
reducer: {
  app: appReducer,
}
```

---

### 7. BattlePage のリファクタリング - Composition パターン

#### 問題点

- ❌ render関数を使用（`renderHeaderActions`, `renderLeftSidebar`）
- ❌ 1つのコンポーネントに複数の役割
- ❌ compositionパターンが使われていない

#### 修正内容

**designs/Layout** - Compositionパターンでレイアウト構築

```tsx
<Layout>
  <LayoutHeader>{children}</LayoutHeader>
  <LayoutBody>{children}</LayoutBody>
  <LayoutMain>{children}</LayoutMain>
</Layout>
```

**widgets/Header** - ヘッダーのビジネスロジックとUI

- フェーズに応じたボタン表示
- Redux状態の管理

**widgets/Aside** - サイドバーのタブ切り替え

- 準備中のみ表示
- タブヘッダーとタブコンテンツ

**widgets/Aside/SoldierPlacement** - 兵配置タブ

**widgets/Aside/ArmyPlacement** - 軍編成タブ

**BattlePage.tsx** - シンプルな組み立て

```tsx
// ❌ 修正前：170行、render関数だらけ

// ✅ 修正後：47行、compositionパターン
export default function BattlePage() {
  return (
    <Layout>
      <LayoutHeader>
        <Header />
      </LayoutHeader>
      <LayoutBody>
        <Aside />
        <LayoutMain>...</LayoutMain>
      </LayoutBody>
    </Layout>
  );
}
```

---

### 8. 右側サイドバーの実装 - Composition パターン

#### 要求

- 右側も「戦闘ログ」「ルール解説」のタブで実装

#### 実装内容

1. **states/battle.ts** - 右側タブの定数追加

```typescript
export const RIGHT_SIDEBAR_TAB = {
  BATTLE_LOG: "BATTLE_LOG",
  RULE_EXPLANATION: "RULE_EXPLANATION",
} as const;
```

2. **states/state.ts** - 右側タブ状態追加

```typescript
rightSidebarTab: RightSidebarTab;
```

3. **states/slice.ts** - タブ切り替えaction

```typescript
switchRightSidebarTab: (state, action: PayloadAction<RightSidebarTab>) => {
  state.rightSidebarTab = action.payload;
}
```

4. **widgets/BattleLog** - 戦闘ログコンポーネント
5. **widgets/RuleExplanation** - ルール解説コンポーネント
6. **widgets/RightSidebar** - 右側サイドバー

**BattlePage.tsx** - 最終形

```tsx
// 28行、完全にcomposition
export default function BattlePage() {
  return (
    <Layout>
      <LayoutHeader>
        <Header />
      </LayoutHeader>
      <LayoutBody>
        <Aside />
        <LayoutMain>...</LayoutMain>
        <RightSidebar />
      </LayoutBody>
    </Layout>
  );
}
```

---

## 主要な学び・パターン

### Compositionパターンの徹底

- render関数は使わない
- コンポーネントに切り出す
- childrenで柔軟に構築

### Redux action命名規則

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

- **designs/**: ビジネスロジックを持たない純粋なUI
- **widgets/**: ビジネスロジックを持つコンポーネント
- **states/**: 状態管理とドメインの型・定数
- **routes/**: ページ単位のコンポーネント（組み立てのみ）

---

### 9. カスタムスクロールバーの実装 - ダークテーマ対応

#### 要求

- 左右サイドバーのスクロールバーをダークテーマに合ったデザインに変更
- ブラウザデフォルトのダサいスクロールバーを置き換える

#### 実装内容

**App.css** - CSS変数とスクロールバースタイル

```css
@layer base {
  :root {
    /* カスタムスクロールバー */
    --scrollbar-width: 8px;
    --scrollbar-track: 217 33% 17%; /* slate-900 */
    --scrollbar-thumb: 215 20% 35%; /* slate-600 */
    --scrollbar-thumb-hover: 215 16% 47%; /* slate-500 */
    --scrollbar-border-radius: 4px;
  }
}

@layer utilities {
  .custom-scrollbar {
    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--scrollbar-thumb)) hsl(var(--scrollbar-track));
  }

  /* Webkit (Chrome, Safari, Edge) */
  .custom-scrollbar::-webkit-scrollbar {
    width: var(--scrollbar-width);
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: hsl(var(--scrollbar-track));
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: hsl(var(--scrollbar-thumb));
    border-radius: var(--scrollbar-border-radius);
    transition: background-color 0.2s ease;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--scrollbar-thumb-hover));
  }
}
```

**widgets/Aside/index.tsx** - カスタムスクロールバー適用

```tsx
<aside className="w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto custom-scrollbar">
```

**widgets/RightSidebar/index.tsx** - カスタムスクロールバー適用

```tsx
<aside className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto custom-scrollbar">
```

#### デザインの特徴

- ✅ 細めのスクロールバー（幅8px）
- ✅ ダークテーマに調和した配色（slate系）
- ✅ ホバー時に明るくなるインタラクション
- ✅ 滑らかなトランジション（0.2s ease）
- ✅ 角丸デザイン（4px）
- ✅ Firefox / Webkit（Chrome, Safari, Edge）両対応

#### CSS変数の活用

- コーディングルールに従い、カラーコードを直接指定せずCSS変数で管理
- スクロールバーの幅、色、角丸を変数化し、保守性を向上
- hsl形式でslate系のカラーパレットを使用

---

### 10. shadcn/ui インストールディレクトリの統一 - designs/ui/ への集約

#### 要求

- shadcn/ui のインストール先を `src/components/ui/` から `src/designs/ui/` に変更
- プロジェクトのディレクトリ構造ルールに従う
- `components/` ディレクトリは使わない（技術的な命名を避ける）

#### 実装内容

**components.json** - aliases の変更

```json
{
  "aliases": {
    "components": "@/designs",
    "utils": "@/lib/utils",
    "ui": "@/designs/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**ファイルの移動**

- `src/components/ui/card.tsx` → `src/designs/ui/card.tsx` に移動
- `src/components/` ディレクトリを削除

#### ディレクトリ構造ルールとの整合性

プロジェクトのディレクトリ構造では以下のルールがあります：

- ✅ **designs/**: ビジネスロジックを持たない純粋な汎用 UI コンポーネント
- ✅ **widgets/**: ビジネスロジックを持つコンポーネント

shadcn/ui のコンポーネントは純粋な UI コンポーネントなので、`designs/ui/` に配置するのが適切です。

#### メリット

- ✅ プロジェクトのディレクトリ構造ルールに準拠
- ✅ 技術的な命名（`components/`）を避ける
- ✅ shadcn/ui の今後のインストール先が自動的に `src/designs/ui/` になる
- ✅ コードベース全体で一貫したディレクトリ構造を維持

---

### 11. コンテキストメニューの実装 - 兵の削除機能

#### 要求

- shadcn/ui の context-menu をインストール
- マップ上の兵種マスを右クリックで「削除」メニューを表示
- 削除を選択すると配置した兵を削除

#### 実装内容

**1. shadcn/ui context-menu のインストール**

```bash
bunx shadcn@latest add context-menu
```

自動的に `src/designs/ui/context-menu.tsx` にインストールされました。

**2. Tile コンポーネントの更新**

```tsx
// インポートを追加
import { removeTroop } from "@/states/slice";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/designs/ui/context-menu";

// 削除ハンドラーを追加
const handleRemoveTroop = () => {
  dispatch(removeTroop({ x, y }));
};

// 兵が配置されている場合のみコンテキストメニューを表示
if (troopOnTile) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{tileContent}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleRemoveTroop}>削除</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

**3. Redux action の活用**

すでに存在していた `removeTroop` アクションを活用：

```typescript
// ユーザーが兵を削除する
removeTroop: (state, action: PayloadAction<{ x: number; y: number }>) => {
  state.placedTroops = state.placedTroops.filter(
    (troop) => troop.x !== action.payload.x || troop.y !== action.payload.y
  );
},
```

#### 実装のポイント

- ✅ コンテキストメニューは兵が配置されている場合のみ表示
- ✅ `asChild` プロパティでタイルの既存スタイルを維持
- ✅ Redux action 命名規則に従った `removeTroop`（ユーザーの操作を直接表現）
- ✅ shadcn/ui の components.json 設定により、自動的に `src/designs/ui/` にインストール

#### UX

- マップ上の兵種マスを右クリック
- 「削除」メニューが表示される
- 削除を選択すると即座に兵が削除される

---

### 12. TroopCard ホバーエフェクトの強化 - きらりんエフェクトと兵種色boxshadow

#### 要求

- ホバー時のきらりんエフェクトをもっと白く強くする
- ホバー時のboxshadowを兵種と同色カラーにする

#### 実装内容

**1. ホバー時の兵種色boxshadowを追加**

```tsx
<Card
  style={{
    boxShadow: `0 4px 20px ${theme.primary}40, 0 0 0 1px ${theme.primary}20`,
    transition: "box-shadow 0.3s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = `0 8px 32px ${theme.primary}60, 0 0 24px ${theme.primary}50, 0 0 0 2px ${theme.primary}40`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = `0 4px 20px ${theme.primary}40, 0 0 0 1px ${theme.primary}20`;
  }}
>
```

**2. きらりんエフェクトを白く強化**

```tsx
{/* Shimmer effect */}
<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
  <div
    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
    style={{
      background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6), transparent)`,
      filter: "blur(8px)",
    }}
  />
</div>
```

#### 改善ポイント

**ホバー時のboxshadow**
- ✅ 通常時: `0 4px 20px ${theme.primary}40`（控えめな影）
- ✅ ホバー時: `0 8px 32px ${theme.primary}60, 0 0 24px ${theme.primary}50`（兵種色で強い発光）
- ✅ トランジション: `0.3s ease` で滑らかな変化

**きらりんエフェクト**
- ✅ 修正前: `${theme.secondary}30`（兵種の副色で薄い）
- ✅ 修正後: `rgba(255, 255, 255, 0.6)`から`0.9`へのグラデーション（明るい白）
- ✅ `blur(8px)` を追加して柔らかい光の表現
- ✅ 5段階のグラデーションで自然な光の流れ

#### 視覚効果

- カードにホバーすると、兵種の色で発光するboxshadowが強くなる
- 同時に、明るい白のきらりんエフェクトがカード全体を横断する
- ブラーがかかった光の表現で、より高級感のある演出に

#### 追加改善: ホバー時シャドウをさらに強化

ホバー時のシャドウをさらに強調：

```tsx
onMouseEnter={(e) => {
  e.currentTarget.style.boxShadow = `
    0 0 60px 8px ${theme.primary}90,    // 広範囲で非常に濃い発光
    0 0 40px 4px ${theme.primary}70,    // 中範囲の発光
    0 12px 48px ${theme.primary}80,     // 下方向への深い影（立体感）
    0 0 0 3px ${theme.primary}60,       // 太い縁取り
    inset 0 0 20px ${theme.primary}30   // 内側からの光（発光感を演出）
  `;
}}
```

**強化ポイント:**
- ✅ `60px 8px` の広範囲で非常に濃い発光（90%不透明度）
- ✅ 複数レイヤーの発光で立体感を表現
- ✅ `0 12px 48px` で下方向への深い影
- ✅ `3px` の太い縁取りで輪郭を強調
- ✅ `inset` で内側からも光る演出

これにより、ホバー時にカード全体が兵種の色で強く輝くようになります。

---

### 13. Button コンポーネントのアニメーション追加

#### 要求

- Button コンポーネントにホバー時とクリック時のアニメーションを追加

#### 実装内容

**1. 共通アニメーション（全variant共通）**

```tsx
"transition-all duration-200"    // 滑らかなトランジション（200ms）
"hover:scale-105"                // ホバー時に5%拡大
"active:scale-95"                // クリック時に5%縮小（押し込まれる感じ）
```

**2. variant別のアニメーション**

- **default**
  ```tsx
  hover:shadow-lg hover:shadow-primary/30 active:shadow-md
  ```
  - ホバー時：大きな影 + プライマリカラーの発光
  - クリック時：影が少し小さくなる

- **destructive**
  ```tsx
  hover:shadow-lg hover:shadow-destructive/30 active:shadow-md
  ```
  - ホバー時：大きな影 + destructiveカラーの発光
  - クリック時：影が少し小さくなる

- **outline**
  ```tsx
  hover:shadow-md hover:border-accent-foreground/20 active:shadow-sm
  ```
  - ホバー時：中程度の影 + ボーダーの強調
  - クリック時：影が小さくなる

- **secondary**
  ```tsx
  hover:shadow-lg hover:shadow-secondary/30 active:shadow-md
  ```
  - ホバー時：大きな影 + セカンダリカラーの発光
  - クリック時：影が少し小さくなる

- **ghost**
  ```tsx
  hover:shadow-md active:shadow-sm
  ```
  - ホバー時：中程度の影
  - クリック時：影が小さくなる

- **link**
  - アニメーションなし（下線のみ）

#### アニメーション効果

- ✅ **ホバー時**: ボタンが5%拡大し、影が大きくなって浮き上がる
- ✅ **クリック時**: ボタンが5%縮小し、影が小さくなって押し込まれる感じ
- ✅ **variant別の発光**: 各variantの色に応じた影の色で統一感を演出
- ✅ **滑らかなトランジション**: 200msで全てのプロパティがスムーズに変化
- ✅ **既存の機能維持**: フォーカスリング、無効状態などはそのまま

---

### 14. コンテキストメニューの拡張 - 向きと移動モード

#### 要求

- 右クリックした場所が軍内であれば「向き」メニューを表示し、サブメニューで上下左右を選択できる
- バトルフェーズのみ、軍内であれば「移動モード」メニューを表示

#### 実装内容

**1. battle.tsに定数を追加**

```typescript
// バトル中の移動モード
export const BATTLE_MOVE_MODE = {
  NONE: "NONE",
  MOVE: "MOVE",
} as const;

export type BattleMoveMode =
  (typeof BATTLE_MOVE_MODE)[keyof typeof BATTLE_MOVE_MODE];
```

**2. state.tsに状態を追加**

```typescript
export type AppState = {
  // ...既存の状態
  battleMoveMode: BattleMoveMode;
};

export const initialState: AppState = {
  // ...既存の初期値
  battleMoveMode: BATTLE_MOVE_MODE.NONE,
};
```

**3. slice.tsにアクションを追加**

```typescript
// ユーザーが軍の向きを変更する
changeArmyDirection: (
  state,
  action: PayloadAction<{ armyId: string; direction: ArmyDirection }>
) => {
  const army = state.armies.find((a) => a.id === action.payload.armyId);
  if (army) {
    army.direction = action.payload.direction;
  }
},

// ユーザーが移動モードを切り替える
switchBattleMoveMode: (state, action: PayloadAction<BattleMoveMode>) => {
  state.battleMoveMode = action.payload;
},
```

**4. Tile コンポーネントの更新**

タイルが軍に属しているかを判定：

```typescript
// このタイルが属している軍を見つける
const belongingArmy = armies.find((army) =>
  army.positions.some((pos) => pos.x === x && pos.y === y)
);
```

向き変更のハンドラー：

```typescript
const handleChangeDirection = (direction: ArmyDirection) => {
  if (belongingArmy) {
    dispatch(changeArmyDirection({ armyId: belongingArmy.id, direction }));
  }
};
```

コンテキストメニューにサブメニューを追加：

```tsx
{/* 軍に属している場合は「向き」サブメニューを表示 */}
{belongingArmy && (
  <>
    <ContextMenuSeparator />
    <ContextMenuSub>
      <ContextMenuSubTrigger>向き</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem onClick={() => handleChangeDirection(ARMY_DIRECTION.UP)}>
          上 {belongingArmy.direction === ARMY_DIRECTION.UP && " ✓"}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleChangeDirection(ARMY_DIRECTION.DOWN)}>
          下 {belongingArmy.direction === ARMY_DIRECTION.DOWN && " ✓"}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleChangeDirection(ARMY_DIRECTION.LEFT)}>
          左 {belongingArmy.direction === ARMY_DIRECTION.LEFT && " ✓"}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleChangeDirection(ARMY_DIRECTION.RIGHT)}>
          右 {belongingArmy.direction === ARMY_DIRECTION.RIGHT && " ✓"}
        </ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </>
)}

{/* バトルフェーズかつ軍に属している場合は「移動モード」を表示 */}
{phase === BATTLE_PHASE.BATTLE && belongingArmy && (
  <ContextMenuItem onClick={() => handleContextMenu("移動モード")}>
    移動モード
  </ContextMenuItem>
)}
```

#### 実装のポイント

- ✅ **軍の判定**: タイルの座標が軍のpositionsに含まれているかで判定
- ✅ **サブメニュー**: shadcn/ui の `ContextMenuSub`, `ContextMenuSubTrigger`, `ContextMenuSubContent` を使用
- ✅ **チェックマーク**: 現在の向きに ✓ を表示
- ✅ **条件付き表示**: 軍内のみ「向き」を表示、バトルフェーズのみ「移動モード」を表示
- ✅ **Redux action命名**: `changeArmyDirection`（ユーザーの操作を直接表現）

#### UX

**向きの変更:**
1. 軍内のマスを右クリック
2. 「向き」メニューが表示される
3. サブメニューで「上」「下」「左」「右」を選択
4. 現在の向きには ✓ が表示される

**移動モード:**
1. バトルフェーズ中に軍内のマスを右クリック
2. 「移動モード」メニューが表示される
3. 選択すると移動モードに切り替わる

---

### 15. マップ背景のサイバーグリッド演出

#### 要求

- マップの背景にTroopCardのような光り輝くサイバーな演出を追加
- マップと同じグリッド+ボーダー
- 背景色は`bg-slate-900`のまま維持

#### 実装内容

**1. widgets/Map/index.tsx - グリッドと発光エフェクト**

```tsx
<div
  className="w-full h-full overflow-hidden relative bg-slate-900"
  style={{
    backgroundImage: `
      linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: "50px 50px",
    boxShadow: `
      inset 0 0 60px rgba(59, 130, 246, 0.15),
      inset 0 0 30px rgba(59, 130, 246, 0.1),
      0 0 40px rgba(59, 130, 246, 0.2)
    `,
    border: "1px solid rgba(59, 130, 246, 0.3)",
    animation: "cyber-grid-glow 3s ease-in-out infinite alternate",
  }}
>
```

**2. App.css - 脈動アニメーション**

```css
@keyframes cyber-grid-glow {
  0% {
    box-shadow: inset 0 0 60px rgba(59, 130, 246, 0.15),
      inset 0 0 30px rgba(59, 130, 246, 0.1), 0 0 40px rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: inset 0 0 80px rgba(59, 130, 246, 0.25),
      inset 0 0 50px rgba(59, 130, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.35);
    border-color: rgba(59, 130, 246, 0.5);
  }
  100% {
    box-shadow: inset 0 0 60px rgba(59, 130, 246, 0.15),
      inset 0 0 30px rgba(59, 130, 246, 0.1), 0 0 40px rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.3);
  }
}
```

#### 視覚効果

- ✅ **グリッドパターン**: 50px x 50px（タイルサイズと一致）
- ✅ **青い発光ライン**: グリッドの線が青く発光
- ✅ **内側の光**: `inset` シャドウで内側から青い光が広がる
- ✅ **外側の光**: 周囲に青い発光エフェクト
- ✅ **脈動アニメーション**: 3秒かけて光が強くなったり弱くなったりする
- ✅ **背景色維持**: `bg-slate-900` のままでダークな雰囲気を保つ
- ✅ **TroopCardとの統一感**: 同じ青色のサイバー演出

#### デザインのポイント

- TroopCardの発光エフェクトと同じ色（`rgba(59, 130, 246, ...)`）を使用
- グリッドサイズをタイルサイズ（50px）に合わせることで、タイルとグリッドが一致
- `alternate` で無限ループの脈動アニメーション
- 内側と外側の両方から発光することで、立体感と深みを表現

#### 追加改善: 発光オーバーレイを前面に配置

**要求**

- 発光をマップより前面に配置し、将来的に攻撃方向に応じた演出を実装しやすくする

**実装内容**

```tsx
<div
  className="w-full h-full overflow-hidden relative bg-slate-900"
  style={{
    /* グリッドの背景のみ保持 */
    backgroundImage: `
      linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: "50px 50px",
  }}
>
  {/* サイバーグロウオーバーレイ - マップの前面 */}
  <div
    className="absolute inset-0 z-50"
    style={{
      pointerEvents: "none", // クリックイベントを透過
      boxShadow: `
        inset 0 0 60px rgba(59, 130, 246, 0.15),
        inset 0 0 30px rgba(59, 130, 246, 0.1),
        0 0 40px rgba(59, 130, 246, 0.2)
      `,
      border: "1px solid rgba(59, 130, 246, 0.3)",
      animation: "cyber-grid-glow 3s ease-in-out infinite alternate",
    }}
  />
  {/* マップコンテンツ */}
</div>
```

**メリット**

- ✅ 発光がタイル・ユニットより前面に来る
- ✅ 攻撃方向に応じた発光演出（例: 赤く早い脈動）が実装しやすい
- ✅ `pointer-events: none` でマップ操作を妨げない
- ✅ オーバーレイとして独立しているため、動的な色変更が容易

---

### 16. ArmyPopover のサイバーデザイン - TroopCard風の洗練されたスタイル

#### 要求

- 軍編成ポップオーバーをTroopCardのようなイケてるサイバーデザインに変更
- 和風の古臭いデザインから、モダンでサイバーな青い発光デザインへ

#### 実装内容

**1. 全体のコンテナ - ダークグラデーションと青い発光**

```tsx
<PopoverContent
  className="group w-96 relative overflow-hidden border-0 shadow-2xl"
  style={{
    background: "linear-gradient(135deg, rgb(30, 41, 59) 0%, rgb(15, 23, 42) 100%)",
    boxShadow: `
      0 0 60px 8px rgba(59, 130, 246, 0.4),
      0 0 40px 4px rgba(59, 130, 246, 0.3),
      0 12px 48px rgba(59, 130, 246, 0.5),
      0 0 0 1px rgba(59, 130, 246, 0.6),
      inset 0 0 20px rgba(59, 130, 246, 0.15)
    `,
  }}
>
```

**2. 背景の発光エフェクト**

```tsx
{/* Animated background glow */}
<div
  className="absolute inset-0 opacity-50"
  style={{
    background: "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.3), transparent 70%)",
  }}
/>

{/* Shimmer effect */}
<div className="absolute inset-0 pointer-events-none">
  <div
    className="absolute inset-0 -translate-x-full animate-shimmer"
    style={{
      background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1), transparent)",
      animation: "shimmer 3s ease-in-out infinite",
    }}
  />
</div>
```

**3. ヘッダー - 青いグラデーション**

```tsx
<div className="relative -mt-2 -mx-4 px-4 py-3 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-b border-blue-500/50 backdrop-blur-sm">
  <h3 className="relative text-white font-bold text-lg text-center tracking-wider drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
    軍 編 成
  </h3>
</div>
```

**4. 軍名入力 - ダークな入力フィールド**

```tsx
<Input
  className="flex-1 border border-blue-500/50 focus:border-blue-500 bg-slate-800/50 text-white font-medium placeholder:text-slate-400 shadow-inner"
  style={{
    boxShadow: "inset 0 0 10px rgba(59, 130, 246, 0.2)",
  }}
/>
```

**5. 士気 - 青い炎アイコン**

```tsx
<Flame
  className="h-8 w-8 transition-all duration-300 text-blue-400 fill-blue-400 animate-pulse"
  style={{
    filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))",
  }}
/>
```

**6. 向き - 青い発光ボックス**

```tsx
<div
  className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-400/50"
  style={{
    boxShadow: "0 0 15px rgba(59, 130, 246, 0.5), inset 0 0 10px rgba(59, 130, 246, 0.2)",
  }}
>
  <div className="text-blue-400" style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))" }}>
    {getDirectionIcon()}
  </div>
</div>
```

**7. 合計兵力 - 青い発光プログレスバー**

```tsx
<Progress
  value={healthPercentage}
  className="flex-1 h-6 bg-slate-700"
  style={{
    boxShadow: "inset 0 0 10px rgba(59, 130, 246, 0.3)",
  }}
/>
<span
  className="text-lg font-bold font-mono whitespace-nowrap text-white tabular-nums"
  style={{
    textShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
  }}
>
  {totalHealth.toLocaleString()} / {maxHealth.toLocaleString()}
</span>
```

**8. フッター - 青い発光ライン**

```tsx
<div
  className="relative -mb-2 -mx-4 h-1"
  style={{
    background: "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent)",
    boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
  }}
/>
```

**9. App.css - shimmerアニメーション**

```css
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
```

#### デザインの特徴

- ✅ **ダークグラデーション背景**: slate-700 → slate-900
- ✅ **青い多層発光**: 外側・内側の両方から青く発光
- ✅ **shimmerエフェクト**: 3秒周期で白い光が横断
- ✅ **背景グロー**: 上部から青い光が広がる
- ✅ **統一されたアクセントカラー**: 全て青（`rgba(59, 130, 246, ...)`）
- ✅ **半透明の背景**: `bg-slate-800/50` でガラスモーフィズム風
- ✅ **発光ボーダー**: `border-blue-500/30` で控えめな青い縁取り
- ✅ **テキストシャドウ**: 全てのテキストに青い発光エフェクト

#### TroopCardとの統一感

- 同じ青色（`rgba(59, 130, 246, ...)`）を使用
- 同じダークな背景グラデーション
- 同じshimmerエフェクト
- 同じ発光パターン（内側+外側）

---

### 17. きらりエフェクトの無限ループ化とポップオーバー位置の調整

#### 要求

- きらりエフェクトが途中で終わるのを直す → 無限ループにする
- ポップオーバーが開く位置を調整 → 上側に開くように

#### 実装内容

**1. ArmyPopover - shimmerエフェクトの無限ループ化**

```tsx
{/* Shimmer effect - 無限ループ */}
<div className="absolute inset-0 pointer-events-none overflow-hidden">
  <div
    className="absolute inset-0"
    style={{
      background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1), transparent)",
      animation: "shimmer 3s linear infinite",
    }}
  />
</div>
```

**変更点:**
- ✅ `ease-in-out` → `linear` に変更（等速で流れる）
- ✅ `overflow-hidden` を追加（はみ出さないように）
- ✅ `-translate-x-full` などのクラスを削除してCSSアニメーションに一元化

**2. PopoverContent - 位置の調整**

```tsx
<PopoverContent
  side="top"          // 上側に開く
  align="center"      // 中央揃え
  sideOffset={10}     // トリガーから10px離す
  // ...
>
```

**3. TroopCard - shimmerエフェクトの無限ループ化**

```tsx
{/* Shimmer effect - 無限ループ */}
<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
  <div
    className="absolute inset-0"
    style={{
      background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6), transparent)`,
      filter: "blur(8px)",
      animation: "shimmer 2s linear infinite",
    }}
  />
</div>
```

**変更点:**
- ✅ `animation: "shimmer 2s linear infinite"` を追加
- ✅ `overflow-hidden` を追加
- ✅ `transition-transform` などを削除してCSSアニメーションに統一

#### 改善ポイント

**きらりエフェクト:**
- ✅ **無限ループ**: `infinite` で永遠に流れ続ける
- ✅ **等速**: `linear` で一定速度で流れる
- ✅ **途切れない**: `overflow-hidden` ではみ出しを防ぐ
- ✅ **App.cssのkeyframes**: 既に定義済みの `@keyframes shimmer` を使用

**ポップオーバー位置:**
- ✅ **上側に開く**: `side="top"` でデフォルトを上側に
- ✅ **中央揃え**: `align="center"` で中央配置
- ✅ **適度な距離**: `sideOffset={10}` で10px離す
- ✅ **自動調整**: 上側にスペースがない場合は自動的に下側に開く

#### 視覚効果

- ArmyPopoverは常にきらりと光が流れ続ける
- TroopCardはホバー時にきらりと光が流れ続ける
- ポップオーバーは選択範囲の上側に表示される

---

### 18. きらりエフェクトの輝度調整とポップオーバー位置の修正

#### 要求

- きらりエフェクトが光りすぎ → 控えめに調整
- ポップオーバーの位置が治っていない → より確実に上側に表示

#### 実装内容

**1. ArmyPopover - shimmerエフェクトを控えめに**

```tsx
{/* Shimmer effect - 無限ループ（控えめ） */}
<div className="absolute inset-0 pointer-events-none overflow-hidden">
  <div
    className="absolute inset-0"
    style={{
      background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05), transparent)",
      animation: "shimmer 4s linear infinite",
    }}
  />
</div>
```

**変更点:**
- ✅ 不透明度を下げる: `0.1, 0.2` → `0.05, 0.1`（半分に）
- ✅ 速度を遅くする: `3s` → `4s`（よりゆっくり）

**2. TroopCard - shimmerエフェクトを控えめに**

```tsx
{/* Shimmer effect - 無限ループ（控えめ） */}
<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
  <div
    className="absolute inset-0"
    style={{
      background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3), transparent)`,
      filter: "blur(8px)",
      animation: "shimmer 3s linear infinite",
    }}
  />
</div>
```

**変更点:**
- ✅ 不透明度を下げる: `0.6, 0.9` → `0.3, 0.5`（約半分に）
- ✅ 速度を遅くする: `2s` → `3s`（よりゆっくり）

**3. PopoverContent - 位置の調整を強化**

```tsx
<PopoverContent
  side="top"                // 上側に開く
  align="center"            // 中央揃え
  sideOffset={20}           // トリガーから20px離す（10→20に増加）
  collisionPadding={20}     // 衝突検知の余白を20pxに設定
>
```

**変更点:**
- ✅ `sideOffset`: `10` → `20`（より上に）
- ✅ `collisionPadding`: `20` を追加（画面端との衝突を避ける）

#### 改善ポイント

**きらりエフェクト:**
- ✅ **控えめな輝度**: 不透明度を約半分に下げて眩しさを軽減
- ✅ **ゆっくりした動き**: アニメーション速度を遅くして落ち着いた印象
- ✅ **無限ループ維持**: `infinite` で永遠に流れ続ける

**ポップオーバー位置:**
- ✅ **より上に表示**: `sideOffset` を20pxに増やして選択範囲から離す
- ✅ **衝突検知**: `collisionPadding` で画面端との衝突を避ける
- ✅ **中央揃え**: `align="center"` で中央に配置

#### 視覚効果

- ArmyPopoverのきらりエフェクトがより上品で控えめに
- TroopCardのホバー時のきらりエフェクトも控えめで洗練された印象
- ポップオーバーが選択範囲の上側に確実に表示される

---

### 19. 汎用マップエフェクトシステムの実装

#### 要求

- 向き変更や攻撃受けなどのアクション時に、手軽にエフェクトを呼び出せる仕組み
- フラグをONにすると指定されたエフェクトが自動的に発動
- エフェクトの種類:
  - 向き変更: じわっと滲み出る黒い発光（特定の方向）
  - 攻撃を受ける: 早い脈動で赤く発光（特定の方向）

#### 実装内容

**1. states/battle.ts - エフェクト定数と型定義**

```typescript
// マップエフェクトの種類
export const MAP_EFFECT = {
  NONE: "NONE",
  DIRECTION_CHANGE: "DIRECTION_CHANGE", // 向き変更
  UNDER_ATTACK: "UNDER_ATTACK", // 攻撃を受ける
} as const;

export type MapEffect = {
  type: MapEffectType;
  direction?: "UP" | "DOWN" | "LEFT" | "RIGHT";
  timestamp: number; // 自動クリア用
};
```

**2. states/state.ts - Redux stateに追加**

```typescript
export type AppState = {
  // ...既存の状態
  mapEffect: MapEffect | null;
};
```

**3. states/slice.ts - アクション定義**

```typescript
// ユーザーがマップエフェクトを発火する
triggerMapEffect: (
  state,
  action: PayloadAction<{
    type: MapEffectType;
    direction?: "UP" | "DOWN" | "LEFT" | "RIGHT";
  }>
) => {
  state.mapEffect = {
    type: action.payload.type,
    direction: action.payload.direction,
    timestamp: Date.now(),
  };
},

// マップエフェクトをクリアする
clearMapEffect: (state) => {
  state.mapEffect = null;
},
```

**4. widgets/Map/MapEffectOverlay.tsx - エフェクトオーバーレイ**

エフェクトタイプと方向に応じた発光を動的に生成:

```typescript
const getEffectStyle = (effect: MapEffect): React.CSSProperties => {
  switch (effect.type) {
    case MAP_EFFECT.DIRECTION_CHANGE:
      return {
        boxShadow: getDirectionalShadow(effect.direction, "0, 0, 0", "0.6"),
        animation: "direction-change-glow 1.5s ease-out forwards",
      };

    case MAP_EFFECT.UNDER_ATTACK:
      return {
        boxShadow: getDirectionalShadow(effect.direction, "239, 68, 68", "0.8"),
        animation: "under-attack-pulse 0.4s ease-in-out 4",
      };
  }
};

const getDirectionalShadow = (
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT" | undefined,
  rgbColor: string,
  opacity: string
): string => {
  switch (direction) {
    case "UP":
      return `inset 0 100px 80px -40px rgba(${rgbColor}, ${opacity})`;
    case "DOWN":
      return `inset 0 -100px 80px -40px rgba(${rgbColor}, ${opacity})`;
    case "LEFT":
      return `inset 100px 0 80px -40px rgba(${rgbColor}, ${opacity})`;
    case "RIGHT":
      return `inset -100px 0 80px -40px rgba(${rgbColor}, ${opacity})`;
  }
};
```

自動クリア機能:

```typescript
useEffect(() => {
  if (!mapEffect) return;

  const duration = getDuration(mapEffect.type);
  const timer = setTimeout(() => {
    dispatch(clearMapEffect());
  }, duration);

  return () => clearTimeout(timer);
}, [mapEffect, dispatch]);
```

**5. App.css - アニメーション定義**

```css
/* 向き変更エフェクト: じわっと滲み出る黒い発光 */
@keyframes direction-change-glow {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* 攻撃を受けるエフェクト: 早い脈動で赤く発光 */
@keyframes under-attack-pulse {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
```

**6. widgets/Map/index.tsx - BattleMapに統合**

```tsx
{/* マップエフェクトオーバーレイ - 攻撃や向き変更のエフェクト */}
<MapEffectOverlay />

{/* サイバーグロウオーバーレイ - マップの前面 */}
<div className="absolute inset-0 z-50" ... />
```

#### 使い方

**向き変更時:**

```typescript
// 軍の向きを変更
dispatch(changeArmyDirection({ armyId, direction: "UP" }));

// エフェクトを発火
dispatch(triggerMapEffect({
  type: MAP_EFFECT.DIRECTION_CHANGE,
  direction: "UP"
}));

// 1.5秒後に自動的にクリアされる
```

**攻撃を受けた時:**

```typescript
// 下方向から攻撃を受けた
dispatch(triggerMapEffect({
  type: MAP_EFFECT.UNDER_ATTACK,
  direction: "DOWN"
}));

// 0.4秒 × 4回の脈動後、自動的にクリアされる
```

#### システムの特徴

- ✅ **手軽な呼び出し**: `dispatch(triggerMapEffect(...))` だけで発動
- ✅ **自動クリア**: エフェクトに応じた時間で自動的に消える
- ✅ **方向指定**: 上下左右どの方向からのエフェクトかを指定可能
- ✅ **拡張可能**: 新しいエフェクトタイプを追加しやすい設計
- ✅ **パフォーマンス**: `pointer-events: none` でマップ操作を妨げない
- ✅ **視覚的フィードバック**: ユーザーのアクションに対する明確な応答

#### エフェクトの詳細

**DIRECTION_CHANGE（向き変更）:**
- 色: 黒（`rgba(0, 0, 0, 0.6)`）
- アニメーション: じわっと滲み出る（1.5秒）
- 使用例: 軍の向きを変更した時

**UNDER_ATTACK（攻撃を受ける）:**
- 色: 赤（`rgba(239, 68, 68, 0.8)` = red-500）
- アニメーション: 早い脈動（0.4秒 × 4回 = 1.6秒）
- 使用例: 敵から攻撃を受けた時

#### 将来の拡張性

新しいエフェクトタイプを追加する場合:
1. `MAP_EFFECT` に定数を追加
2. `getEffectStyle` に新しいcaseを追加
3. App.cssにアニメーションを定義
4. 必要に応じて `getDuration` を調整

#### 実装例: 向き変更時にエフェクトを適用

**widgets/Map/Tile/index.tsx - handleChangeDirection**

```typescript
const handleChangeDirection = (direction: typeof ARMY_DIRECTION[keyof typeof ARMY_DIRECTION]) => {
  if (belongingArmy) {
    dispatch(changeArmyDirection({ armyId: belongingArmy.id, direction }));

    // 向き変更エフェクトを発火
    dispatch(triggerMapEffect({
      type: MAP_EFFECT.DIRECTION_CHANGE,
      direction: direction as "UP" | "DOWN" | "LEFT" | "RIGHT",
    }));
  }
};
```

**動作:**
1. 軍内のマスを右クリック → 「向き」→ 方向を選択
2. 軍の向きが変更される
3. 指定した方向からじわっと黒い発光が滲み出る（1.5秒）
4. 自動的にエフェクトがクリアされる
