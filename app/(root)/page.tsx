// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

import { auth } from "@/auth";
import { redirect } from "next/navigation";

const HomePage = async () => {
  const session = await auth();

  if (session) {
    if (session.user?.isResearcher) {
      redirect('/my-studies');
    } else {
      redirect('/my-participation');
    } 
  }

  redirect("/explore");
}
   
export default HomePage;