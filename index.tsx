import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, Action, Dispatch} from 'redux';
import { Provider } from 'react-redux';
import { connect } from 'react-redux';
import './style.css';

type SquareType =  ('O' | 'X' | null);

interface SquareProps {
    value: SquareType;
    onClick: () => void;
}

interface SqaureState {
  value: SquareType;
}

interface BoardState {
  squares:SquareType[];
  xIsNext: boolean;
}



function Square(props: SquareProps) {
    return (
      <button className="square" onClick={props.onClick}>
        {props.value}
      </button>
    );
}

interface BoardProps {
  squares: SquareType[];
  onClick: (number) => void;
}

class Board extends React.Component<BoardProps> {

  renderSquare(i) {
    return <Square 
              value={this.props.squares[i]}
              onClick={()=>this.props.onClick(i)}
              />;
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

interface HistoryData {
  squares: SquareType[];
}

interface GameProps {
  history: HistoryData[];
  stepNumber: number;
  xIsNext: boolean;
  onClick: (number) => void;
  jumpTo: (number) => void;
}

interface StateDef {
  history: HistoryData[];
  stepNumber: number;
  xIsNext: boolean;
}

class Game extends React.Component<GameProps> {

  render() {
    const history = this.props.history.slice();
    const current = history[this.props.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.props.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.props.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.props.onClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status }</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

const initState = {
        history: [{
          squares: Array<SquareType>(9).fill(null),
        }],
        stepNumber: 0,
        xIsNext: true,
      };

const reducer = (state: StateDef = initState,action) => {
  switch(action.type) {
    case 'HANDLECLICK':
      console.log("ACTION: " + action.index);
      const i = action.index;
      const history = state.history.slice(0, state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();

      if (calculateWinner(squares) || squares[i]) {
        return state;
      }
      squares[i] = state.xIsNext ? 'X' : 'O';
      return {
        history: history.concat([{
          squares: squares,
        }]),
        stepNumber: history.length,
        xIsNext: !state.xIsNext,
      };
    case 'JUMPTO':
      return {
          history: state.history,
          stepNumber: action.step,
          xIsNext: (action.step % 2) === 0
      };
    default:
      return state;
  }
}

const store = createStore(reducer);

function mapStateToProps(state: StateDef) {
  console.log("STATE: " + state);
  return state;
}

function mapDispatchToProps(dispatch: Dispatch ) {
  console.log("DISPATCH: " + dispatch);
  return { 
            onClick: (i:number) => { dispatch({ type: "HANDLECLICK",index: i }); } ,
            jumpTo: (step:number) => { dispatch({ type: "JUMPTO", step: step}); }
        };
}


const GameContainer = connect(mapStateToProps, mapDispatchToProps)(Game);

console.log(store.getState());

ReactDOM.render(
  <Provider store={store}>
    <GameContainer />
  </Provider>,
  document.getElementById('root')
);

function calculateWinner(squares: SquareType[]) {
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
