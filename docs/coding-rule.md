# コーディングルール

## [MUST] 使用するライブラリの公式ガイド通りにベストプラクティスを使い、アンチパターンを避けること

context7 mcp を使用し、コンテキストにあった公式ドキュメントを参照し、必ずベストプラクティスを使い、アンチパターンを避けること

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
