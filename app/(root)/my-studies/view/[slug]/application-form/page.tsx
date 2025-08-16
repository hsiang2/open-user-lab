'use client'

import { FormValues } from "@/types";
import { useStudy } from "../StudyProviderClient";
import { ApplicationSettingForm } from "./ApplicationSettingForm";

const toFormValues = (study: any): FormValues => ({
  description: study.form?.description ?? "",
  form: (study.form?.questions ?? []).map((q: any) => ({
    text: q.text,
    required: q.required,
    type: q.type,
    evaluationType: q.evaluationType,
    options: (q.options ?? []).map((o: any) => ({
      text: o.text,
      score: o.score ?? undefined,
    })),
  })),
});

const StudyRecruitmentSettingPage = () => {
    const study = useStudy();
    const initial = toFormValues(study);
   
    // const getUserAvatar
    return (
        <div className="my-8">
            <div className="flex flex-col flex-center space-y-10">
                <h2 className="text-subtitle">Application Form</h2>
                <ApplicationSettingForm   initial={initial} slug={study.slug} studyStatus={study.status}  />
            </div>
        </div>
    );
}
 
export default StudyRecruitmentSettingPage;
