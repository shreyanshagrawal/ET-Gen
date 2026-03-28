import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const CreateProject = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate()
  const onSubmit = async (data) => {
    // console.log(data);
    try{
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/projects`, data)
      console.log(response.data)
      console.log("Project Created Successfully ^_^")
    } catch(err){
      console.log("Error creating project", err)
    }
    
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-5"
    >
      <h2 className="text-2xl font-bold text-center">Create Project 🚀</h2>

      {/* Title */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          placeholder="Project Title"
          {...register("title", { required: true })}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Description</label>
        <textarea
          placeholder="Project Description"
          {...register("description", { required: true })}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows="3"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            {...register("startDate", { required: true })}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            {...register("endDate", { required: true })}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Status</label>
        <select
          {...register("status", { required: true })}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ONGOING">ONGOING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="DROPPED">DROPPED</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
        onClick={() => {
          navigate("/dashboard")
        }}
      >
        Create Project
      </button>
    </form>
  </div>
);
}

export default CreateProject;
