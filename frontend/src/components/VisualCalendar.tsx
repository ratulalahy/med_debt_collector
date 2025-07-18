// Visual Calendar Component for Calendar Scheduling
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Event,
  Phone,
  MonetizationOn,
  Business,
  Gavel,
  Campaign,
  PhoneCallback,
} from '@mui/icons-material';
import { formatDate, getPriorityColor } from '../utils';

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  patientName?: string;
  balance?: number;
}

interface VisualCalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: string) => void;
}

const VisualCalendar: React.FC<VisualCalendarProps> = ({ events, onEventClick, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Get calendar data
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate previous month's trailing days
  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  const daysFromPrevMonth = firstDayOfWeek;
  const prevMonthDays = Array.from({ length: daysFromPrevMonth }, (_, i) => {
    const day = prevMonth.getDate() - daysFromPrevMonth + i + 1;
    return {
      day,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth - 1, day),
    };
  });

  // Generate current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      day,
      isCurrentMonth: true,
      date: new Date(currentYear, currentMonth, day),
    };
  });

  // Generate next month's leading days
  const totalCells = 42; // 6 weeks * 7 days
  const remainingCells = totalCells - prevMonthDays.length - currentMonthDays.length;
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => {
    const day = i + 1;
    return {
      day,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth + 1, day),
    };
  });

  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const eventDate = event.date;
    if (!acc[eventDate]) {
      acc[eventDate] = [];
    }
    acc[eventDate].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get event type icon
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'follow_up_call': return <PhoneCallback sx={{ fontSize: 12 }} />;
      case 'payment_due': return <MonetizationOn sx={{ fontSize: 12 }} />;
      case 'team_meeting': return <Business sx={{ fontSize: 12 }} />;
      case 'legal_review': return <Gavel sx={{ fontSize: 12 }} />;
      case 'campaign_review': return <Campaign sx={{ fontSize: 12 }} />;
      case 'callback_appointment': return <Phone sx={{ fontSize: 12 }} />;
      default: return <Event sx={{ fontSize: 12 }} />;
    }
  };

  // Format date for comparison
  const formatDateForComparison = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Check if date is today
  const isToday = (date: Date) => {
    return formatDateForComparison(date) === formatDateForComparison(today);
  };

  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardContent>
        {/* Calendar Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={goToPreviousMonth}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h5" sx={{ minWidth: 200, textAlign: 'center' }}>
              {monthNames[currentMonth]} {currentYear}
            </Typography>
            <IconButton onClick={goToNextMonth}>
              <ChevronRight />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Today />}
              onClick={goToToday}
              size="small"
            >
              Today
            </Button>
            <Button
              variant={viewMode === 'month' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('month')}
              size="small"
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('week')}
              size="small"
            >
              Week
            </Button>
          </Box>
        </Box>

        {/* Calendar Grid */}
        <Grid container spacing={0} sx={{ border: 1, borderColor: 'divider' }}>
          {/* Day Headers */}
          {dayNames.map((dayName) => (
            <Grid item xs={12/7} key={dayName}>
              <Paper
                sx={{
                  p: 1,
                  textAlign: 'center',
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 0,
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {dayName}
                </Typography>
              </Paper>
            </Grid>
          ))}

          {/* Calendar Days */}
          {allDays.map((dayData, index) => {
            const dateStr = formatDateForComparison(dayData.date);
            const dayEvents = eventsByDate[dateStr] || [];
            const isCurrentDay = isToday(dayData.date);

            return (
              <Grid item xs={12/7} key={index}>
                <Paper
                  sx={{
                    minHeight: 100,
                    p: 1,
                    borderRadius: 0,
                    border: 1,
                    borderColor: 'divider',
                    cursor: 'pointer',
                    bgcolor: dayData.isCurrentMonth ? 'background.paper' : 'grey.50',
                    '&:hover': {
                      bgcolor: dayData.isCurrentMonth ? 'action.hover' : 'grey.100',
                    },
                    position: 'relative',
                  }}
                  onClick={() => onDateClick(dateStr)}
                >
                  {/* Day Number */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isCurrentDay ? 'bold' : 'normal',
                        color: dayData.isCurrentMonth
                          ? isCurrentDay
                            ? 'primary.main'
                            : 'text.primary'
                          : 'text.disabled',
                        bgcolor: isCurrentDay ? 'primary.light' : 'transparent',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {dayData.day}
                    </Typography>
                    
                    {/* Event Count Badge */}
                    {dayEvents.length > 0 && (
                      <Badge
                        badgeContent={dayEvents.length}
                        color="primary"
                        sx={{ fontSize: 10 }}
                      />
                    )}
                  </Box>

                  {/* Events */}
                  <Box sx={{ mt: 1 }}>
                    {dayEvents.slice(0, 3).map((event) => (
                      <Tooltip
                        key={event.id}
                        title={`${event.time} - ${event.title}${event.patientName ? ` (${event.patientName})` : ''}`}
                        arrow
                      >
                        <Chip
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {getEventTypeIcon(event.type)}
                              <Typography variant="caption" sx={{ fontSize: 10 }}>
                                {event.time}
                              </Typography>
                            </Box>
                          }
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 10,
                            mb: 0.25,
                            width: '100%',
                            justifyContent: 'flex-start',
                            backgroundColor: getPriorityColor(event.priority),
                            color: 'white',
                            '&:hover': {
                              backgroundColor: getPriorityColor(event.priority),
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                        />
                      </Tooltip>
                    ))}
                    
                    {/* Show more indicator */}
                    {dayEvents.length > 3 && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 10,
                          color: 'text.secondary',
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDateClick(dateStr);
                        }}
                      >
                        +{dayEvents.length - 3} more
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Calendar Legend */}
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
            Event Types:
          </Typography>
          {[
            { type: 'follow_up_call', label: 'Follow-up Call' },
            { type: 'payment_due', label: 'Payment Due' },
            { type: 'team_meeting', label: 'Team Meeting' },
            { type: 'legal_review', label: 'Legal Review' },
            { type: 'callback_appointment', label: 'Callback' },
          ].map((item) => (
            <Box key={item.type} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getEventTypeIcon(item.type)}
              <Typography variant="caption">{item.label}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
            Priority:
          </Typography>
          {[
            { priority: 'urgent', label: 'Urgent' },
            { priority: 'high', label: 'High' },
            { priority: 'medium', label: 'Medium' },
            { priority: 'low', label: 'Low' },
          ].map((item) => (
            <Box key={item.priority} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: getPriorityColor(item.priority),
                  borderRadius: '50%',
                }}
              />
              <Typography variant="caption">{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default VisualCalendar;
