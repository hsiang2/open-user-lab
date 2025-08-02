import { z } from "zod";
import { AVATAR_ACCESSORY, AVATAR_BACKGROUND, AVATAR_STYLE } from "./constants";

const StudyStatusEnum = z.enum(['draft', 'ongoing', 'ended']);
const RecruitmentStatusEnum = z.enum(['open', 'closed']);

// Schema for inserting studies
export const insertStudySchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
    description: z.string().min(1, 'Description is required').max(1000, 'Description must be 1000 characters or fewer'),
    status: StudyStatusEnum,
    recruitmentStatus: RecruitmentStatusEnum
})

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
    avatarAccessory: z
      .union([
        z.enum(
          AVATAR_ACCESSORY
          .filter((a) => a.key !== null)
          .map((a) => a.key) as [string, ...string[]]
        ),
        z.literal(null),
      ])
      .optional(), 
  }) 


