
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, MessageSquare, BookOpen, Heart, TrendingUp, Award, 
  Star, DollarSign, Target, HelpCircle, Shield, Lightbulb,
  CheckCircle, Clock, ArrowRight, UserPlus, MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CommunityHubPage = () => {
  const { toast } = useToast();
  
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Mock data
  const mentors = [
    {
      id: 1,
      name: 'Sarah Kimani',
      avatar: '/placeholder.svg',
      rating: 4.9,
      expertise: ['Savings', 'Small Business', 'Budgeting'],
      experience: '5+ years',
      helped: 127,
      bio: 'Certified financial planner specializing in small business growth and personal savings strategies.',
      successStories: 85,
      available: true
    },
    {
      id: 2,
      name: 'James Otieno',
      avatar: '/placeholder.svg',
      rating: 4.8,
      expertise: ['Investment', 'Retirement Planning', 'Debt Management'],
      experience: '8+ years',
      helped: 89,
      bio: 'Investment advisor with expertise in helping young professionals build wealth.',
      successStories: 62,
      available: true
    },
    {
      id: 3,
      name: 'Grace Mwangi',
      avatar: '/placeholder.svg',
      rating: 4.9,
      expertise: ['Emergency Fund', 'Insurance', 'Family Finance'],
      experience: '6+ years',
      helped: 156,
      bio: 'Family financial planning expert focused on building financial security.',
      successStories: 94,
      available: false
    }
  ];

  const crowdfundingProjects = [
    {
      id: 1,
      title: 'Community Water Project - Kibera',
      description: 'Installing clean water access points in underserved areas',
      target: 500000,
      raised: 342000,
      backers: 89,
      daysLeft: 12,
      category: 'Infrastructure',
      verified: true
    },
    {
      id: 2,
      title: 'Maria\'s Tailoring Business Expansion',
      description: 'Help Maria buy 3 additional sewing machines to employ local women',
      target: 85000,
      raised: 63000,
      backers: 23,
      daysLeft: 18,
      category: 'Small Business',
      verified: true
    },
    {
      id: 3,
      title: 'Digital Literacy Center - Nakuru',
      description: 'Setting up computer lab for youth skills development',
      target: 250000,
      raised: 180000,
      backers: 45,
      daysLeft: 25,
      category: 'Education',
      verified: true
    }
  ];

  const learningPaths = [
    {
      id: 1,
      title: 'Financial Foundations',
      description: 'Master the basics of personal finance',
      modules: 8,
      duration: '2-3 weeks',
      difficulty: 'Beginner',
      completed: 3,
      points: 400,
      badge: 'Financial Rookie'
    },
    {
      id: 2,
      title: 'Small Business Mastery',
      description: 'Learn to start and grow your business',
      modules: 12,
      duration: '4-6 weeks',
      difficulty: 'Intermediate',
      completed: 0,
      points: 800,
      badge: 'Entrepreneur'
    },
    {
      id: 3,
      title: 'Investment Strategies',
      description: 'Build wealth through smart investing',
      modules: 10,
      duration: '3-4 weeks',
      difficulty: 'Advanced',
      completed: 0,
      points: 600,
      badge: 'Investor'
    }
  ];

  const groupLending = [
    {
      id: 1,
      name: 'Tech Entrepreneurs Circle',
      members: 12,
      target: 300000,
      committed: 240000,
      interestRate: 8.5,
      term: '18 months',
      description: 'Group lending for tech startup founders',
      trustScore: 94,
      slots: 3
    },
    {
      id: 2,
      name: 'Women in Business Collective',
      members: 8,
      target: 150000,
      committed: 120000,
      interestRate: 9.0,
      term: '12 months',
      description: 'Supporting women entrepreneurs in retail',
      trustScore: 89,
      slots: 2
    }
  ];

  const handleConnectMentor = (mentorId) => {
    setSelectedMentor(mentorId);
    toast({
      title: "Mentor Connection Request Sent",
      description: "Your mentor will respond within 24 hours. Check your notifications.",
    });
  };

  const handleJoinProject = (projectId) => {
    toast({
      title: "Project Joined Successfully",
      description: "You'll receive updates on project progress and milestones.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Community Empowerment Hub
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect, learn, and grow together in our financial community
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="mentorship" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
              <TabsTrigger value="crowdfunding">Crowdfunding</TabsTrigger>
              <TabsTrigger value="learning">Learning Hub</TabsTrigger>
              <TabsTrigger value="groups">Group Lending</TabsTrigger>
            </TabsList>

            <TabsContent value="mentorship">
              <div className="grid gap-6">
                {/* Mentorship Overview */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold">50+</h3>
                      <p className="text-muted-foreground">Certified Mentors</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold">1,200+</h3>
                      <p className="text-muted-foreground">Success Stories</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Award className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold">4.8★</h3>
                      <p className="text-muted-foreground">Average Rating</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Available Mentors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Available Mentors
                    </CardTitle>
                    <CardDescription>
                      AI-matched mentors based on your financial goals and experience level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mentors.map((mentor) => (
                        <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={mentor.avatar} />
                                <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">{mentor.name}</h4>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">{mentor.rating}</span>
                                </div>
                              </div>
                              {mentor.available && (
                                <Badge className="ml-auto bg-green-100 text-green-800">Available</Badge>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground mb-4">{mentor.bio}</p>

                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium mb-1">Expertise</p>
                                <div className="flex flex-wrap gap-1">
                                  {mentor.expertise.map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Experience</p>
                                  <p className="font-medium">{mentor.experience}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">People Helped</p>
                                  <p className="font-medium">{mentor.helped}</p>
                                </div>
                              </div>

                              <Button 
                                className="w-full" 
                                onClick={() => handleConnectMentor(mentor.id)}
                                disabled={!mentor.available || selectedMentor === mentor.id}
                              >
                                {selectedMentor === mentor.id ? 'Request Sent' : 'Connect with Mentor'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Direct Access to Regulators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Regulatory Support
                    </CardTitle>
                    <CardDescription>
                      Direct, encrypted channels to regulatory bodies and consumer protection services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Shield className="h-8 w-8 text-blue-600" />
                          <div>
                            <h4 className="font-medium">Central Bank of Kenya</h4>
                            <p className="text-sm text-muted-foreground">Digital Credit Providers Office</p>
                          </div>
                        </div>
                        <Button size="sm" className="w-full">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Report Issue
                        </Button>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <HelpCircle className="h-8 w-8 text-green-600" />
                          <div>
                            <h4 className="font-medium">Financial Ombudsman</h4>
                            <p className="text-sm text-muted-foreground">Consumer Protection Service</p>
                          </div>
                        </div>
                        <Button size="sm" className="w-full">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Get Help
                        </Button>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="crowdfunding">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Featured Projects
                    </CardTitle>
                    <CardDescription>
                      Support community projects and individual entrepreneurial ventures
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {crowdfundingProjects.map((project) => (
                        <Card key={project.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-semibold">{project.title}</h3>
                                  {project.verified && (
                                    <Badge className="bg-green-100 text-green-800">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground mb-3">{project.description}</p>
                                <Badge variant="outline">{project.category}</Badge>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-medium">
                                    KES {project.raised.toLocaleString()} raised of KES {project.target.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {Math.round((project.raised / project.target) * 100)}%
                                  </span>
                                </div>
                                <Progress value={(project.raised / project.target) * 100} />
                              </div>

                              <div className="flex justify-between items-center">
                                <div className="flex gap-4 text-sm">
                                  <span>{project.backers} backers</span>
                                  <span>{project.daysLeft} days left</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    Learn More
                                  </Button>
                                  <Button size="sm" onClick={() => handleJoinProject(project.id)}>
                                    Support Project
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Start Your Own Campaign</CardTitle>
                    <CardDescription>
                      Have a community project or business idea? Start crowdfunding today
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <h4 className="font-medium mb-2">Set Your Goal</h4>
                        <p className="text-sm text-muted-foreground">Define your funding target and timeline</p>
                      </div>
                      <div className="text-center">
                        <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h4 className="font-medium mb-2">Build Community</h4>
                        <p className="text-sm text-muted-foreground">Share your story and attract supporters</p>
                      </div>
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                        <h4 className="font-medium mb-2">Achieve Success</h4>
                        <p className="text-sm text-muted-foreground">Reach your goal and make impact</p>
                      </div>
                    </div>
                    <Button className="w-full mt-6">
                      Start Your Campaign
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="learning">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Personalized Learning Paths
                    </CardTitle>
                    <CardDescription>
                      Gamified financial education tailored to your knowledge level and goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {learningPaths.map((path) => (
                        <Card key={path.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold mb-2">{path.title}</h3>
                                <p className="text-muted-foreground mb-3">{path.description}</p>
                                <div className="flex gap-4 text-sm">
                                  <Badge variant="outline">{path.difficulty}</Badge>
                                  <span>{path.modules} modules</span>
                                  <span>{path.duration}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 mb-2">
                                  <Award className="h-4 w-4 text-yellow-500" />
                                  <span className="font-medium">{path.points} pts</span>
                                </div>
                                <Badge>{path.badge}</Badge>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-medium">Progress</span>
                                  <span className="text-sm">{path.completed}/{path.modules} modules</span>
                                </div>
                                <Progress value={(path.completed / path.modules) * 100} />
                              </div>

                              <Button className="w-full">
                                {path.completed > 0 ? 'Continue Learning' : 'Start Path'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Weekly Challenges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Target className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Budgeting Challenge</h4>
                            <p className="text-sm text-muted-foreground">Create and stick to a weekly budget</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge className="bg-green-100 text-green-800">+150 points</Badge>
                          <Button size="sm">Join Challenge</Button>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Savings Sprint</h4>
                            <p className="text-sm text-muted-foreground">Save KES 1,000 this week</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge className="bg-green-100 text-green-800">+200 points</Badge>
                          <Button size="sm">Join Challenge</Button>
                        </div>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="groups">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Group Lending Circles
                    </CardTitle>
                    <CardDescription>
                      Join trusted groups for shared liability lending with better rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {groupLending.map((group) => (
                        <Card key={group.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                                <p className="text-muted-foreground mb-3">{group.description}</p>
                              </div>
                              <Badge className="bg-green-100 text-green-800">
                                Trust Score: {group.trustScore}%
                              </Badge>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Target Amount</p>
                                    <p className="font-semibold">KES {group.target.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                                    <p className="font-semibold text-green-600">{group.interestRate}%</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Members</p>
                                    <p className="font-semibold">{group.members}/15</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Term</p>
                                    <p className="font-semibold">{group.term}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">Funding Progress</span>
                                    <span className="text-sm">{Math.round((group.committed / group.target) * 100)}%</span>
                                  </div>
                                  <Progress value={(group.committed / group.target) * 100} />
                                </div>

                                <div className="flex items-center justify-between">
                                  <Badge variant="outline">{group.slots} slots available</Badge>
                                  <Button size="sm">
                                    Join Group
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Create Your Own Group</CardTitle>
                    <CardDescription>
                      Start a lending circle with people you trust
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="groupName">Group Name</Label>
                          <Input id="groupName" placeholder="e.g., Local Entrepreneurs Circle" />
                        </div>
                        <div>
                          <Label htmlFor="targetAmount">Target Amount (KES)</Label>
                          <Input id="targetAmount" type="number" placeholder="100000" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Describe your group's purpose and membership criteria" />
                      </div>

                      <Button className="w-full">
                        Create Lending Group
                        <Users className="ml-2 h-4 w-4" />
                      </Button>
                     </div>
                   </CardContent>
                 </Card>
               </div>
             </TabsContent>
           </Tabs>
        </div>
      );
    };

    export default CommunityHubPage;
