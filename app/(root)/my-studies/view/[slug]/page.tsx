const StudyDetailsResearcherPage = async (props: {
    params: Promise<{
      slug: string;
    }>;
}) => {
    const { slug } = await props.params;
    
    return (
        <div className="flex flex-col items-center my-8">
            Detail
        </div>
    );
}
 
export default StudyDetailsResearcherPage;
