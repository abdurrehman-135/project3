import { ArrowRight, CheckCircle2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { clearAuthError, login, register } from "../features/auth/authSlice";

const modes = {
  login: {
    title: "Sign in to your workspace",
    button: "Enter Dashboard",
  },
  register: {
    title: "Create your workspace",
    button: "Start Building",
  },
};

export function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, status, error } = useSelector((state) => state.auth);

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");

  const destination = useMemo(() => location.state?.from || "/dashboard", [location.state]);

  useEffect(() => {
    if (token) {
      navigate(destination, { replace: true });
    }
  }, [destination, navigate, token]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setLocalError("Email and password are required.");
      return;
    }

    if (mode === "register" && !form.name.trim()) {
      setLocalError("Name is required to create an account.");
      return;
    }

    setLocalError("");

    if (mode === "login") {
      await dispatch(login({ email: form.email, password: form.password }));
    } else {
      await dispatch(register(form));
    }
  };

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white/70 shadow-ambient backdrop-blur-xl lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative hidden overflow-hidden bg-brand-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_22%)]" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/70">TaskFlow</p>
            <h1 className="mt-8 max-w-md text-5xl font-black tracking-tight leading-[1.05]">
              A fluid project workspace for teams that move fast.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/80">
              Live tasks, shared projects, instant notifications, and a modern SaaS interface built from a real backend.
            </p>
          </div>

          <div className="relative grid gap-4">
            {[
              "Protected dashboard with JWT authentication",
              "MongoDB-backed projects, tasks, and notifications",
              "Real-time Socket.io updates across the workspace",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-xl">
            <div className="mb-10 space-y-4 text-center lg:text-left">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-primary/20 lg:mx-0">
                <ArrowRight size={22} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">{modes[mode].title}</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Use the same backend-backed workspace across dashboard, board, calendar, and detail views.
                </p>
              </div>
            </div>

            <div className="mb-8 flex rounded-2xl bg-surface-container-high p-1">
              {["login", "register"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    mode === item ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
                  }`}
                >
                  {item === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {mode === "register" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Full name</label>
                    <div className="relative">
                      <UserRound
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                      />
                      <input
                        className="ghost-input pl-11"
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Alex Morgan"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Title</label>
                    <input
                      className="ghost-input"
                      value={form.title}
                      onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                      placeholder="Creative Operations Lead"
                    />
                  </div>
                </>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm font-semibold">Email</label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  />
                  <input
                    type="email"
                    className="ghost-input pl-11"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Password</label>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  />
                  <input
                    type="password"
                    className="ghost-input pl-11"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {localError || error ? <p className="text-sm font-medium text-error">{localError || error}</p> : null}

              <button type="submit" className="primary-button w-full" disabled={status === "loading"}>
                {status === "loading" ? "Working..." : modes[mode].button}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

