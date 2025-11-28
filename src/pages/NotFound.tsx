import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { NavHeader } from "@/components/NavHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="max-w-md mx-auto px-4 py-16">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-wine/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-wine" />
            </div>
            <h1 className="text-4xl font-medium text-foreground mb-2">404</h1>
            <p className="text-muted-foreground mb-6">
              The page you're looking for doesn't exist.
            </p>
            <Button asChild variant="wine">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NotFound;
