"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MapPin, ExternalLink, Github, Sparkles, Trophy, Code, Coffee } from "lucide-react";

// Event type matching database schema
type Event = {
  id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  long_description: string;
  location: string;
  max_attendees: number;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  event_type: "Workshop" | "Hackathon" | "Meetup" | "Conference" | "Sprint";
  prizes?: string[];
  is_upcoming: boolean;
  is_community_event: boolean;
  registration_link?: string;
  attendees?: number;
};


export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const supabase = createClientComponentClient();
      
      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        return;
      }

      // Fetch RSVP counts for each event
      const eventsWithAttendees = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from('rsvp_responses')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);
          
          return {
            ...event,
            attendees: count || 0
          };
        })
      );

      setEvents(eventsWithAttendees);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const upcomingEvents = events.filter((e) => e.is_upcoming);
  const pastEvents = events.filter((e) => !e.is_upcoming);

  const getEventIcon = (type: Event['event_type']) => {
    switch (type) {
      case 'Workshop': return <Code className="w-5 h-5" />;
      case 'Hackathon': return <Trophy className="w-5 h-5" />;
      case 'Meetup': return <Coffee className="w-5 h-5" />;
      case 'Sprint': return <Sparkles className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: Event['difficulty']) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <header className="text-center mb-16 animate-fade-in">
          <div className="mb-6">
            <span className="text-6xl">🎉</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-brand-blue to-primary bg-clip-text text-transparent">
            Community Events
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Build, learn, and ship together with the func(Kode) community. Join our events to connect with fellow developers and level up your skills.
          </p>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-brand-blue/10 to-primary/10">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-brand-blue mb-2">
                {upcomingEvents.length}
              </div>
              <p className="text-muted-foreground">Upcoming Events</p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-brand-green/10 to-brand-green/5">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-brand-green mb-2">
                {events.reduce((sum, event) => sum + (event.attendees || 0), 0)}
              </div>
              <p className="text-muted-foreground">Total Attendees</p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-primary/10 to-muted/10">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {events.length}
              </div>
              <p className="text-muted-foreground">Events Hosted</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-6 h-6 text-brand-green" />
            <h2 className="text-3xl font-bold text-foreground">Upcoming Events</h2>
          </div>
          
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-8">
              {upcomingEvents.map((event, index) => (
                <Card key={event.id} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden animate-slide-up`} style={{animationDelay: `${index * 0.1}s`}}>
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-brand-blue to-primary p-6 text-white">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            {getEventIcon(event.event_type)}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold mb-1">{event.name}</h3>
                            <div className="flex items-center gap-4 text-white/80">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{event.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            {event.event_type}
                          </Badge>
                          <Badge className={getDifficultyColor(event.difficulty)}>
                            {event.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                          <p className="text-muted-foreground leading-relaxed">
                            {event.long_description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            {event.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {event.prizes && (
                            <div className="bg-muted/50 rounded-lg p-4">
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-brand-green" />
                                Prizes & Rewards
                              </h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {event.prizes.map((prize, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-brand-green rounded-full"></span>
                                    {prize}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground">{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground">
                                {event.attendees || 0}/{event.max_attendees} attendees
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-brand-green h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((event.attendees || 0) / event.max_attendees) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button asChild className="bg-brand-blue hover:bg-brand-blue/90">
                              <Link href={`/rsvp?event=${event.id}`} className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                RSVP Open
                              </Link>
                            </Button>
                            <Button variant="outline" asChild>
                              <Link href={`/events/${event.id}`} className="flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                Learn More
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">No upcoming events</h3>
                <p className="text-muted-foreground mb-6">Check back soon for exciting new events!</p>
                <Button asChild variant="outline">
                  <Link href="https://github.com/orgs/func-Kode/discussions/categories/ideas-brainstorming" target="_blank">
                    Suggest an Event
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-6 h-6 text-muted-foreground" />
              <h2 className="text-3xl font-bold text-foreground">Past Events</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event, index) => (
                <Card key={event.id} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in`} style={{animationDelay: `${index * 0.1}s`}}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        {getEventIcon(event.event_type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{event.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{event.attendees || 0} attended</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.event_type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="text-center">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-brand-blue/10 via-primary/10 to-brand-green/10">
            <CardContent className="p-12">
              <div className="text-5xl mb-6">🚀</div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Want to Host Your Own Event?</h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Have an idea for a workshop, meetup, or hackathon? We&#39;d love to help you bring it to life! 
                Share your ideas with the community and let&#39;s make it happen together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue/90">
                  <Link href="https://github.com/orgs/func-Kode/discussions/categories/ideas-brainstorming" target="_blank" className="flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    Propose an Event
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/about" className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Join Our Community
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
