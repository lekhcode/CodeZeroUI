import { Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { LazyRouteFallback } from "@/components/ui/LazyRouteFallback";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { GuestRoute } from "@/routes/GuestRoute";
import {
  BrainCachePage,
  CommunityBrowsePage,
  CommunityCreatePostPage,
  CommunityHubPage,
  CommunityPostPage,
  DashboardPage,
  LabPage,
  ProblemDetailPage,
  SettingsPage,
  SubmissionsPage,
  TemplatesPage,
  TodayPage,
  UserSchedulesPage,
} from "@/routes/lazyPages";
import { GitHubCallbackPage } from "@/pages/auth/GitHubCallbackPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { OAuthCompleteRegistrationPage } from "@/pages/auth/OAuthCompleteRegistrationPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LazyRouteFallback />}>{children}</Suspense>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/github/callback" element={<GitHubCallbackPage />} />
        <Route path="/auth/github/success" element={<GitHubCallbackPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/oauth/complete" element={<OAuthCompleteRegistrationPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={
                <Lazy>
                  <DashboardPage />
                </Lazy>
              }
            />
            <Route
              path="/lab"
              element={
                <Lazy>
                  <LabPage />
                </Lazy>
              }
            />
            <Route
              path="/today"
              element={
                <Lazy>
                  <TodayPage />
                </Lazy>
              }
            />
            <Route
              path="/submissions"
              element={
                <Lazy>
                  <SubmissionsPage />
                </Lazy>
              }
            />
            <Route
              path="/templates"
              element={
                <Lazy>
                  <TemplatesPage />
                </Lazy>
              }
            />
            <Route
              path="/schedules"
              element={
                <Lazy>
                  <UserSchedulesPage />
                </Lazy>
              }
            />
            <Route
              path="/brain-cache"
              element={
                <Lazy>
                  <BrainCachePage />
                </Lazy>
              }
            />
            <Route
              path="/community"
              element={
                <Lazy>
                  <CommunityHubPage />
                </Lazy>
              }
            />
            <Route
              path="/community/browse"
              element={
                <Lazy>
                  <CommunityBrowsePage />
                </Lazy>
              }
            />
            <Route
              path="/community/new"
              element={
                <Lazy>
                  <CommunityCreatePostPage />
                </Lazy>
              }
            />
            <Route
              path="/community/posts/:id"
              element={
                <Lazy>
                  <CommunityPostPage />
                </Lazy>
              }
            />
            <Route
              path="/problems/:slug"
              element={
                <Lazy>
                  <ProblemDetailPage />
                </Lazy>
              }
            />
            <Route
              path="/settings"
              element={
                <Lazy>
                  <SettingsPage />
                </Lazy>
              }
            />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/community" replace />} />
        <Route path="*" element={<Navigate to="/community" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
