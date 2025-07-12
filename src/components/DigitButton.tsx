import { ACTIONS } from "../types/types";

interface DigitButtonProps {
  dispatch: React.Dispatch<any>;
  digit: string;
}

export default function DigitButton({ dispatch, digit }: DigitButtonProps) {
  return (
    <button
      onClick={() => dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit } })}
    >
      {digit}
    </button>
  );
}
