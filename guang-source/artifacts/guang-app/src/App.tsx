import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/lib/auth";
import { AuthProvider } from "@/lib/auth-provider";
import { useEffect } from "react";

import Login from "@/pages/login";
import Register from "@/pages/register";
import Recovery from "@/pages/recovery";
import Home from "@/pages/home";
import Resultado from "@/pages/resultado";
import Notebooks from "@/pages/notebooks";
import Notebook from "@/pages/notebook";
import Config from "@/pages/config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Component />;
}

function AuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Redirect to="/home" />;
  return <Component />;
}

function AuthWatcher() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        const url = typeof args[0] === "string" ? args[0] : args[0].toString();
        if (url.includes("/api/") && !url.includes("/auth/")) {
          logout();
          setLocation("/login");
        }
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [logout, setLocation]);

  return null;
}

function Router() {
  return (
    <>
      <AuthWatcher />
      <Switch>
        <Route path="/login">
          <AuthRoute component={Login} />
        </Route>
        <Route path="/register">
          <AuthRoute component={Register} />
        </Route>
        <Route path="/recovery">
          <AuthRoute component={Recovery} />
        </Route>
        <Route path="/home">
          <ProtectedRoute component={Home} />
        </Route>
        <Route path="/resultado">
          <ProtectedRoute component={Resultado} />
        </Route>
        <Route path="/notebooks/:id">
          <ProtectedRoute component={Notebook} />
        </Route>
        <Route path="/notebooks">
          <ProtectedRoute component={Notebooks} />
        </Route>
        <Route path="/config">
          <ProtectedRoute component={Config} />
        </Route>
        <Route path="/">
          <Redirect to="/login" />
        </Route>
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
