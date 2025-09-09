"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

  return (
    <Button onClick={handleCopy} className="w-full">
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}
