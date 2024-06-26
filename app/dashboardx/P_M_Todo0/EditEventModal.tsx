import React, { useEffect, useRef, useState } from "react";
import "./EditEventModal.css"; // Import CSS for modal styles
import axios from 'axios';
import moment from 'moment';
import { BASE_URL } from "@/constants/ENVIRONMENT_VARIABLES";
import EventDetailModal from "./EventDetailModal";
const EditEventModal = ({ show, handleClose, event, handleSave ,position}) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setDetailModal] = useState(false);
  const modalRef = useRef(null);
  
  const formatEventTime = (start, end) => {
    const formatTime = (dateString, options) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', options).format(date);
    };
  
    const hourOptions = { hour: 'numeric' };
    const hourWithPeriodOptions = { hour: 'numeric', hour12: true };
  
    const startHour = formatTime(start, hourOptions);
    const endHourWithPeriod = formatTime(end, hourWithPeriodOptions);
  
    return `${startHour} - ${endHourWithPeriod}`;
  };

  const handleClickOutside = (e:any) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };
  const handleDetailClose = () => setDetailModal(false);

  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  const getEventDetail=(id:any)=>{
    axios.get(`${BASE_URL}/calendar_app/api/calendar_meeting?id=${id}`)
    .then((res)=>{
        setSelectedEvent(res.data);
        setDetailModal(true);
        handleClose();
    })
    .catch((err)=>{

    })
}
  return (
    <>
    <div className={`overlay ${show ? "" : "hide"}`} />
    <div className={`modal ${show ? "show" : ""}`} style={{left:position.x,top:position.y}}  ref={modalRef}>
       {event.map((item:any,index:any)=>(
        <div  className="calendarTopSection1" key={index}  onClick={()=>getEventDetail(item.id)}>
            <ul>
               <li className="text-[12px] py-1">{item?.job_id?.jobRequest_Role}</li>
               <li className="text-[12px] py-1">Interviewer: {item?.job_id?.jobRequest_createdBy.username}</li>
               <li className="text-[12px] py-1">Time : {formatEventTime(item?.start,item?.end)}</li>
             </ul>
        </div>
       ))} 
    </div>
    {selectedEvent && (
        <EventDetailModal
          show={showDetailModal}
          handleDetailClose={handleDetailClose}
          event={selectedEvent}
          handleSave={handleSave}
          position={position} 
        />
      )}
</>
  );
};

export default EditEventModal;
