import { useEffect } from "react";
import { UseFormReturn, useFieldArray, useWatch } from "react-hook-form";
import { EvaluationType, QuestionType } from "@prisma/client";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormValues } from "@/types";

export function QuestionEditor({
  index,
  disabled,
  form,
}: {
  index: number;
  disabled: boolean;
  form: UseFormReturn<FormValues>;  
}) {
  const { control, getValues, setValue } = form;

  const type = useWatch({ control, name: `form.${index}.type` });
  const evalType = useWatch({ control, name: `form.${index}.evaluationType` });

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `form.${index}.options`,
  });

  // Text question and evaluation types
  useEffect(() => {
    if (type === QuestionType.text) {
      const opts = getValues(`form.${index}.options`);
      if (opts?.length) setValue(`form.${index}.options`, [], { shouldDirty: true, shouldValidate: true });
      if (evalType === EvaluationType.automatic) {
        setValue(`form.${index}.evaluationType`, EvaluationType.manual, { shouldDirty: true, shouldValidate: true });
      }
    }
  }, [type, evalType, index, getValues, setValue]);

  return (
    <div className="flex-1 space-y-4">
      <FormField
        control={control}
        name={`form.${index}.text`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input {...field} readOnly={disabled} placeholder="Question" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="
    flex justify-between gap-4
      ">
        <FormField
          control={control}
          name={`form.${index}.required`}
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
          control={control}
          name={`form.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                <FormControl className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value={QuestionType.text}>Text</SelectItem>
                    <SelectItem value={QuestionType.single_choice}>Single choice</SelectItem>
                    <SelectItem value={QuestionType.multiple_choice}>Multiple choice</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`form.${index}.evaluationType`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evaluation Type</FormLabel>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  const isAuto = val === EvaluationType.automatic;
                  const opts = getValues(`form.${index}.options`) ?? [];
                  opts.forEach((_, j) => {
                    setValue(
                      `form.${index}.options.${j}.score`,
                      isAuto ? getValues(`form.${index}.options.${j}.score`) ?? 0 : undefined,
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
                  <SelectItem value={EvaluationType.automatic} disabled={type === QuestionType.text}>
                    Automatically scored
                  </SelectItem>
                  <SelectItem value={EvaluationType.none}>Not used for evaluation</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {type !== QuestionType.text && (
        <div className="space-y-4">
          {optionFields.map((opt, j) => (
            <div key={opt.id} className="
            flex items-end justify-between "
            >
                <FormField
                  control={control}
                  name={`form.${index}.options.${j}.text`}
                  render={({ field }) => (
                    <FormItem>
                       
                      <FormControl>
                        <Input {...field} readOnly={disabled} placeholder="Option" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {evalType === EvaluationType.automatic && (
                  <FormField
                    control={control}
                    name={`form.${index}.options.${j}.score`}
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
          ))}

          {!disabled && (
            <Button
              type="button"
              onClick={() => appendOption({ text: "", score: evalType === EvaluationType.automatic ? 0 : undefined })}
            >
              Add option
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
