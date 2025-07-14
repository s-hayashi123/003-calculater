import { useReducer } from "react";
import "./App.css";
import { ACTIONS } from "./types/types";
import DigitButton from "./components/DigitButton";
import OperationButton from "./components/OperationButton";

interface State {
  currentOperand?: string | null;
  previousOperand?: string | null;
  operation?: string | null;
  overwrite?: boolean;
}

type Action =
  | { type: typeof ACTIONS.ADD_DIGIT; payload: { digit: string } }
  | { type: typeof ACTIONS.CHOOSE_OPERATION; payload: { operation: string } }
  | { type: typeof ACTIONS.CLEAR }
  | { type: typeof ACTIONS.ALL_CLEAR }
  | { type: typeof ACTIONS.EVALUATE };

const initialState: State = {
  currentOperand: null,
  previousOperand: null,
  operation: null,
  overwrite: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: action.payload.digit,
          overwrite: false,
        };
      }
      if (action.payload.digit === "0" && state.currentOperand === "0")
        return state;
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${action.payload.digit}`,
      };

    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state;
      }
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: action.payload.operation,
        };
      }
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: action.payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        };
      }
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: action.payload.operation,
        currentOperand: null,
      };

    case ACTIONS.CLEAR:
      return {
        ...state,
        currentOperand: null,
      };
    case ACTIONS.ALL_CLEAR:
      return initialState;

    case ACTIONS.EVALUATE:
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state;
      }
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      };
  }
}

function evaluate({
  currentOperand,
  previousOperand,
  operation,
}: State): string {
  const prev = parseFloat(previousOperand!);
  const current = parseFloat(currentOperand!);
  if (isNaN(prev) || isNaN(current)) return "";
  let computation: number = 0;
  switch (operation) {
    case "+":
      computation = prev + current;
      break;
    case "-":
      computation = prev - current;
      break;
    case "*":
      computation = prev * current;
      break;
    case "/":
      if (current === 0) return "Error";
      computation = prev / current;
      break;
  }
  return computation.toString();
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
});

function formatOperand(operand: string | null | undefined) {
  if (operand == null) return;
  const [integer, decimal] = operand.split(".");
  if (decimal == null) return INTEGER_FORMATTER.format(Number(integer));
  return `${INTEGER_FORMATTER.format(Number(integer))}.${decimal}`;
}

function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    initialState
  );
  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)}
          {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.ALL_CLEAR })}
      >
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.CLEAR })}>C</button>
      <OperationButton operation="/" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
      >
        =
      </button>
    </div>
  );
}

export default App;
