// components/explore/ExploreToolbar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // 若沒有就用 checkbox 也行

export default function ExploreToolbar({
  defaultQ = "",
  matched = false,
  userId
}: {
  defaultQ?: string;
  matched?: boolean;
  userId?: string | null;
}) {
    
  const [text, setText] = useState(defaultQ);
  const [onlyMatched, setOnlyMatched] = useState(matched);
  const router = useRouter();
  const search = useSearchParams();
  const [, start] = useTransition();

  // 當使用者用「上一頁 / 下一頁」改了網址時，和本地 state 同步
  useEffect(() => setOnlyMatched(matched), [matched]);
  useEffect(() => setText(defaultQ), [defaultQ]);

  const apply = (q: string, m: boolean) => {
    const qs = new URLSearchParams(search.toString());
    if (q.trim()) qs.set("q", q.trim()); else qs.delete("q");
    if (m) qs.set("matched", "1"); else qs.delete("matched");
    qs.delete("cursor"); // 切換模式或重新搜尋要回第一頁
    start(() => router.push(`/explore?${qs.toString()}`));
  };

  return (
    <div className="flex flex-col  md:flex-row gap-3 md:items-center justify-end">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(text, onlyMatched);
        }}
        className="flex gap-2 w-full md:w-auto"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search studies…"
        />
        <Button type="submit">Search</Button>
      </form>
        {userId &&
            <label className="inline-flex items-center gap-2 text-sm">
            <Switch
            checked={onlyMatched}
            onCheckedChange={(v) => {
                setOnlyMatched(v);
                apply(text, v);
            }}
            />
            Only show studies I qualify for
        </label>
        }
      
    </div>
  );
}
