import { z } from "zod";

const StudyStatusEnum = z.enum(['draft', 'ongoing', 'ended']);
const RecruitmentStatusEnum = z.enum(['open', 'closed']);

// Schema for inserting studies
export const insertStudySchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or fewer'),
    description: z.string().min(1, 'Description is required').max(1000, 'Description must be 1000 characters or fewer'),
    status: StudyStatusEnum,
    recruitmentStatus: RecruitmentStatusEnum
})