import StudyList from "@/components/shared/study/studyList";
import { getLatestStudies } from "@/lib/actions/study.actions";

const ExplorePage = async() => {
    const latestStudies = await getLatestStudies();

    return (
        <>
          <StudyList data={latestStudies} type="explore" />
        </>
      );
  }
   
  export default ExplorePage;