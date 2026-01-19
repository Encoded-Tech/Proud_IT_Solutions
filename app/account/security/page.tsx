"use client";

import { useEffect, useState, useTransition } from "react";
import { AuthUser } from "@/redux/features/auth/userSlice";

import { getCurrentUserAction } from "@/lib/server/fetchers/fetchUser";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { signOut } from "next-auth/react";
import { updatePasswordAction } from "@/lib/server/actions/public/user/updatePasswordAction";

export default function SecurityPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUserAction();
      setUser(u);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6 text-sm text-gray-600">Loading security settings…</div>;
  if (!user) return <div className="p-6 text-sm text-red-600">Unauthorized</div>;

  const isOAuthUser = user.provider !== "credentials" || !user.hasPassword;

  const validatePassword = (password: string) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be strong. Minimum 8 characters, include uppercase, lowercase, number, and special symbol."
      );
      return;
    }

    startTransition(async () => {
      const res = await updatePasswordAction({ currentPassword, newPassword });

      if (!res.success) {
        setError(res.message);
        toast.error(res.message);
      } else {
        setSuccess(res.message);
        toast.success(res.message);

        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Auto clear messages after 5 seconds
        setTimeout(() => {
          setSuccess(null);
          setError(null);
        }, 5000);

        // Show logout confirmation
        setLogoutDialogOpen(true);
      }
    });
  };

  const handleForceLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const renderPasswordInput = (
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    placeholder: string,
    show: boolean,
    toggleShow: () => void
  ) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
        value={value}
        onChange={onChange}
        required
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Security</h1>
        <p className="mt-1 text-sm text-gray-600">Manage how you sign in and protect your account.</p>
      </div>

      {/* Security Overview */}
      <div className="rounded-xl border bg-gray-50 p-5">
        <h2 className="font-medium mb-2">Account Protection</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          We use secure authentication and encrypted credentials to keep your account safe. Some security options depend on how you signed in.
        </p>
      </div>

      {/* Authentication Method */}
      <div className="rounded-xl border p-5">
        <h2 className="font-medium mb-2">Sign-in Method</h2>
        {isOAuthUser ? (
          <p className="text-sm text-gray-700">
            You are signed in using <strong>Google</strong>. Authentication and password management are securely handled by Google.
          </p>
        ) : (
          <p className="text-sm text-gray-700">
            You are signed in using <strong>Email & Password</strong>. You can update your password below.
          </p>
        )}
      </div>

      {/* Password Section */}
      {isOAuthUser ? (
        <div className="rounded-xl border bg-gray-50 p-5">
          <h2 className="font-medium mb-2">Password Management</h2>
          <p className="text-sm text-gray-600">
            Password changes are not available for Google-based accounts. To update your password, manage your security settings directly from your Google account.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="font-medium">Change Password</h2>
          <p className="text-sm text-gray-600">Use a strong password that you don’t reuse anywhere else.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {renderPasswordInput(currentPassword, (e) => setCurrentPassword(e.target.value), "Current password", showCurrent, () => setShowCurrent((v) => !v))}
            {renderPasswordInput(newPassword, (e) => setNewPassword(e.target.value), "New password", showNew, () => setShowNew((v) => !v))}
            {renderPasswordInput(confirmPassword, (e) => setConfirmPassword(e.target.value), "Confirm new password", showConfirm, () => setShowConfirm((v) => !v))}

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center rounded bg-primary hover:bg-primary/80 px-4 py-2 text-white disabled:opacity-50"
            >
              {isPending ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      )}

      {/* Security Tips */}
      <div className="rounded-xl border bg-gray-50 p-5">
        <h2 className="font-medium mb-3">Security Tips</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>Use a unique password for this account</li>
          <li>Never share your login credentials</li>
          <li>Log out from shared or public devices</li>
          <li>Keep your email account secure</li>
        </ul>
      </div>

      {/* LOGOUT CONFIRMATION DIALOG */}
      {logoutDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Password Changed</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your password has been updated. For security reasons, please log in again.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={handleForceLogout}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition bg-primary hover:bg-primary/80"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
