import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Scan from "./pages/Scan";
import MyTickets from "./pages/MyTickets";
import Account from "./pages/Account";
import Layout from "./components/Layout";
import EventDetail from "./pages/EventDetail";
import Checkout from "./pages/Checkout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import Support from "./pages/Support";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/checkout/:id" element={<Checkout />} />
                <Route path="/scan" element={<Scan />} />
                <Route path="/my-tickets" element={<MyTickets />} />
                <Route path="/account" element={<Account />} />
              </Route>
            </Route>
            <Route path="/support" element={<Support />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;