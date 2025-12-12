import { Link } from "react-router";

export function Home() {
  return (
    <ul>
      <li>
        <Link to="/e2e/encoder">e2e: encoder</Link>
      </li>
      <li>
        <Link to="/e2e/dynamic">e2e: dynamic</Link>
      </li>
    </ul>
  );
}
