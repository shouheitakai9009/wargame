import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from "./states";
import LandingPage from "./routes/LandingPage";
import BattlePage from "./routes/BattlePage";
import ErrorAlert from "./widgets/ErrorAlert";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/battle" element={<BattlePage />} />
        </Routes>
      </BrowserRouter>
      <ErrorAlert />
    </Provider>
  );
}

export default App;
