import Link from "next/link";
import { editorials } from "@/data/editorials";

export default function PortfolioPage() {
  return (
    <main>
      <h1>Portfolio</h1>
      <p>Portfolio landing placeholder.</p>
      <ul>
        {editorials.map((e) => (
          <li key={e.slug}>
            <Link href={`/portfolio/${e.slug}`}>{e.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}