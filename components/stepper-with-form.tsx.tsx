"use client"
import { defineStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultipleSelector, { Option } from "@/components/ui/multipleSelector";
import { BACKGROUND_CATEGORIES, GENDERS, LANGUAGES, RECRUITMENT_FORMATS, REGIONS } from "@/lib/constants";
import { createStudyFullSchema, criteriaUiSchema, insertParticipantWorkflowStep, insertRecruitmentSchema, insertStudySchema, insertStudyWorkflowStep } from "@/lib/validators";
import { Criteria, CriteriaUiValues, MatchLevel, StudyCreatePayload, StudyFullInput } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Control, Controller, FieldPath, Resolver, useFieldArray, useForm, useFormContext, UseFormWatch } from "react-hook-form";
import z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CriteriaMatchLevel, ProfileField } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { createStudyFull } from "@/lib/actions/study.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const formatOptions: Option[] = RECRUITMENT_FORMATS.map((item) => ({
    label: item,
    value: item,
}));


export const genderOptions: Option[] = GENDERS.map((item) => ({
    label: item,
    value: item,
}));

export const regionOptions: Option[] = REGIONS.map((item) => ({
    label: item,
    value: item,
}));

export const languageOptions: Option[] = LANGUAGES.map((item) => ({
    label: item,
    value: item,
}));

export const backgroundOptions: Option[] = BACKGROUND_CATEGORIES.map((item) => ({
    label: item,
    value: item,
}));

type Props = { showErrors: boolean };

const StudyInfoForm = ({ showErrors }: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<StudyFullInput>();

  return (
    <div className="space-y-4 text-start w-full max-w-[600px]">
      <div className="space-y-2">
        <label
          htmlFor={register("name").name}
          className="block text-sm font-medium text-primary"
        >
          Study Name
        </label>
        <Input
          id={register("name").name}
          {...register("name")}
          className="block w-full rounded-md border p-2"
        />
        {showErrors && errors.name && (
          <span className="text-sm text-destructive">
            {errors.name.message}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor={register("description").name}
          className="block text-sm font-medium text-primary"
        >
          Study Description
        </label>
        <Input
          id={register("description").name}
          {...register("description")}
          className="block w-full rounded-md border p-2"
        />
        {showErrors && errors.description && (
          <span className="text-sm text-destructive">
            {errors.description.message}
          </span>
        )}
      </div>
    </div>
  );
};

const SessionForm = ({ showErrors }: Props) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<StudyFullInput>();

  const [showOtherFormat, setShowOtherFormat] = useState(false)

  return (
    <div className="space-y-4 text-start w-full max-w-[600px]">
      <div className="space-y-4 ">
          <Controller
            name="format"
            control={control}
            render={({ field }) => (
                <div className="space-y-2">
                    <label
                    htmlFor={register("format").name}
                    className="block text-sm font-medium text-primary"
                    >
                    Format
                    </label>
                    <MultipleSelector
                    value={formatOptions.filter(opt => (field.value as string[])?.includes(opt.value))}
                    onChange={(selected: Option[]) => {
                        let values = selected.map(opt => opt.value);                                     
                        field.onChange(values);
                        setShowOtherFormat(values.includes("Other"));
                    }}
                    defaultOptions={formatOptions}
                    placeholder="Select session formats"
                    emptyIndicator={
                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                        no results found.
                        </p>
                    }
                    />
                     {showErrors && errors.format && (
            <span className="text-sm text-destructive">
              {errors.format.message}
            </span>
          )}
                </div>
            )}
          />
         
          {showOtherFormat && (
                <div className="space-y-2">
                    <label
                    htmlFor={register("formatOther").name}
                    className="block text-sm font-medium text-primary"
                    >
                    Other format (please specify)
                    </label>
                    <Input
                    id={register("formatOther").name}
                    {...register("formatOther")}
                    className="block w-full rounded-md border p-2"
                    />
                    {showErrors && errors.formatOther && (
                    <span className="text-sm text-destructive">
                        {errors.formatOther.message}
                    </span>
                    )}
                  </div>
          )}
        <div className="space-y-2">
          <label
            htmlFor={register("durationMinutes").name}
            className="block text-sm font-medium text-primary"
          >
            Estimated Duration
          </label>
          <Input
            id={register("durationMinutes").name}
            {...register("durationMinutes")}
            className="block w-full rounded-md border p-2"
            type="number"
          />
          {showErrors && errors.durationMinutes && (
            <span className="text-sm text-destructive">
              {errors.durationMinutes.message}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor={register("sessionDetail").name}
            className="block text-sm font-medium text-primary"
          >
            Session Details (optional)
          </label>
          <Input
            id={register("sessionDetail").name}
            {...register("sessionDetail")}
            className="block w-full rounded-md border p-2"
            placeholder="e.g. You’ll complete an online survey, then join a 30-minute interview on Teams."
          />
          {showErrors && errors.sessionDetail && (
            <span className="text-sm text-destructive">
              {errors.sessionDetail.message}
            </span>
          )}
        </div>
      </div>
      <div className="space-y-4 ">
        <div className="space-y-2">
          <label
            htmlFor={register("criteriaDescription").name}
            className="block text-sm font-medium text-primary"
          >
            Participant Criteria
          </label>
          <Input
            id={register("criteriaDescription").name}
            {...register("criteriaDescription")}
            className="block w-full rounded-md border p-2"
          />
          {showErrors && errors.criteriaDescription && (
            <span className="text-sm text-destructive">
              {errors.criteriaDescription.message}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor={register("reward").name}
            className="block text-sm font-medium text-primary"
          >
            Reward (optional)
          </label>
          <Input
            id={register("reward").name}
            {...register("reward")}
            className="block w-full rounded-md border p-2"
          />
          {showErrors && errors.reward && (
            <span className="text-sm text-destructive">
              {errors.reward.message}
            </span>
          )}
        </div>
      </div>
       
    </div>
  );
};

// 小工具：從巢狀物件用 "a.b.c" 取值
const getAt = (obj: any, path: string) =>
  path.split(".").reduce((o, k) => (o ? (o as any)[k] : undefined), obj);


export function CriterionRow({
  label,
  levelName,
  valuesName,
  options,
  control,
  watch,
}: {
  label: string;
  levelName: `criteria.${string}.matchLevel`;
  valuesName: `criteria.${string}.values`;
  options: Option[];
  control: Control<any>;
  watch: UseFormWatch<any>;
}) {
  const { setValue, formState: { errors } } = useFormContext();
  const level = watch(levelName) as MatchLevel | undefined;
  const disabled = !level || level === "No Preference";

  // 這一步的 values 欄位錯誤（我們在 superRefine 有把 path 指到 ["values"]）
  const valuesError = getAt(errors, valuesName) as { message?: string }

  return (
    <div className="grid grid-cols-[140px_200px_1fr] items-start gap-4">
      <div className="text-sm font-medium text-primary pt-2">{label}</div>

      <Controller
        name={levelName}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(v: MatchLevel) => {
              field.onChange(v);
              if (v === "No Preference") setValue(valuesName, []); // 清空值
            }}
          >
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="No Preference" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="No Preference">No Preference</SelectItem>
              <SelectItem value="Optional">Optional</SelectItem>
              <SelectItem value="Required">Required</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
        <Controller
          name={valuesName}
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <>
              <MultipleSelector
                value={options.filter(o => (field.value ?? []).includes(o.value))}
                onChange={(sel) => field.onChange(sel.map(s => s.value))}
                defaultOptions={options}
                placeholder={`Select ${label.toLowerCase()}`}
              />
              {valuesError && (
                <p id={`${valuesName}-error`} className="mt-1 text-sm text-destructive">
                  {valuesError.message ?? "Please select at least one."}
                </p>
              )}
            </>
              
          )}
        />
      </div>
    </div>
  );
}

export function CriterionAgeRow({
  label = "Age",
  levelName,
  minName,
  maxName,
  control,
  watch,
}: {
  label?: string;
  levelName: `criteria.age.matchLevel`;
  minName: `criteria.age.min`;
  maxName: `criteria.age.max`;
  control: Control<any>;
  watch: UseFormWatch<any>;
}) {
  const { setValue,  formState: { errors }  } = useFormContext();
  const level = watch(levelName) as MatchLevel | undefined;
  const disabled = !level || level === "No Preference";

  const minError = getAt(errors, minName) as { message?: string } | undefined;
  const maxError = getAt(errors, maxName) as { message?: string } | undefined;


  return (
    <div className="grid grid-cols-[140px_200px_1fr] items-start gap-4">
      <div className="text-sm font-medium text-primary pt-2">{label}</div>

      <Controller
        name={levelName}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(v: MatchLevel) => {
              field.onChange(v);
              if (v === "No Preference") {
                setValue(minName, undefined);
                setValue(maxName, undefined);
              }
            }}
          >
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="No Preference" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="No Preference">No Preference</SelectItem>
              <SelectItem value="Optional">Optional</SelectItem>
              <SelectItem value="Required">Required</SelectItem>
            </SelectContent>
          </Select>
        )}
      />

      <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
        <div className="flex items-center gap-2">
          <Controller
            name={minName}
            control={control}
            render={({ field }) => (
              <Input 
                type="number" 
                 inputMode="numeric"
                placeholder="Min" 
                min={0} 
                // {...field} 
                value={field.value ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  field.onChange(v === "" ? undefined : Number(v));
                }}
                className="w-[120px]" 
                aria-invalid={!!minError}
                aria-describedby={minError ? `${minName}-error` : undefined}
              />
            )}
          />
          <span>to</span>
          <Controller
            name={maxName}
            control={control}
            render={({ field }) => (
              <Input 
              value={field.value ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                field.onChange(v === "" ? undefined : Number(v));
              }}
                type="number" 
                  inputMode="numeric"
                placeholder="Max" 
                min={0} 
                // {...field} 
                className="w-[120px]" 
                 aria-invalid={!!maxError}
                aria-describedby={maxError ? `${maxName}-error` : undefined}
              />
            )}
          />
          <span>years</span>
        </div>
        {minError && (
          <p id={`${minName}-error`} className="mt-1 text-sm text-destructive">
            {minError.message ?? "Min is required."}
          </p>
        )}
        {maxError && (
          <p id={`${maxName}-error`} className="mt-1 text-sm text-destructive">
            {maxError.message ?? "Max is required."}
          </p>
        )}
      </div>
    </div>
  );
}

export function CriteriaForm({showErrors}: Props) {
  const { control, watch, formState: { errors }, } = useFormContext<StudyFullInput>();

  return (
    <div className="space-y-6 w-full max-w-[800px]">
      <CriterionAgeRow
        levelName="criteria.age.matchLevel"
        minName="criteria.age.min"
        maxName="criteria.age.max"
        control={control as unknown as Control<any>}
        watch={watch as unknown as UseFormWatch<any>}
      />

      <CriterionRow
        label="Gender"
        levelName="criteria.gender.matchLevel"
        valuesName="criteria.gender.values"
        options={genderOptions}
        control={control as unknown as Control<any>}
        watch={watch as unknown as UseFormWatch<any>}
      />

      <CriterionRow
        label="Background"
        levelName="criteria.background.matchLevel"
        valuesName="criteria.background.values"
        options={backgroundOptions}
        control={control as unknown as Control<any>}
        watch={watch as unknown as UseFormWatch<any>}
      />

      <CriterionRow
        label="Region"
        levelName="criteria.region.matchLevel"
        valuesName="criteria.region.values"
        options={regionOptions}
        control={control as unknown as Control<any>}
        watch={watch as unknown as UseFormWatch<any>}
      />

      <CriterionRow
        label="Language Spoken"
        levelName="criteria.language.matchLevel"
        valuesName="criteria.language.values"
        options={languageOptions}
        control={control as unknown as Control<any>}
        watch={watch as unknown as UseFormWatch<any>}
      />
    </div>
  );
}

export default function WorkflowFormBase({ fieldName, showErrors }: {
  fieldName: "participantSteps" | "studySteps";
  showErrors: boolean;
}) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext(); // 泛型沿用你外層 <FormProvider> 的 StudyFullInput

  const { fields, append, remove, move, insert } = useFieldArray({
    control,
    name: fieldName as any,
  });

  const addEmpty = () => {
    if (fieldName === "participantSteps") {
      append({
        name: "",
        noteResearcher: "",
        noteParticipant: "",
        deadline: undefined,
      } as any);
    } else {
      append({
        name: "",
        note: "",
        deadline: undefined,
      } as any);
    }
  };

  const duplicate = (i: number) => {
    insert(i + 1, fields[i]);
  };

  // 初始沒有就塞一列（可選）
  // useEffect(() => { if (fields.length === 0) addEmpty(); }, [fields.length]);

  return (
    <div className={cn("w-full max-w-[900px] space-y-4")}>
      <div className="flex justify-between items-center">
        <h4 className="text-base font-medium">
          {fieldName === "participantSteps" ? "Participant Workflow" : "Study Workflow"}
        </h4>
        <Button type="button" onClick={addEmpty}>Add step</Button>
      </div>

      <ol className="space-y-4">
        {fields.map((f, i) => {
          const base = `${fieldName}.${i}`;
          const nameErr = getAt(errors, `${base}.name`) as { message?: string } | undefined;
          const deadlineErr = getAt(errors, `${base}.deadline`) as { message?: string } | undefined;
          const noteRErr =
            fieldName === "participantSteps"
              ? (getAt(errors, `${base}.noteResearcher`) as { message?: string } | undefined)
              : undefined;
          const notePErr =
            fieldName === "participantSteps"
              ? (getAt(errors, `${base}.noteParticipant`) as { message?: string } | undefined)
              : undefined;
          const noteErr =
            fieldName === "studySteps"
              ? (getAt(errors, `${base}.note`) as { message?: string } | undefined)
              : undefined;

          return (
            <li key={f.id} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-2 w-8 text-center shrink-0 rounded-full bg-muted">
                  {i + 1}
                </div>

                <div className="flex-1 space-y-3">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-primary">Step name</label>
                    <Input
                      {...register(`${base}.name` as const)}
                      placeholder="e.g. Send screening survey"
                      aria-invalid={!!nameErr}
                    />
                    {showErrors && nameErr && (
                      <p className="mt-1 text-sm text-destructive">{nameErr.message ?? "Name is required"}</p>
                    )}
                  </div>

                  {/* Notes */}
                  {fieldName === "participantSteps" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-primary">Note (Researcher)</label>
                        <Input
                          {...register(`${base}.noteResearcher` as const)}
                          placeholder="Optional note for researchers"
                          aria-invalid={!!noteRErr}
                        />
                        {showErrors && noteRErr && (
                          <p className="mt-1 text-sm text-destructive">{noteRErr.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary">Note (Participant)</label>
                        <Input
                          {...register(`${base}.noteParticipant` as const)}
                          placeholder="Optional note visible to participants"
                          aria-invalid={!!notePErr}
                        />
                        {showErrors && notePErr && (
                          <p className="mt-1 text-sm text-destructive">{notePErr.message}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-primary">Note (Optional)</label>
                      <Input
                        {...register(`${base}.note` as const)}
                        placeholder="Optional note"
                        aria-invalid={!!noteErr}
                      />
                      {showErrors && noteErr && (
                        <p className="mt-1 text-sm text-destructive">{noteErr.message}</p>
                      )}
                    </div>
                  )}

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-medium text-primary">Deadline (Optional)</label>
                    <Controller
                      name={`${base}.deadline`}
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                              <Button
                              type="button"
                              variant={"outline"}
                              className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                              )}
                              >
                              {field.value ? (
                                  format(field.value as Date, "PPP")
                              ) : (
                                  <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                          
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value as Date | undefined}
                                onSelect={(date) => field.onChange(date ?? undefined)}
                                captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                      )} 
                    />
                    
                    {/* <Input
                      type="date"
                      {...register(`${base}.deadline` as const)}
                      aria-invalid={!!deadlineErr}
                    /> */}
                    {showErrors && deadlineErr && (
                      <p className="mt-1 text-sm text-destructive">{deadlineErr.message}</p>
                    )}
                  </div>
                </div>

                {/* Row actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Button type="button" variant="secondary" onClick={() => i > 0 && move(i, i - 1)} disabled={i === 0}>
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => i < fields.length - 1 && move(i, i + 1)}
                    disabled={i === fields.length - 1}
                  >
                    ↓
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => duplicate(i)}>
                    Duplicate
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => remove(i)}>
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">No steps yet. Click “Add step”.</p>
      )}
    </div>
  );
}

export const ParticipantWorkflowForm = (p: { showErrors: boolean }) => (
  <WorkflowFormBase fieldName="participantSteps" {...p} />
);

export const StudyWorkflowForm = (p: { showErrors: boolean }) => (
  <WorkflowFormBase fieldName="studySteps" {...p} />
);

const mapLevel = (lv: "No Preference" | "Optional" | "Required"): CriteriaMatchLevel =>
  lv === "Required" ? CriteriaMatchLevel.Required : CriteriaMatchLevel.Optional;

export function toCriteriaArray(ui: CriteriaUiValues): Criteria[] {
  const out: Criteria[] = [];

  const push = (cond: boolean, type: ProfileField, values: string[], level: "Optional" | "Required") => {
    if (!cond) return;
    out.push({ type, value: values, matchLevel: mapLevel(level) });
  };

  // 多選類
  if (ui.gender.matchLevel !== "No Preference")
    push(true, ProfileField.gender, ui.gender.values, ui.gender.matchLevel);

  if (ui.background.matchLevel !== "No Preference")
    push(true, ProfileField.background, ui.background.values, ui.background.matchLevel);

  if (ui.region.matchLevel !== "No Preference")
    push(true, ProfileField.region, ui.region.values, ui.region.matchLevel);

  if (ui.language.matchLevel !== "No Preference")
    push(true, ProfileField.language, ui.language.values, ui.language.matchLevel);

  // 年齡：以 ["min","max"] 兩格字串存，查詢時再轉 DOB 範圍
  if (ui.age.matchLevel !== "No Preference" && ui.age.min != null && ui.age.max != null) {
    push(true, ProfileField.birth, [String(ui.age.min), String(ui.age.max)], ui.age.matchLevel);
  }

  return out;
}

const { Stepper, useStepper } = defineStepper(
  {
    id: "info",
    title: "Study Info",
    schema: insertStudySchema,
    Component: StudyInfoForm,
  },
  {
    id: "session",
    title: "Session Details",
    schema: insertRecruitmentSchema,
    Component: SessionForm,
  },
  {
    id: "criteria",
    title: "Recruitment Criteria",
    // schema: criteriaUiSchema,
     schema: z.object({ criteria: criteriaUiSchema }),
    Component: CriteriaForm,
  },
  {
  id: "participantWorkflow",
  title: "Participant Workflow",
  schema: z.object({
    participantSteps: z
      .array(insertParticipantWorkflowStep)
      .min(1, "Please add at least one step"),
  }),
  Component: ParticipantWorkflowForm,
},
{
  id: "studyWorkflow",
  title: "Study Workflow",
  schema: z.object({
    studySteps: z
      .array(insertStudyWorkflowStep)
      .min(1, "Please add at least one step"),
  }),
  Component: StudyWorkflowForm,
},
  // {
  //   id: "participantWorkflow",
  //   title: "Participant Workflow",
  //     schema: insertStudySchema,
  //   Component: StudyInfoForm,
  // },
  // {
  //   id: "studyWorkflow",
  //   title: "Study Workflow",
  //     schema: insertStudySchema,
  //   Component: StudyInfoForm,
  // },


//   {
//     id: "studyWorkflow",
//     title: "Study Workflow",
//     schema: z.object({}),
//     Component: CompleteComponent,
//   }
);
// type FormValues = z.infer<typeof insertStudySchema> & z.infer<typeof insertRecruitmentSchema>;




export function StepperWithForm() {
  return (
    <Stepper.Provider labelOrientation="vertical">
      <FormStepperComponent />
    </Stepper.Provider>
  );
}

const FormStepperComponent = () => {
  
  const router = useRouter();
  const methods = useStepper();

  const form = useForm<StudyFullInput>({
    mode: "onTouched",
    resolver: zodResolver(createStudyFullSchema) as Resolver<StudyFullInput>,
    // resolver: zodResolver(methods.current.schema),
    defaultValues: {
    // 其他步的初值...
    criteria: {
      gender:     { matchLevel: "No Preference", values: [] },
      background: { matchLevel: "No Preference", values: [] },
      region:     { matchLevel: "No Preference", values: [] },
      language:   { matchLevel: "No Preference", values: [] },
      age:        { matchLevel: "No Preference", min: undefined, max: undefined },
    },
     participantSteps: [],  
    studySteps: [], 
  },
  });

  const [showErrorsByStep, setShowErrorsByStep] = useState<Record<string, boolean>>({});
  const showErrors = !!showErrorsByStep[methods.current.id];

  // const onSubmit = (values: z.infer<typeof methods.current.schema>) => {

//         const trimmedformatOther = values.formatOther?.trim();
//         const trimmedWebsite = values.website?.trim();

//         const payload = {
//         ...values,

//         formatOther:
//             values.format === "Other" && trimmedformatOther
//             ? trimmedformatOther
//             : null,

//         website:
//             trimmedWebsite === "" ? undefined : trimmedWebsite,
//         };

  //   alert(
  //     `Form values for step ${methods.current.id}: ${JSON.stringify(values)}`
  //   );
  // };

  const onSubmit = async (all: StudyFullInput) => {
    // 不是最後一步就不送（避免有人按 Enter 觸發 submit）
    if (!methods.isLast) return;

    // 1) 轉換 criteria（過濾掉 No Preference）
    const criteria = toCriteriaArray(all.criteria);

    // 2) 組 payload（order 用索引補）
    const payload = {
      name: all.name,
      description: all.description,

      format: all.format,
      formatOther: all.formatOther ?? null,
      durationMinutes: all.durationMinutes,
      sessionDetail: all.sessionDetail ?? null,
      criteriaDescription: all.criteriaDescription,
      reward: all.reward ?? null,

      criteria: criteria,
      participantSteps: (all.participantSteps ?? []).map((s, i) => ({ ...s, order: i + 1 })),
      studySteps: (all.studySteps ?? []).map((s, i) => ({ ...s, order: i + 1 })),

      // 可選：不傳 image / avatarResearcher / thankYouMessage，讓後端套預設
    } satisfies StudyCreatePayload;

    console.log(payload)

    try {
      const { slug } = await createStudyFull(payload);
      // 成功：導頁或重置
      // methods.reset(); // 如果你想回到第一步
      router.push(`/my-studies/view/${slug}/overview`);
    } catch (e) {
      console.error(e);
      toast.error(e as string);
    }
  };

  const fieldsByStep: Record<string, FieldPath<StudyFullInput>[]> = {
    info: ["name","description"],
    session: [
      "format","formatOther","durationMinutes",
      "sessionDetail","criteriaDescription","reward"
    ],
    criteria: [
      "criteria.gender.matchLevel","criteria.gender.values",
      "criteria.background.matchLevel","criteria.background.values",
      "criteria.region.matchLevel","criteria.region.values",
      "criteria.language.matchLevel","criteria.language.values",
      "criteria.age.matchLevel","criteria.age.min","criteria.age.max",
    ],
    participantWorkflow: ["participantSteps"],
    studyWorkflow: ["studySteps"],
  };

  const validateStep = async (stepId: string) => {
    const keys = fieldsByStep[stepId] ?? [];
    if (!keys.length) return true; // 這步沒有要驗證的欄位
    return await form.trigger(keys, { shouldFocus: true });
  };

  const handleNext = async () => {
    const ok = await validateStep(methods.current.id);
    if (!ok) {
      setShowErrorsByStep(p => ({ ...p, [methods.current.id]: true }));
      return;
    }
    methods.next();
  };



  return (
    <Form {...form}>
      <form 
        // onSubmit={form.handleSubmit(onSubmit)} 
         onSubmit={(e) => e.preventDefault()} // 不用原生 submit
          onKeyDown={(e) => {
            // 任何欄位按 Enter，如果不是最後一步就擋掉
            if (e.key === "Enter" && !methods.isLast) e.preventDefault();
          }}
        className="space-y-4 flex flex-col items-center w-full"
      >
        <Stepper.Navigation className="w-full max-w-[1000px] overflow-scroll mb-10">
          {methods.all.map((step) => (
            <Stepper.Step
              key={step.id}
              of={step.id}
              // type={step.id === methods.current.id ? "submit" : "button"}
              type="button"
               onClick={async () => {
                // 如果是往前跳，直接跳
                if (methods.all.indexOf(step) < methods.all.indexOf(methods.current)) {
                  methods.goTo(step.id);
                  return;
                }
                // 往後跳需要驗證
                const ok = await validateStep(methods.current.id);
                if (!ok) {
                  setShowErrorsByStep(p => ({ ...p, [methods.current.id]: true }));
                  return;
                }
                methods.goTo(step.id);
              }}
              // onClick={async () => {
              //   const valid = await form.trigger();
              //   if (!valid) return;
              //   methods.goTo(step.id);
              // }}
            >
              <Stepper.Title>{step.title}</Stepper.Title>
            </Stepper.Step>
          ))}
        </Stepper.Navigation>
        {methods.switch({
          info: ({ Component }) => <Component  showErrors={showErrors} />,
          session: ({ Component }) => <Component showErrors={showErrors} />,
          criteria: ({ Component }) => <Component showErrors={showErrors} />,
          participantWorkflow: ({ Component }) => <Component showErrors={showErrors} />,
          studyWorkflow: ({ Component }) => <Component showErrors={showErrors} />,
        })}
        <Stepper.Controls className="mt-10">
          {/* {!methods.isLast && ( */}
            <Button
              type="button" 
              variant="secondary"
              onClick={methods.prev}
              disabled={methods.isFirst}
            >
              Previous
            </Button>
          {/* )} */}
          <Button
           type="button"
           onClick={() => {
              if (!methods.isLast) {
                // 非最後一步：驗證當步
                handleNext();
              } else {
                // 最後一步：手動送出（不走原生 submit）
                form.handleSubmit(onSubmit)();
              }
            }}
            // type={methods.isLast ? "submit" : "button"}
              // onClick={
              //   methods.isLast
              //     ? undefined // submit 交給 form.handleSubmit(onSubmit)
              //     : handleNext
              // }
          >
            {methods.isLast ? "Create Study" : "Next"}
          </Button>
        </Stepper.Controls>
      </form>
    </Form>
  );
};


  // onClick={async () => {
  //   const valid = await form.trigger(undefined, { shouldFocus: true });
  //   if (!valid) {
  //     setShowErrorsByStep(p => ({ ...p, [methods.current.id]: true }));
  //     return;
  //   }
  //   methods.next();
  // }}

  //           type="submit"
              // onClick={() => {
              // if (methods.isLast) {
              //   return methods.reset();
              // }
              // methods.beforeNext(async () => {
              //   const valid = await form.trigger();
              //   if (!valid) return false;
              //   return true;
              // });
  //                 methods.beforeNext(async () => {
  //     const stepKeys = Object.keys((methods.current.schema as any)._def.shape) as any;
  // const valid = await form.trigger(stepKeys, { shouldFocus: true });
  // console.log("stepKeys", stepKeys);
  // console.log("form values", form.getValues());
  // console.log("valid", valid);
  // return valid; });
  //           }}

            // onClick={() => {
            //   if (methods.isLast) {
            //     return methods.reset();
            //   }
            //   methods.beforeNext(async () => {
            //     const valid = await form.trigger();
            //      console.log("trigger result", valid);
            //     if (!valid) return false;
            //     return true;
            //   });
             
            // }}
            // onClick={methods.isLast ? methods.reset : methods.next}
//             onClick={() => {
//     if (methods.isLast) {
//       return methods.reset();
//     }
//     methods.beforeNext(async () => {
//       const stepKeys = Object.keys((methods.current.schema as any)._def.shape) as any;
//   const valid = await form.trigger(stepKeys, { shouldFocus: true });
//   console.log("stepKeys", stepKeys);
//   console.log("form values", form.getValues());
//   console.log("valid", valid);
//   return valid;
// //      const stepKeys = Object.keys((methods.current.schema as any)._def.shape) as (keyof FormValues)[];
// // const valid = await form.trigger(stepKeys, { shouldFocus: true });

// //       if (!valid) return false;
// //       return true;
//     });
//   }}