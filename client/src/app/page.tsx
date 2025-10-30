import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
    return null; // Prevent rendering anything before redirect
  }

  return <div>Loading...</div>; // Placeholder until authenticated content is loaded
}
