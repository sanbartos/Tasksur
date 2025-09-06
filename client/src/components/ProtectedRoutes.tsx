import { useAuth } from "@/contexts/AuthContext";
import { Route, Redirect } from "wouter";

type RouteComponentProps = {
  params?: { [key: string]: string | undefined };
};

export function PrivateRoute({ component: Component, ...rest }: { component: React.FC<RouteComponentProps>; path: string }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;

  return (
    <Route
      {...rest}
      component={(props) =>
        isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
}

export function PublicRoute({ component: Component, ...rest }: { component: React.FC<RouteComponentProps>; path: string }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;

  return (
    <Route
      {...rest}
      component={(props) =>
        !isAuthenticated ? <Component {...props} /> : <Redirect to="/home" />
      }
    />
  );
}






