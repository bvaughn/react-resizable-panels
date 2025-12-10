import { Link } from "react-router";

export function Home() {
  return (
    <ul>
      <li>
        <Link to="/e2e/conditionally-rendered-panels">
          e2e: conditionally-rendered-panels
        </Link>
      </li>
    </ul>
  );
}
