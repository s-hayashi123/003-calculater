import { ACTIONS } from "../types/types";

interface OperationButtonProps {
  dispatch: React.Dispatch<any>;
  operation: string;
}

export default function OperationButton({
  dispatch,
  operation,
}: OperationButtonProps) {
  return (
    <button
      onClick={() =>
        dispatch({
          type: ACTIONS.CHOOSE_OPERATION,
          payload: { operation },
        })
      }
    >
      {operation}
    </button>
  );
}
