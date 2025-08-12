"use client";

import { formatOptions } from "@/components/stepper-with-form.tsx";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultipleSelector, { Option } from "@/components/ui/multipleSelector";
import { Textarea } from "@/components/ui/textarea";
import { patchRecruitment } from "@/lib/actions/study.actions";
import { STUDY_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { fullRecruitmentSchema } from "@/lib/validators";
import { RecruitmentFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Resolver, useForm } from "react-hook-form";

export function ApplicationSettingForm({ recruitment, slug }: { recruitment: RecruitmentFormValues; slug: string; }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<RecruitmentFormValues>({
    resolver: zodResolver(fullRecruitmentSchema) as Resolver<RecruitmentFormValues>,
    defaultValues: {
      ...recruitment,
    //   image: recruitment.image || STUDY_IMAGE[0],
    //   thankYouMessage: recruitment.thankYouMessage || "Thank you for participating in our study. Your contribution is greatly appreciated!",
    },
     mode: "onChange",
  });

  function onEdit() {
    setIsEditing(true);
  }

  function onCancel() {
    form.reset(); // 回到 defaultValues
    setIsEditing(false);
  }

  function onSave(values: RecruitmentFormValues) {
     const trimmedFormatOther = values.formatOther?.trim();

        const payload = {
        ...values,

        formatOther:
            values.format.includes("Other") && trimmedFormatOther
            ? trimmedFormatOther
            : null,
        };

    startTransition(async () => {
      await patchRecruitment(slug, payload);
      setIsEditing(false);
          form.reset(payload); 
    //   router.refresh(); // 讓頁面顯示最新
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6 w-full max-w-[600px]">
        
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Study Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe your study..." readOnly={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image selection */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choose an Image</FormLabel>
              <div className={cn("flex gap-4", !isEditing && "opacity-60 pointer-events-none")}>
                {STUDY_IMAGE.map((img) => (
                  <div
                    key={img}
                    className={cn(
                      "border rounded-md cursor-pointer p-1",
                      field.value === img ? "border-primary" : "border-muted"
                    )}
                    onClick={() => field.onChange(img)}
                  >
                    <Image src={`/images/study/${img}.png`} alt="Study image" width={160} height={160} className="rounded-md" />
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Format */}
        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <FormControl>
                <div className={cn(!isEditing && "opacity-60 pointer-events-none")}>
                    <MultipleSelector
                        value={formatOptions.filter(opt => (field.value as string[])?.includes(opt.value))}
                        onChange={(selected: Option[]) => {
                            field.onChange(selected.map(opt => opt.value));
                            
                            // form.setValue("formatOther", null);
                        }}
                        defaultOptions={formatOptions}
                        placeholder="Select session formats"
                    />
                </div>
               
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Format Other */}
        {form.watch("format")?.includes("Other") && (
          <FormField
            control={form.control}
            name="formatOther"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other format (please specify)</FormLabel>
                <FormControl>
                  <Input {...field} readOnly={!isEditing} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Duration */}
        <FormField
          control={form.control}
          name="durationMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  readOnly={!isEditing}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Session Details */}
        <FormField
          control={form.control}
          name="sessionDetail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Details</FormLabel>
              <FormControl>
                <Textarea {...field}  readOnly={!isEditing}  value={field.value ?? ''} placeholder="e.g. Online survey + 30min interview" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Criteria Description */}
        <FormField
          control={form.control}
          name="criteriaDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Participant Criteria</FormLabel>
              <FormControl>
                <Input {...field}  readOnly={!isEditing}  placeholder="e.g. Aged 18–30, based in the UK" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reward */}
        <FormField
          control={form.control}
          name="reward"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward (optional)</FormLabel>
              <FormControl>
                <Input {...field}  readOnly={!isEditing}  value={field.value ?? ''} placeholder="e.g. £15 gift card" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thank You Message */}
        <FormField
          control={form.control}
          name="thankYouMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thank You Message</FormLabel>
              <FormControl>
                <Textarea {...field}  readOnly={!isEditing}  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing ? (
            <div className="flex justify-center gap-2">
              <Button variant="secondary" type="button" onClick={() => window.open(`/recruitment/${slug}`, "_blank")}>
                Preview
              </Button>
              <Button type="button" onClick={onEdit}>
                Edit
              </Button>
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              <Button variant="secondary" type="button" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !form.formState.isDirty}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}

      </form>
    </Form>
  );
}