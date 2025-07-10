import { useReducer } from "react";
import "./App.css";
import { ACTIONS } from "./types/types";

interface State {
  currentOperand?: string | null;
  previousOperand?: string | null;
  operation?: string | null;
  overview?: boolean;
}

type Action =
  | { type: typeof ACTIONS.ADD_DIGIT; payload: { digit: string } }
  | { type: typeof ACTIONS.CHOOSE_OPERATION; payload: { operation: string } }
  | { type: typeof ACTIONS.CLEAR }
  | { type: typeof ACTIONS.ALL_CLEAR }
  | { type: typeof ACTIONS.EVALUETE };

function App() {
  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand"></div>
        <div className="current-operand"></div>
      </div>
      <button className="span-two">AC</button>
      <button>C</button>
      <button>/</button>
      <button>1</button>
      <button>2</button>
      <button>3</button>
      <button>*</button>
      <button>4</button>
      <button>5</button>
      <button>6</button>
      <button>+</button>
      <button>7</button>
      <button>8</button>
      <button>9</button>
      <button>-</button>
      <button>.</button>
      <button>0</button>
      <button className="span-two">=</button>
    </div>
  );
}

export default App;
