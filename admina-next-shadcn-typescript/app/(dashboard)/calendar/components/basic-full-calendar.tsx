"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

/** A date in the current month, so the demo always shows events on first load. */
const dayOfThisMonth = (day: number, hour?: number) => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), day, hour ?? 0);
};

const initialEvents = (): EventInput[] => [
    { id: uuidv4(), title: "Team Meeting", start: dayOfThisMonth(13, 10) },
    { id: uuidv4(), title: "Project Deadline", start: dayOfThisMonth(15), allDay: true },
];

function BasicFullCalendar() {
    const [events, setEvents] = useState<EventInput[]>(initialEvents);

    // Add event
    const handleDateClick = (info: DateClickArg) => {
        const title = prompt("Enter Event Title:");
        if (title) {
            setEvents((prev) => [...prev, { id: uuidv4(), title, start: info.date }]);
        }
    };

    // Edit event (an empty title deletes it)
    const handleEventClick = (info: EventClickArg) => {
        const newTitle = prompt("Edit Event Title:", info.event.title);
        if (newTitle) {
            setEvents((prev) =>
                prev.map((event) => (event.id === info.event.id ? { ...event, title: newTitle } : event))
            );
        } else if (newTitle === "" && confirm("Delete this event?")) {
            setEvents((prev) => prev.filter((event) => event.id !== info.event.id));
        }
    };

    return (
        <Card className="card h-full rounded-lg border-0">
            <CardContent className="card-body p-0 flex flex-col justify-between gap-8">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    selectable={true}
                    editable={true}
                    events={events}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                />
            </CardContent>
        </Card>
    );
}

export default BasicFullCalendar;
