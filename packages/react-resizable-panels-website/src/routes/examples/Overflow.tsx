import { useLayoutEffect, useRef, useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";

import Code from "../../components/Code";
import { ResizeHandle } from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";

export default function OverflowRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <p>
          Panels clip their content by default, to avoid showing scrollbars
          while resizing. Content can still be configured to overflow within a
          panel though. This example shows how.
        </p>
      }
      title="Overflow content"
    />
  );
}

function Content() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const div = ref.current!;

    const observer = new ResizeObserver(() => {
      setWidth(div.offsetWidth);
    });
    observer.observe(div);

    return () => {
      observer.unobserve(div);
      observer.disconnect();
    };
  }, []);

  const useVerticalLayout = width < 800;

  return (
    <div
      className={styles.PanelGroupWrapper}
      ref={ref}
      style={{ height: useVerticalLayout ? "30rem" : undefined }}
    >
      <PanelGroup
        className={styles.PanelGroup}
        direction={useVerticalLayout ? "vertical" : "horizontal"}
      >
        <Panel className={styles.PanelColumn} defaultSize={50} minSize={25}>
          <div
            className={styles.Centered}
            style={{ backgroundColor: "var(--color-background-code)" }}
          >
            <Code
              className={styles.Overflow}
              code={TUTORIAL_CODE_LEFT.trim()}
              language="jsx"
              showLineNumbers
            />
          </div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel className={styles.PanelColumn} defaultSize={50} minSize={25}>
          <div
            className={styles.Centered}
            style={{ backgroundColor: "var(--color-background-code)" }}
          >
            <Code
              className={styles.Overflow}
              code={TUTORIAL_CODE_RIGHT.trim()}
              language="jsx"
              showLineNumbers
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup direction="horizontal">
  <Panel>
    <div style="overflow: auto">
      {/* Content */}
    </div>
  </Panel>
  <PanelResizeHandle />
  <Panel>
    <div style="overflow: auto">
      {/* Content */}
    </div>
  </Panel>
</PanelGroup>
`;

const TUTORIAL_CODE_LEFT = `
// https://reactjs.org/tutorial/tutorial.html#completing-the-game
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
`;

const TUTORIAL_CODE_RIGHT = `
function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ? "Go to move #" + move : "Go to game start";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}
`;
