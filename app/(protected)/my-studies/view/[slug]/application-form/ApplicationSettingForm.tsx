"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { patchForm } from "@/lib/actions/participation.actions";
import { formSchema, normalizedFormSchema } from "@/lib/validators";
import { FormValues, QuestionInput } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { EvaluationType, QuestionType, StudyStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import { QuestionEditor } from "./QuestionEditor";

export function ApplicationSettingForm({ 
  initial,
  slug,
  studyStatus, 
}: { 
 initial: FormValues;
  slug: string;
  studyStatus: StudyStatus;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const locked = studyStatus !== "draft";

  const form = useForm<FormValues>({
  resolver: zodResolver(formSchema) as Resolver<FormValues>,
  defaultValues: initial ?? { description: null, form: [] },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(initial ?? { description: null, form: [] });
  }, [initial]);

   const { fields, append, remove, move, insert } = useFieldArray({
    control: form.control,
    name: 'form'
  });


  function onEdit() {
    if (locked) return;
    setIsEditing(true);
  }

  function onCancel() {
    form.reset(initial);
    setIsEditing(false);
  }

  function onSave(values: FormValues) {
    const payload = normalizedFormSchema.parse(values);

    startTransition(async () => {
      await patchForm(slug, payload);
      setIsEditing(false);
      form.reset(payload.form.length ? payload : { description: payload.description ?? null, form: [] });
        router.refresh(); 
    });
  }

  const addQuestion = () => {
  
      append({
        text: "",
        required: false,
        type: QuestionType.text,
        evaluationType: EvaluationType.manual,
        options: []
      } as QuestionInput);
  };

   const duplicate = (i: number) => {
    const q = form.getValues(`form.${i}`) as QuestionInput & { id?: string };
    const clone: QuestionInput = {
      text: q.text,
      required: q.required,
      type: q.type,
      evaluationType: q.evaluationType,
      options: (q.options ?? []).map((o) => ({ text: o.text, score: o.score ?? "" })),
    };
    insert(i + 1, clone);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6 w-full max-w-[700px]">
        
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value ?? ""}     
                  placeholder="Describe your application form..." 
                  readOnly={!isEditing || locked} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         {/* Questions */}
        {fields.map((f, i) => {
          const disabled = !isEditing || locked;
          return (
            <div key={f.id} className="rounded-xl border p-4 space-y-3">
               <div className="flex items-start gap-3">
                  <div className="mt-2 w-8 text-center shrink-0 rounded-full bg-muted">
                    {i + 1}
                  </div>
                     <QuestionEditor 
                      index={i}
                      disabled={disabled}
                      form={form}
                    />
                    
                    {/* Row actions */}
                  <div className="flex flex-col gap-2 shrink-0 ml-4">
                    <Button type="button" variant="secondary" onClick={() => i > 0 && move(i, i - 1)} disabled={i === 0|| disabled}>
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => i < fields.length - 1 && move(i, i + 1)}
                      disabled={i === fields.length - 1 || disabled}
                    >
                      ↓
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => duplicate(i)} disabled={disabled}>
                      Duplicate
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => remove(i)} disabled={disabled}>
                      Delete
                    </Button>
                  </div>
                </div>
                </div>
          );
        })}

        {!locked && isEditing && (
          <div className="flex justify-center mb-8">
              <Button type="button" onClick={addQuestion}>
              Add question
            </Button>
          </div>
         
        )}

        {!locked ? (
          !isEditing ? (
            <div className="flex justify-center gap-2">
              <Button variant="secondary" type="button" onClick={() => window.open(`/apply/${slug}`, "_blank")}>
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
          )
        ) : (
          <div className="text-sm text-muted-foreground text-center">Form is locked because the study is not in draft.</div>
        )}
      </form>
    </Form>
  );
}