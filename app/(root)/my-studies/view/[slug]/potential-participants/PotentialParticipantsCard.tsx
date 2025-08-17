// components/potential/PotentialParticipantCard.tsx
"use client";
import Avatar from "@/components/shared/avatar/Avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AVATAR_ACCESSORY_KEYS, AVATAR_BACKGROUND, AVATAR_STYLE } from "@/lib/constants";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

type Breakdown = {
  ok: boolean;
  requiredMatched: string[];
  optionalMatched: string[];
  missingRequired: string[];
  missingOptional: string[];
  requiredMismatches: string[];
  optionalMismatches: string[];
  score: number;
};

function InviteSubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Inviting..." : "Invite"}
    </Button>
  );
}

export const CriteriaList = ({label, matched, mismatched, missing}: {label: string, matched: string[], mismatched: string[], missing: string[]}) => {
    const all = [
    ...matched.map(t => ({ type: t, icon: "match" })),
    ...mismatched.map(t => ({ type: t, icon: "mismatch" })),
    ...missing.map(t => ({ type: t, icon: "missing" })),
  ];

    return ( 
        <div>
            <p className="text-body font-bold">{label}:</p>
            <ul className="pl-4">

                {all.length ? all.map((c, i) => (
                <li key={i}>
                    <div className="flex items-center justify-between">
                        <p className="text-body">{c.type}</p>
                        { c.icon === "match" ? (
                            <Check size={16} />
                        ) : c.icon === "mismatch" ? (
                            <X  size={16} />
                        ) : (
                            <p className="text-body">?</p>
                        )
                        }
                    </div>
                    
                </li>
                )): 
                <>-</>
                }
            </ul>
        </div> 
    );
}

export function PotentialParticipantCard({
  item,
//   onInvite,
//   onView,
//   onSave,
}: {
  item: { userId: string; name: string | null; breakdown: Breakdown; 
    avatarBase: typeof AVATAR_STYLE[number]; 
    avatarAccessory: typeof AVATAR_ACCESSORY_KEYS[number];  
    avatarBg: typeof AVATAR_BACKGROUND[number];   
    };
//   onInvite: (userId: string) => void;
//   onView: (userId: string) => void;
//   onSave: (userId: string) => void;
}) {
  const b = item.breakdown;
  return (
        <Card
        // className="w-full max-w-sm"
        >
            <CardHeader >
                <div  className="flex space-x-4 items-center min-w-0">
                    <div className="flex-shrink-0">
                        <Avatar width={50} background={item.avatarBg} style={item.avatarBase} accessory={item.avatarAccessory} />
                    </div>
                    <p className="text-body font-bold truncate min-w-0">{item.name}</p>
                </div>
                {/* <Link href={`/recruitment/${study.slug}`}> */}
                    {/* <h2 className="text-subtitle text-center">{item.name}</h2> */}
                {/* </Link> */}
            </CardHeader>
            <CardContent>
                <div className="flex flex-col flex-center">
                    <div className="mb-10 space-y-4 w-full">
                        <CriteriaList label="Required" matched={b.requiredMatched}  mismatched={b.requiredMismatches} missing={b.missingRequired}  />
                        <CriteriaList label="Optional" matched={b.optionalMatched}  mismatched={b.optionalMismatches} missing={b.missingOptional}  />
                    </div>
                    <div className="flex gap-2">
                    {/* <Button variant="secondary" onClick={() => onView(item.userId)}>Profile</Button>
                    <Button variant="secondary" onClick={() => onSave(item.userId)}>Save</Button> */}
                     <Button variant="secondary" className="w-fit">
                        <Link href={`/profile/view/${item.userId}`}>
                            View Profile
                        </Link>
                     </Button>
                       <InviteSubmitButton disabled={!b.ok} />
                    </div>
                </div>
            </CardContent>
        </Card>
    
  );
}
