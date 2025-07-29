import { PrismaClient } from "@prisma/client";
import sampleData from "./sample-data";

const prisma = new PrismaClient();

async function seedUsers() {
  for (const user of sampleData.users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        isResearcher: user.isResearcher,
        institution: user.institution || undefined,
        profile: {
          create: {
            birth: user.profile.birth ? new Date(user.profile.birth) : undefined,
            gender: user.profile.gender || undefined,
            language: user.profile.language || undefined,
            website: user.profile.website || undefined,
            region: user.profile.region || undefined,
            background: user.profile.background || undefined,
            avatarBase: user.profile.avatarBase || undefined,
            avatarAccessory: user.profile.avatarAccessory || undefined,
            avatarBg: user.profile.avatarBg || undefined
          }
        }
      }
    });
  }
}

async function seedStudies() {
  for (const study of sampleData.studies) {
    await prisma.study.create({
      data: {
        id: study.id,
        name: study.name,
        slug: study.slug,
        description: study.description,
        status: study.status as any,
        recruitmentStatus: study.recruitmentStatus as any,
        createdAt: study.createdAt,
        collaborators: {
          create: study.collaborators.map(c => ({
            user: { connect: { id: c.userId } },
            role: c.role as any
          }))
        },
        criteria: {
          create: study.criteria.map(c => ({
            type: c.type as any,
            value: c.value,
            matchLevel: c.matchLevel as any
          }))
        },
        recruitment: {
          create: {
            ...study.recruitment
          }
        },
        form: {
          create: {
            id: study.form.id,
            description: study.form.description,
            questions: {
              create: study.form.questions.map(q => ({
                id: q.id,
                text: q.text,
                type: q.type as any,
                required: q.required,
                evaluationType: q.evaluationType as any,
                options: {
                    create: (q.options as { text: string; score?: number }[]).map(o => ({
                      text: o.text,
                      score: o.score ?? undefined
                    }))
                  }
              }))
            }
          }
        }
      }
    });
  }
}

async function seedParticipations() {
  for (const part of sampleData.participations) {
    await prisma.participation.create({
      data: {
        id: part.id,
        user: { connect: { id: part.userId } },
        study: { connect: { id: part.studyId } },
        status: part.status as any,
        inviteStatus: part.inviteStatus as any,
        appliedAt: part.appliedAt ? new Date(part.appliedAt) : undefined,
        invitedAt: part.invitedAt ? new Date(part.invitedAt) : undefined,
        formResponses: {
          create: part.formResponses.map(resp => ({
            id: resp.id,
            form: { connect: { id: resp.formId } },
            submittedAt: new Date(resp.submittedAt),
            answers: {
              create: resp.answers.map(ans => ({
                id: ans.id,
                question: { connect: { id: ans.questionId } },
                text: ans.text,
                selectedOptions: {
                    create: (ans.selectedOptions as { optionId: string }[]).map(sel => ({
                      option: { connect: { id: sel.optionId } }
                    }))
                  }
              }))
            }
          }))
        }
      }
    });
  }
}

async function main() {
  await prisma.formAnswerSelectedOption.deleteMany();
  await prisma.formAnswer.deleteMany();
  await prisma.formResponse.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.formQuestion.deleteMany();
  await prisma.formOption.deleteMany();
  await prisma.form.deleteMany();
  await prisma.criteria.deleteMany();
  await prisma.collaborator.deleteMany();
  await prisma.recruitment.deleteMany();
  await prisma.study.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Old data cleared");

  await seedUsers();
  console.log("Users seeded");

  await seedStudies();
  console.log("Studies seeded");

  await seedParticipations();
  console.log("Participations seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
