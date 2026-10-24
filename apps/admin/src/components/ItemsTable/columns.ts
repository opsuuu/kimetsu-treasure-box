type Column = {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center';
  className?: string;
};

export const COLUMNS: Column[] = [
  { key: 'cover',      label: '封面',    width: 'w-20' },
  { key: 'name',       label: '週邊名稱' },
  { key: 'category',   label: '分類',    width: 'w-32' },
  { key: 'series',     label: '系列',    width: 'w-32', className: 'hidden md:table-cell' },
  { key: 'characters', label: '角色',    width: 'w-36', className: 'hidden lg:table-cell' },
  { key: 'price',      label: '售價',    width: 'w-24' },
  { key: 'date',       label: '發售日',  width: 'w-28', className: 'hidden md:table-cell' },
  { key: 'order',      label: '排序',    width: 'w-16', align: 'center', className: 'hidden lg:table-cell' },
  { key: 'status',     label: '狀態',    width: 'w-20', align: 'center' },
  { key: 'actions',    label: '操作',    width: 'w-24', align: 'center' },
];
