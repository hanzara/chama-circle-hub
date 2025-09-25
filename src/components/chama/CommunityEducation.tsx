
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Video, FileCheck, ExternalLink } from 'lucide-react';

interface CommunityEducationProps {
  chamaData: any;
}

const CommunityEducation: React.FC<CommunityEducationProps> = ({ chamaData }) => {
  const educationResources = [
    { 
      title: 'Financial Literacy Basics', 
      type: 'Article', 
      duration: '10 min read',
      icon: FileText,
      description: 'Learn the fundamentals of personal finance and money management.',
      level: 'Beginner'
    },
    { 
      title: 'Investment Strategies for SACCOs', 
      type: 'Video', 
      duration: '25 min',
      icon: Video,
      description: 'Discover proven investment strategies specifically for SACCO members.',
      level: 'Intermediate'
    },
    { 
      title: 'Understanding Loan Terms', 
      type: 'Guide', 
      duration: '15 min read',
      icon: FileCheck,
      description: 'Master the complexities of loan agreements and terms.',
      level: 'Beginner'
    },
    { 
      title: 'Business Planning Workshop', 
      type: 'Course', 
      duration: '2 hours',
      icon: BookOpen,
      description: 'Complete course on creating effective business plans.',
      level: 'Advanced'
    },
    { 
      title: 'Digital Banking Safety', 
      type: 'Article', 
      duration: '8 min read',
      icon: FileText,
      description: 'Stay safe while using digital banking platforms.',
      level: 'Beginner'
    },
    { 
      title: 'Chama Management Best Practices', 
      type: 'Video', 
      duration: '35 min',
      icon: Video,
      description: 'Learn how to effectively manage and grow your chama.',
      level: 'Intermediate'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Community Education</h2>
        <p className="text-muted-foreground">Enhance your financial knowledge with our curated resources</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Education Resources
          </CardTitle>
          <CardDescription>Financial literacy and business skills for chama members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {educationResources.map((resource, index) => {
              const IconComponent = resource.icon;
              return (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {resource.type}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(resource.level)}`}>
                      {resource.level}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-sm mb-2">{resource.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{resource.duration}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Access
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Learning Path Recommendation</h4>
            <p className="text-sm text-blue-800 mb-3">
              New to financial management? Start with "Financial Literacy Basics" then progress to "Understanding Loan Terms".
            </p>
            <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700">
              View Complete Learning Path
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityEducation;
