import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router";

/**
 * 有未儲存修改時，攔下站內導頁（回傳 blocker 給頁面顯示確認視窗）與重新整理、關閉分頁。
 * 所有主動導走的地方（例如儲存成功）都要先呼叫 allowLeave()。
 */
export function useUnsavedChangesGuard(shouldBlock: boolean) {
  const allowRef = useRef(false);

  // 一定要傳函式：react-router 在導頁當下才呼叫它，才讀得到 navigate 前剛設好的 allowRef。
  // 傳布林值的話是上一次 render 算好的結果，allowLeave() 後緊接著 navigate 仍會被攔下
  const blocker = useBlocker(
    useCallback(() => shouldBlock && !allowRef.current, [shouldBlock]),
  );

  useEffect(() => {
    if (!shouldBlock) return;

    // 瀏覽器只會顯示內建的提示文字，無法自訂
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (allowRef.current) return;
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldBlock]);

  const allowLeave = useCallback(() => {
    allowRef.current = true;
  }, []);

  return { blocker, allowLeave };
}
