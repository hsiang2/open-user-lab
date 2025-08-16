import { z } from "zod";
import { AVATAR_ACCESSORY_KEYS, AVATAR_BACKGROUND, AVATAR_STYLE, BACKGROUND_CATEGORIES, GENDERS, LANGUAGES, RECRUITMENT_FORMATS, REGIONS } from "./constants";
import { CriteriaMatchLevel, EvaluationType, ProfileField, QuestionType } from "@prisma/client";

// Schema for inserting studies
export const insertStudySchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
    description: z.string().min(1, 'Description is required').max(1000, 'Description must be 1000 characters or fewer'),
    // status: StudyStatusEnum,
    // recruitmentStatus: RecruitmentStatusEnum
})

export const insertRecruitmentSchema = z.object({
    // description: z.string().max(1000, 'Description must be 1000 characters or fewer').optional(),
    reward: z.string().max(1000, 'Reward must be 1000 characters or fewer').nullable().optional(),
    format: z.array(z.enum(RECRUITMENT_FORMATS)).min(1).max(4),
    formatOther: z.string().max(100).nullable().optional(),
    durationMinutes: z.coerce.number().int().positive().max(24*60),
    sessionDetail: z.string().max(1000, 'Session detail must be 1000 characters or fewer').nullable().optional(),
    criteriaDescription: z.string().min(1, 'Criteria description is required').max(1000, 'Criteria description detail must be 1000 characters or fewer'),
})

export const fullRecruitmentSchema = insertRecruitmentSchema.extend({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be 2000 characters or fewer'),
  image: z.string().min(1, 'Image is required'),
  thankYouMessage: z
    .string()
    .max(2000, 'Thank you message must be 2000 characters or fewer'),
  avatarBaseResearcher: z.string().nullable().optional(),
  avatarAccessoryResearcher:  z.string().nullable().optional(),
});

export const insertCriteria = z.object({
  type: z.enum(ProfileField),
  value: z.array(z.string()),
  matchLevel: z.enum(CriteriaMatchLevel)
})


export const matchLevelUi = z.enum(["No Preference", "Optional", "Required"]);

const withValues = z.object({
  matchLevel: matchLevelUi,
  values: z.array(z.string()).default([]),
}).superRefine((v, ctx) => {
  if (v.matchLevel !== "No Preference" && v.values.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["values"],        
      message: "Please select at least one.",
    });
  }
});

export const criteriaUiSchema = z.object({
 gender: withValues,
  background: withValues,
  region: withValues,
  language: withValues,
  age: z.object({
    matchLevel: matchLevelUi,
    min: z.coerce.number().int().nonnegative().optional(),
    max: z.coerce.number().int().positive().optional(),
  }).superRefine((v, ctx) => {
    if (v.matchLevel === "No Preference") return;
    if (v.min == null) {
      ctx.addIssue({ code: "custom", path: ["min"], message: "Min is required." }); 
    }
    if (v.max == null) {
      ctx.addIssue({ code: "custom", path: ["max"], message: "Max is required." }); 
    }
    if (v.min != null && v.max != null && v.min > v.max) {
      ctx.addIssue({ code: "custom", path: ["max"], message: "Max must be ≥ Min." });
    }
  }),
});


export const insertParticipantWorkflowStep = z.object({
  name:  z.string().min(1, 'Name is required').max(1000, 'Name must be 1000 characters or fewer'),
  // order: z.number().int().positive(),  
  noteResearcher: z.string().max(1000, 'Note must be 1000 characters or fewer').optional(),
  noteParticipant:   z.string().max(1000, 'Note must be 1000 characters or fewer').optional(),
  deadline: z.coerce.date().optional(),
})

export const insertStudyWorkflowStep = z.object({
  name:  z.string().min(1, 'Name is required').max(1000, 'Name must be 1000 characters or fewer'),
  // order: z.number().int().positive(),  
  note: z.string().max(1000, 'Note must be 1000 characters or fewer').optional(),
  deadline: z.coerce.date().optional(),
})

export const createStudyFullSchema = insertStudySchema
  .and(insertRecruitmentSchema)
  .and(
    z.object({
      criteria: criteriaUiSchema,
      participantSteps: z.array(insertParticipantWorkflowStep).default([]),
      studySteps: z.array(insertStudyWorkflowStep).default([]),


      // thankYouMessage: z.string().max(1000).optional(),
      // avatarBaseResearcher: z.string().optional(),
      // avatarAccessoryResearcher: z.string().optional(),
      // image: z.string().optional(),
    })
  )

export const recruitmentGoalSchema = z.object({
  autoCloseSelectedCount: z.number().int().positive().nullable().optional(),
  autoCloseApplicantCount: z.number().int().positive().nullable().optional(),
  autoCloseDate: z.date().nullable().optional(),
});


// Schema for signing users in
export const signInFormSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

// Schema for signing up a user
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be at most 50 characters'),
    email: z.string().email('Invalid email address').max(100),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters').max(100),
    isResearcher: z.boolean().default(false),
    institution: z.string().max(100).optional()

  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

  export const avatarSchema = z
  .object({
    avatarBase: z.enum(AVATAR_STYLE),
    avatarBg: z.enum(AVATAR_BACKGROUND),
    avatarAccessory: z.enum(AVATAR_ACCESSORY_KEYS).nullable().optional(),
  }) 

  export const userProfileSchema = z
  .object({
    birth: z.coerce.date().max(new Date(), 'Birthdate cannot be in the future').optional(),
    gender: z.enum(GENDERS).optional(),
    language: z.array(z.enum(LANGUAGES)).optional(),
    website: z.string().max(1000, 'website must be 1000 characters or fewer').optional(),
    region: z.enum(REGIONS).optional(),
    background: z.array(z.enum(BACKGROUND_CATEGORIES)).optional(),
    genderOther: z.string().max(1000, 'gender must be 1000 characters or fewer').nullable().optional(),
    languageOther: z.string().max(1000, 'language must be 1000 characters or fewer').nullable().optional(),
    backgroundOther: z.string().max(1000, 'background must be 1000 characters or fewer').nullable().optional(),
  }) 
  .refine((data) => {
    if (data.gender === "Other") return !!data.genderOther?.trim();
    return true;
  }, {
    message: "Please describe your gender",
    path: ["genderOther"],
  })
  .refine((data) => {
    if (data.language?.includes("Other")) return !!data.languageOther?.trim();
    return true;
  }, {
    message: "Please specify your language",
    path: ["languageOther"],
  })
  .refine((data) => {
    if (data.background?.includes("Other")) return !!data.backgroundOther?.trim();
    return true;
  }, {
    message: "Please specify your background",
    path: ["backgroundOther"],
  });



//Form
export const optionInputSchema = z.object({
  text: z.string().trim().min(1, "Option is required"),
  score: z.union([z.number().int().min(0), z.literal("")]).optional(),
});

export const questionSchema = z
  .object({
    text: z.string().trim().min(1, "Question is required"),
    required: z.boolean().default(false),
    type: z.nativeEnum(QuestionType),
    evaluationType: z.nativeEnum(EvaluationType),
    options: z.array(optionInputSchema).optional().default([]),
  })
  .superRefine((q, ctx) => {
    if (q.type === QuestionType.text) {
      if (q.evaluationType === EvaluationType.automatic) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["evaluationType"],
          message: "Text questions cannot be automatically scored",
        });
      }
      if (q.options && q.options.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options"],
          message: "Text questions should not have options",
        });
      }
      return;
    }

    if (!q.options || q.options.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "At least one option is required",
      });
    }

    if (q.evaluationType === EvaluationType.automatic) {
      q.options?.forEach((opt, idx) => {
        if (opt.score === undefined || opt.score === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["options", idx, "score"],
            message: "Score is required for automatic evaluation",
          });
        }
      });
    }
  });

export const formSchema = z.object({
  description: z.string().max(2000).optional().nullable(),
  form: z.array(questionSchema).default([]),
});

/** 正規化
 * text 題清空 options
 * automatic 題：空值視為 0 分
 * 非 automatic 題：移除分數
 */
export const normalizedFormSchema = formSchema.transform((data) => {
  const desc = data.description ?? "";
  const description = desc.trim() === "" ? null : desc;

  return {
    ...data,
    description,
    form: data.form.map((q) => {
      if (q.type === QuestionType.text) {
        return { ...q, options: [] as Array<z.infer<typeof optionInputSchema>> };
      }
      const isAuto = q.evaluationType === EvaluationType.automatic;
      const options =
        q.options?.map((o) => ({
          text: o.text.trim(),
          score: isAuto
            ? typeof o.score === "number"
              ? o.score
              : 0
            : undefined,
        })) ?? [];
      return { ...q, options };
    }),
  };
});