"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { format, parse, startOfWeek, getDay, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import Link from "next/link";
import axios from 'axios';
import {
  Calendar,
  momentLocalizer,
  dateFnsLocalizer,
} from "react-big-calendar";
import moment from 'moment';
import "./style.css";

import SideMenu from "@/app/dashboard/component/SideMenu";
import "react-big-calendar/lib/css/react-big-calendar.css"; // Import the calendar styles
import { BASE_URL } from "@/constants/ENVIRONMENT_VARIABLES";
import EditEventModal from "./EditEventModal";
import { getMeetings } from "@/store/reducers/dashboard";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function P_M_Todo0() {

  const dispatch = useDispatch()

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [activeEventModal, setActiveEventModal] = useState();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [events, setEvents] = useState([]);
  const [currentView, setCurrentView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [allEvents,setAllEvents]=useState([]);

  const fromDate="2024-06-04";
  const toDate="2025-06-30";
  useEffect(() => {
    console.log("CurrentDate===>",currentDate,currentView)
    if(currentView=='month'){
      let { startDate, endDate } = getMonthStartEndDate(currentDate);
      getMeetingDetails(startDate,endDate);
    }else if(currentView=='week'){
      let {startDate,endDate}=getWeekStartEndDate(currentDate);
      getMeetingDetails(startDate,endDate);
    }else{
      console.log("==Other  views")
    }
   
  },[currentDate,currentView])
  const getMonthStartEndDate=(currentDate:any)=>{
    let dateValue = new Date(currentDate);
    let year = dateValue.getFullYear();
    let month = dateValue.getMonth();

    let startDate = new Date(year, month, 1).toISOString().slice(0, 10);

    // Calculate the last day of the current month
    let endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  
  return { startDate: startDate, endDate: endDate };
  };
  const getWeekStartEndDate=(currentDate:any)=>{
        let dateValue = new Date(currentDate);
  
        // Get the starting date of the current week (Sunday)
        let startDate = new Date(dateValue);
        startDate.setDate(dateValue.getDate() - dateValue.getDay());
  
        let endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        // Format dates as YYYY-MM-DD
        let formattedStartDate = startDate.toISOString().slice(0, 10);
        let formattedEndDate = endDate.toISOString().slice(0, 10);
        return { startDate: formattedStartDate, endDate: formattedEndDate };

  };
  const getMeetingDetails = async (startDate:any,endDate:any) => {
    try {
      const response = await axios.get(
        `${BASE_URL}calendar_app/api/calendar?from_date=${startDate}&to_date=${endDate}`
      );
      setAllEvents(response.data);
      const uniqueEventDates = removeDuplicateEventsByDate(response.data);   
   
      let events = uniqueEventDates.map((event: { title: any; start: string | number | Date; end: string | number | Date; }) => (
        {
        ...event,
        start: formatDate(event.start), // Ensure date strings are converted to Date objects
        end: formatDate(event.end),
      }));
      setEvents(events);
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };
  const removeDuplicateEventsByDate = (events) => {
    const dateCountMap = {};
    const uniqueEvents = [];

    // Count occurrences of each date
    events.forEach(event => {
      const date = new Date(event.start).toISOString().split('T')[0];
      if (dateCountMap[date]) {
        dateCountMap[date].count += 1;
      } else {
        dateCountMap[date] = { ...event, count: 1 };
      }
    });

    // Create unique events array with count
    for (const date in dateCountMap) {
      uniqueEvents.push(dateCountMap[date]);
    }

    return uniqueEvents;
  };

  const formatDate =(dateString:any) =>{
    const date = new Date(dateString);
    return date;
  
  }
  
  // Define months and years
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = [
    { value: "2022", label: "2022" },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    // Add more years as needed
  ];

  // Handle month and year changes
  const handleMonthChange = (e) => {
    const selectedMonthValue = e.target.value;
    setSelectedMonth(selectedMonthValue);

    // Adjust currentDate based on the selected month
    const newDate = moment(currentDate)
      .set("month", parseInt(selectedMonthValue) - 1) // Set the month (zero-indexed in Moment.js)
      .toDate();

    setCurrentDate(newDate); // Update currentDate state
    setCurrentView("month"); // Optionally set the view to 'month'
  };
  const handleYearChange = (e:any) => {
    const selectedYearValue = e.target.value;
    setSelectedYear(selectedYearValue);

    // Adjust currentDate based on the selected year
    const newDate = moment(currentDate)
      .set("year", parseInt(selectedYearValue)) // Set the year
      .toDate();

    setCurrentDate(newDate); // Update currentDate state
  };


  const handleSelectSlot = (event: any) => {
    if (typeof event.start === "string") {
      event.start = new Date(event.start);
    }
    if (typeof event.end === "string") {
      event.end = new Date(event.end);
    }
    setActiveEventModal(event);
  };

  const handleSelect = (event: any, e: { clientX: any; clientY: any; }) => {
    const { start, end } = event;
    setActiveEventModal(event);
     const filteredEvents = allEvents.filter(event => {
      return formatDate(event.start).getTime() === start.getTime();
    });
    event=filteredEvents;
    setSelectedEvent(event);
    setShowEditModal(true);
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleSave = (editedEvent:any) => {
    setShowEditModal(false);
  };

  const handleClose = () => setShowEditModal(false);

  const EventDetailModal = () => {
    return (
      <>
        {activeEventModal?.title && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              backgroundColor: "white",
              border: "1px solid black",
              padding: "10px",
              color: "blue",
              height: "100%",
              zIndex: 1000,
            }}
          >
            {activeEventModal?.title}
          </div>
        )}
      </>
    );
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
  // Custom Event Component
  const CustomEvent = ({ event }: any) => {
    return (
      <>
          <div>     
              <div className="calendarTopSection" style={{  position: 'relative' }}>
                    {event.count!=1  &&  
                    <div style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '0',
                      background: '#ffc107',
                      color: 'black',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}>
                  {event.count}
                </div> }
                  <ul>
                    <li className="text-[12px] py-1">{event?.job_id?.jobRequest_Role}</li>
                    <li className="text-[12px] py-1">Interviewer:{event?.job_id?.jobRequest_createdBy.username} </li>
                    <li className="text-[12px] py-1">Time :{formatEventTime(event?.start,event?.end)}</li>
                  </ul>
                </div>
            </div>
        {activeEventModal && <EventDetailModal />}
      </>
    );
  };
  

  const onPrevClick = useCallback(() => {
    if (currentView === 'day') {
      setCurrentDate(moment(currentDate).subtract(1, "d").toDate());
    } else if (currentView === 'week') {
      setCurrentDate(moment(currentDate).subtract(1, "w").toDate());
    } else {
      setCurrentDate(moment(currentDate).subtract(1, "M").toDate());
    }
  }, [currentView, currentDate]);
  
  const CustomToolbar = ({ label, onNavigate, onView, views }) => {
    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={onPrevClick}>
            Back
          </button>
          <button type="button" onClick={() => onNavigate('TODAY')}>
            Today
          </button>
          <button type="button" onClick={() => onNavigate('NEXT')}>
            Next
          </button>
        </span>
        <span className="rbc-toolbar-label">{label}</span>
        <span className="rbc-btn-group">
          {views.includes('month') && (
            <button type="button" onClick={() => onView('month')} className={currentView === 'month' ? 'active'  : ''}>
              Month
            </button>
          )}
          {views.includes('week') && (
            <button type="button" onClick={() => onView('week')} className={currentView === 'week' ? 'active'  : ''}>
              Week
            </button>
          )}
          {views.includes('day') && (
            <button type="button" onClick={() => onView('day')} className={currentView === 'day' ? 'active'  : ''}>
              Day
            </button>
          )}
        </span>
      </div>
    );
  };
  return (
    <section className="">
      <div className="container-fluid my-md-5 my-4">
        <div className="row">
          <div className="col-lg-1 leftMenuWidth ps-0 position-relative">
            <SideMenu />
          </div>

          <div className="col-lg-11 pe-lg-4 ps-lg-0">
            <div className="row justify-content-between align-items-center">
              <div className="col-lg-8 projectText">
                <h1>Calendar</h1>
                <p className="mt-3">
                  Enjoy your selecting potential candidates Tracking and
                  Management System.
                </p>
              </div>

              <div className="col-lg-4 mt-3 mt-lg-0 text-center text-lg-end">
                <Link
                  prefetch
                  href="/"
                  className="btn btn-light me-3 mx-lg-2"
                >
                  JD Assets
                </Link>
                <Link
                  prefetch
                  href="/"
                  className="btn btn-blue bg-[#0a66c2!important]"
                >
                  Create New JD
                </Link>
              </div>
            </div>

            <div className="TotalEmployees shadow bg-white rounded-3 p-3 w-100 mt-4">
              <div className="md:flex align-items-center">
                <h3 className="projectManHeading">Your Todo’s</h3>
                <div className="ml-auto d-flex todoHeadingSelect">
                  <div className="month-year-picker">
                    <select value={selectedMonth} onChange={handleMonthChange}>
                      <option value="">Select Month</option>
                       {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    <select value={selectedYear} onChange={handleYearChange}>
                      <option value="">Select Year</option>
                        {years.map((year) => (
                         <option key={year.value} value={year.value}>
                            {year.label}
                          </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
                <Calendar
                  className="TodoDataTable"
                  selectable
                  localizer={localizer}
                  events={events}
                  // startAccessor="start"
                  // endAccessor="end"
                  style={{ height: 600,}}
                  // defaultView={"week"}
                  timeslots={5} // number of per section
                  step={30}
                  view={currentView}
                  date={currentDate}
                  onView={(view:any) => setCurrentView(view)}
                  components={{ event: CustomEvent,toolbar:CustomToolbar }}
                  formats={{
                    dayFormat: "EEEE", // day labels
                  }}
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelect}
                  onNavigate={setCurrentDate}
                />
              </div>
            </div>
          </div>
        </div>
        {selectedEvent && (
        <EditEventModal
          show={showEditModal}
          handleClose={handleClose}
          event={selectedEvent}
          handleSave={handleSave}
          position={position} 
        />
      )}
    </section>
  );
}
