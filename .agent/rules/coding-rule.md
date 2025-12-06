---
trigger: always_on
---

# コーディングルール

## [MUST] svg やデータ以外は、1 ファイルは最大で 300 行までとすること。

ファイルが肥大化する原因は、役割ごとに分解できていない、ロジックをフックに切り出せていないため、
こういったファイルを見かけた場合は、ユーザに許可をとり即座にリファクタリングを行うこと。これはとても重要な仕事です。
リファクタリングといってもここで行うのは適切な役割ごとにディレクトリやファイルを移し替えることとなります。

## [MUST] 使用するライブラリの公式ガイド通りにベストプラクティスを使い、アンチパターンを避けること

context7 mcp を使用し、コンテキストにあった公式ドキュメントを参照し、必ずベストプラクティスを使い、アンチパターンを避けること

### 具体的な手順

1. 新しいライブラリやフレームワークの機能を使う前に、必ず公式ドキュメントを参照する
2. 公式が推奨するパターンに従う
3. 公式が非推奨としているパターンは絶対に使わない

### ✅ 良い例

```tsx
// React 18のuseTransitionを使用する際、公式ドキュメントを参照してベストプラクティスに従う
import { useTransition } from "react";

function SearchResults() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 緊急性の低い更新をuseTransitionでラップ
    startTransition(() => {
      setQuery(e.target.value);
    });
  };

  return (
    <>
      <input onChange={handleChange} />
      {isPending && <Spinner />}
      <Results query={query} />
    </>
  );
}
```

### ❌ 悪い例

```tsx
// 公式ドキュメントを読まずに、推測で実装したり古いパターンを使う
import { useState, useEffect } from "react";

function SearchResults() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // useTransitionを使うべき場面で手動でloading状態を管理
    setLoading(true);
    setTimeout(() => {
      setQuery(e.target.value);
      setLoading(false);
    }, 0);
  };

  return (
    <>
      <input onChange={handleChange} />
      {loading && <Spinner />}
      <Results query={query} />
    </>
  );
}
```

## [MUST] カラーコードや CSS 変数は@shadcn/ui の Theming に従う

https://ui.shadcn.com/docs/theming を参考にする

shadcn/ui はカラーパレットを CSS 変数で管理しています。直接カラーコードを指定せず、必ずテーマの CSS 変数を使用してください。

### ✅ 良い例

```tsx
// shadcn/uiのテーマ変数を使用
function ArmyCard({ army }: { army: Army }) {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg p-4">
      <h3 className="text-primary font-bold">{army.name}</h3>
      <p className="text-muted-foreground">{army.description}</p>
      <button className="bg-primary text-primary-foreground hover:bg-primary/90">
        選択
      </button>
    </div>
  );
}

// カスタムコンポーネントでもCSS変数を使用
function StatusBadge({ status }: { status: "active" | "inactive" }) {
  return (
    <span
      className={
        status === "active"
          ? "bg-green-500/10 text-green-700 dark:text-green-400"
          : "bg-muted text-muted-foreground"
      }
    >
      {status}
    </span>
  );
}
```

### ❌ 悪い例

```tsx
// 直接カラーコードを指定（テーマに対応しない）
function ArmyCard({ army }: { army: Army }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff", // ダークモードで対応できない
        color: "#000000",
        border: "1px solid #e5e5e5",
      }}
    >
      <h3 style={{ color: "#0070f3" }}>{army.name}</h3>
      <p style={{ color: "#666666" }}>{army.description}</p>
      <button
        style={{
          backgroundColor: "#0070f3",
          color: "#ffffff",
        }}
      >
        選択
      </button>
    </div>
  );
}

// Tailwindの色を直接使用（テーマとの一貫性がない）
function StatusBadge({ status }: { status: "active" | "inactive" }) {
  return (
    <span
      className={
        status === "active"
          ? "bg-blue-500 text-white"
          : "bg-gray-300 text-black"
      }
    >
      {status}
    </span>
  );
}
```

## [MUST] designs レベルのコンポーネントの追加・編集時に@shadcn/ui が使用できないか必ず見る

shadcn mcp をインストール済みなので、mcp を介しコンポーネントを探索して下さい。

### 手順

1. 新しいコンポーネントが必要になったら、まず shadcn/ui に同等のコンポーネントがないか確認
2. shadcn/ui にある場合は、それをインストールして使用
3. ない場合のみ、カスタムコンポーネントを作成

### ✅ 良い例

```tsx
// ボタンコンポーネントが必要な場合、shadcn/uiのButtonを使用
import { Button } from "@/designs/ui/button";

function ArmyActions({
  onAttack,
  onDefend,
}: {
  onAttack: () => void;
  onDefend: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button variant="default" onClick={onAttack}>
        攻撃
      </Button>
      <Button variant="outline" onClick={onDefend}>
        防御
      </Button>
    </div>
  );
}

// ダイアログが必要な場合、shadcn/uiのDialogを使用
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/designs/ui/dialog";

function ArmyDetail({ army }: { army: Army }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">詳細を見る</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{army.name}</DialogTitle>
          <DialogDescription>{army.description}</DialogDescription>
        </DialogHeader>
        <ArmyStats stats={army.stats} />
      </DialogContent>
    </Dialog>
  );
}
```

### ❌ 悪い例

```tsx
// shadcn/uiに同等のコンポーネントがあるのに、車輪の再発明をする
function CustomButton({
  children,
  variant = "default",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
  onClick: () => void;
}) {
  const baseStyles = "px-4 py-2 rounded font-medium";
  const variantStyles =
    variant === "default"
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "border border-gray-300 hover:bg-gray-100";

  return (
    <button className={`${baseStyles} ${variantStyles}`} onClick={onClick}>
      {children}
    </button>
  );
}

// アクセシビリティやフォーカス管理が不十分な独自ダイアログ
function CustomDialog({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose} // 背景クリックでしか閉じられない
    >
      <div
        className="bg-white p-6 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        {/* ESCキーでの閉じる機能がない、フォーカストラップもない */}
      </div>
    </div>
  );
}
```

## [MUST] state 管理は基本的に redux で行う

機能を横断しない UI の状態（例：フォーカス、ホバー等）は、ローカルステートで持つ方が効率が良い場合に限り、ローカルステートで保持する。
それ以外は基本的に redux で管理する。

### ✅ 良い例

```tsx
// ローカルステートが適切な例: 単一コンポーネント内のUI状態
function SearchInput() {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <input
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={isFocused ? "focused" : ""}
    />
  );
}

// Reduxが適切な例: アプリケーション全体で使用するデータ
function ArmyList() {
  const armies = useAppSelector((state) => state.game.armies);
  const dispatch = useAppDispatch();

  const handleCreateArmy = (name: string) => {
    dispatch(createArmy({ name }));
  };

  return (
    <div>
      {armies.map((army) => (
        <ArmyCard key={army.id} army={army} />
      ))}
    </div>
  );
}

// Reduxが適切な例: 複数コンポーネントで共有するフィルター状態
function TroopFilter() {
  const filter = useAppSelector((state) => state.ui.troopFilter);
  const dispatch = useAppDispatch();

  return (
    <select
      value={filter}
      onChange={(e) => dispatch(setTroopFilter(e.target.value))}
    >
      <option value="all">全て</option>
      <option value="infantry">歩兵</option>
      <option value="cavalry">騎兵</option>
    </select>
  );
}

function TroopList() {
  const troops = useAppSelector((state) => state.game.troops);
  const filter = useAppSelector((state) => state.ui.troopFilter);

  const filteredTroops = troops.filter((troop) =>
    filter === "all" ? true : troop.type === filter
  );

  return (
    <div>
      {filteredTroops.map((troop) => (
        <TroopCard key={troop.id} troop={troop} />
      ))}
    </div>
  );
}
```

### ❌ 悪い例

```tsx
// アンチパターン: アプリケーション全体で使うデータをローカルステートで管理
function GameBoard() {
  const [armies, setArmies] = useState<Army[]>([]);
  const [troops, setTroops] = useState<Troop[]>([]);

  // 他のコンポーネントでこのデータが必要な場合、propsで渡す必要がある
  // データの同期が困難になる
  return (
    <div>
      <ArmyPanel armies={armies} onUpdateArmy={setArmies} />
      <TroopPanel troops={troops} armies={armies} onUpdateTroop={setTroops} />
      <BattleLog armies={armies} troops={troops} />
    </div>
  );
}

// アンチパターン: 単純なUI状態をReduxで管理
// これはオーバーエンジニアリング
function Button() {
  const isHovered = useAppSelector((state) => state.ui.buttonHovered);
  const dispatch = useAppDispatch();

  return (
    <button
      onMouseEnter={() => dispatch(setButtonHovered(true))}
      onMouseLeave={() => dispatch(setButtonHovered(false))}
    >
      Click me
    </button>
  );
}

// アンチパターン: 複数コンポーネントで共有するフィルター状態をローカルで管理
function ParentComponent() {
  const [filter, setFilter] = useState("all");

  // propsのバケツリレーが発生
  return (
    <div>
      <TroopFilter filter={filter} onFilterChange={setFilter} />
      <TroopList filter={filter} />
      <TroopStats filter={filter} />
    </div>
  );
}
```

## [MUST] redux action の命名はユーザ操作を直接表す

Action 名は「何が起きたか」をユーザーの視点から表現します。技術的な状態変更ではなく、ビジネスロジックやユーザーの意図を反映した命名にしてください。

### 命名の基本原則

1. **動詞で始める**: `createArmy`, `moveArmy`, `attackEnemy` など
2. **ユーザーの意図を表現**: `setPosition` ではなく `moveArmy`
3. **過去形ではなく現在形**: `armyMoved` ではなく `moveArmy`
4. **具体的に**: `update` ではなく `upgradeTroop`, `healSoldier` など

### ✅ 良い例

```typescript
// ユーザーの操作を直接表現
const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // ✅ ユーザーが戦闘を開始する
    startBattle: (state) => {
      state.phase = "battle";
      state.turn = 1;
    },

    // ✅ ユーザーが軍を移動する
    moveArmy: (
      state,
      action: PayloadAction<{ armyId: string; position: Position }>
    ) => {
      const army = state.armies.find((a) => a.id === action.payload.armyId);
      if (army) {
        army.position = action.payload.position;
      }
    },

    // ✅ ユーザーが敵を攻撃する
    attackEnemy: (
      state,
      action: PayloadAction<{ attackerId: string; targetId: string }>
    ) => {
      const attacker = state.troops.find(
        (t) => t.id === action.payload.attackerId
      );
      const target = state.troops.find((t) => t.id === action.payload.targetId);
      if (attacker && target) {
        target.health -= attacker.attack;
      }
    },

    // ✅ ユーザーが兵を配置する
    deploySoldier: (
      state,
      action: PayloadAction<{ type: SoldierType; position: Position }>
    ) => {
      state.soldiers.push({
        id: generateId(),
        type: action.payload.type,
        position: action.payload.position,
      });
    },

    // ✅ ユーザーが軍の向きを変更する
    rotateArmy: (
      state,
      action: PayloadAction<{ armyId: string; direction: Direction }>
    ) => {
      const army = state.armies.find((a) => a.id === action.payload.armyId);
      if (army) {
        army.direction = action.payload.direction;
      }
    },

    // ✅ ユーザーがターンを終了する
    endTurn: (state) => {
      state.turn += 1;
      state.currentPlayer = state.currentPlayer === "player" ? "ai" : "player";
    },
  },
});
```

### ❌ 悪い例

```typescript
// 技術的な状態変更を表現している（ユーザーの意図が不明）
const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // ❌ 何をしたいのか不明（戦闘を開始するのか？）
    setPhase: (state, action: PayloadAction<string>) => {
      state.phase = action.payload;
    },

    // ❌ 技術的な状態変更（ユーザーは「軍を移動する」と考えている）
    setArmyPosition: (
      state,
      action: PayloadAction<{ armyId: string; position: Position }>
    ) => {
      const army = state.armies.find((a) => a.id === action.payload.armyId);
      if (army) {
        army.position = action.payload.position;
      }
    },

    // ❌ 過去形を使用している
    armyMoved: (
      state,
      action: PayloadAction<{ armyId: string; position: Position }>
    ) => {
      const army = state.armies.find((a) => a.id === action.payload.armyId);
      if (army) {
        army.position = action.payload.position;
      }
    },

    // ❌ 抽象的すぎる（何をupdateするのか？）
    updateData: (state, action: PayloadAction<any>) => {
      // ...
    },

    // ❌ 技術的なCRUD操作（ユーザーの意図が不明）
    addItem: (state, action: PayloadAction<Soldier>) => {
      state.soldiers.push(action.payload);
    },

    // ❌ 単なるsetter（ユーザーの操作を表現していない）
    setDirection: (
      state,
      action: PayloadAction<{ armyId: string; direction: Direction }>
    ) => {
      const army = state.armies.find((a) => a.id === action.payload.armyId);
      if (army) {
        army.direction = action.payload.direction;
      }
    },
  },
});
```

### 良い命名パターン集

| ユーザーの操作         | ✅ 良い命名      | ❌ 悪い命名                          |
| ---------------------- | ---------------- | ------------------------------------ |
| 戦闘を開始する         | `startBattle`    | `setBattleState`, `setPhase`         |
| 軍を移動する           | `moveArmy`       | `setArmyPosition`, `updatePosition`  |
| 敵を攻撃する           | `attackEnemy`    | `decreaseHealth`, `updateTarget`     |
| 兵を配置する           | `deploySoldier`  | `addSoldier`, `createUnit`           |
| 軍の向きを変える       | `rotateArmy`     | `setDirection`, `changeDirection`    |
| ターンを終了する       | `endTurn`        | `incrementTurn`, `nextTurn`          |
| 兵をレベルアップする   | `upgradeSoldier` | `updateLevel`, `setSoldierStats`     |
| 負傷した兵を回復する   | `healSoldier`    | `addHealth`, `updateHealth`          |
| 軍を解散する           | `disbandArmy`    | `deleteArmy`, `removeArmy`           |
| 兵カードをドラッグ開始 | `beginTroopDrag` | `setDraggingTroop`, `setDragState`   |
| 兵カードをドラッグ終了 | `endTroopDrag`   | `setDraggingTroop`, `clearDragState` |

## [MUST] ドラッグ&ドロップの視覚フィードバックは明確に区別する

ドラッグ&ドロップ機能を実装する際は、ユーザーが「どこにドロップできるか」を明確に理解できるよう、視覚的なフィードバックを適切に設計してください。

### 基本原則

1. **ドラッグ中は全ての有効なドロップゾーンをハイライト**
2. **現在カーソルが重なっているドロップ対象は、他のゾーンと明確に区別**
3. **視覚的な階層を作る**: 通常 < ドロップ可能 < ドロップ対象

### ✅ 良い例

```tsx
// ドラッグ状態をReduxで管理
const isDraggingTroop = useAppSelector((state) => state.app.isDraggingTroop);
const { dropProps, isDropTarget } = useDrop({ ... });

return (
  <div
    {...dropProps}
    style={{
      // ドロップ対象: 最も明確（緑のボーダー + グロー + 高輝度）
      ...(isPlacementZone && isDropTarget && {
        filter: "brightness(1.5)",
        border: "2px solid rgba(34, 197, 94, 0.8)",
        boxShadow: "0 0 12px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.3)",
      }),
      // ドラッグ中の配置可能エリア: 控えめなハイライト
      ...(isPlacementZone && isDraggingTroop && !isDropTarget && {
        filter: "brightness(1.2)",
        border: "1px solid rgba(100, 116, 139, 0.2)",
      }),
      // 通常時
      ...(!isPlacementZone && {
        border: "1px solid rgba(100, 116, 139, 0.2)",
      }),
    }}
  >
    {children}
  </div>
);
```

### ❌ 悪い例

```tsx
// アンチパターン1: ドロップ対象と他のゾーンが区別できない
return (
  <div
    {...dropProps}
    style={{
      // 全て同じハイライト（どこにドロップできるか分からない）
      filter:
        isPlacementZone && (isDraggingTroop || isDropTarget)
          ? "brightness(1.3)"
          : undefined,
    }}
  >
    {children}
  </div>
);

// アンチパターン2: ドラッグ中に配置可能エリアが表示されない
return (
  <div
    {...dropProps}
    style={{
      // ドロップ対象のみハイライト（他の配置可能エリアが分からない）
      filter: isDropTarget ? "brightness(1.3)" : undefined,
    }}
  >
    {children}
  </div>
);

// アンチパターン3: ローカルステートでドラッグ状態を管理
// 全てのタイルで個別にドラッグ状態を検知しようとする（非効率）
const [isDragOver, setIsDragOver] = useState(false);

return (
  <div
    onDragEnter={() => setIsDragOver(true)}
    onDragLeave={() => setIsDragOver(false)}
    style={{
      filter: isDragOver ? "brightness(1.3)" : undefined,
    }}
  >
    {children}
  </div>
);
```

### 実装チェックリスト

- [ ] ドラッグ開始時に、全ての有効なドロップゾーンがハイライトされる
- [ ] ドロップ対象（カーソルが重なっているマス）は、他のゾーンと明確に区別できる
- [ ] ドラッグ状態は Redux で管理し、全コンポーネントで共有している
- [ ] ドラッグ開始/終了のタイミングで、視覚フィードバックが即座に反映される
- [ ] 色、ボーダー、シャドウなどを組み合わせて、視覚的な階層を作っている

## [MUST] composition パターンを採用する

コンポーネントの柔軟性と再利用性を高めるため、composition パターンを採用する。
props で全てを制御するのではなく、children や render props を活用する。

### ✅ 良い例

```tsx
// Composition パターン: 柔軟性が高く、再利用しやすい
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
}

// 使用例: 様々なコンテンツを柔軟に配置できる
function ArmyCard({ army }: { army: Army }) {
  return (
    <Card>
      <CardHeader>
        <h2>{army.name}</h2>
        <ArmyStatus status={army.status} />
      </CardHeader>
      <CardBody>
        <ArmyStats stats={army.stats} />
        <TroopList troops={army.troops} />
      </CardBody>
    </Card>
  );
}

function BattleResultCard({ result }: { result: BattleResult }) {
  return (
    <Card>
      <CardHeader>
        <h2>戦闘結果</h2>
      </CardHeader>
      <CardBody>
        <WinnerDisplay winner={result.winner} />
        <CasualtyReport casualties={result.casualties} />
      </CardBody>
    </Card>
  );
}

// Render props パターン: データと表示を分離
function DataList<T>({
  items,
  renderItem,
  emptyMessage,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <div className="empty">{emptyMessage}</div>;
  }

  return <div className="list">{items.map(renderItem)}</div>;
}

// 使用例
function ArmyListView() {
  const armies = useAppSelector((state) => state.game.armies);

  return (
    <DataList
      items={armies}
      renderItem={(army) => <ArmyCard key={army.id} army={army} />}
      emptyMessage="軍隊がありません"
    />
  );
}

function TroopListView() {
  const troops = useAppSelector((state) => state.game.troops);

  return (
    <DataList
      items={troops}
      renderItem={(troop) => <TroopCard key={troop.id} troop={troop} />}
      emptyMessage="部隊がありません"
    />
  );
}
```

### ❌ 悪い例

```tsx
// アンチパターン: propsで全てを制御しようとする
// 柔軟性が低く、新しい要件に対応しづらい
function Card({
  title,
  subtitle,
  showStatus,
  status,
  showStats,
  stats,
  showTroops,
  troops,
  showBattleResult,
  battleResult,
}: {
  title: string;
  subtitle?: string;
  showStatus?: boolean;
  status?: string;
  showStats?: boolean;
  stats?: Stats;
  showTroops?: boolean;
  troops?: Troop[];
  showBattleResult?: boolean;
  battleResult?: BattleResult;
}) {
  return (
    <div className="card">
      <div className="card-header">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
        {showStatus && status && <span>{status}</span>}
      </div>
      <div className="card-body">
        {showStats && stats && <ArmyStats stats={stats} />}
        {showTroops && troops && <TroopList troops={troops} />}
        {showBattleResult && battleResult && (
          <BattleResult result={battleResult} />
        )}
      </div>
    </div>
  );
}

// 使用例: propsが多すぎて可読性が低い
function ArmyCard({ army }: { army: Army }) {
  return (
    <Card
      title={army.name}
      showStatus
      status={army.status}
      showStats
      stats={army.stats}
      showTroops
      troops={army.troops}
    />
  );
}

// アンチパターン: リストコンポーネントが特定のデータ型に依存
// 再利用性が低い
function ArmyList({ armies }: { armies: Army[] }) {
  if (armies.length === 0) {
    return <div className="empty">軍隊がありません</div>;
  }

  return (
    <div className="list">
      {armies.map((army) => (
        <ArmyCard key={army.id} army={army} />
      ))}
    </div>
  );
}

// 部隊用に同じようなコンポーネントを別途作成する必要がある
function TroopList({ troops }: { troops: Troop[] }) {
  if (troops.length === 0) {
    return <div className="empty">部隊がありません</div>;
  }

  return (
    <div className="list">
      {troops.map((troop) => (
        <TroopCard key={troop.id} troop={troop} />
      ))}
    </div>
  );
}
```

## [MUST] 1 つのコンポーネントに複数の役割を持たせない

各コンポーネントは単一の責任を持つべき。データ取得、ビジネスロジック、UI 表示を 1 つのコンポーネントに詰め込まない。

### ✅ 良い例

```tsx
// データ取得とロジックを担当するコンポーネント
function ArmyListContainer() {
  const armies = useAppSelector((state) => state.game.armies);
  const dispatch = useAppDispatch();

  const handleCreateArmy = (name: string) => {
    dispatch(createArmy({ name }));
  };

  const handleDeleteArmy = (id: string) => {
    dispatch(deleteArmy(id));
  };

  return (
    <ArmyListView
      armies={armies}
      onCreateArmy={handleCreateArmy}
      onDeleteArmy={handleDeleteArmy}
    />
  );
}

// UI表示のみを担当するコンポーネント
function ArmyListView({
  armies,
  onCreateArmy,
  onDeleteArmy,
}: {
  armies: Army[];
  onCreateArmy: (name: string) => void;
  onDeleteArmy: (id: string) => void;
}) {
  return (
    <div className="army-list">
      <ArmyCreateForm onSubmit={onCreateArmy} />
      {armies.map((army) => (
        <ArmyCard
          key={army.id}
          army={army}
          onDelete={() => onDeleteArmy(army.id)}
        />
      ))}
    </div>
  );
}

// フォーム処理のみを担当するコンポーネント
function ArmyCreateForm({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name);
      setName("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="軍隊名"
      />
      <button type="submit">作成</button>
    </form>
  );
}

// 単一のカード表示のみを担当するコンポーネント
function ArmyCard({ army, onDelete }: { army: Army; onDelete: () => void }) {
  return (
    <div className="army-card">
      <h3>{army.name}</h3>
      <ArmyStats stats={army.stats} />
      <button onClick={onDelete}>削除</button>
    </div>
  );
}
```

### ❌ 悪い例

```tsx
// アンチパターン: データ取得、状態管理、フォーム処理、UI表示を全て1つのコンポーネントで行う
// 責任が多すぎて、テスト、保守、再利用が困難
function ArmyManagement() {
  // データ取得
  const armies = useAppSelector((state) => state.game.armies);
  const dispatch = useAppDispatch();

  // フォーム状態
  const [newArmyName, setNewArmyName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // UI状態
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedArmyId, setSelectedArmyId] = useState<string | null>(null);

  // ビジネスロジック
  const handleCreateArmy = (e: React.FormEvent) => {
    e.preventDefault();
    if (newArmyName.trim()) {
      dispatch(createArmy({ name: newArmyName }));
      setNewArmyName("");
      setShowCreateForm(false);
    }
  };

  const handleDeleteArmy = (id: string) => {
    if (confirm("本当に削除しますか?")) {
      dispatch(deleteArmy(id));
      if (selectedArmyId === id) {
        setSelectedArmyId(null);
      }
    }
  };

  const handleEditArmy = (id: string) => {
    setEditingId(id);
    const army = armies.find((a) => a.id === id);
    if (army) {
      setEditingName(army.name);
    }
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      dispatch(updateArmy({ id: editingId, name: editingName }));
      setEditingId(null);
      setEditingName("");
    }
  };

  // 複雑なUI表示ロジック
  return (
    <div className="army-management">
      <div className="header">
        <h1>軍隊管理</h1>
        <button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "キャンセル" : "新規作成"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateArmy}>
          <input
            type="text"
            value={newArmyName}
            onChange={(e) => setNewArmyName(e.target.value)}
            placeholder="軍隊名"
          />
          <button type="submit">作成</button>
        </form>
      )}

      <div className="army-list">
        {armies.map((army) => (
          <div
            key={army.id}
            className={selectedArmyId === army.id ? "selected" : ""}
            onClick={() => setSelectedArmyId(army.id)}
          >
            {editingId === army.id ? (
              <div>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <button onClick={handleSaveEdit}>保存</button>
                <button onClick={() => setEditingId(null)}>キャンセル</button>
              </div>
            ) : (
              <div>
                <h3>{army.name}</h3>
                <div className="stats">
                  <span>兵力: {army.stats.strength}</span>
                  <span>士気: {army.stats.morale}</span>
                </div>
                <button onClick={() => handleEditArmy(army.id)}>編集</button>
                <button onClick={() => handleDeleteArmy(army.id)}>削除</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedArmyId && (
        <div className="army-detail">{/* 詳細表示のロジックもここに... */}</div>
      )}
    </div>
  );
}
```

## マジックナンバーは必ず定数化する

className に書く`w-[50]px`や hoge.length > 3 などのマジックナンバーは states/配下にドメインを切って定数化する
