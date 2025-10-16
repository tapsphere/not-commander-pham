import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Lobby from "./pages/Lobby";
import Profile from "./pages/Profile";
import Inventory from "./pages/Inventory";
import Wallet from "./pages/Wallet";
import Leaderboard from "./pages/Leaderboard";
import VoiceChat from "./pages/VoiceChat";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Play from "./pages/Play";
import { PlatformLayout } from "./components/platform/PlatformLayout";
import CreatorDashboard from "./pages/platform/CreatorDashboard";
import BrandDashboard from "./pages/platform/BrandDashboard";
import BrandProfileEdit from "./pages/platform/BrandProfileEdit";
import BrandProfile from "./pages/BrandProfile";
import Marketplace from "./pages/platform/Marketplace";
import CreatorPortfolio from "./pages/platform/CreatorPortfolio";
import TemplateDetail from "./pages/platform/TemplateDetail";
import ValidatorDemo from "./pages/ValidatorDemo";
import ValidatorTest from "./pages/platform/ValidatorTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Game Routes (Players) */}
          <Route path="/" element={<Index />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/voice-chat" element={<VoiceChat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          {/* Platform Routes (Creators & Brands) */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/platform" element={<PlatformLayout />}>
            <Route path="creator" element={<CreatorDashboard />} />
            <Route path="brand" element={<BrandDashboard />} />
            <Route path="brand/profile-edit" element={<BrandProfileEdit />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="creator/:creatorId" element={<CreatorPortfolio />} />
            <Route path="template/:templateId" element={<TemplateDetail />} />
            <Route path="validator-test" element={<ValidatorTest />} />
          </Route>
          
          {/* Public Brand Profile */}
          <Route path="/brand/:brandId" element={<BrandProfile />} />
          
          {/* Validator Demo */}
          <Route path="/validator-demo" element={<ValidatorDemo />} />
          
          {/* Public Play Route */}
          <Route path="/play/:code" element={<Play />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
