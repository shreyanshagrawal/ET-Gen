import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

const statusStyles = {
  COMPLETED: "bg-green-100 text-green-600",
  INPROGRESS: "bg-yellow-100 text-yellow-600",
  DROPPED: "bg-red-100 text-red-600",
};

const ProjectCard = ({ details }) => {
  if (!details)
    return (
      <Link to="/projects/create">
        <div className="flex justify-center items-center w-72 h-40 border-2 border-dashed rounded-2xl text-gray-400">
          <Plus className="w-8 h-8" />
        </div>
      </Link>
      // <Card>
      //   <CardHeader>
      //     <CardTitle>Card Title</CardTitle>
      //     <CardDescription>Card Description</CardDescription>
      //     <CardAction>Card Action</CardAction>
      //   </CardHeader>
      // </Card>
    );

  const { title, deadline, status } = details;

  return (
    <div className="w-72 p-5 rounded-2xl bg-white shadow-md hover:shadow-xl transition duration-300 border">
      {/* Title */}
      <h2 className="text-xl font-semibold mb-2">{title}</h2>

      {/* Deadline */}
      <p className="text-sm text-gray-500 mb-4">
        ⏳ Deadline:{" "}
        {deadline ? new Date(deadline).toLocaleDateString() : "N/A"}
      </p>

      {/* Status Badge */}
      <span
        className={`px-3 py-1 text-xs rounded-full font-medium ${
          statusStyles[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status}
      </span>
    </div>
  );
};

export default ProjectCard;
