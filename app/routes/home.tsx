import { Link } from "react-router";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Conform Example</h1>
      <p className="mb-4">Test multi-step form flow with Conform validation.</p>
      <Link
        to="/flow/test/step-1"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Start Test Form
      </Link>
    </div>
  );
}
