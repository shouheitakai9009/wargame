/**
 * Gemini API認証テスト
 *
 * ⚠️ セキュリティ警告:
 * このファイルはテスト目的のみで使用してください。
 * フロントエンドから直接Gemini APIを呼び出すため、APIキーがブラウザに露出します。
 * 本番環境では必ずバックエンドAPI経由でGemini APIを呼び出してください。
 */

// グローバルフラグで1回だけ実行されることを保証
let hasRun = false;

/**
 * Gemini API認証テスト関数
 * アプリ初期化時に1回だけ実行され、認証が成功するかをテストします。
 * 結果はブラウザコンソールに出力されます。
 */
export async function testGeminiAuthentication(): Promise<void> {
  // 既に実行済みの場合はスキップ
  if (hasRun) {
    console.log(
      "⏭️  Gemini API authentication test already executed, skipping..."
    );
    return;
  }
  hasRun = true;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // APIキーが設定されていない場合は警告を出力して終了
  if (!apiKey) {
    console.warn("⚠️ Gemini API Key is not set in .env.local");
    console.warn("Please create .env.local file and set VITE_GEMINI_API_KEY");
    return;
  }

  console.log("🔑 Testing Gemini API authentication...");

  try {
    // Gemini API generateContentエンドポイントへのリクエスト
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Hello",
                },
              ],
            },
          ],
        }),
      }
    );

    // レスポンスの処理
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Gemini API Authentication: Success");
      console.log("📝 Response:", data);

      // Gemini APIのレスポンス構造に合わせて内容を表示
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        console.log(
          "💬 Generated text:",
          data.candidates[0].content.parts[0].text
        );
      }
    } else {
      const errorData = await response.json();
      console.error("❌ Gemini API Authentication: Failed");
      console.error("Status:", response.status, response.statusText);
      console.error("Error:", errorData);
    }
  } catch (error) {
    console.error("❌ Gemini API Authentication: Network Error");
    console.error("Error:", error);
  }
}
