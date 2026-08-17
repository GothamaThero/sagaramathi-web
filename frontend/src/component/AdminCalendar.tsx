
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format } from 'date-fns';
import { parse } from 'date-fns';
import { startOfWeek } from 'date-fns';
import { getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import "react-big-calendar/lib/css/react-big-calendar.css";

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

interface AdminCalendarProps {
  danas: any[];
}

export const AdminCalendar = ({ danas }: AdminCalendarProps) => {
  const events = danas.map((dana) => {
    // Parse "YYYY-MM" and "DD" to a Date object
    const [year, month] = dana.month.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(dana.day));
    
    // Set time based on meal type for better calendar display
    if (dana.mealType === "MORNING") {
      date.setHours(7, 0, 0);
    } else if (dana.mealType === "NOON") {
      date.setHours(11, 30, 0);
    } else if (dana.mealType === "EVENING") {
      date.setHours(18, 0, 0);
    }

    const endDate = new Date(date);
    endDate.setHours(date.getHours() + 2);

    return {
      title: `${dana.name} (${dana.mealType === 'MORNING' ? 'Morning Meal (Heel Dana)' : dana.mealType === 'NOON' ? 'Midday Meal (Dawal Dana)' : 'Evening Refreshments (Gilampasa)'}) - ${dana.status}`,
      start: date,
      end: endDate,
      status: dana.status,
      resource: dana
    };
  });

  const eventStyleGetter = (event: any) => {
    let backgroundColor = "#3b82f6"; // Default blue
    if (event.status === "APPROVED") {
      backgroundColor = "#10b981"; // Green
    } else if (event.status === "REJECTED") {
      backgroundColor = "#ef4444"; // Red
    } else if (event.status === "PENDING") {
      backgroundColor = "#f59e0b"; // Yellow/Orange
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
        fontSize: "0.8rem",
        fontWeight: "bold"
      }
    };
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-1/10 h-[600px]">
      <h2 className="text-xl font-bold mb-4 text-brand-1">දින දර්ශනය (Calendar)</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={eventStyleGetter}
        views={["month", "week", "day"]}
      />
    </div>
  );
};
