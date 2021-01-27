import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button
            className={`square ${props.index === props.stepIndex ? "fw-900" : ""} ${props.numberOfWin.indexOf(props.index) !== -1 ? 'c-red' : ''}`}
            onClick={props.onClick}
        >
            {props.value.value ? props.value.value : ''}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                index={i}
                stepIndex={this.props.stepIndex}
                numberOfWin={this.props.numberOfWin}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    renderRow(row) {
        return (
            [0, 1, 2].map((col) => {
                return this.renderSquare(3 * row + col)
            })
        )
    }

    render() {
        // Rewrite Board to use two loops to make the squares instead of hardcoding them
        return (
            [0, 1, 2].map((row) => {
                return (
                    <div className="board-row" key={row}>
                        {this.renderRow(row)}
                    </div>
                )
            })
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    index: 0,
                    squares: Array(9).fill({
                        value: "",
                        row: "",
                        col: ""
                    })
                }
            ],
            stepNumber: 0, // 第几步
            stepIndex: [0], // 点击的index的顺：[0, 5, 7...]
            sortType: 'asc', // asc desc
            xIsNext: true,
            numberOfWin: [] // 胜者的index数组。如：[2, 5, 8]
        };
    }

    handleClick(i) {
        const stepIndex = this.state.stepIndex.slice(0, this.state.stepNumber + 1).concat(i);
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i].value) {
            return;
        }
        // Display the location for each move in the format (col, row) in the move history list
        squares[i] = {
            value: this.state.xIsNext ? "X" : "O",
            row: parseInt(i % 3),
            col: parseInt(i / 3)
        }
        this.setState({
            history: history.concat([
                {
                    index: history.length,
                    squares: squares
                }
            ]),
            stepNumber: history.length,
            stepIndex: stepIndex,
            xIsNext: !this.state.xIsNext
        }, () => {
            this.setColorSquare();
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        }, () => {
            this.setColorSquare();
        });
    }

    // when someone wins, highlight the three squares that caused the win
    setColorSquare() {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const winner = calculateWinner(squares);
        this.setState({
            numberOfWin: winner ? winner[1] : []
        })
    }

    sort() {
        this.setState({
            sortType: this.state.sortType === 'asc' ? 'desc' : 'asc'
        })
    }

    render() {
        console.log(this.state.stepNumber)
        const current = this.state.history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const stepIndex = this.state.sortType === 'asc' ? this.state.stepIndex : this.state.stepIndex.slice().reverse();
        const moves = this.state.history.slice().sort((a, b) => {  // 也可使用reverse()
            return this.state.sortType === 'asc' ? a.index - b.index : b.index - a.index
        }).map((step, i) => {
            let index = stepIndex[i],
                row = index !== undefined ? step.squares[index].row : '',
                col = index !== undefined ? step.squares[index].col : '';
            var desc = step.index ?
                'Go to move #' + step.index + ' row:' + row + ' col: ' + col :
                'Go to game start';
            return (
                <li key={step.index}>
                    {/* Bold the currently selected item in the move list. */}
                    <button className={step.index === this.state.stepNumber ? 'fw-900' : ''} onClick={() => this.jumpTo(step.index)}>{desc}</button>
                </li>
            );
        })

        let status;
        if (winner) {
            status = "Winner: " + winner[0].value;
        } else {
            // When no one wins, display a message about the result being a draw
            status = stepIndex.length === 10 && this.state.stepNumber === 9 ? "和局" : "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        stepIndex={this.state.stepIndex[this.state.stepNumber]}
                        numberOfWin={this.state.numberOfWin}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div style={{ marginBottom: '6px' }}>{status}</div>
                    {/* Add a toggle button that lets you sort the moves in either ascending or descending order */}
                    <button style={{ marginBottom: '6px' }} onClick={() => this.sort()}>asc/desc</button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a].value && squares[a].value === squares[b].value && squares[a].value === squares[c].value) {
            return [squares[a], [a, b, c]];
        }
    }
    return null;
}
