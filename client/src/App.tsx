import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ApplicationsQueue from "@/pages/applications-queue";
import NewApplication from "@/pages/new-application";
import ReviewExtraction from "@/pages/review-extraction";
import ScoreRecommendation from "@/pages/score-recommendation";
import DecisionApproval from "@/pages/decision-approval";
import HistoryPage from "@/pages/history";
import ReportsPage from "@/pages/reports";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/applications" component={ApplicationsQueue} />
      <Route path="/applications/new" component={NewApplication} />
      <Route path="/applications/:id/extraction" component={ReviewExtraction} />
      <Route path="/applications/:id/score" component={ScoreRecommendation} />
      <Route path="/applications/:id/decision" component={DecisionApproval} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/reports" component={ReportsPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
