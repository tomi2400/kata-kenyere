import { notFound } from "next/navigation";
import CustomerLimitPreview from "./preview";

export default function PreviewPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <CustomerLimitPreview />;
}
