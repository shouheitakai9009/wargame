export function RuleExplanation() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">ルール解説</h2>
      <div className="space-y-3 text-sm text-slate-300">
        <div>
          <h3 className="font-semibold text-white mb-1">勝利条件</h3>
          <p className="text-slate-400">敵将軍の兵力を0にしたら勝利</p>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-1">兵種</h3>
          <ul className="space-y-1 text-slate-400">
            <li>• 歩兵：バランスの取れた基本兵種</li>
            <li>• 弓兵：遠距離攻撃が可能</li>
            <li>• 盾兵：防御力が高い</li>
            <li>• 騎兵：移動速度が速い</li>
            <li>• 将軍：最強だが1体のみ</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-1">軍編成</h3>
          <p className="text-slate-400">
            2体以上の兵を隣接させることで軍を編成できます。
          </p>
        </div>
      </div>
    </div>
  );
}
