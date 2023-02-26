import React from "react";

export type EventFormData = {
  title: string;
  description: string;
  image: File | string | null;
};

function EventForm() {
  return <div>EventForm</div>;
}

export default EventForm;
