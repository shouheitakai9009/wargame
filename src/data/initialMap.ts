import { TERRAIN_TYPE, type Terrain } from "../states/terrain";

// 30x30の平原マップを生成
// 座標は (x, y) で、インデックスは y * 30 + x
const MAP_WIDTH = 30;
const MAP_HEIGHT = 30;

// デフォルトは全て草原
const map: Terrain[] = Array.from({ length: MAP_WIDTH * MAP_HEIGHT }, () => ({
  type: TERRAIN_TYPE.GRASS,
  height: 1,
}));

// ヘルパー関数：座標をインデックスに変換
const getIndex = (x: number, y: number): number => y * MAP_WIDTH + x;

// ヘルパー関数：範囲内チェック
const isInBounds = (x: number, y: number): boolean =>
  x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT;

// ヘルパー関数：地形を設定
const setTerrain = (
  x: number,
  y: number,
  type: (typeof TERRAIN_TYPE)[keyof typeof TERRAIN_TYPE],
  height: 1 | 2 | 3
) => {
  if (isInBounds(x, y)) {
    map[getIndex(x, y)] = { type, height };
  }
};

// === 川（水）の配置 - 蛇行する川 ===
// 北から南へ蛇行しながら流れる川
const riverPath: [number, number][] = [
  // 上流（北部）- やや左寄りから開始
  [13, 0], [14, 0],
  [13, 1], [14, 1],
  [13, 2], [14, 2],
  [12, 3], [13, 3], [14, 3],
  [12, 4], [13, 4],
  [12, 5], [13, 5],
  // 中流（中央部）- 右にカーブ
  [13, 6], [14, 6],
  [14, 7], [15, 7],
  [14, 8], [15, 8],
  [15, 9], [16, 9],
  [15, 10], [16, 10],
  [15, 11], [16, 11],
  [15, 12], [16, 12],
  // 中央で少し広がる
  [14, 13], [15, 13], [16, 13],
  [14, 14], [15, 14], [16, 14],
  [15, 15], [16, 15],
  // 下流（南部）- 左にカーブ
  [15, 16], [16, 16],
  [14, 17], [15, 17],
  [14, 18], [15, 18],
  [13, 19], [14, 19],
  [13, 20], [14, 20],
  [13, 21], [14, 21],
  [12, 22], [13, 22], [14, 22],
  [12, 23], [13, 23],
  [12, 24], [13, 24],
  [13, 25], [14, 25],
  [13, 26], [14, 26],
  [13, 27], [14, 27],
  [13, 28], [14, 28],
  [13, 29], [14, 29],
];

riverPath.forEach(([x, y]) => setTerrain(x, y, TERRAIN_TYPE.WATER, 1));

// 湖1：左上エリアの小さな湖（不規則な形状）
const lake1: [number, number][] = [
  [3, 8], [4, 8], [5, 8],
  [2, 9], [3, 9], [4, 9], [5, 9],
  [2, 10], [3, 10], [4, 10],
  [3, 11], [4, 11],
];
lake1.forEach(([x, y]) => setTerrain(x, y, TERRAIN_TYPE.WATER, 1));

// 湖2：右下エリアの小さな池
const lake2: [number, number][] = [
  [24, 22], [25, 22],
  [23, 23], [24, 23], [25, 23],
  [24, 24], [25, 24], [26, 24],
  [25, 25],
];
lake2.forEach(([x, y]) => setTerrain(x, y, TERRAIN_TYPE.WATER, 1));

// === 森の配置 - 有機的な形状 ===

// 森グループ1：左上エリア（L字型）
const forest1: [number, number][] = [
  [6, 3], [7, 3], [8, 3],
  [6, 4], [7, 4],
  [6, 5], [7, 5],
  [6, 6],
];
forest1.forEach(([x, y]) => setTerrain(x, y, TERRAIN_TYPE.FOREST, 1));

// 森グループ2：右上エリア（クラスター状）
const forest2: [number, number][] = [
  [22, 4], [23, 4],
  [21, 5], [22, 5], [23, 5], [24, 5],
  [22, 6], [23, 6], [24, 6],
  [23, 7],
];
forest2.forEach(([x, y]) => setTerrain(x, y, TERRAIN_TYPE.FOREST, 1));

// 森グループ3：左下エリア（T字型）
const forest3: [number, number][] = [
  [4, 20],
  [3, 21], [4, 21], [5, 21], [6, 21],
  [4, 22], [5, 22],
  [4, 23],
];
forest3.forEach(([x, y]) => setTerrain(x, y, TERRAIN_TYPE.FOREST, 1));

// 森グループ4：中央右エリア（不規則な形）
const forest4: [number, number][] = [
  [19, 12], [20, 12],
  [20, 13], [21, 13],
  [20, 14], [21, 14], [22, 14],
  [21, 15],
];
forest4.forEach(([x, y]) => setTerrain(x, y, TERRAIN_TYPE.FOREST, 1));

// 森グループ5：右下エリア（有機的な形）
const forest5: [number, number][] = [
  [27, 25],
  [26, 26], [27, 26], [28, 26],
  [27, 27], [28, 27],
];
forest5.forEach(([x, y]) => setTerrain(x, y, TERRAIN_TYPE.FOREST, 1));

// === 山の配置 - より自然な山脈 ===

// 山脈：右上から中央にかけての大きな山脈
// レベル3を中心に配置
setTerrain(21, 8, TERRAIN_TYPE.MOUNTAIN_3, 3);

// レベル3の四方にレベル2を配置
setTerrain(21, 7, TERRAIN_TYPE.MOUNTAIN_2, 2);
setTerrain(21, 9, TERRAIN_TYPE.MOUNTAIN_2, 2);
setTerrain(20, 8, TERRAIN_TYPE.MOUNTAIN_2, 2);
setTerrain(22, 8, TERRAIN_TYPE.MOUNTAIN_2, 2);

// 山脈を広げるために追加のレベル2（レベル1に隣接）
setTerrain(20, 10, TERRAIN_TYPE.MOUNTAIN_2, 2);
setTerrain(23, 10, TERRAIN_TYPE.MOUNTAIN_2, 2);

// レベル2の周りにレベル1を自然な形で配置
const mountain1Positions: [number, number][] = [
  // レベル3周辺のレベル1
  [21, 6], [20, 7], [22, 7],
  [19, 8], [23, 8],
  [20, 9], [22, 9],
  [21, 10],

  // 山脈を広げるレベル1
  [19, 9], [19, 10], [19, 11],
  [20, 11], [21, 11],
  [22, 10], [23, 9], [23, 11],
  [24, 8], [24, 9], [24, 10],

  // 左側への広がり
  [18, 9], [18, 10],

  // 上部への広がり
  [20, 6], [22, 6], [23, 7],
];

mountain1Positions.forEach(([x, y]) => {
  // レベル1はレベル2に隣接している必要があるため、
  // 隣接チェックを行う（簡易的にすべて配置）
  setTerrain(x, y, TERRAIN_TYPE.MOUNTAIN_1, 1);
});

// 山脈2：左側エリアの小規模な山（レベル2とレベル1のみ）
setTerrain(7, 15, TERRAIN_TYPE.MOUNTAIN_2, 2);
setTerrain(9, 16, TERRAIN_TYPE.MOUNTAIN_2, 2);

// レベル2の周りにレベル1
const mountain2Area1: [number, number][] = [
  [7, 14], [6, 15], [8, 15], [7, 16], [8, 16],
  [9, 15], [10, 16], [8, 17], [9, 17],
];
mountain2Area1.forEach(([x, y]) => setTerrain(x, y, TERRAIN_TYPE.MOUNTAIN_1, 1));

// 山脈3：下部エリアの丘陵地帯（レベル1のみ）
const hillsArea: [number, number][] = [
  [18, 25], [19, 25], [20, 25],
  [19, 26], [20, 26],
  [19, 27],
];
hillsArea.forEach(([x, y]) => setTerrain(x, y, TERRAIN_TYPE.MOUNTAIN_1, 1));

export const initialMap: Terrain[] = map;
