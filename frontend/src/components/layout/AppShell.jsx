import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { createProject, fetchProjects } from "../../features/projects/projectsSlice";
import { createTask } from "../../features/tasks/tasksSlice";
import { fetchNotifications } from "../../features/notifications/notificationsSlice";
import { fetchTeam } from "../../features/team/teamSlice";
import { fetchDashboardOverview } from "../../features/dashboard/dashboardSlice";
import { ProjectFormModal } from "../forms/ProjectFormModal";
import { TaskFormModal } from "../forms/TaskFormModal";
import { useSocketEvents } from "../../hooks/useSocketEvents";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);
  const { list: projects } = useSelector((state) => state.projects);
  const { users: team } = useSelector((state) => state.team);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  useSocketEvents(token);

  useEffect(() => {
    dispatch(fetchTeam());
    dispatch(fetchNotifications());
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      dispatch(fetchDashboardOverview());
    }
  }, [dispatch, location.pathname]);

  const handleCreateProject = async (values) => {
    setSavingProject(true);
    const result = await dispatch(createProject(values));
    setSavingProject(false);

    if (createProject.fulfilled.match(result)) {
      setProjectModalOpen(false);
      navigate(`/projects/${result.payload._id}`);
    }
  };

  const handleCreateTask = async (values) => {
    setSavingTask(true);
    const result = await dispatch(createTask(values));
    setSavingTask(false);

    if (createTask.fulfilled.match(result)) {
      setTaskModalOpen(false);
      navigate(`/tasks/${result.payload._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <Sidebar onCreateTask={() => setTaskModalOpen(true)} onCreateProject={() => setProjectModalOpen(true)} />

      <div className="min-w-0 flex-1 pb-24 lg:pb-0">
        <Topbar onCreateTask={() => setTaskModalOpen(true)} onCreateProject={() => setProjectModalOpen(true)} />
        <main className="px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>

      <MobileNav onCreateTask={() => setTaskModalOpen(true)} />

      <ProjectFormModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={handleCreateProject}
        team={team}
        loading={savingProject}
      />

      <TaskFormModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projects={projects}
        team={team}
        loading={savingTask}
      />
    </div>
  );
}
