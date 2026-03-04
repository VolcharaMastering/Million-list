import "./App.scss";
import { AvailablePanel } from "./components/AvailablePanel/AvailablePanel";
import { SelectedPanel } from "./components/SelectedPanel/SelectedPanel";

const App = () => (
  <div className="app">
    <AvailablePanel />
    <SelectedPanel />
  </div>
);

export default App;
