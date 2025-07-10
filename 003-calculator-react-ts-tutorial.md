# 【React & TypeScript】useReducerで作る！高機能電卓開発チュートリアル (003)

このチュートリアルでは、`web-dev-100-challenge`の課題`003`に基づき、ReactとTypeScriptを使った電卓アプリケーションの作成手順を詳細に解説します。

この課題では、状態管理が複雑になりがちなため、React Hooksの中でも特に強力な `useReducer` を活用します。`useState` との違いを学びながら、より宣言的でメンテナンス性の高いコードを目指しましょう。

## 🎯 課題の確認

まずは、`003-calculator.md`で定義されている要件と学習ポイントを再確認しましょう。

- **主要機能**: 四則演算、クリア（C/AC）、小数点対応
- **技術スタック**: React, TypeScript, Vite
- **学習ポイント**: `useReducer`による複雑な状態管理、TypeScriptによる型定義（State, Action）、CSS Grid LayoutによるUI構築

---

## 開発ステップ

### Step 0: 開発環境の準備

Viteを使ってReact + TypeScriptのプロジェクトを素早く立ち上げます。

1.  ターミナルを開き、以下のコマンドを実行します。

    ```bash
    npm create vite@latest 003-calculator -- --template react-ts
    ```

2.  作成されたプロジェクトフォルダに移動し、依存関係をインストールします。

    ```bash
    cd 003-calculator
    npm install
    ```

3.  開発サーバーを起動し、動作を確認します。

    ```bash
    npm run dev
    ```

    ブラウザで `http://localhost:5173/` が開き、Viteのロゴが表示されれば成功です。

---

### Step 1: プロジェクトの骨格作り（UIとコンポーネント）

まず、アプリケーションの見た目とコンポーネントの構成を整えます。

1.  **`App.css`の編集:**
    `src/App.css` を開き、中身をすべて削除して、電卓のレイアウトのためのCSSを記述します。CSS Grid Layoutを使うと、ボタンの配置を直感的に定義できます。

    ```css
    /* src/App.css */
    *, *::before, *::after {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: linear-gradient(to right, #00AAFF, #00FF6C);
    }

    .calculator-grid {
      display: grid;
      justify-content: center;
      align-content: center;
      min-height: 100vh;
      grid-template-columns: repeat(4, 100px);
      grid-template-rows: minmax(120px, auto) repeat(5, 100px);
    }

    .calculator-grid > button {
      cursor: pointer;
      font-size: 2rem;
      border: 1px solid white;
      outline: none;
      background-color: rgba(255, 255, 255, .75);
    }

    .calculator-grid > button:hover {
      background-color: rgba(255, 255, 255, .9);
    }

    .span-two {
      grid-column: span 2;
    }

    .output {
      grid-column: 1 / -1;
      background-color: rgba(0, 0, 0, .75);
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      flex-direction: column;
      padding: 10px;
      word-wrap: break-word;
      word-break: break-all;
    }

    .output .previous-operand {
      color: rgba(255, 255, 255, .75);
      font-size: 1.5rem;
    }

    .output .current-operand {
      color: white;
      font-size: 2.5rem;
    }
    ```

2.  **コンポーネントの作成:**
    `src`フォルダに`components`フォルダを作成し、中に以下の2つのコンポーネントファイルを新規作成します。

    - `DigitButton.tsx`: 数字と小数点（.）用のボタン
    - `OperationButton.tsx`: 演算子（+, -, *, /）用のボタン

3.  **`App.tsx`の骨格:**
    `src/App.tsx`を開き、中身を以下のように書き換えます。この時点では、まだロジックは空っぽです。

    ```tsx
    // src/App.tsx
    import './App.css';

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
    ```

---

### Step 2: 状態管理の設計 (`useReducer`)

電卓の複雑な状態遷移を管理するために`useReducer`を導入します。

1.  **アクションの定義:**
    `src`フォルダに`types.ts`ファイルを作成し、どのような操作が可能かを定義します。

    ```ts
    // src/types.ts
    export const ACTIONS = {
      ADD_DIGIT: 'add-digit',
      CHOOSE_OPERATION: 'choose-operation',
      CLEAR: 'clear',
      ALL_CLEAR: 'all-clear',
      EVALUATE: 'evaluate',
    } as const;

    // as const を使うことで、ACTIONSオブジェクトの各プロパティが具体的な文字列リテラル型になる
    // これにより、Actionの型定義で `ACTIONS[keyof typeof ACTIONS]` のようにして値を取り出せる
    ```

2.  **StateとActionの型定義:**
    `App.tsx`に戻り、`useReducer`で管理する`state`と、`state`を更新するための`action`の型を定義します。

    ```tsx
    // src/App.tsx の上部に追加
    import { useReducer } from 'react';
    import { ACTIONS } from './types';

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
    ```

3.  **Reducer関数の作成:**
    状態更新のロジックを集約する`reducer`関数を定義します。`switch`文を使って、`action`の種類ごとに処理を分岐させるのが定石です。

    ```tsx
    // App.tsx に追加
    const initialState: State = {
      currentOperand: null,
      previousOperand: null,
      operation: null,
      overwrite: false,
    };

    function reducer(state: State, action: Action): State {
      switch (action.type) {
        // 各アクションの処理は後ほど実装
        default:
          return state;
      }
    }
    ```

4.  **`useReducer`の呼び出し:**
    `App`コンポーネント内で`useReducer`を呼び出し、`state`と`dispatch`関数を取得します。

    ```tsx
    // Appコンポーネント内
    const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(reducer, initialState);
    ```
    - `state`: 現在の状態オブジェクト
    - `dispatch`: `action`を`reducer`に送るための関数

---

### Step 3: 数字と演算子のボタンコンポーネント

再利用可能なボタンコンポーネントを作成します。

1.  **`DigitButton.tsx`:**

    ```tsx
    // src/components/DigitButton.tsx
    import { ACTIONS } from '../types';

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
    ```

2.  **`OperationButton.tsx`:**

    ```tsx
    // src/components/OperationButton.tsx
    import { ACTIONS } from '../types';

    interface OperationButtonProps {
      dispatch: React.Dispatch<any>;
      operation: string;
    }

    export default function OperationButton({ dispatch, operation }: OperationButtonProps) {
      return (
        <button
          onClick={() =>
            dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation } })
          }
        >
          {operation}
        </button>
      );
    }
    ```

3.  **`App.tsx`でコンポーネントを使用:**
    作成したコンポーネントをインポートして、`App.tsx`のJSXを書き換えます。

    ```tsx
    // App.tsx の return 文を修正
    // ... (imports)
    import DigitButton from './components/DigitButton';
    import OperationButton from './components/OperationButton';

    // ... (App component)
    return (
      <div className="calculator-grid">
        <div className="output">
          <div className="previous-operand">{previousOperand} {operation}</div>
          <div className="current-operand">{currentOperand}</div>
        </div>
        <button className="span-two" onClick={() => dispatch({ type: ACTIONS.ALL_CLEAR })}>AC</button>
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
        <button className="span-two" onClick={() => dispatch({ type: ACTIONS.EVALUATE })}>=</button>
      </div>
    );
    ```

---

### Step 4: Reducerロジックの実装

いよいよ電卓の頭脳部分である`reducer`関数の中身を実装していきます。

**`ADD_DIGIT` (数字入力):**

```tsx
// reducer関数内のswitch文に追加
case ACTIONS.ADD_DIGIT:
  if (state.overwrite) {
    return {
      ...state,
      currentOperand: action.payload.digit,
      overwrite: false,
    };
  }
  if (action.payload.digit === "0" && state.currentOperand === "0") return state;
  if (action.payload.digit === "." && state.currentOperand?.includes(".")) return state;
  return {
    ...state,
    currentOperand: `${state.currentOperand || ""}${action.payload.digit}`,
  };
```

**`CHOOSE_OPERATION` (演算子選択):**

```tsx
// reducer関数内のswitch文に追加
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
    previousOperand: evaluate(state), // 連続で演算子が押されたら計算
    operation: action.payload.operation,
    currentOperand: null,
  };
```

**`CLEAR` & `ALL_CLEAR` (クリア機能):**

```tsx
// reducer関数内のswitch文に追加
case ACTIONS.CLEAR:
  return {
    ...state,
    currentOperand: null,
  };
case ACTIONS.ALL_CLEAR:
  return initialState; // 初期状態に戻す
```

**`EVALUATE` (計算実行):**

```tsx
// reducer関数内のswitch文に追加
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
    overwrite: true, // 計算直後は上書きモード
    previousOperand: null,
    operation: null,
    currentOperand: evaluate(state),
  };
```

---

### Step 5: 計算ロジックと仕上げ

`reducer`から呼び出される計算関数`evaluate`を実装します。

1.  **`evaluate`関数の作成:**
    `App.tsx`の`reducer`関数の外に、計算を実行するヘルパー関数を作成します。

    ```tsx
    // App.tsx に追加
    function evaluate({ currentOperand, previousOperand, operation }: State): string {
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
          if (current === 0) return "Error"; // 0除算エラー
          computation = prev / current;
          break;
      }
      return computation.toString();
    }
    ```
    **注意:** `!` (Non-null assertion operator) は、値が`null`や`undefined`でないことをTypeScriptコンパイラに伝えるものです。`evaluate`が呼び出される文脈では`null`でないことが保証されているため、ここでは使用しています。

2.  **数値のフォーマット（任意）:**
    `003-calculator.md`のヒントにあるように、`Intl.NumberFormat`を使うと、表示を見やすくできます。興味があれば実装してみましょう。

## 🏆 完成！

お疲れ様でした！これで`003-calculator.md`の要件を満たした、`useReducer`ベースの電卓アプリが完成しました。

このプロジェクトを通して、`useState`だけでは管理が煩雑になりがちな状態を、`useReducer`がいかに整理し、見通しを良くしてくれるかを体験できたはずです。

ここからさらに、キーボード入力への対応、計算履歴の表示、テーマの切り替え機能などに挑戦してみるのも良い学習になります。

---

