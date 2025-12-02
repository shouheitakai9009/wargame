# Redux State Management

このディレクトリには、Redux Toolkit を使用したグローバル状態管理の設定が含まれています。

## ファイル構成

- `store.ts` - Redux store の設定
- `hooks.ts` - 型安全な Redux hooks
- `exampleSlice.ts` - サンプルの slice (実際の機能に置き換えてください)

## 使用方法

### 1. Slice の作成

新しい機能の状態管理を追加する場合は、新しい slice ファイルを作成します:

```typescript
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface FeatureState {
  // 状態の型定義
}

const initialState: FeatureState = {
  // 初期状態
};

export const featureSlice = createSlice({
  name: "feature",
  initialState,
  reducers: {
    action: (state, action: PayloadAction<Type>) => {
      // 状態更新ロジック
    },
  },
});

export const { action } = featureSlice.actions;
export default featureSlice.reducer;
```

### 2. Store への登録

`store.ts` で reducer を登録:

```typescript
import featureReducer from "./featureSlice";

export const store = configureStore({
  reducer: {
    feature: featureReducer,
  },
});
```

### 3. コンポーネントでの使用

```typescript
import { useAppDispatch, useAppSelector } from "@/states/hooks";
import { action } from "@/states/featureSlice";

function Component() {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.feature.data);

  const handleAction = () => {
    dispatch(action(payload));
  };

  return <div>{data}</div>;
}
```

## ベストプラクティス

- 常に `useAppDispatch` と `useAppSelector` を使用してください (型安全性のため)
- Slice は機能ごとに分割してください
- 複雑な非同期処理には `createAsyncThunk` を使用してください
- Immer が組み込まれているため、reducer で直接状態を変更できます
