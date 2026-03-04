import "./App.scss";

const App = () => (
  <div className="app">
    <aside className="panel" aria-label="Available items">
      <h2 className="panelTitle">Available</h2>
      <div className="panelContent">Left panel: list and filters (placeholder)</div>
    </aside>
    <aside className="panel" aria-label="Selected items">
      <h2 className="panelTitle">Selected</h2>
      <div className="panelContent">Right panel: selected list (placeholder)</div>
    </aside>
  </div>
);

export default App;
