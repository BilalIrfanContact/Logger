import { requireAuthenticatedUser } from "@/lib/auth/server";
import { createProjectManager } from "@/lib/journal/projects";
import { getSupabaseProjectRepository } from "@/lib/supabase/projects";

import { ProjectManager } from "./project-manager";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await requireAuthenticatedUser();
  const projects = await createProjectManager(await getSupabaseProjectRepository()).listProjects(user.id);

  return (
    <section className="projects-page" aria-labelledby="projects-title">
      <div className="projects-heading">
        <p className="eyebrow">Projects</p>
        <h1 id="projects-title">Names that keep history connected.</h1>
        <p className="journal-copy">Create projects when they become useful. Renaming keeps every saved entry connected, and archiving never hides history.</p>
      </div>
      <ProjectManager projects={projects} />
    </section>
  );
}
