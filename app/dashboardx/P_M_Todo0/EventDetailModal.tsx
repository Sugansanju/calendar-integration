import React, { useEffect, useRef, useState } from "react";
import './EventDetailModal.css';
import logo from './assets/png-transparent-google-meet-camera-logo-icon-thumbnail.png';
import axios from 'axios';
import moment from 'moment';
const EventDetailModal = ({ show, handleDetailClose, event, handleSave ,position}) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setDetailModal] = useState(false);
  const [interviewDate,setInterviewDate]=useState(null);
  const modalRef = useRef(null);


  const handleClickOutside = (e:any) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleDetailClose();
    }
  };
  const addOrdinalSuffix = (day) => {
    if (day % 10 === 1 && day !== 11) {
      return `${day}st`;
    } else if (day % 10 === 2 && day !== 12) {
      return `${day}nd`;
    } else if (day % 10 === 3 && day !== 13) {
      return `${day}rd`;
    } else {
      return `${day}th`;
    }
  };
  useEffect(() => {
    let date=moment(event?.start);
   setInterviewDate(addOrdinalSuffix(date.date()));
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  const handleResumeDownload = () => {
    // Replace 'https://example.com/sample.pdf' with the actual URL of the file you want to download
    const fileUrl = event?.user_det.candidate.candidate_resume;
    
    // Use an invisible link to trigger the download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
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
  const handleAadharDownload = () => {
    const fileUrl = event?.user_det.candidate.candidate_resume;    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <>
    <div className={`overlay1 ${show ? "" : "hide"}`} />
    <div className={`modal1 ${show ? "show" : ""}`}   ref={modalRef}>
        <div className="container">
            <div className="column " style={{borderRight:'2px solid #f5f5f5'}}>
            <h3 className="details">Interview With: {event?.user_det.candidate.candidate_firstName}</h3>
            <h3 className="details">Position: {event?.job_id.jobRequest_Role}</h3>
            <h3 className="details">Created By: {event?.user_det.handled_by.firstName}</h3>
            <h3 className="details">Interview Date:{interviewDate} {moment(event?.start).format("MMM YYYY")}</h3>
            <h3 className="details">Interview Time: {formatEventTime(event?.start,event?.end)}</h3>
            <h3 className="details">Interview Via: {event?.link!=''?'Google Meet':'Offline'}</h3>
            <button className="button-details" onClick={handleResumeDownload}>
                <div className="">
                    Resume.docx
                </div>
                <div className="" onClick={handleAadharDownload}>

                </div>
            </button>
            
            <button className="button-details">Aadharcard</button>
            </div>
            <div className="column center-column">
                <div className="first-div"> 
                    <img src="/image/google-meet-logo.png" width={100}/>
                </div>
                <div>    
                    <a href={event?.link} target="_blank" rel="noopener noreferrer">
                        <button className="meet-button">
                            Join
                        </button>
                    </a>
                </div>
            </div>
        </div>
    </div>

</>
  );
};

export default EventDetailModal;
