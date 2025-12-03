import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/designs/ui/alert";
import { useAppDispatch, useAppSelector } from "@/states";
import { hideError } from "@/states/slice";

/**
 * エラーメッセージを画面上部中央に表示するコンポーネント
 */
export default function ErrorAlert() {
  const dispatch = useAppDispatch();
  const errorMessage = useAppSelector((state) => state.app.errorMessage);

  useEffect(() => {
    if (errorMessage) {
      // 3秒後に自動的に非表示にする
      const timer = setTimeout(() => {
        dispatch(hideError());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, dispatch]);

  if (!errorMessage) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Alert variant="destructive">
        <AlertCircle size={16} />
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    </div>
  );
}
