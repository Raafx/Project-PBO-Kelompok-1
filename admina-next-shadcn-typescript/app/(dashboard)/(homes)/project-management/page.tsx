import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import ActiveProjectCard from "./components/active-project-card";
import AllProjectsCard from "./components/all-projects-card";
import ChatProjectsCard from "./components/chat-projects-card";
import ProjectStatCards from "./components/project-stat-cards";
import ProjectsAnalysisCard from "./components/projects-analysis-card";
import ProjectsProgressCard from "./components/projects-progress-card";
import ProjectsRoadmapCard from "./components/projects-roadmap-card";
import TeamMembersCard from "./components/team-members-card";
import TodoListCard from "./components/todo-list-card";
import WorkingScheduleCard from "./components/working-schedule-card";

export const metadata: Metadata = {
  title: "Project Management Dashboard | Admina Admin Dashboard",
  description:
    "Manage projects, roadmaps, team members, schedules, tasks, and analytics with the Project Management Dashboard in Admina.",
};

const ProjectManagementPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Project Management" text="Project Management" />

      <div className="grid grid-cols-12 gap-5 mt-6">
        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <ProjectStatCards />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <ProjectsRoadmapCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <AllProjectsCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <ProjectsProgressCard />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <WorkingScheduleCard />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <TeamMembersCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <ChatProjectsCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <ProjectsAnalysisCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TodoListCard />
          </Suspense>
        </div>

        <div className="col-span-12">
          <Suspense fallback={<LoadingSkeleton />}>
            <ActiveProjectCard />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default ProjectManagementPage;
