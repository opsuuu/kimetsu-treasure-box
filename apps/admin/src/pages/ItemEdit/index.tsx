import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchCategories } from "@/services/categories";
import { fetchCharacters } from "@/services/characters";
import { fetchSeries } from "@/services/series";
import { fetchItemForEdit } from "@/services/items";
import { ItemEditForm } from "./components/ItemEditForm";
import { PageMessage } from "./components/PageMessage";

export default function ItemEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const itemQuery = useQuery({
    queryKey: ["admin-item", id],
    queryFn: () => fetchItemForEdit(id),
    // 表單以 updated_at 當 key，背景重抓到新版本會 remount 並丟掉未儲存的修改；
    // 別人改過的情況交給送出時的 KT409 處理
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // 每次進入都重新載入，避免先顯示快取的舊版本、背景重抓完又 remount 一次
    gcTime: 0,
  });
  // 與 ItemForm 使用相同的 query key，表單 mount 時直接讀 cache
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const charactersQuery = useQuery({
    queryKey: ["characters"],
    queryFn: fetchCharacters,
  });
  const seriesQuery = useQuery({
    queryKey: ["series"],
    queryFn: fetchSeries,
  });

  // 重新載入後 updated_at 變了，表單跟著 key 改變而 remount；沒變則保留目前的修改
  async function reload() {
    const result = await itemQuery.refetch();
    if (result.isError) toast.error("重新載入失敗，請稍後再試");
  }

  const queries = [itemQuery, categoriesQuery, charactersQuery, seriesQuery];
  // 已經有資料、只是重新載入失敗的不算，由 reload() 提示
  const failedQueries = queries.filter((q) => q.isError && q.data === undefined);
  if (failedQueries.length > 0) {
    return (
      <PageMessage
        message="載入失敗，請稍後再試"
        actionLabel="重試"
        onAction={() => failedQueries.forEach((q) => void q.refetch())}
      />
    );
  }

  const item = itemQuery.data;
  if (item === null) {
    return (
      <PageMessage
        message="找不到這筆商品"
        actionLabel="回到列表"
        onAction={() => navigate("/items")}
      />
    );
  }

  const characters = charactersQuery.data;
  // 清單全部載完才 mount 表單，ItemForm 的下拉選單與 slug 自動產生才不會拿到空清單
  if (!item || !categoriesQuery.data || !characters || !seriesQuery.data) {
    return <PageMessage message="載入中..." />;
  }

  return (
    <ItemEditForm
      key={item.updated_at}
      item={item}
      characters={characters}
      onReload={() => void reload()}
    />
  );
}
