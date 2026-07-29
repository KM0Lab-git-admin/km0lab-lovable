import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import PostalCode from "./pages/PostalCode";
import Home from "./pages/Home";
import Points from "./pages/Points";
import HistorialPunts from "./pages/HistorialPunts";
import PointsActions from "./pages/PointsActions";
import Premis from "./pages/Premis";
import PremisCanjats from "./pages/PremisCanjats";

import Agenda from "./pages/Agenda";
import Evento from "./pages/Evento";
import Noticias from "./pages/Noticias";
import Comercos from "./pages/Comercos";
import ComercDetall from "./pages/ComercDetall";
import Scanner from "./pages/Scanner";
import ScannerSuccess from "./pages/ScannerSuccess";
import Login from "./pages/Login";
import CheckEmail from "./pages/CheckEmail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import DesignSystem from "./pages/DesignSystem";




import TopLoadingBar from "./components/TopLoadingBar";
import RequireAuth from "./components/RequireAuth";
import { LangProvider } from "./contexts/LangContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LangProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TopLoadingBar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/postal-code" element={<PostalCode />} />
            <Route path="/login" element={<Login />} />
            <Route path="/check-email" element={<CheckEmail />} />
            
            <Route path="/home" element={<Home />} />
            <Route path="/home-registered" element={<Home forceAuthState="authed" />} />
            <Route path="/points" element={<Points />} />
            <Route path="/points-history" element={<RequireAuth><HistorialPunts /></RequireAuth>} />
            <Route path="/points-actions" element={<PointsActions />} />
            <Route path="/rewards" element={<Premis />} />
            <Route path="/redeemed-rewards" element={<RequireAuth><PremisCanjats /></RequireAuth>} />


            <Route path="/events" element={<Agenda />} />
            <Route path="/event" element={<Evento />} />
            <Route path="/news" element={<Noticias />} />
            <Route path="/merchants" element={<Comercos />} />
            <Route path="/merchants/:id" element={<ComercDetall />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/scanner/success" element={<ScannerSuccess />} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

            <Route path="/design-system" element={<DesignSystem />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LangProvider>
  </QueryClientProvider>
);

export default App;
