"use client";

import { useMemo, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form as UiForm, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { QuestionType } from "@prisma/client";
import { ApplyFormDTO, applyToStudy } from "@/lib/actions/participation.actions";
import MultipleSelector, { Option } from "@/components/ui/multipleSelector";

type ApplyValues = Record<string, string | string[]>;

export default function ApplyFormClient({ data }: { data: ApplyFormDTO }) {
  const [isPending, startTransition] = useTransition();

  const defaultValues = useMemo<ApplyValues>(
    () => Object.fromEntries(data.questions.map(q => [q.id, q.type === "multiple_choice" ? [] : ""])),
    [data.questions]
  );

  const form = useForm<ApplyValues>({ defaultValues, mode: "onSubmit" });

  function onSubmit(values: ApplyValues) {
    startTransition(async () => {
      await applyToStudy({ slug: data.slug, formId: data.formId, answers: values });
      // 若 action 內有 redirect，這裡不會繼續執行
    });
  }

  return (
    <UiForm {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center space-y-6 max-w-[700px] mx-auto">
        <h1 className="text-title">{data.studyName}</h1>
        {data.description && <p className="text-body whitespace-pre-wrap">{data.description}</p>}

        <div className="w-full space-y-6 my-8">
        {data.questions.map((q, idx) => {
          const name = q.id;
          const required = q.required;

          if (q.type === QuestionType.text) {
            return (
              <FormField
                key={q.id}
                control={form.control}
                name={name}
                rules={{ required }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{idx + 1}. {q.text}</FormLabel>
                    <FormControl>
                      <Input {...field} required={required} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }

          if (q.type === QuestionType.single_choice) {
            return (
              <FormField
                key={q.id}
                control={form.control}
                name={name}
                rules={{ required }}
                render={({ field }) => (
                  <FormItem >
                    <FormLabel>{idx + 1}. {q.text}</FormLabel>
                    <FormControl>
                      <Select value={field.value as string} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {q.options?.map((o) => (
                            <SelectItem key={o.id} value={o.id}>{o.text}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }

          // multiple_choice with MultipleSelector
          const opts: Option[] = (q.options ?? []).map(o => ({ label: o.text, value: o.id }));
          return (
            <Controller
              key={q.id}
              control={form.control}
              name={name}
              rules={{ validate: (v) => (!required || (Array.isArray(v) && v.length > 0)) || "Please select at least one option" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{idx + 1}. {q.text}</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={opts.filter(opt => (field.value as string[])?.includes(opt.value))}
                      onChange={(selected: Option[]) => field.onChange(selected.map(s => s.value))}
                      defaultOptions={opts}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </div>
        <Button type="submit" disabled={isPending || data.recruitmentStatus === "closed"}>
          {data.recruitmentStatus === "closed" ? "Recruitment closed" : isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </UiForm>
  );
}
