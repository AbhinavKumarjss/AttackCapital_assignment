import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Botpage from "./pages/bots";
import CallLogsPage from "./pages/calls";
export default function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Layout />}>

          <Route path="bots" element={<Botpage/>}></Route>
          <Route path="calls" element={<CallLogsPage/>}></Route>
          <Route path="settings" element={<Botpage/>}></Route>
        </Route>
      </Routes>
    </Router>
  );
}