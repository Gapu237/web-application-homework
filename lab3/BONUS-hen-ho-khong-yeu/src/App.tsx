
import { useReducer, useState, useId } from "react";

import {
  INITIAL_RELATIONSHIP_STATE,
} from "./types/relationship";

import { relationshipReducer } from "./utils/relationshipReducer";
import { RelationshipPanel } from "./components/RelationshipPanel";
import { EffortPanel } from "./components/EffortPanel";
import { MessagePanel } from "./components/MessagePanel";

import "./App.css";

function App() {
  const [state, dispatch] = useReducer(
    relationshipReducer,
    INITIAL_RELATIONSHIP_STATE,
  );

  const [redFlag, setRedFlag] = useState("");
  const alertId = useId();

  return (
    <main className="app-container">
      <header className="app-header">
        <p className="eyebrow">RELATIONSHIP STATE MACHINE</p>
        <h1>Hẹn Hò Nhưng Không Yêu</h1>
        <p>
          Một ứng dụng mô phỏng trạng thái và sự cân bằng
          trong một mối quan hệ.
        </p>
      </header>

      <div className="dashboard">
        <RelationshipPanel
          phase={state.phase}
          dispatch={dispatch}
        />

        <EffortPanel
          logs={state.effortLogs}
          dispatch={dispatch}
        />

        <MessagePanel
          phase={state.phase}
          dispatch={dispatch}
          onRedFlag={setRedFlag}
        />
      </div>

      <section
        className="red-flag-alert"
        id={alertId}
        aria-live="polite"
        aria-atomic="true"
      >
        {redFlag && (
          <p>
            <strong>Red flag:</strong> {redFlag}
          </p>
        )}
      </section>

      <footer>
        <p>Built with React, TypeScript and useReducer.</p>
      </footer>
    </main>
  );
}

export default App;
