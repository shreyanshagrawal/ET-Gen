import React from "react";

const MilestoneListItems = ({ e }) => {
  
  return (
    <div className="flex justify-between w-3xl bg-purple-400 px-4">
      <p>{e}</p>
      <input type="checkbox" />
    </div>
  );
};

export default MilestoneListItems;