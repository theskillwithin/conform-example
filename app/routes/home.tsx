import { Link } from "react-router";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-2xl">Conform Example</h1>
      <p className="mb-4">Test multi-step form flow with Conform validation.</p>
      <Link
        to="/flow/test/step-1"
        className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Start Test Form
      </Link>
    </div>
  );
}
