import React, { useEffect, useState, useRef } from "react";
import { Circle, DeleteIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const formatToLocalDate = (dateInput) => {
  if (!dateInput) return "N/A";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ProjectDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { project } = location.state ?? {};
  // console.log(location)
  const projectId = location.pathname.split("/")[2]
  // console.log(projectId)
  // console.log(project);

  const deleteMilestone = async (milestoneId) => {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/projects/${projectId}/milestone/${milestoneId}`)
  }
  
  
  
  // Milestones State
  const [milestones, setMilestones] = useState([]);
  const [creatingMilestone, setCreatingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const inputRef = useRef(null);
  
  const [refresh, setRefresh] = useState(false)
  
  useEffect(() => {
    const fetchMilestone = async () => {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/projects/${projectId}/milestone`)
      // console.log(response.data)
      setMilestones(response.data.res)
    }
    fetchMilestone()
  },[refresh])
  
  useEffect(() => {
    inputRef.current?.focus();
  },[creatingMilestone])
  
  const addMilestone = async () => {
    try{
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/projects/${projectId}/milestone`, {
        title: newMilestoneTitle
      })
      
      // console.log(res)
      // if(!res.ok) return console.log("Error while making post request to milestone")
      
      setCreatingMilestone(false)
      setNewMilestoneTitle("")
      console.log("Milestone added")
      setRefresh(e => !e)
      
    } catch (error) {
      console.log("Error setting milestone:", error)
    }
  }
  
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <button onClick={() => navigate(-1)}>← Back</button>

      <h1 className="text-4xl font-bold mb-6">{project?.title}</h1>

      <div className="flex justify-between items-start bg-white rounded-2xl shadow-md p-6 mb-10">
        <div className="space-y-4">
          <div>
            <p className="text-gray-500 text-sm">Started</p>
            <p className="font-medium">
              {formatToLocalDate(project?.startDate)}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Deadline</p>
            <p className="font-medium">{formatToLocalDate(project?.endDate)}</p>
          </div>

          <div>
            <h1>Members</h1>
            {project.members.map((e) => {
              <p>{e}</p>;
            })}
          </div>
        </div>

        <div>
          <span className="px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-semibold">
            {project?.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Milestones */}
        <div className="col-span-2 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Milestones</h2>

          <div className="flex flex-col gap-4">
            {milestones.map((m) => (
              <div key={m._id} className="border p-4 rounded">
                <p className="font-semibold">{m.title}</p>
                <button
                  onClick={() => {
                    deleteMilestone(m._id)
                    setRefresh(e => !e)
                  }}
                >
                  <DeleteIcon />
                </button>
              </div>
            ))}
            {creatingMilestone && (
              <input 
                ref={inputRef}
                value={newMilestoneTitle}
                placeholder="Set your next milestone"
                onChange={(e) => {
                  setNewMilestoneTitle(e.target.value)
                }}
                onKeyDown={e => {
                  if(e.key == 'Enter'){
                    inputRef.current.focus()
                    addMilestone()
                  }

                  if(e.key == 'Escape'){
                    setNewMilestoneTitle("")
                    setCreatingMilestone(false)
                  }
                }}
              />
            )}

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => {
                setCreatingMilestone(true)
              }}
            >
              Add Milestone
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-4">Progress</h2>
          <Circle />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
