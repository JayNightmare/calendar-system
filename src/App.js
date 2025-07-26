/*
 * Main component for the Calendar App.  This file wires together the
 * user interface for creating and viewing events.  It uses
 * react-big-calendar for the calendar view and date-fns for
 * localisation.  Events can be added via a modal form, searched,
 * filtered by type and coloured for quick visual differentiation.  A
 * subtle zoom animation plays whenever the user switches between
 * calendar views.
 */

import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enGB } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./App.css";

// Define the locales for date-fns.  Only English (Great Britain) is
// configured here, but other locales can be added easily.
const locales = { "en-GB": enGB };

// Configure the localiser for react-big-calendar using date-fns.
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

// Define the available event categories and their associated colours.
const eventTypes = {
    reminder: { label: "Reminder", color: "#ff9800" },
    plan: { label: "Plan", color: "#3f51b5" },
    other: { label: "Other", color: "#4caf50" },
};

// Helper to format Date objects into a value usable by the
// `datetime-local` input.  If the value is falsy the function
// returns an empty string.
function formatForInput(date) {
    if (!date) return "";
    const pad = (n) => n.toString().padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

const App = () => {
    // Initialise events from localStorage if available.  Dates are
    // revived from strings back into Date objects.
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem("calendarEvents");
        if (saved) {
            try {
                return JSON.parse(saved, (key, value) => {
                    if (key === "start" || key === "end") {
                        return new Date(value);
                    }
                    return value;
                });
            } catch (err) {
                console.warn("Failed to parse saved events", err);
            }
        }
        return [];
    });

    // Dark mode state.  The preference is loaded from localStorage on
    // initialisation.  When changed, it is saved back and the `dark`
    // class is toggled on the document body to update CSS variables.
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("calendarDarkMode");
        return saved ? JSON.parse(saved) : false;
    });
    useEffect(() => {
        localStorage.setItem("calendarDarkMode", JSON.stringify(darkMode));
        document.body.classList.toggle("dark", darkMode);
    }, [darkMode]);

    // Persist events to localStorage whenever they change.
    useEffect(() => {
        localStorage.setItem("calendarEvents", JSON.stringify(events));
    }, [events]);

    // Current calendar view (month, week, day or agenda).
    const [view, setView] = useState("month");
    // Flag used to trigger the zoom animation when the view changes.
    const [zooming, setZooming] = useState(false);
    // Search query for filtering events by title.
    const [searchQuery, setSearchQuery] = useState("");
    // Filters controlling which event types are shown.
    const [filters, setFilters] = useState({
        reminder: true,
        plan: true,
        other: true,
    });
    // Modal state to control the visibility of the event creation form.
    const [showForm, setShowForm] = useState(false);
    // Data bound to the event creation form.
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "reminder",
        start: "",
        end: "",
    });

    // Selected event for details view when the user clicks on an event.
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Compute the filtered events based on search and selected filters.
    const filteredEvents = events.filter((ev) => {
        if (!filters[ev.type]) return false;
        if (
            searchQuery.trim() &&
            !ev.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
            return false;
        return true;
    });

    // Customise event appearance based on its type colour.
    const eventStyleGetter = (event) => {
        const backgroundColor = eventTypes[event.type]?.color || "#2196f3";
        return {
            style: {
                backgroundColor,
                borderRadius: "4px",
                opacity: 0.8,
                color: "#fff",
                border: "none",
                paddingLeft: "4px",
            },
        };
    };

    // Handles view changes.  A short delay triggers the CSS zoom animation.
    const handleViewChange = (newView) => {
        if (view === newView) return;
        setZooming(true);
        // Wait for the CSS animation to take effect before switching view.
        setTimeout(() => {
            setView(newView);
            setZooming(false);
        }, 150);
    };

    // When an existing event is clicked in the calendar, show its
    // details in a modal.
    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
    };

    // Called when the user selects a slot on the calendar.  Pre-fills
    // the form with the selected time range and opens the modal.
    const handleSelectSlot = ({ start, end }) => {
        setFormData({
            title: "",
            description: "",
            type: "reminder",
            start,
            end,
        });
        setShowForm(true);
    };

    // Submit handler for the event creation form.
    const handleSubmit = (e) => {
        e.preventDefault();
        const newEvent = {
            id: Date.now(),
            title: formData.title,
            description: formData.description,
            type: formData.type,
            start: new Date(formData.start),
            end: new Date(formData.end),
        };
        setEvents([...events, newEvent]);
        setShowForm(false);
    };

    // Toggle an individual event type filter on or off.
    const toggleFilter = (type) => {
        setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    // Remove an event from the calendar by its id.
    const removeEvent = (id) => {
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
        setSelectedEvent(null);
    };

    return (
        <div className="app-container">
            <header>
                <h1>Calendar</h1>
                <div className="controls">
                    <button
                        className="primary"
                        onClick={() => setShowForm(true)}
                    >
                        Add Event
                    </button>
                    <button
                        className="toggle-mode"
                        onClick={() => setDarkMode((prev) => !prev)}
                        title="Toggle dark mode"
                    >
                        {darkMode ? "Light mode" : "Dark mode"}
                    </button>
                    <div className="view-switch">
                        <label htmlFor="view-select">View:</label>
                        <select
                            id="view-select"
                            value={view}
                            onChange={(e) => handleViewChange(e.target.value)}
                        >
                            <option value="month">Month</option>
                            <option value="week">Week</option>
                            <option value="day">Day</option>
                            <option value="agenda">Agenda</option>
                        </select>
                    </div>
                    <div className="search">
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filters">
                        {Object.keys(eventTypes).map((type) => (
                            <label key={type} className="filter-label">
                                <input
                                    type="checkbox"
                                    checked={filters[type]}
                                    onChange={() => toggleFilter(type)}
                                />
                                <span
                                    className="color-swatch"
                                    style={{
                                        backgroundColor: eventTypes[type].color,
                                    }}
                                ></span>
                                {eventTypes[type].label}
                            </label>
                        ))}
                    </div>
                </div>
            </header>
            <main className={zooming ? "zooming" : ""}>
                <Calendar
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{
                        height: "75vh",
                        backgroundColor: "var(--card-bg)",
                        padding: "8px",
                        borderRadius: "6px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    }}
                    views={["month", "week", "day", "agenda"]}
                    view={view}
                    onView={handleViewChange}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                />
            </main>
            {showForm && (
                <div className="modal" onClick={() => setShowForm(false)}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Add Event</h2>
                        <form onSubmit={handleSubmit} className="event-form">
                            <label>
                                Title
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </label>
                            <label>
                                Description
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    rows="3"
                                ></textarea>
                            </label>
                            <label>
                                Type
                                <select
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            type: e.target.value,
                                        })
                                    }
                                >
                                    {Object.keys(eventTypes).map((type) => (
                                        <option value={type} key={type}>
                                            {eventTypes[type].label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Start
                                <input
                                    type="datetime-local"
                                    value={formatForInput(formData.start)}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            start: new Date(e.target.value),
                                        })
                                    }
                                    required
                                />
                            </label>
                            <label>
                                End
                                <input
                                    type="datetime-local"
                                    value={formatForInput(formData.end)}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            end: new Date(e.target.value),
                                        })
                                    }
                                    required
                                />
                            </label>
                            <div className="modal-actions">
                                <button type="submit" className="primary">
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {selectedEvent && (
                <div className="modal" onClick={() => setSelectedEvent(null)}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Event Details</h2>
                        <p>
                            <strong>Title:</strong> {selectedEvent.title}
                        </p>
                        <p>
                            <strong>Type:</strong>{" "}
                            {eventTypes[selectedEvent.type]?.label ||
                                selectedEvent.type}
                        </p>
                        <p>
                            <strong>Start:</strong>{" "}
                            {selectedEvent.start.toLocaleString()}
                        </p>
                        <p>
                            <strong>End:</strong>{" "}
                            {selectedEvent.end.toLocaleString()}
                        </p>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="secondary"
                                onClick={() => removeEvent(selectedEvent.id)}
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                className="primary"
                                onClick={() => setSelectedEvent(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
