import React, { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import axios from "axios";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/projects`,
        );
        setProjects(response.data);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProjects();
  }, []);

  // useEffect(() => {
  //   console.log(projects);
  // }, [projects]);

  return (
    <div className="p-2">
      <div className="w-full h-screen">
        <h1 className="text-5xl font-bold mb-10">Task Scheduler</h1>

        {/* Project Cards */}
        {projects.length === 0 ? (
          <>
            <h1>No Projecs Found</h1>
            <ProjectCard />
          </>
        ) : (
          <div className="w-full grid grid-cols-4 gap-4 place-items-center">
            {projects.map((e) => (
              <div key={e._id}>
                <Link to={`/projects/${e._id}`} state={{ project: e }}>
                  <ProjectCard details={e} key={e._id} />
                </Link>
              </div >
            ))}
            <ProjectCard />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
