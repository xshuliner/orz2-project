import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { UseMotionEffects } from "./components/UseMotionEffects";
import { HomePage } from "./pages/HomePage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ProductsPage } from "./pages/ProductsPage";
import { TeamPage } from "./pages/TeamPage";
import { ToolPage } from "./pages/ToolPage";

export function App() {
  return (
    <>
      <UseMotionEffects />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
        </Route>
      </Routes>
    </>
  );
}
