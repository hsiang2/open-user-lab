"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { patchForm } from "@/lib/actions/participation.actions";
import { formSchema, normalizedFormSchema } from "@/lib/validators";
import { FormValues, QuestionInput } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { EvaluationType, QuestionType, StudyStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Resolver, useFieldArray, useForm, UseFormReturn } from "react-hook-form";
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
          // const type = form.watch(`form.${i}.type`);
          // const evalType = form.watch(`form.${i}.evaluationType`);
          const disabled = !isEditing || locked;

          // // 選 automatic 改 type=text 時，清空 options 並把 evaluationType 調回 manual
          // useEffect(() => {
          //   if (type === QuestionType.text) {
          //     const opts = form.getValues(`form.${i}.options`);
          //     if (opts?.length) form.setValue(`form.${i}.options`, [], { shouldDirty: true, shouldValidate: true });
          //     if (evalType === EvaluationType.automatic) {
          //       form.setValue(`form.${i}.evaluationType`, EvaluationType.manual, { shouldDirty: true, shouldValidate: true });
          //     }
          //   }
          // }, [type, evalType]);

          //  // 巢狀 options
          // const {
          //   fields: optionFields,
          //   append: appendOption,
          //   remove: removeOption,
          // } = useFieldArray({
          //   control: form.control,
          //   name: `form.${i}.options`,
          // });

          return (
            <div key={f.id} className="rounded-xl border p-4 space-y-3">
               <div className="flex items-start gap-3">
                  <div className="mt-2 w-8 text-center shrink-0 rounded-full bg-muted">
                    {i + 1}
                  </div>
                     <QuestionEditor 
                      index={i}
                      disabled={disabled}
                      form={form} // ← 傳整個 form 物件
                    />
                   {/* <div className="flex-1 space-y-3">
                      <FormField
                        control={form.control}
                        name={`form.${i}.text`}
                        render={({ field }) => (
                          <FormItem>
                           
                            <FormControl>
                              <Input {...field}  readOnly={disabled}  placeholder="Question" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`form.${i}.required`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Required</FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={disabled}
                                  aria-readonly={disabled}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name={`form.${i}.type`}
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Question Type</FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={(val) => field.onChange(val)}
                                    disabled={disabled}
                                  >
                                      <FormControl className="w-full">
                                      <SelectTrigger>
                                          <SelectValue placeholder="Select question type" />
                                      </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                          {Object.values(QuestionType).map((type) => (
                                              <SelectItem key={type} value={type}>{type}</SelectItem>
                                          ))}
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                                  </FormItem>
                              )}
                        />
                        <FormField
                          control={form.control}
                          name={`form.${i}.evaluationType`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Evaluation Type</FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={(val) => {
                                      field.onChange(val);
                                      const isAuto = val === EvaluationType.automatic;
                                      const opts = form.getValues(`form.${i}.options`) ?? [];
                                      opts.forEach((_, j) => {
                                        form.setValue(
                                          `form.${i}.options.${j}.score`,
                                          isAuto ? form.getValues(`form.${i}.options.${j}.score`) ?? 0 : undefined,
                                          { shouldDirty: true, shouldValidate: true }
                                        );
                                      });
                                    }}
                                    disabled={disabled}
                                  >
                                      <FormControl className="w-full">
                                      <SelectTrigger>
                                          <SelectValue placeholder="Select evaluation type" />
                                      </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                          <SelectItem value={EvaluationType.manual}>Manually reviewed</SelectItem>
                                          <SelectItem value={EvaluationType.automatic} disabled={type === QuestionType.text}>Automatically scored</SelectItem>
                                          <SelectItem value={EvaluationType.none}>Not used for evaluation</SelectItem>
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                        />

                      </div>
                      

                      {type !== QuestionType.text && (
                        <div className="space-y-2">
                          {optionFields.map((opt, j) => (
                            <div key={opt.id} className="flex items-start gap-3">
                              <div className="flex-1 grid grid-cols-[1fr_140px_auto] gap-3">
                                 <FormField
                                  control={form.control}
                                   name={`form.${i}.options.${j}.text`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input {...field}  readOnly={disabled}  placeholder="Option" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {evalType === EvaluationType.automatic && (
                                  <FormField
                                    control={form.control}
                                    name={`form.${i}.options.${j}.score`}
                                    render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Score</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              inputMode="numeric"
                                              step={1}
                                              min={0}
                                              value={field.value === undefined ? "" : field.value}
                                              onChange={(e) => {
                                                const v = e.target.value;
                                                field.onChange(v === "" ? "" : Number(v));
                                              }}
                                              readOnly={disabled}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                    )}  
                                  />
                                )}
                              <Button type="button" variant="destructive" onClick={() => removeOption(j)} disabled={disabled}>
                                Delete
                              </Button>
                              </div>
                            </div>
                        ))}
                        {!disabled && (
                          <Button
                            type="button"
                            onClick={() =>
                              appendOption({
                                text: "",
                                // 若目前是 automatic，預設 0；否則 undefined
                                score: evalType === EvaluationType.automatic ? 0 : undefined,
                              })
                            }
                          >
                            Add option
                          </Button>
                        )}
                      </div>
                       )}
                  </div> */}

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