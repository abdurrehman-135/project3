import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { EmptyState } from "../components/common/EmptyState";
import { LoadingScreen } from "../components/common/LoadingScreen";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../features/notifications/notificationsSlice";
import { formatRelative } from "../utils/formatters";

export function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleOpen = async (notification) => {
    if (!notification.read) {
      await dispatch(markNotificationRead(notification._id));
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Notifications</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
            Real-time updates from task assignments, comments, and project activity.
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={() => dispatch(markAllNotificationsRead())}>
          Clear All
        </button>
      </section>

      {status === "loading" && !items.length ? <LoadingScreen label="Loading notifications..." /> : null}

      {!items.length && status !== "loading" ? (
        <EmptyState
          title="No notifications yet"
          description="Once collaborators create tasks, leave comments, or update projects, real-time notifications will appear here."
        />
      ) : null}

      {items.length ? (
        <section className="surface-card overflow-hidden">
          {items.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() => handleOpen(notification)}
              className={`flex w-full items-start gap-4 px-6 py-5 text-left transition hover:bg-surface-container-low ${
                notification.read ? "opacity-70" : ""
              }`}
            >
              <div className={`mt-1 h-11 w-1 rounded-full ${notification.read ? "bg-transparent" : "bg-primary"}`} />
              <div className="flex-1">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-base font-bold">{notification.title}</p>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-on-surface-variant">
                    {formatRelative(notification.createdAt)}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">{notification.message}</p>
              </div>
              <ArrowRight size={18} className="mt-1 text-on-surface-variant" />
            </button>
          ))}
        </section>
      ) : null}
    </div>
  );
}
