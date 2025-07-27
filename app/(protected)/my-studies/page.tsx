import StudyList from "@/components/shared/study/studyList";
import sampleData from "@/db/sample-data";

const MyStudiesPage = () => {
  return (
    <>
      <StudyList data={sampleData.studies} type="researcher" />
    </>
  );
}
 
export default MyStudiesPage;