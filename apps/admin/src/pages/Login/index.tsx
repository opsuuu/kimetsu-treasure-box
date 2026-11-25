import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    // 送出後收回明文，避免登入失敗時密碼一直顯示在畫面上
    setShowPassword(false);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (signInError || !data.session) {
      setError("帳號或密碼錯誤");
      setLoading(false);
      return;
    }

    const { data: adminProfile } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("user_id", data.session.user.id)
      .single();

    if (!adminProfile) {
      await supabase.auth.signOut();
      setError("此帳號沒有後台存取權限");
      setLoading(false);
      return;
    }

    navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6fa] px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-giyu to-shinobu px-5 py-2 shadow-sm">
            <span className="text-sm font-bold tracking-widest text-white">
              義忍 × 圖鑑
            </span>
          </div>
          <p className="text-sm text-gray-500">後台管理系統</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <h1 className="mb-1 text-xl font-bold text-gray-900">登入您的帳號</h1>
          <p className="mb-8 text-sm text-gray-500">僅限授權管理員存取</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="mb-1.5 text-gray-700">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="h-10 bg-gray-50 focus-visible:border-giyu focus-visible:ring-giyu/20"
              />
            </div>

            <div>
              <Label className="mb-1.5 text-gray-700">密碼</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10 bg-gray-50 pr-10 focus-visible:border-shinobu focus-visible:ring-shinobu/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                  className="absolute inset-y-0 right-1.5 my-auto text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-linear-to-r from-giyu to-shinobu hover:from-[#336a91] hover:to-[#6a4f91] text-white border-transparent"
            >
              {loading ? "登入中..." : "登入"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          僅限授權人員登入 · 義忍同好委員會
        </p>
      </div>
    </div>
  );
}
